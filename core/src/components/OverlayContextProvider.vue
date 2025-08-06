<script setup lang="ts">
import { useOverlayStore } from "../stores";

const store = useOverlayStore();
const { overlays } = storeToRefs(store);
</script>

<template>
  <div aria-label="overlay provider" data-component="overlay-provider">
    <slot v-for="[id, item] in overlays" :key="id" name="content" :item="item as any" />
  </div>
</template>
