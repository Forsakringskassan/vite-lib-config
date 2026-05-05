import fs from "node:fs/promises";
import path from "node:path";

interface PackageJson {
    name: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
}

interface Reference {
    path: string;
}

/**
 * @internal
 */
export interface Options {
    testRunner?: "jest" | "vitest";
}

/**
 * Detects whether jest or vitest is used based on the package.json dependencies.
 *
 * @internal
 */
export function detectTestRunner(
    pkg: PackageJson,
): "jest" | "vitest" | undefined {
    const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies,
    };
    const packages = Object.keys(allDeps);

    if (packages.some((name) => name.includes("jest"))) {
        return "jest";
    }

    if (packages.some((name) => name.includes("vitest"))) {
        return "vitest";
    }

    return undefined;
}

/**
 * @internal
 */
export function generateTsconfig(_options: Options = {}): string {
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
export function generateTsconfigLib(
    packageName: string,
    _options: Options = {},
): string {
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
    _options: Options = {},
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
export function generateTsconfigSelectors(
    packageName: string,
    _options: Options = {},
): string {
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
export function generateTsconfigPageobjects(
    packageName: string,
    _options: Options = {},
): string {
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
  --with-jest                Apply jest workarounds.
  --with-vitest              Apply vitest workarounds.
`);
        return;
    }

    const cwd = process.cwd();
    const pkg = await readJsonFile<PackageJson>("package.json");
    const packageName = pkg.name;
    const cypressConfigPath = await findCypressConfigPath(cwd);

    let testRunner: "jest" | "vitest" | undefined;
    if (flags.has("--with-jest")) {
        testRunner = "jest";
    } else if (flags.has("--with-vitest")) {
        testRunner = "vitest";
    } else {
        testRunner = detectTestRunner(pkg);
    }

    const options: Options = { testRunner };

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

    await fs.writeFile(
        path.join(cwd, "tsconfig.json"),
        generateTsconfig(options),
    );
    await fs.writeFile(
        path.join(cwd, "tsconfig.lib.json"),
        generateTsconfigLib(packageName, options),
    );
    await fs.writeFile(
        path.join(cwd, "tsconfig.cypress.json"),
        generateTsconfigCypress(packageName, cypressConfigPath, options),
    );
    await fs.writeFile(
        path.join(cwd, "tsconfig.selectors.json"),
        generateTsconfigSelectors(packageName, options),
    );
    await fs.writeFile(
        path.join(cwd, "tsconfig.pageobjects.json"),
        generateTsconfigPageobjects(packageName, options),
    );

    console.log("Wrote tsconfig files");
}
