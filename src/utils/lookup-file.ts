import fs from "node:fs";

const extensions = ["ts", "mts", "mjs", "js"];
export function lookupFile(nameWithoutExtension: string): string {
    for (const extension of extensions) {
        const fileName = `${nameWithoutExtension}.${extension}`;
        if (fs.existsSync(fileName)) {
            return fileName;
        }
    }
    /* No file found, return default file extension and let Esbuild / Vite fail later on */
    return `${nameWithoutExtension}.ts`;
}
