import fs from "node:fs/promises";
import { parseArgs } from "node:util";
import { build as viteBuild } from "vite";

export async function cli(args: string[]): Promise<void> {
    const { values: flags } = parseArgs({
        args,
        strict: true,
        allowPositionals: false,
        options: {
            clean: {
                type: "boolean",
                default: false,
            },
            help: {
                type: "boolean",
                default: false,
            },
        },
    });

    if (flags.help) {
        console.log("usage: fk-build-vue-lib [OPTIONS..]");
        console.log(`
  --clean                    Clean dist folder before building.
  --help                     Show this help.
`);
        return;
    }

    if (flags.clean) {
        await fs.rm("dist", { recursive: true, force: true });
    }

    await viteBuild();
}
