import defaultConfig, { defineConfig } from "@forsakringskassan/eslint-config";
import cliConfig from "@forsakringskassan/eslint-config-cli";
import typescriptConfig from "@forsakringskassan/eslint-config-typescript";
import typeinfoConfig from "@forsakringskassan/eslint-config-typescript-typeinfo";
import vueConfig from "@forsakringskassan/eslint-config-vue";

export default [
    defineConfig({
        name: "Ignored files",
        ignores: [
            "**/coverage/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/temp/**",
        ],
    }),

    ...defaultConfig,

    cliConfig({
        files: ["**/*.{js,ts,mjs}"],
    }),
    typescriptConfig(),
    typeinfoConfig(import.meta.dirname, {
        ignores: ["*.d.ts", "testbed/**/*.ts"],
    }),
    vueConfig(),

    defineConfig({
        files: ["*.d.ts"],
        rules: {
            "import/extensions": "off",
        },
    }),
];
