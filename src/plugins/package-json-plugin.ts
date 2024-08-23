import path from "node:path/posix";
import { type Plugin } from "vite";

const mapping = {
    es: "module",
    cjs: "commonjs",
} as const;

const folder = {
    es: "esm",
    cjs: "cjs",
} as const;

export function packageJsonPlugin(): Plugin {
    return {
        name: "fk:package-json",

        generateBundle(options) {
            const { format } = options;
            if (format !== "es" && format !== "cjs") {
                return;
            }
            const pkg = {
                type: mapping[format],
            };
            this.emitFile({
                type: "asset",
                fileName: path.join("dist", folder[format], "package.json"),
                source: JSON.stringify(pkg, null, 2),
            });
        },
    };
}
