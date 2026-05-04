import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path/posix";
import * as esbuild from "esbuild";

interface PackageJson {
    peerDependencies?: Partial<Record<string, string>>;
    externalDependencies?: string[];
}

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

async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
}

/**
 * @internal
 */
export function getExternals(pkg: PackageJson): string[] {
    const { peerDependencies = {}, externalDependencies = [] } = pkg;
    const unique = new Set([
        ...Object.keys(peerDependencies),
        ...externalDependencies,
    ]);
    return Array.from(unique).toSorted((a, b) => a.localeCompare(b));
}

/**
 * @public
 */
export async function run(argv: string[]): Promise<void> {
    const flags = new Set(argv.filter((it) => it.startsWith("--")));

    if (flags.has("--help")) {
        console.log("usage: fk-build-selectors [OPTIONS..]");
        console.log(`
  --help                     Show this help.
`);
    }

    const pkg = await readJsonFile<PackageJson>("package.json");
    const external = getExternals(pkg);

    const formats = ["cjs", "esm"] as const;

    await build("src/cypress/index.ts", { external, formats });
    await build("src/selectors/index.ts", { external, formats });
}
