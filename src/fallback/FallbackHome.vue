<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
    examples: string[];
}>();
</script>

<template>
    <div>
        <header>
            <h1>@forsakringskassan/vite-lib-config</h1>
        </header>

        <p v-if="examples.length === 0">Create a new vue example at <b>./src/examples/**</b> to get started.</p>

        <div v-else>
            <p>Start one of the following examples directly:</p>
            <ul>
                <li v-for="example in examples" :key="example">
                    <RouterLink :to="`/${example}`">{{ example }}</RouterLink>
                </li>
            </ul>
            <p>Or from your terminal, type:</p>
            <pre>$ npm start -- {{ examples[0] }}</pre>
        </div>
    </div>
</template>
<style scoped>
header {
    background-color: #116a3e;
    color: #ffffff;
    padding: 1rem;
}

h1 {
    margin: 0;
    font-size: 1.5rem;
}
</style>
