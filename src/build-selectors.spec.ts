import { checkEntrypoints, getExternals } from "./build-selectors";

describe("getExternals()", () => {
    it("should return packages from peerDependencies", () => {
        expect.assertions(1);
        const pkg = {
            peerDependencies: {
                foo: "^1.0.0",
                bar: "^2.0.0",
            },
        };
        const result = getExternals(pkg);
        expect(result).toEqual(["bar", "foo"]);
    });

    it("should return packages from externalDependencies", () => {
        expect.assertions(1);
        const pkg = {
            externalDependencies: ["foo", "bar"],
        };
        const result = getExternals(pkg);
        expect(result).toEqual(["bar", "foo"]);
    });

    it("should combine peerDependencies and externalDependencies", () => {
        expect.assertions(1);
        const pkg = {
            peerDependencies: {
                foo: "^1.0.0",
                bar: "^2.0.0",
            },
            externalDependencies: ["bar", "baz"],
        };
        const result = getExternals(pkg);
        expect(result).toEqual(["bar", "baz", "foo"]);
    });

    it("should return empty array when neither peerDependencies nor externalDependencies are set", () => {
        expect.assertions(1);
        const pkg = {};
        const result = getExternals(pkg);
        expect(result).toEqual([]);
    });
});

describe("checkEntrypoints()", () => {
    it("should not throw when both entrypoints exist", () => {
        expect.assertions(1);
        expect(() => {
            checkEntrypoints(true, true);
        }).not.toThrow();
    });

    it("should not throw when only cypress exists", () => {
        expect.assertions(1);
        expect(() => {
            checkEntrypoints(true, false);
        }).not.toThrow();
    });

    it("should not throw when only selectors exists", () => {
        expect.assertions(1);
        expect(() => {
            checkEntrypoints(false, true);
        }).not.toThrow();
    });

    it("should log when src/cypress/index.ts does not exist", () => {
        expect.assertions(1);
        const spy = jest.spyOn(console, "log").mockReturnValue(undefined);
        checkEntrypoints(false, true);
        expect(spy).toHaveBeenCalledWith(
            "src/cypress/index.ts does not exist, skipping",
        );
        spy.mockRestore();
    });

    it("should log when src/selectors/index.ts does not exist", () => {
        expect.assertions(1);
        const spy = jest.spyOn(console, "log").mockReturnValue(undefined);
        checkEntrypoints(true, false);
        expect(spy).toHaveBeenCalledWith(
            "src/selectors/index.ts does not exist, skipping",
        );
        spy.mockRestore();
    });

    it("should throw when neither entrypoint exists", () => {
        expect.assertions(1);
        const spy = jest.spyOn(console, "log").mockReturnValue(undefined);
        expect(() => {
            checkEntrypoints(false, false);
        }).toThrow(
            "Neither src/cypress/index.ts nor src/selectors/index.ts exists",
        );
        spy.mockRestore();
    });
});
