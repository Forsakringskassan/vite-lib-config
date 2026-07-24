import { describe, expect, it } from "vitest";
import { isStaticAsset } from "./api-extractor";

describe("isStaticAsset()", () => {
    it("should return true for css assets", () => {
        expect.assertions(8);
        expect(isStaticAsset("./foo.css")).toBeTruthy();
        expect(isStaticAsset("./foo.scss")).toBeTruthy();
        expect(isStaticAsset("./foo.sass")).toBeTruthy();
        expect(isStaticAsset("./foo.less")).toBeTruthy();
        expect(isStaticAsset("./foo.styl")).toBeTruthy();
        expect(isStaticAsset("./foo.stylus")).toBeTruthy();
        expect(isStaticAsset("./foo.pcss")).toBeTruthy();
        expect(isStaticAsset("./foo.sss")).toBeTruthy();
    });

    it("should return false for other imports", () => {
        expect.assertions(3);
        expect(isStaticAsset("./foo")).toBeFalsy();
        expect(isStaticAsset("./foo.ts")).toBeFalsy();
        expect(isStaticAsset("./foo.mjs")).toBeFalsy();
    });
});
