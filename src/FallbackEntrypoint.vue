<!-- eslint-disable @typescript-eslint/no-non-null-assertion, unicorn/max-nested-calls, vue/one-component-per-file -- default -->
<script setup lang="ts">
import { type PropType, defineComponent, getCurrentInstance, h } from "vue";
import { RouterLink, createRouter, createWebHashHistory } from "vue-router";

const availableExamples = __AVAILABLE_EXAMPLES__;

const renderEmptyState = (): ReturnType<typeof h> =>
    h("p", ["Create a new vue example at ", h("b", "./src/examples/**"), " to get started."]);

const renderExampleList = (examples: string[]): ReturnType<typeof h> => {
    const listItems = examples.map((example) =>
        h(
            "li",
            { key: example },
            h(RouterLink, { to: `/${example}` }, () => example),
        ),
    );

    return h("div", [
        h("p", "Start one of the following examples directly:"),
        h("ul", listItems),
        h("p", "Or from your terminal, type:"),
        h("pre", `$ npm run start -- ${examples[0]}`),
    ]);
};

const renderNotFound = (): ReturnType<typeof h> =>
    h("div", [h("h1", "404"), h("p", "Example not found."), h(RouterLink, { to: "/" }, () => "Back to start page")]);

const FallbackHome = defineComponent({
    props: {
        examples: {
            type: Array as PropType<string[]>,
            required: true,
        },
    },
    setup(props) {
        return () =>
            h("div", [
                h("h1", "@forsakringskassan/vite-lib-config"),
                props.examples.length === 0 ? renderEmptyState() : renderExampleList(props.examples),
            ]);
    },
});

const NotFound = defineComponent({
    setup() {
        return renderNotFound;
    },
});

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
            props: { examples: availableExamples },
        },
        ...exampleRoutes,
        {
            path: "/:pathMatch(.*)*",
            component: NotFound,
        },
    ],
});

getCurrentInstance()!.appContext.app.use(router);
</script>

<template>
    <RouterView />
</template>
