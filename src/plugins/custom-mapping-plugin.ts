import { type Plugin } from "vite";

const folder = {
    es: "esm",
    cjs: "cjs",
} as const;

/**
 * Allow us to use `[custom-format]` as a placeholder in files and directories.
 */
export function customMappingPlugin(): Plugin {
    return {
        name: "fk:custom-mapping",

        renderStart(options) {
            const { format } = options;
            if (format !== "es" && format !== "cjs") {
                return;
            }
            const replacement = folder[format];
            options.dir = options.dir?.replace("[custom-format]", replacement);
            if (typeof options.entryFileNames === "string") {
                options.entryFileNames = options.entryFileNames.replace(
                    "[custom-format]",
                    replacement,
                );
            }
        },
    };
}
