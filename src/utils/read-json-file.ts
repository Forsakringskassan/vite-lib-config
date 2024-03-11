import fs from "node:fs";

/**
 * @internal
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- result can be literally anything */
export function readJsonFile(filename: string): any {
    return JSON.parse(fs.readFileSync(filename, "utf-8"));
}
