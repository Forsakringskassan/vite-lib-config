import { vitePlugin as apimockPlugin } from "@forsakringskassan/apimock-express";
import uFuzzy from "@leeoniya/ufuzzy";
import deepmerge from "deepmerge";
import colors from "picocolors";
import { type Plugin, type UserConfig as ViteUserConfig } from "vite";
import vue3plugin, {
    type Options as Vue3PluginOptions,
} from "@vitejs/plugin-vue";
import { glob } from "glob";
import {
    babelPlugin,
    customMappingPlugin,
    indexHtmlPlugin,
    packageJsonPlugin,
} from "./plugins";
import { type FKConfig } from "./fk-config";
import { detectVueMajor, prettyList, readJsonFile } from "./utils";
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

async function findEntrypoint(pattern: string | null): Promise<string> {
    const defaultEntrypoint = "/src/vite-dev/app.vue";
    if (!pattern) {
        return defaultEntrypoint;
    }

    const uf = new uFuzzy({ intraIns: Infinity });
    const files = await glob("**/*.vue", { posix: true, nodir: true });
    const idxs = uf.filter(files, pattern);
    if (!idxs || idxs.length === 0) {
        throw new Error(`No files matching "${pattern}"`);
    }
    const info = uf.info(idxs, files, pattern);
    const order = uf.sort(info, files, pattern);
    const matches = order.map((it) => files[info.idx[it]]);

    if (matches.length > 1) {
        console.error(
            `Multiple files matching "${pattern}", using first one from:`,
            matches,
        );
    }

    return matches[0];
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

/**
 * @public
 */
export const defaultPlugins = [
    indexHtmlPlugin(),
    packageJsonPlugin(),
    vuePlugin(),
    customMappingPlugin(),
    babelPlugin(),
];

const defaultConfig = {
    fk: {},
    plugins: defaultPlugins,

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
                entryFileNames: `[name].[custom-format].js`,
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
export async function defineConfig(
    config: UserConfig = {},
): Promise<UserConfig> {
    const argv = process.argv.slice(2);
    const positional = argv.filter((it) => !it.startsWith("-"));

    config.fk ??= {};
    const { mocks = [] } = config.fk;

    if (mocks.length > 0) {
        defaultConfig.plugins.push(apimockPlugin(mocks));
    }

    const userEntrypoint = positional.length > 0 && !config.fk.entrypoint;
    if (userEntrypoint) {
        const entrypoint = await findEntrypoint(positional[0]);
        config.fk.entrypoint = `/${entrypoint}`;
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
    if (userEntrypoint) {
        console.log("Entrypoint:", config.fk.entrypoint);
    }
    console.groupEnd();
    console.log();

    return result;
}
