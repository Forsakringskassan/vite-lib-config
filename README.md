# `@forsakringskassan/vite-lib-config`

Toolchain for building Vue framework libraries.

- Hybrid ESM/CJS packages.
- Transpiled with Babel.
- Supports monorepo.

## Configuration

### Bundled dependencies

By default all dependencies (`dependencies` and `peerDependencies`) are marked as external and not bundled in output files.
This can be overriden by setting `externalDependencies` in `package.json`:

```diff
     "dependencies": {
         "lodash": "^4.17.20"
     },
+    "externalDependencies": [
+        "lodash"
+    ],
```

## Usage

### `babel.config.js`

```js
module.exports = {
    presets: ["@forsakringskassan/vite-lib-config/babel"],
};
```

### `vite.config.ts`

```ts
import { defineConfig } from "@forsakringskassan/vite-lib-config/vite";

export default defineConfig();
```

In addition to the regular Vite configuration you can also pass the optional `fk` property:

```
export interface FKConfig {
    /** path to component to mount by default (default `src/dev-vite/app.vue`) */
    entrypoint?: string;
    /** mocks to configure with apimock-express (default `[]`) */
    mocks?: MockEntry[];
}
```

### `package.json`

```json
{
    "scripts": {
        "build": "fk-build-vue-lib"
    }
}
```

### Optional: API Extractor

```diff
 {
     "scripts": {
         "build": "fk-build-vue-lib",
+        "postbuild": "fk-api-extractor api-extractor.json",
     }
 }
```

Multiple files or globs can be given:

> fk-api-extractor api-extractor.\*.json

To fix global module augmentations use:

> fk-api-extractor --patch-augmentations

Use `--help` to see full description.

### Dev-server

```json
{
    "scripts": {
        "start": "vite"
    }
}
```

Create `src/local.{ts,mts,mjs,js}` exporting a single function `setup`:

```
import { createApp } from "vue";
import { type SetupOptions } from "@forsakringskassan/vite-lib-config";

export function setup(options: SetupOptions): void {
    const { rootComponent, selector } = options;
    const app = createApp(rootComponent);
    app.mount(selector);
}
```

If the `setup` function is async (i.e. returns a `Promise`) it will be awaited before continuing.

Create `src/vite-dev/app.vue` containing the root component you want to serve as a development environment.

### Appending Plugins

If you need to use custom plugins in your library, remember to also include the default plugins, these will otherwise by overwritten.

#### `vite.config.ts`

```ts
import {
    defineConfig,
    defaultPlugins,
} from "@forsakringskassan/vite-lib-config/vite";

export default defineConfig({
    plugins: [...defaultPlugins, myFancyPlugin],
});
```
