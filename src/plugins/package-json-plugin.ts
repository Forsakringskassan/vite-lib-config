import { type Plugin } from "vite";

const mapping = {
    es: "module",
    cjs: "commonjs",
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
                fileName: "package.json",
                source: JSON.stringify(pkg, null, 2),
            });
        },
    };
}
