import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

function dedent(str) {
    const lines = str.split("\n");
    const indent = Math.min(
        ...lines
            .filter((line) => line.trim())
            .map((line) => line.match(/^(\s*)/)[1].length),
    );
    return lines
        .map((line) => line.slice(indent))
        .join("\n")
        .trim();
}

async function readJsonFile(filePath) {
    const fullPath = path.join(import.meta.dirname, filePath);
    const content = await readFile(fullPath, "utf8");
    return JSON.parse(content);
}

async function buildTree(dir, prefix = "") {
    const entries = await readdir(dir);
    const sorted = entries.toSorted();
    const lines = await Promise.all(
        sorted.map(async (entry, index) => {
            const isLast = index === sorted.length - 1;
            const fullPath = path.join(dir, entry);
            const st = await stat(fullPath);
            const isDir = st.isDirectory();
            const connector = isLast ? "└── " : "├── ";
            const childPrefix = prefix + (isLast ? "    " : "│   ");
            const line = `${prefix}${connector}${entry}${isDir ? "/" : ""}`;
            if (isDir) {
                const subtree = await buildTree(fullPath, childPrefix);
                return [line, ...subtree];
            } else {
                return [line];
            }
        }),
    );
    return lines.flat();
}

describe("dist", () => {
    it("should contain the correct file structure", async (t) => {
        const distDir = path.join(import.meta.dirname, "dist");
        const tree = await buildTree(distDir);
        const result = ["dist/", ...tree].join("\n");
        t.assert.equal(
            result,
            dedent(`
                dist/
                ├── cjs/
                │   ├── index.cjs.js
                │   ├── index.cjs.js.map
                │   └── package.json
                └── esm/
                    ├── index.esm.js
                    ├── index.esm.js.map
                    └── package.json
            `),
        );
    });

    it("should have package.json with correct type", async (t) => {
        const cjs = await readJsonFile("dist/cjs/package.json");
        const esm = await readJsonFile("dist/esm/package.json");
        t.assert.deepEqual(cjs, { type: "commonjs" });
        t.assert.deepEqual(esm, { type: "module" });
    });
});
