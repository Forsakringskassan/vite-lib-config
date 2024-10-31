import { build as viteBuild } from "vite";

export async function cli(): Promise<void> {
    await viteBuild();
}
