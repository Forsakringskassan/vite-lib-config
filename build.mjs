import fs from "node:fs";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import esbuild from "esbuild";
import isCI from "is-ci";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
const externalDependencies = Object.values(pkg.externalDependencies);
const peerDependencies = Object.keys(pkg.peerDependencies);

/**
 * @param {import("esbuild").BuildOptions} options
 * @returns {Promise<void>}
 */
async function build(options) {
    const result = await esbuild.build({
        outdir: "dist",
        bundle: true,
        metafile: true,
        platform: "node",
        logLevel: "info",
        target: "node20",
        format: "cjs",
        external: [...peerDependencies, ...externalDependencies],
        ...options,
    });
    console.log(await esbuild.analyzeMetafile(result.metafile));
}

/**
 * @param {string} filename
 * @returns {Promise<void>}
 */
async function apiExtractor(filename) {
    const config = ExtractorConfig.loadFileAndPrepare(filename);
    const result = Extractor.invoke(config, {
        localBuild: !isCI,
        showVerboseMessages: true,
    });

    if (result.succeeded) {
        console.log(`API Extractor completed successfully`);
    } else {
        const { errorCount, warningCount } = result;
        console.error(
            [
                "API Extractor completed with",
                `${errorCount} error(s) and ${warningCount} warning(s)`,
            ].join("\n"),
        );
        process.exitCode = 1;
    }
}

async function run() {
    await build({
        entryPoints: [
            "src/api-extractor.ts",
            "src/babel.config.ts",
            "src/index.ts",
        ],
    });
    await build({
        entryPoints: ["src/vite.config.ts"],
        format: "cjs",
        outExtension: { ".js": ".cjs" },
        define: {
            "import.meta.url": "__filename",
        },
    });
    await build({
        entryPoints: ["src/vite.config.ts"],
        format: "esm",
        outExtension: { ".js": ".mjs" },
        banner: {
            js: [
                `import { dirname as $_dirname } from "node:path";`,
                `import { fileURLToPath as $_fileURLToPath } from "node:url";`,
                `const __dirname = $_dirname($_fileURLToPath(import.meta.url));`,
            ].join("\n"),
        },
    });
    await build({
        entryPoints: ["src/cli.ts"],
        format: "esm",
        outExtension: { ".js": ".mjs" },
        banner: {
            js: [
                `import { createRequire } from "node:module";`,
                `const require = createRequire(import.meta.url);`,
            ].join("\n"),
        },
    });

    /* copy this one as-is instead of running api-extractor as it doesnt handle
     * "export = ..." and there is very little in this file anyway */
    fs.copyFileSync("temp/types/babel.config.d.ts", "dist/babel.config.d.ts");

    await apiExtractor("api-extractor.vite.json");
    await apiExtractor("api-extractor.lib.json");
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
