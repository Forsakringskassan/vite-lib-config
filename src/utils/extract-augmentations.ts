import dedent from "dedent";

/**
 * @internal
 */
export function extractAugmentations(content: string): string[] {
    const matches = content.matchAll(
        /^declare module\s*"([^"]+)"\s*{([^]+?)^}/gm,
    );
    return Array.from(matches).map((it) => {
        const [withDeclaration, name, withoutDeclaration] = it;

        /* if the augmentation refers to a local file we exclude the "declare
         * module" block itself, if it refers to an external package we include
         * the full declaration */
        if (name.startsWith(".")) {
            const exported = withoutDeclaration.replace(
                /^(\s*)interface/g,
                "$1export interface",
            );
            return dedent(exported);
        } else {
            return withDeclaration;
        }
    });
}
