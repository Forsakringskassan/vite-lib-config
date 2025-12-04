import { type TransformOptions } from "@babel/core";

function babelPreset(): TransformOptions {
    return {
        plugins: [
            /* we need this plugin for force `??` to be transpiled or Cypress/Webpack chokes on it */
            require.resolve("@babel/plugin-transform-nullish-coalescing-operator"),
        ],
        presets: [
            [
                require.resolve("@vue/babel-preset-app"),
                { absoluteRuntime: false },
            ],
        ],
    };
}

export = babelPreset;
