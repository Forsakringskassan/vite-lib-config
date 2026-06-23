import { type Plugin } from "vite";
import * as babel from "@babel/core";

const filter = /\.(?:js|ts|vue)$/;

/**
 * Transforms source code with babel.
 */
export function babelPlugin(): Plugin {
    return {
        name: "fk:babel",
        enforce: "post",
        apply: "build",
        async transform(src, id) {
            /* skip transforming rolldown runtime, it prevents functions such as
             * `__commonJSMin` from being added properly to the bundle */
            if (id === "\u0000rolldown/runtime.js") {
                return null;
            }

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
