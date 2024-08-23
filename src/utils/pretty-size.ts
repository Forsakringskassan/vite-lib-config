export function prettySize(size: number): string {
    if (size < 1024) {
        return `${size} B`;
    } else if (size < 1024 * 1024) {
        const divisor = 1024;
        const rounded = (size / divisor).toFixed(2);
        return `${rounded} kB`;
    } else {
        const divisor = 1024 * 1024;
        const rounded = (size / divisor).toFixed(2);
        return `${rounded} mB`;
    }
}
