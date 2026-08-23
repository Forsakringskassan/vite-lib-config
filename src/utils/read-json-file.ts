import fs from "node:fs";
import { type PackageJson } from "../package-json";

/**
 * @internal
 */
export function readJsonFile(filename: `package.json`): PackageJson;
export function readJsonFile(filename: string): unknown;
export function readJsonFile(filename: string): unknown {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
}
