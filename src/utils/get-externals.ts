import { type PackageJson } from "../package-json";

/**
 * @internal
 */
export function getExternals(pkg: PackageJson): string[] {
    const { peerDependencies = {}, externalDependencies = [] } = pkg;
    const unique = new Set([
        ...Object.keys(peerDependencies),
        ...externalDependencies,
    ]);
    return Array.from(unique).toSorted((a, b) => a.localeCompare(b));
}
