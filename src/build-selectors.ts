import { existsSync } from "node:fs";
import path from "node:path/posix";
import * as esbuild from "esbuild";

const extension = {
    cjs: ".cjs",
    esm: ".mjs",
} as const;

async function build(
    entrypoint: string,
    formats: readonly ["cjs", "esm"],
): Promise<void> {
    if (!existsSync(entrypoint)) {
        return;
    }

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

export async function run(argv: string[]): Promise<void> {
    const flags = new Set(argv.filter((it) => it.startsWith("--")));

    if (flags.has("--help")) {
        console.log("usage: fk-build-selectors [OPTIONS..]");
        console.log(`
  --help                     Show this help.
`);
    }

    const formats = ["cjs", "esm"] as const;

    await build("src/cypress/index.ts", formats);
    await build("src/selectors/index.ts", formats);
}
