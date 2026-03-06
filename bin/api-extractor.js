#!/usr/bin/env node

const { run } = require("../dist/api-extractor");

const argv = process.argv.slice(2);

/* eslint-disable-next-line unicorn/prefer-top-level-await -- technical debt, this still runs as commonjs */
run(argv).catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
