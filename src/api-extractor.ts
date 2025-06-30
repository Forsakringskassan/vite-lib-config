import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { glob, globSync } from "glob";
import isCI from "is-ci";
import { findUp } from "find-up";
import { Extractor, ExtractorConfig } from "@microsoft/api-extractor";
import { extractAugmentations } from "./utils";

/**
 * @param configFiles - Optional specific configfiles from CLI
 */
async function getConfigFiles(configFiles: string[]): Promise<string[]> {
    if (configFiles.length > 0) {
        return configFiles.map((it) => globSync(it)).flat();
    } else {
        const result = await findUp("api-extractor.json");
        return result ? [result] : [];
    }
}

/**
 * Find all `.d.ts` files referenced by a given entrypoing.
 */
async function findReferencedFiles(
    filename: string,
    visited: Set<string>,
): Promise<void> {
    if (visited.has(filename)) {
        return;
    }
    visited.add(filename);
    const content = await fs.readFile(filename, "utf-8");
    const matches = content.matchAll(/^(?:import|export)[^"]*"([^"]+)";?$/gm);
    for (const match of Array.from(matches)) {
        const modname = match[1];
        if (!modname.startsWith(".")) {
            continue;
        }
        const relPath = path.join(path.dirname(filename), modname);
        if (existsSync(relPath)) {
            const stat = await fs.stat(relPath);
            if (stat.isDirectory()) {
                await findReferencedFiles(
                    path.join(relPath, "index.d.ts"),
                    visited,
                );
            } else {
                await findReferencedFiles(relPath, visited);
            }
        } else {
            await findReferencedFiles(`${relPath}.d.ts`, visited);
        }
    }
}

async function patchAugmentations(config: ExtractorConfig): Promise<void> {
    const { mainEntryPointFilePath, rollupEnabled, publicTrimmedFilePath } =
        config;

    if (!rollupEnabled) {
        return;
    }

    async function extract(filename: string): Promise<string[]> {
        const content = await fs.readFile(filename, "utf-8");
        return extractAugmentations(content);
    }

    async function patch(
        filename: string,
        augmentations: string[],
    ): Promise<void> {
        const content = await fs.readFile(filename, "utf-8");
        const patched = [content, ...augmentations].join("\n\n");
        await fs.writeFile(filename, patched, "utf-8");
    }

    console.log();
    console.group("Patching module augmentations");
    const files = new Set<string>();
    await findReferencedFiles(mainEntryPointFilePath, files);
    console.log(
        "Searching",
        files.size,
        "declaration files referenced by",
        mainEntryPointFilePath,
    );
    const augmentations = await Promise.all(
        Array.from(files).map(extract),
    ).then((it) => it.flat());
    console.log("Found", augmentations.length, "module augmentation(s)");
    if (augmentations.length > 0) {
        console.log("Writing", publicTrimmedFilePath);
        await patch(publicTrimmedFilePath, augmentations);
    } else {
        console.log("Skipping writing patched declaration");
    }
    console.groupEnd();
}

async function patchDeclareVarVls(declarationDir: string): Promise<void> {
    console.group(
        `Patching vue-tsc dts files in "${declarationDir}" (microsoft/rushstack#5146)`,
    );

    let numPatchedFiles = 0;
    const filenames = await glob("**/*.vue.d.ts", { cwd: declarationDir });
    const promises = filenames.map(async (filename) => {
        const filePath = path.join(declarationDir, filename);
        const content = await fs.readFile(filePath, "utf-8");
        const updated = content.replace(
            /declare var (__VLS_\d+)/,
            "declare const $1",
        );
        if (content !== updated) {
            await fs.writeFile(filePath, updated, "utf-8");
            numPatchedFiles++;
            console.log(filename);
        }
    });
    await Promise.all(promises);

    console.groupEnd();
    console.log(
        `${numPatchedFiles} file${numPatchedFiles === 1 ? "" : "s"} patched\n`,
    );
}

export async function run(argv: string[]): Promise<void> {
    const flags = argv.filter((it) => it.startsWith("--"));
    const positional = argv.filter((it) => !it.startsWith("--"));

    if (flags.includes("--help")) {
        console.log("usage: fk-api-extractor [OPTIONS..] [FILENAME..]");
        console.log(`
  --help                     Show this help.
  --patch-augmentations      Post-process generated dts file to include module
                             augmentations.
  --patch-declare-var-vls    Pre-process dts files to workaround
                             vue-tsc/api-extractor incompatibility (see
                             microsoft/rushstack#5146)

By default \`api-extractor.json\` is used as configuration file but you can
specify custom configuration filenames as the positional argument to this tool,
e.g. \`fkui-api-extractor custom.json other.json\` would use those two filenames
only.
`);
    }

    const configFiles = await getConfigFiles(positional);
    const numFiles = configFiles.length;
    const strFiles = `${numFiles} file${numFiles === 1 ? "" : "s"}`;

    if (isCI) {
        console.group(`Running API Extractor in CI mode on ${strFiles}:`);
    } else {
        console.group(`Running API Extractor in local mode on ${strFiles}:`);
    }
    for (const filePath of configFiles) {
        console.log(`- ${path.basename(filePath)}`);
    }
    console.groupEnd();
    console.log();

    if (flags.includes("--patch-declare-var-vls")) {
        await patchDeclareVarVls("temp/types");
    }

    for (const filePath of configFiles) {
        const config = ExtractorConfig.loadFileAndPrepare(filePath);
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

        if (flags.includes("--patch-augmentations")) {
            await patchAugmentations(config);
        }
    }
}
