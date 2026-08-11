import { type AddressInfo } from "node:net";
import path from "node:path";
import { type ViteDevServer, createServer } from "vite";
import { afterAll, beforeAll, expect, it } from "vitest";
import { indexHtmlPlugin } from "./index-html-plugin";

let server: ViteDevServer;
let origin: string;

beforeAll(async () => {
    server = await createServer({
        configFile: false,
        root: path.join(import.meta.dirname, "../../testbed"),
        plugins: [indexHtmlPlugin()],
        server: {
            host: "::1",
            port: 0,
        },
    });
    await server.listen();
    const addr = server.httpServer!.address() as AddressInfo;
    origin = `http://[::1]:${addr.port}`;
});

afterAll(async () => {
    await server.close();
});

it("should return proper index page", async () => {
    expect.assertions(4);
    const response = await fetch(origin);
    const text = await response.text();
    const contentType = response.headers.get("content-type");
    expect(response.status).toBe(200);
    expect(contentType).toBe("text/html; charset=utf-8");
    expect(text).toContain("FKUI Vite development environment");
    expect(text).toContain('<div id="app"></div>');
});

it("should handle /", async () => {
    expect.assertions(4);
    const response = await fetch(`${origin}/`);
    const text = await response.text();
    const contentType = response.headers.get("content-type");
    expect(response.status).toBe(200);
    expect(contentType).toBe("text/html; charset=utf-8");
    expect(text).toContain("FKUI Vite development environment");
    expect(text).toContain('<div id="app"></div>');
});
