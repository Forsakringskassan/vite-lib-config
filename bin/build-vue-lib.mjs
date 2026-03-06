#!/usr/bin/env node

import { cli } from "../dist/cli.mjs";

const argv = process.argv.slice(2);

/* eslint-disable-next-line unicorn/prefer-top-level-await -- technical debt, this still runs as commonjs */
cli(argv).catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
