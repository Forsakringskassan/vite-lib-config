<script setup lang="ts">
import { getCurrentInstance } from "vue";
import { RouterView, createRouter, createWebHashHistory } from "vue-router";
import FallbackHome from "./FallbackHome.vue";
import NotFound from "./NotFound.vue";

// @ts-expect-error -- __AVAILABLE_EXAMPLES__ is injected at build time
const availableExamples = __AVAILABLE_EXAMPLES__;

// @ts-expect-error -- __PACKAGE_NAME__ is injected at build time
const packageName: string = __PACKAGE_NAME__;

const exampleRoutes = availableExamples.map((example: string) => ({
    path: `/${example}`,
    component: () => import(/* @vite-ignore */ `/${example}`),
}));

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            component: FallbackHome,
            props: { examples: availableExamples, name: packageName },
        },
        ...exampleRoutes,
        {
            path: "/:pathMatch(.*)*",
            component: NotFound,
        },
    ],
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- It exists
getCurrentInstance()!.appContext.app.use(router);
</script>

<template>
    <RouterView />
</template>
