import { defineTestConfig } from "@forsakringskassan/vitest-config";
import { defineConfig } from "vitest/config";

export default defineConfig({
    define: {
        "process.env.ROOT_DIR": JSON.stringify(import.meta.dirname),
    },
    test: defineTestConfig({
        exclude: ["**/node_modules/**", "testbed/**"],
    }),
});
