import { describe, expect, it } from "vitest";
import { getExternals } from "./build-selectors";

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
