import * as babel from "@babel/core";
import { type Plugin } from "vite";

const filter = /\.(js|ts|vue)$/;

/**
 * Transforms source code with babel.
 */
export function babelPlugin(): Plugin {
    return {
        name: "fk:babel",
        enforce: "post",
        apply: "build",
        async transform(src, id) {
            const { pathname: filename } = new URL(id, "file://");
            if (!filter.test(filename)) {
                return null;
            }
            const transformed = await babel.transformAsync(src, {
                sourceMaps: true,
                comments: true,
                filename,
            });
            if (!transformed) {
                return null;
            }
            const { code, map } = transformed;
            return {
                code: code ?? src,
                map: map ?? null,
            };
        },
    };
}
