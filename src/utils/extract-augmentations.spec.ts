import dedent from "dedent";
import { extractAugmentations } from "./extract-augmentations";

describe("extractAugmentations()", () => {
    it("should find module augmentation", () => {
        expect.assertions(2);
        const content = dedent`
            declare module "foo" {
                interface Foo {
                    /**
                     * Does something useful
                     */
                    usefulFunction(): void;
                }
            }
        `;
        const result = extractAugmentations(content);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchInlineSnapshot(`
            "declare module "foo" {
                interface Foo {
                    /**
                     * Does something useful
                     */
                    usefulFunction(): void;
                }
            }"
        `);
    });

    it("should find global augmentation", () => {
        expect.assertions(2);
        const content = dedent`
            declare global {
                namespace foo {
                    interface Bar {
                        /**
                         * Does something useful
                         */
                        usefulFunction(): void;
                    }
                }
            }
        `;
        const result = extractAugmentations(content);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchInlineSnapshot(`
            "declare global {
                namespace foo {
                    interface Bar {
                        /**
                         * Does something useful
                         */
                        usefulFunction(): void;
                    }
                }
            }"
        `);
    });

    it("should find multiple augmentations", () => {
        expect.assertions(3);
        const content = dedent`
            declare module "foo" {
                interface Foo {
                    usefulFunction(): void;
                }
            }

            declare module "bar" {
                interface Bar {
                    uselessFunction(): void;
                }
            }
        `;
        const result = extractAugmentations(content);
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchInlineSnapshot(`
            "declare module "foo" {
                interface Foo {
                    usefulFunction(): void;
                }
            }"
        `);
        expect(result[1]).toMatchInlineSnapshot(`
            "declare module "bar" {
                interface Bar {
                    uselessFunction(): void;
                }
            }"
        `);
    });

    it("should find local augmentation", () => {
        expect.assertions(2);
        const content = dedent`
            declare module "./foo" {
                export interface Foo {
                    usefulFunction(): void;
                }
            }
        `;
        const result = extractAugmentations(content);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchInlineSnapshot(`
            "export interface Foo {
                usefulFunction(): void;
            }"
        `);
    });

    it("should force local augmentation to be exported", () => {
        expect.assertions(2);
        const content = dedent`
            declare module "./foo" {
                interface Foo {
                    usefulFunction(): void;
                }
            }
        `;
        const result = extractAugmentations(content);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchInlineSnapshot(`
            "export interface Foo {
                usefulFunction(): void;
            }"
        `);
    });
});
