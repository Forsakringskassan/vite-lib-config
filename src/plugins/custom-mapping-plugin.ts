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
        outputOptions(options) {
            const { format, dir, entryFileNames } = options;
            if (format !== "es" && format !== "cjs") {
                return;
            }
            const replacement = folder[format];
            return {
                ...options,
                dir: dir?.replace("[custom-format]", replacement),
                entryFileNames:
                    typeof entryFileNames === "string"
                        ? entryFileNames.replace("[custom-format]", replacement)
                        : entryFileNames,
            };
        },
    };
}
