export function displayTime(time: number): string {
    // display: {X}ms
    if (time < 1000) {
        return `${time}ms`;
    }

    time = time / 1000;

    // display: {X}s
    if (time < 60) {
        return `${time.toFixed(2)}s`;
    }

    const mins = parseInt((time / 60).toString(), 10);
    const seconds = time % 60;
    const minuteString = `${mins}m`;
    const secondString = seconds < 1 ? "" : ` ${seconds.toFixed(0)}s`;

    // display: {X}m {Y}s
    return `${minuteString}m${secondString}`;
}
