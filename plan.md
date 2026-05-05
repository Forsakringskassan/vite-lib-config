## step 1: create shared tsconfig.json

in the `tsconfig/` folder.

## step 2: create cli script to generate files in consumer library

for each file in `tsconfig/` write a file with a similar name to the working directory, each file should extend the file from `tsconfig/`:

```json
{
    "extends": "@forsakringskassan/vite-lib-config/tsconfig.json"
}
```

`compilerOptions.paths` should include package name mapped to `src/index.ts`, e.g.

```json
{
    "compilerOptions": {
        "paths": {
            "@fkui/vue/cypress": "src/cypress/index.ts"
            "@fkui/vue/selectors": "src/selectors/index.ts"
            "@fkui/vue": "src/index.ts"
        }
    }
}
```

for cypress locate and add the `cypress/tsconfig.json` file, e.g. `"extends": "../../cypress/tsconfig.json"`. in a monorepo setup this will be in a parent folder, in a non-monorepo setup this will be in the same directory.

the script should be used for other configuration files in the future

the script should be named `fk-write-config`.

if there are any other tsconfig files, remove them

for each tsconfig, add a corresponding function which takes all the required parameters it needs and outputs the content as a string. add tests for these functions. these functions may not read or write files directly.

the `run` function should then gather the required parameters, call the tsconfig functions and write the result to disk.

## step 3: update cli script to have vitest/jest feature detection

if jest is detected (including `@forsakringskassan/jest-config-vue`) some workarounds should be applied automatically.

different tsconfig files will need different workarounds, add a placeholder for each one and I'll add the contents manually.

add cli parameters `--with-jest` and `--with-vitest` to override feature detection.

## step 4: update fk-build-selectors to be more verbose

have it write out when `src/cypress/index.ts` or `src/selectors/index.ts` does not exist.

fail with exit code 1 if neither exists.
