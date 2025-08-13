<script setup lang="ts">
import { useInventory } from "@aldegad/nuxt-forest-princess/store";
import CanvasImg from "./CanvasImg.vue";
import InventoryQueue from "./InventoryQueue.vue";

const inventoryRef = ref<HTMLDivElement | null>(null);
const slotRefs = ref<HTMLDivElement[]>([]);
const inventory = useInventory();

watch(
  inventoryRef,
  (newRef) => {
    if (newRef) {
      inventory.state.ref = newRef;
    }
  },
  { immediate: true },
);

watch(
  slotRefs,
  (newRefs) => {
    if (newRefs) {
      console.log("slotRefs", newRefs);
      inventory.state.slotRefs = newRefs;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <div
      ref="inventoryRef"
      class="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2 rounded-md bg-white/70 p-2 shadow"
    >
      <template v-for="slotNum in inventory.state.slotLength" :key="slotNum">
        <div ref="slotRefs" class="flex h-10 w-10 items-center justify-center rounded border border-slate-300 bg-white">
          <div v-if="inventory.state.items[slotNum - 1]" class="rounded bg-slate-400/80">
            <CanvasImg :src="inventory.state.items[slotNum - 1]!.src" :width="32" :height="32" />
          </div>
        </div>
      </template>
    </div>
    <InventoryQueue />
  </div>
</template>
