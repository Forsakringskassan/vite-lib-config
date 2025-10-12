<script setup lang="ts">
import { onMounted, ref } from "vue";

const count = ref(0);

function increment(): void {
    count.value++;
}

onMounted(() => {
    /* eslint-disable-next-line no-console -- expected to log */
    console.log(`The initial count is ${count.value}.`);
});
</script>

<template>
    <button @click="increment">Count is: {{ count }}</button>
</template>
