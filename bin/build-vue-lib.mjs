#!/usr/bin/env node

import { cli } from "../dist/cli.mjs";

const argv = process.argv.slice(2);
cli(argv).catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
