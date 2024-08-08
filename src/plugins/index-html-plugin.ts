import fs from "node:fs/promises";
import path from "node:path";
import {
    type Connect,
    type Plugin,
    type UserConfig,
    type ViteDevServer,
} from "vite";
import { type FKConfig } from "../fk-config";

interface TemplateData {
    entrypoint: string;
    [key: string]: string | undefined;
}

const templateFile = path.resolve(__dirname, "../assets/index.html");
const VIRTUAL_ENTRYPOINT = "index.html";

function isHtmlPage(url: string | undefined): url is string {
    if (!url) {
        return false;
    }

    return url.startsWith(".html") || url === "/";
}

function middleware(server: ViteDevServer): Connect.NextHandleFunction {
    return async (req, res, next) => {
        const { url } = req;
        if (isHtmlPage(url)) {
            try {
                res.end(await server.transformIndexHtml(url, ""));
            } catch (err) {
                console.error(err);
                res.writeHead(500);
                res.end("Internal Server Error");
            }
        } else {
            return next();
        }
    };
}

export function indexHtmlPlugin(): Plugin {
    const templateData: TemplateData = {
        entrypoint: "/src/vite-dev/app.vue",
    };
    return {
        name: "fk:virtual-entrypoint",

        resolveId: {
            order: "pre",
            handler(source) {
                const { base } = path.parse(source);
                if (base === "index.html") {
                    return VIRTUAL_ENTRYPOINT;
                }
            },
        },

        load: {
            order: "pre",
            handler(id) {
                /* if the virtual entrypoint is about to be loaded we just
                 * return an empty string, the actual template is rendered in
                 * `transformIndexHtml` instead. */
                if (id === VIRTUAL_ENTRYPOINT) {
                    return "";
                }
            },
        },

        transformIndexHtml: {
            order: "pre",
            async handler() {
                const content = await fs.readFile(templateFile, "utf-8");
                return content.replace(/{{([^}]+)}}/g, (match, key) => {
                    return templateData[key.trim()] ?? match;
                });
            },
        },

        config(config: UserConfig & { fk?: FKConfig }) {
            if (config.fk?.entrypoint) {
                templateData.entrypoint = config.fk.entrypoint;
            }
        },

        configureServer(server: ViteDevServer) {
            server.middlewares.use(middleware(server));
        },
    };
}
