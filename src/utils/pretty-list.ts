/**
 * @internal
 */
export function prettyList(
    deps: string[],
    predicate?: (name: string) => boolean,
): string {
    const filtered = predicate ? deps.filter(predicate) : deps;
    filtered.sort((a, b) => a.localeCompare(b));
    if (filtered.length > 0) {
        return ["", ...filtered.map((it) => `  - ${it}`)].join("\n");
    }
    return "(none)";
}
