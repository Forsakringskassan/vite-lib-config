import { major } from "semver";
import { version } from "vue";

export function detectVueMajor(): 2 | 3 {
    try {
        return major(version) as 2 | 3;
    } catch (err) {
        console.error("Failed to detect Vue version:", err);
        console.error("Assuming Vue 2");
        return 2;
    }
}
