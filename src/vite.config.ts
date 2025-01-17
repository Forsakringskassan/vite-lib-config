import { vitePlugin as apimockPlugin } from "@forsakringskassan/apimock-express";
import deepmerge from "deepmerge";
import colors from "picocolors";
import { type Plugin, type UserConfig as ViteUserConfig } from "vite";
import vue3plugin, {
    type Options as Vue3PluginOptions,
} from "@vitejs/plugin-vue";
import {
    babelPlugin,
    customMappingPlugin,
    indexHtmlPlugin,
    packageJsonPlugin,
} from "./plugins";
import { type FKConfig } from "./fk-config";
import {
    detectInternalDependencies,
    detectMonorepoPackages,
    detectVueMajor,
    prettyList,
    readJsonFile,
} from "./utils";
import { lookupFile } from "./utils/lookupFile";

export { type FKConfig } from "./fk-config";
export {
    /* eslint-disable-next-line import/named -- false positive */
    type MockEntry,
    vitePlugin as apimockPlugin,
} from "@forsakringskassan/apimock-express";

/**
 * @public
 */
export type UserConfig = ViteUserConfig & { fk?: FKConfig };

interface PackageJson {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    externalDependencies?: string[];
}

function isExternal(externals: Array<string | RegExp>, name: string): boolean {
    for (const external of externals) {
        const matchRegexp = external instanceof RegExp && external.test(name);
        const matchString = external === name;
        if (matchRegexp || matchString) {
            return true;
        }
    }
    return false;
}

function isBundled(externals: Array<string | RegExp>, name: string): boolean {
    return !isExternal(externals, name);
}

/**
 * @public
 */
export function vuePlugin(config?: Record<string, unknown>): Plugin {
    const defaultConfig = {
        template: {
            compilerOptions: {
                /**
                 * Cypress tests will include comments if not this flag is set,
                 * even though the default value is `false`.
                 */
                comments: false,
                /**
                 * Keep whitespaces in contents coming from a slot and displayed in a pre for instance.
                 */
                whitespace: "preserve",

                /**
                 * Any element starting with `<ce-[...]>` is considered a custom
                 * element (webcomponent).
                 */
                isCustomElement(tagName) {
                    return tagName.startsWith("ce-");
                },
            },
        },
    } satisfies Vue3PluginOptions;

    const resolvedConfig = config
        ? deepmerge(defaultConfig, config, { arrayMerge: overwriteMerge })
        : defaultConfig;

    switch (vueMajor) {
        case 2:
            throw new Error("Vue 2 is no longer supported");
        case 3:
            return vue3plugin(resolvedConfig);
    }
}

const vueMajor = detectVueMajor();
const packageJson = readJsonFile("package.json") as PackageJson;
const dependencies = Object.keys(packageJson.dependencies ?? {});
const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});
const externalDependencies = packageJson.externalDependencies;
const allDependencies = [...dependencies, ...peerDependencies].sort();
const external = new Set([
    ...(externalDependencies ?? dependencies),
    ...peerDependencies,
]);

console.log(
    "Building",
    colors.cyan(packageJson.name),
    `v${packageJson.version} (Vue ${vueMajor})`,
);
console.log();

/* hardcoded path to monorepo root package */
const packages = detectMonorepoPackages("./package.json", "../../package.json");

/** array of all packages within the monorepo this package depends on */
const internalDependencies = detectInternalDependencies(
    packages,
    allDependencies,
);

const defaultPlugins = [
    indexHtmlPlugin(),
    packageJsonPlugin(),
    vuePlugin(),
    customMappingPlugin(),
    babelPlugin(),
];

const defaultConfig = {
    fk: {},
    plugins: defaultPlugins,

    optimizeDeps: {
        /**
         * Vite treats monorepo packages as sourcecode and performs no prebundling by default.
         * See https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
         */
        include: internalDependencies.map((it) => it.name),
        force: false,
    },

    build: {
        emptyOutDir: false,
        minify: false,
        sourcemap: true,
        outDir: "dist/[custom-format]",
        lib: {
            entry: lookupFile("src/index"),
            formats: ["es", "cjs"],
        },
        rollupOptions: {
            output: {
                entryFileNames: `index.[custom-format].js`,
                globals: {
                    vue: "Vue",
                },
            },
            external: Array.from(external),
        },
    },

    server: {
        port: 8080,
    },
    clearScreen: false,
} satisfies UserConfig & { fk: FKConfig };

function overwriteMerge<T>(_a: T[], b: T[]): T[] {
    return b;
}

/**
 * @public
 */
export function defineConfig(config?: UserConfig): UserConfig {
    const { mocks = [] } = config?.fk ?? {};

    if (mocks.length > 0) {
        defaultConfig.plugins.push(apimockPlugin(mocks));
    }

    let result: UserConfig & { fk: FKConfig };
    if (config) {
        result = deepmerge<UserConfig & { fk: FKConfig }>(
            defaultConfig,
            config,
            { arrayMerge: overwriteMerge },
        );
    } else {
        result = defaultConfig;
    }

    const { build } = result;
    const external = build?.rollupOptions?.external as Array<string | RegExp>;
    console.group(colors.bold("Configuration:"));
    console.log(
        "Internal dependencies:",
        prettyList(result.optimizeDeps?.include ?? []),
    );
    console.log(
        "External dependencies:",
        prettyList(allDependencies, (it) => isExternal(external, it)),
    );
    console.log(
        "Bundled dependencies:",
        prettyList(allDependencies, (it) => isBundled(external, it)),
    );
    console.groupEnd();
    console.log();

    return result;
}
