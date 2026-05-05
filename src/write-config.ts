import fs from "node:fs/promises";
import path from "node:path";

interface PackageJson {
    name: string;
}

interface Reference {
    path: string;
}

/**
 * @internal
 */
export function generateTsconfig(): string {
    const config = {
        extends: "@forsakringskassan/vite-lib-config/tsconfig.json",
        references: [
            { path: "./tsconfig.lib.json" },
            { path: "./tsconfig.pageobjects.json" },
            { path: "./tsconfig.cypress.json" },
            { path: "./tsconfig.selectors.json" },
        ] as Reference[],
    };
    return `${JSON.stringify(config, null, 4)}\n`;
}

/**
 * @internal
 */
export function generateTsconfigLib(packageName: string): string {
    const config = {
        extends: "@forsakringskassan/vite-lib-config/tsconfig.lib.json",
        compilerOptions: {
            paths: {
                [packageName]: ["src/index.ts"],
            },
        },
    };
    return `${JSON.stringify(config, null, 4)}\n`;
}

/**
 * @internal
 */
export function generateTsconfigCypress(
    packageName: string,
    cypressConfigPath: string,
): string {
    const config = {
        extends: [
            "@forsakringskassan/vite-lib-config/tsconfig.cypress.json",
            cypressConfigPath,
        ],
        compilerOptions: {
            paths: {
                [`${packageName}/cypress`]: ["src/cypress/index.ts"],
                [packageName]: ["src/index.ts"],
            },
        },
    };
    return `${JSON.stringify(config, null, 4)}\n`;
}

/**
 * @internal
 */
export function generateTsconfigSelectors(packageName: string): string {
    const config = {
        extends: "@forsakringskassan/vite-lib-config/tsconfig.selectors.json",
        compilerOptions: {
            paths: {
                [`${packageName}/selectors`]: ["src/selectors/index.ts"],
                [packageName]: ["src/index.ts"],
            },
        },
    };
    return `${JSON.stringify(config, null, 4)}\n`;
}

/**
 * @internal
 */
export function generateTsconfigPageobjects(packageName: string): string {
    const config = {
        extends: "@forsakringskassan/vite-lib-config/tsconfig.pageobjects.json",
        compilerOptions: {
            paths: {
                [packageName]: ["src/index.ts"],
            },
        },
    };
    return `${JSON.stringify(config, null, 4)}\n`;
}

async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
}

async function findCypressConfigPath(cwd: string): Promise<string> {
    const { findUp } = await import("find-up");
    const absolutePath = await findUp("cypress/tsconfig.json", { cwd });
    if (absolutePath) {
        return path.relative(cwd, absolutePath).replaceAll("\\", "/");
    }
    return "cypress/tsconfig.json";
}

/**
 * @public
 */
export async function run(argv: string[]): Promise<void> {
    const flags = new Set(argv.filter((it) => it.startsWith("--")));

    if (flags.has("--help")) {
        console.log("usage: fk-write-config [OPTIONS..]");
        console.log(`
  --help                     Show this help.
`);
        return;
    }

    const cwd = process.cwd();
    const pkg = await readJsonFile<PackageJson>("package.json");
    const packageName = pkg.name;
    const cypressConfigPath = await findCypressConfigPath(cwd);

    const generated = new Set([
        "tsconfig.json",
        "tsconfig.lib.json",
        "tsconfig.cypress.json",
        "tsconfig.selectors.json",
        "tsconfig.pageobjects.json",
    ]);

    /* remove any other tsconfig files */
    const entries = await fs.readdir(cwd);
    for (const entry of entries) {
        if (
            entry.startsWith("tsconfig") &&
            entry.endsWith(".json") &&
            !generated.has(entry)
        ) {
            await fs.unlink(path.join(cwd, entry));
            console.log(`Removed ${entry}`);
        }
    }

    await fs.writeFile(path.join(cwd, "tsconfig.json"), generateTsconfig());
    await fs.writeFile(
        path.join(cwd, "tsconfig.lib.json"),
        generateTsconfigLib(packageName),
    );
    await fs.writeFile(
        path.join(cwd, "tsconfig.cypress.json"),
        generateTsconfigCypress(packageName, cypressConfigPath),
    );
    await fs.writeFile(
        path.join(cwd, "tsconfig.selectors.json"),
        generateTsconfigSelectors(packageName),
    );
    await fs.writeFile(
        path.join(cwd, "tsconfig.pageobjects.json"),
        generateTsconfigPageobjects(packageName),
    );

    console.log("Wrote tsconfig files");
}
