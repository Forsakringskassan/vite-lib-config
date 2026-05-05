#!/usr/bin/env node

import { run } from "../dist/write-config.mjs";

const cwd = process.cwd();
const argv = process.argv.slice(2);

try {
    await run(cwd, argv);
} catch (err) {
    console.error(err);
    process.exitCode = 1;
}
