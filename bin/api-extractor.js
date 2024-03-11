#!/usr/bin/env node

const { run } = require("../dist/api-extractor");

const argv = process.argv.slice(2);
run(argv).catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
