/**
 * @internal
 */
export function prettyList(
    deps: string[],
    predicate?: (name: string) => boolean,
): string {
    const filtered = predicate ? deps.filter(predicate) : deps;
    /* eslint-disable-next-line sonarjs/no-alphabetical-sort -- technical debt */
    filtered.sort();
    if (filtered.length > 0) {
        return ["", ...filtered.map((it) => `  - ${it}`)].join("\n");
    } else {
        return "(none)";
    }
}
