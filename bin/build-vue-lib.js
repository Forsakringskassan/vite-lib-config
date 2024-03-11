#!/usr/bin/env node

const { cli } = require("../dist/cli");

const argv = process.argv.slice(2);
cli(argv).catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
