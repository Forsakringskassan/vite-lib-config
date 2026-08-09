import fs from "node:fs/promises";
import { build as viteBuild } from "vite";

export async function cli(argv: string[]): Promise<void> {
    if (argv.includes("--clean")) {
        await fs.rm("dist", { recursive: true, force: true });
    }
    await viteBuild();
}
