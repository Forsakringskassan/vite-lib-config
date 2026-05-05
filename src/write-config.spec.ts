jest.mock("find-up", () => ({}));

import {
    detectTestRunner,
    generateTsconfig,
    generateTsconfigCypress,
    generateTsconfigLib,
    generateTsconfigPageobjects,
    generateTsconfigSelectors,
} from "./write-config";

describe("detectTestRunner()", () => {
    it("should return 'jest' when jest is in devDependencies", () => {
        expect.assertions(1);
        const pkg = { name: "my-lib", devDependencies: { jest: "^29.0.0" } };
        expect(detectTestRunner(pkg)).toBe("jest");
    });

    it("should return 'jest' when @forsakringskassan/jest-config-vue is in devDependencies", () => {
        expect.assertions(1);
        const pkg = {
            name: "my-lib",
            devDependencies: {
                "@forsakringskassan/jest-config-vue": "^1.0.0",
            },
        };
        expect(detectTestRunner(pkg)).toBe("jest");
    });

    it("should return 'jest' when a jest package is in dependencies", () => {
        expect.assertions(1);
        const pkg = {
            name: "my-lib",
            dependencies: { "ts-jest": "^29.0.0" },
        };
        expect(detectTestRunner(pkg)).toBe("jest");
    });

    it("should return 'vitest' when vitest is in devDependencies", () => {
        expect.assertions(1);
        const pkg = {
            name: "my-lib",
            devDependencies: { vitest: "^1.0.0" },
        };
        expect(detectTestRunner(pkg)).toBe("vitest");
    });

    it("should return 'vitest' when vitest is in dependencies", () => {
        expect.assertions(1);
        const pkg = {
            name: "my-lib",
            dependencies: { vitest: "^1.0.0" },
        };
        expect(detectTestRunner(pkg)).toBe("vitest");
    });

    it("should prefer jest over vitest when both are present", () => {
        expect.assertions(1);
        const pkg = {
            name: "my-lib",
            devDependencies: { jest: "^29.0.0", vitest: "^1.0.0" },
        };
        expect(detectTestRunner(pkg)).toBe("jest");
    });

    it("should return undefined when neither jest nor vitest is present", () => {
        expect.assertions(1);
        const pkg = {
            name: "my-lib",
            devDependencies: { typescript: "^5.0.0" },
        };
        expect(detectTestRunner(pkg)).toBeUndefined();
    });

    it("should return undefined when no dependencies are set", () => {
        expect.assertions(1);
        const pkg = { name: "my-lib" };
        expect(detectTestRunner(pkg)).toBeUndefined();
    });
});

describe("generateTsconfig()", () => {
    it("should generate tsconfig.json extending the package tsconfig", () => {
        expect.assertions(1);
        const result = generateTsconfig();
        expect(JSON.parse(result)).toEqual({
            extends: "@forsakringskassan/vite-lib-config/tsconfig.json",
            references: [
                { path: "./tsconfig.lib.json" },
                { path: "./tsconfig.pageobjects.json" },
                { path: "./tsconfig.cypress.json" },
                { path: "./tsconfig.selectors.json" },
            ],
        });
    });
});

describe("generateTsconfigLib()", () => {
    it("should generate tsconfig.lib.json with package path", () => {
        expect.assertions(1);
        const result = generateTsconfigLib("@example/lib");
        expect(JSON.parse(result)).toEqual({
            extends: "@forsakringskassan/vite-lib-config/tsconfig.lib.json",
            compilerOptions: {
                paths: {
                    "@example/lib": ["src/index.ts"],
                },
            },
        });
    });
});

describe("generateTsconfigCypress()", () => {
    it("should generate tsconfig.cypress.json with cypress and package paths", () => {
        expect.assertions(1);
        const result = generateTsconfigCypress(
            "@example/lib",
            "../../cypress/tsconfig.json",
        );
        expect(JSON.parse(result)).toEqual({
            extends: [
                "@forsakringskassan/vite-lib-config/tsconfig.cypress.json",
                "../../cypress/tsconfig.json",
            ],
            compilerOptions: {
                paths: {
                    "@example/lib/cypress": ["src/cypress/index.ts"],
                    "@example/lib": ["src/index.ts"],
                },
            },
        });
    });
});

describe("generateTsconfigSelectors()", () => {
    it("should generate tsconfig.selectors.json with selectors and package paths", () => {
        expect.assertions(1);
        const result = generateTsconfigSelectors("@example/lib");
        expect(JSON.parse(result)).toEqual({
            extends:
                "@forsakringskassan/vite-lib-config/tsconfig.selectors.json",
            compilerOptions: {
                paths: {
                    "@example/lib/selectors": ["src/selectors/index.ts"],
                    "@example/lib": ["src/index.ts"],
                },
            },
        });
    });
});

describe("generateTsconfigPageobjects()", () => {
    it("should generate tsconfig.pageobjects.json with package path", () => {
        expect.assertions(1);
        const result = generateTsconfigPageobjects("@example/lib");
        expect(JSON.parse(result)).toEqual({
            extends:
                "@forsakringskassan/vite-lib-config/tsconfig.pageobjects.json",
            compilerOptions: {
                paths: {
                    "@example/lib": ["src/index.ts"],
                },
            },
        });
    });
});
