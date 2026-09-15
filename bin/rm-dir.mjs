#!/usr/bin/env node
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const targets = process.argv.slice(2);

if (targets.length === 0) {
    console.log("Specify at least one directory or file to remove.");
    process.exit(1);
}

for (const target of targets) {
    const pathToRemove = resolve(process.cwd(), target);
    await rm(pathToRemove, { recursive: true, force: true });
}
