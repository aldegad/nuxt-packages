<script setup lang="ts">
import type { InventoryQueueItem, Loot } from "@aldegad/nuxt-forest-princess/schemas";
import { useCamera, useCanvas, useInventory } from "@aldegad/nuxt-forest-princess/store";
import { worldRectToWindowRect } from "@aldegad/nuxt-forest-princess/utils";
import CanvasImg from "./CanvasImg.vue";

const camera = useCamera();
const canvas = useCanvas();
const inventory = useInventory();
const rootingItems = reactive<InventoryQueueItem[]>([]);

const addRootingItem = (loot: Loot) => {
  const slotRefs = inventory.state.slotRefs;
  const itemsLength = inventory.state.items.length;
  const firstEmptySlot = slotRefs[itemsLength + rootingItems.length]!;
  const slotRect = firstEmptySlot.getBoundingClientRect();

  const windowRect = worldRectToWindowRect({
    worldX: loot.x,
    worldY: loot.y,
    worldW: loot.width,
    worldH: loot.height,
    camera: camera.state,
    canvasEl: canvas.ref!,
  });
  const item = {
    ...loot,
    startX: windowRect.x,
    startY: windowRect.y,
    startW: windowRect.width,
    startH: windowRect.height,
    endX: slotRect.x,
    endY: slotRect.y,
    endScale: slotRect.width / windowRect.width,
  };

  rootingItems.push(item);
};

const afterEnter = (_el: Element) => {
  const el = _el as HTMLElement;
  const index = Number(el.dataset.index);
  const item = inventory.state.itemsQueue.splice(index, 1);
  rootingItems.splice(index, 1);
  inventory.state.items.push(item[0]!);
};

watch(inventory.state.itemsQueue, (newItemsQueue) => {
  if (newItemsQueue.length > 0) {
    newItemsQueue.forEach((loot) => {
      if (!rootingItems.some((item) => item.id === loot.id)) {
        // new items
        addRootingItem(loot);
      }
    });
  }
});
</script>

<template>
  <TransitionGroup data-component="rootings" aria-label="rootings" name="rooting" tag="ul" @after-enter="afterEnter">
    <li
      v-for="(loot, index) in rootingItems"
      :key="loot.id"
      :data-index="index"
      class="rooting fixed top-0 left-0"
      :style="{
        width: loot.startW + 'px',
        height: loot.startH + 'px',
        '--rooting-duration': '500ms',
        '--rooting-start-x': loot.startX + 'px',
        '--rooting-start-y': loot.startY + 'px',
        '--rooting-end-x': loot.endX + 'px',
        '--rooting-end-y': loot.endY + 'px',
        '--rooting-end-scale': loot.endScale,
      }"
    >
      <CanvasImg :src="loot.src" :width="loot.startW" :height="loot.startH" />
    </li>
  </TransitionGroup>
</template>

<style scoped>
.rooting {
  transform: translate(var(--rooting-end-x), var(--rooting-end-y)) scale(var(--rooting-end-scale));
}

.rooting-enter-active {
  transition-property: transform;
  transition-timing-function: ease-in-out;
  transform-origin: top left;
  transition-duration: var(--rooting-duration);
}

.rooting-enter-from {
  transform: translate(var(--rooting-start-x), var(--rooting-start-y));
}
</style>
