require("@forsakringskassan/eslint-config/patch/modern-module-resolution");

module.exports = {
    extends: ["@forsakringskassan", "@forsakringskassan/cli"],

    overrides: [
        {
            /* ensure we lint *.cjs and *.mjs files as well */
            files: ["*.cjs", "*.mjs"],
        },

        {
            /* ensure we lint *.cjs and *.mjs files as well */
            files: ["bin/*.mjs"],
            rules: {
                "import/extensions": ["error", "always"],
                "import/no-unresolved": "off",
            },
        },

        {
            files: "*.ts",
            extends: ["@forsakringskassan/typescript"],
        },
    ],
};
