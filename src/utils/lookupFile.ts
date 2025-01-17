import fs from "node:fs";

const extensions = ["ts", "mts", "mjs", "js"];
export function lookupFile(nameWithoutExtension: string): string {
    for (const extension of extensions) {
        const fileName = `${nameWithoutExtension}.${extension}`;
        if (fs.existsSync(fileName)) {
            return fileName;
        }
    }

    throw new Error(
        `Entry is missing. ${nameWithoutExtension}.{${extensions.join(",")}}`,
    );
}
