import { type Package } from "../package";

/**
 * @internal
 */
export function detectInternalDependencies(
    packages: Package[],
    dependencies: string[],
): Package[] {
    const internal = packages.filter((pkg) => dependencies.includes(pkg.name));
    const num = internal.length;

    console.group("Detecting monorepo dependencies:");
    if (num > 0) {
        const ies = num === 1 ? "y" : "ies";
        console.log(`${num} internal dependenc${ies} found.\n`);
    } else {
        console.log("No internal dependencies found");
    }
    console.groupEnd();

    return internal;
}
