<script setup lang="ts">

import { computed } from 'vue';


// Constants

const FLAGS_URL = 'https://flagcdn.com/w40';


// Defining the props

const props = defineProps<{
  country: string,
  title?: string|null,
}>();


// Defining the computed

const url = computed(() => {
  return `${FLAGS_URL}/${props.country?.toLowerCase() || 'unknown'}.png`;
});

</script>

<template>
    <span class="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm">
        <img
            v-if="country"
            :title="title"
            :src="url"
            :alt="title"
        />
    </span>
</template>