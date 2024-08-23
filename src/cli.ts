import fs from "node:fs/promises";
import path from "node:path/posix";
import { build as viteBuild, createLogger } from "vite";
import colors from "picocolors";
import * as babel from "@babel/core";
import { displayTime, prettySize } from "./utils";

const cjsSrcFile = "temp/index.cjs.js";
const esmSrcFile = "temp/index.es.js";
const dstDir = "dist";
const cjsDstFile = `${dstDir}/cjs/index.cjs.js`;
const esmDstFile = `${dstDir}/esm/index.esm.js`;
const logger = createLogger();

async function transpile(src: string, dst: string): Promise<void> {
    const dstMap = `${dst}.map`;
    const result = await babel.transformFileAsync(src, {
        sourceMaps: true,
        comments: true,
    });
    if (!result) {
        throw new Error("babel transform failed");
    }
    const { code, map } = result;
    await Promise.all([
        fs.writeFile(dst, code ?? "", "utf-8"),
        fs.writeFile(dstMap, JSON.stringify(map), "utf-8"),
    ]);
    const stat = await Promise.all([fs.stat(dst), fs.stat(dstMap)]);
    const size = stat.map((it) => prettySize(it.size));
    logger.info(`${src} -> ${dst} ${colors.bold(size[0])} | map: ${size[1]}`);
}

export async function cli(): Promise<void> {
    const startTime = Date.now();

    await fs.rm(dstDir, { recursive: true, force: true });
    await fs.mkdir(path.dirname(cjsDstFile), { recursive: true });
    await fs.mkdir(path.dirname(esmDstFile), { recursive: true });

    await viteBuild();

    console.log();
    console.log(
        colors.cyan(`babel v${babel.version}`),
        colors.green("transpiling..."),
    );

    await Promise.all([
        transpile(esmSrcFile, esmDstFile),
        transpile(cjsSrcFile, cjsDstFile),
    ]);

    const duration = displayTime(Date.now() - startTime);
    console.log();
    console.log(colors.green(`Build successful (${duration}) 🎉`));
}
