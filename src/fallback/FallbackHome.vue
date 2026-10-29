<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
    name: string;
    examples: string[];
}>();
</script>

<template>
    <div class="fallback">
        <header>
            <h1>Start - {{ name }}</h1>
        </header>
        <div class="fallback-content">
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
    </div>
</template>
<style scoped>
.fallback {
    font-family: system-ui, Arial, sans-serif;
    font-weight: normal;
}

header {
    background-color: #116a3e;
    color: #ffffff;
    padding: 1rem;
}

a {
    color: #2358af;
    text-decoration: none;
}

a:hover {
    color: #1b478d;
    text-decoration: underline;
}

h1 {
    margin: 0;
    font-size: 1.5rem;
}

.fallback-content {
    padding: 1rem;
}
</style>
