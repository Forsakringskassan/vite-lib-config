import { type Component } from "vue";

/**
 * Options passed from the toolchain to the `setup` function in `src/local.ts`.
 *
 * @public
 */
export interface SetupOptions {
    /** The component expected to be mounted by the application */
    rootComponent: Component;

    /** Where the application should be mounted */
    selector: string;
}
