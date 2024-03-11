import { prettyList } from "./pretty-list";

it("should output marker if list is empty", () => {
    expect.assertions(1);
    const output = prettyList([]);
    expect(output).toMatchInlineSnapshot(`"(none)"`);
});

it("should output items", () => {
    expect.assertions(1);
    const output = prettyList(["foo", "bar", "baz"]);
    expect(output).toMatchInlineSnapshot(`
        "
          - bar
          - baz
          - foo"
    `);
});

it("should sort items", () => {
    expect.assertions(1);
    const output = prettyList([
        "a",
        "c",
        "b",
        "@c",
        "@a",
        "@b",
        "@foo/b",
        "@foo/c",
        "@foo/a",
    ]);
    expect(output).toMatchInlineSnapshot(`
        "
          - @a
          - @b
          - @c
          - @foo/a
          - @foo/b
          - @foo/c
          - a
          - b
          - c"
    `);
});

it("should filter items", () => {
    expect.assertions(2);
    const output1 = prettyList(["foo", "bar"], (it) => it === "foo");
    const output2 = prettyList(["foo", "bar"], (it) => it === "baz");
    expect(output1).toMatchInlineSnapshot(`
        "
          - foo"
    `);
    expect(output2).toMatchInlineSnapshot(`"(none)"`);
});
