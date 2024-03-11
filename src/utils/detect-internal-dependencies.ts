import { type Package } from "../package";

const exclude = ["/css-variables", "/design"];

function isExcluded(name: string): boolean {
    return exclude.some((suffix) => name.endsWith(suffix));
}

/**
 * @internal
 */
export function detectInternalDependencies(
    packages: Package[],
    dependencies: string[],
): Package[] {
    const internal = packages.filter((pkg) => dependencies.includes(pkg.name));
    const included = internal.filter((pkg) => !isExcluded(pkg.name));
    const num = internal.length;
    const skipped = internal.length - included.length;

    console.group("Detecting monorepo dependencies:");
    if (num > 0) {
        const ies = num === 1 ? "y" : "ies";
        console.log(
            `${num} internal dependenc${ies} found (${skipped} skipped).\n`,
        );
    } else {
        console.log("No internal dependencies found");
    }
    console.groupEnd();

    return included;
}
