import { createApp } from "vue";
import { type SetupOptions } from "@forsakringskassan/vite-lib-config";

export function setup(options: SetupOptions): void {
    const { rootComponent, selector } = options;
    const app = createApp(rootComponent);
    app.mount(selector);
}
