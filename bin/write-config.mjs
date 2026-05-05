#!/usr/bin/env node

import { run } from "../dist/write-config.js";

const argv = process.argv.slice(2);

try {
    await run(argv);
} catch (err) {
    console.error(err);
    process.exitCode = 1;
}
