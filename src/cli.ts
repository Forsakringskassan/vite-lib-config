import fs from "node:fs/promises";
import path from "node:path/posix";
import { parseArgs } from "node:util";
import * as vite from "vite";
import * as esbuild from "esbuild";
import { getExternals, readJsonFile } from "./utils";

const extension = {
    cjs: ".cjs",
    esm: ".mjs",
} as const;

async function build(
    entrypoint: string,
    options: {
        external: string[];
        formats: readonly ["cjs", "esm"];
    },
): Promise<void> {
    const { external, formats } = options;

    /* "src/cypress/index.ts" -> "cypress" */
    const basename = path.basename(path.dirname(entrypoint));

    for (const format of formats) {
        const result = await esbuild.build({
            entryPoints: [entrypoint],
            outfile: `dist/${format}/${basename}.${format}.js`,
            bundle: true,
            platform: "browser",
            format,
            target: "chrome119",
            sourcemap: true,
            external,
            outExtension: {
                ".js": extension[format],
            },
            logLevel: "info",
            metafile: true,
        });
        if (format === "esm") {
            const output = await esbuild.analyzeMetafile(result.metafile);
            console.log(output);
        }
    }
}

export async function cli(args: string[]): Promise<void> {
    const { values: flags } = parseArgs({
        args,
        strict: true,
        allowPositionals: false,
        options: {
            clean: {
                type: "boolean",
                default: false,
            },
            pageobjects: {
                type: "boolean",
            },
            selectors: {
                type: "boolean",
            },
            help: {
                type: "boolean",
                default: false,
            },
        },
    });

    if (flags.help) {
        console.log("usage: fk-build-vue-lib [OPTIONS..]");
        console.log(`
  --clean                    Clean dist folder before building.
  --pageobjects              Build cypress pageobjects.
  --selectors                Build selector objects.
  --help                     Show this help.
`);
        return;
    }

    if (flags.clean) {
        await fs.rm("dist", { recursive: true, force: true });
    }

    const formats = ["cjs", "esm"] as const;
    const pkg = readJsonFile("package.json");
    const external = getExternals(pkg);

    await vite.build();

    if (flags.pageobjects) {
        await build("src/cypress/index.ts", { external, formats });
    }

    if (flags.selectors) {
        await build("src/selectors/index.ts", { external, formats });
    }
}
