import { type Plugin } from "vite";
import { transformAsync } from "@babel/core";

const filter = /\.(?:js|ts|vue)$/;

/**
 * Transforms source code with babel.
 */
export function babelPlugin(): Plugin {
    return {
        name: "fk:babel",
        enforce: "post",
        apply: "build",
        /* @ts-expect-error babel and rolldown sourcemap types are no longer compatible (babel has readonly fields) */
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
            const transformed = await transformAsync(src, {
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
