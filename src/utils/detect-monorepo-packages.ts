import fs from "fs";
import path from "node:path";
import { globSync } from "glob";
import { type Package } from "../package";
import { readJsonFile } from "./read-json-file";

interface PackageJson {
    workspaces?: string[];
}

/**
 * @internal
 * @param pkgPath - Relative path from working directory to root package.json
 */
export function detectMonorepoPackages(...pkgPaths: string[]): Package[] {
    for (const pkgPath of pkgPaths) {
        if (!fs.existsSync(pkgPath)) {
            continue;
        }
        const rootDir = path.dirname(pkgPath);
        const { workspaces } = readJsonFile(pkgPath) as PackageJson;

        if (!workspaces) {
            continue;
        }

        return workspaces
            .map((it) => globSync(`${rootDir}/${it}/package.json`))
            .flat()
            .map((filename): Package => {
                const pkg = readJsonFile(filename) as { name: string };
                return {
                    name: pkg.name,
                    pkgPath: filename,
                    srcPath: path.resolve(path.dirname(filename), "src"),
                };
            });
    }
    return [];
}
