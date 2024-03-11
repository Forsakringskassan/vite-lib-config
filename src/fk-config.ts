import { type MockEntry } from "@forsakringskassan/apimock-express";

/**
 * @public
 */
export interface FKConfig {
    /** @deprecated Not used any longer. Final application should enable banner instead. */
    enableBanner?: boolean;
    /** path to component to mount by default (default `src/dev-vite/app.vue`) */
    entrypoint?: string;
    /** mocks to configure with apimock-express (default `[]`) */
    mocks?: MockEntry[];
}
