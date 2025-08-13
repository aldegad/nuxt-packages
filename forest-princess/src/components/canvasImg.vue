<script setup lang="ts">
const props = defineProps<{
  src: CanvasImageSource | null;
  width: number;
  height: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

watch(
  [canvasRef, () => props.src, () => props.width, () => props.height],
  ([newCanvas, newSrc, newWidth, newHeight]) => {
    if (newCanvas && newSrc) {
      const ctx = newCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(newSrc, 0, 0, newWidth, newHeight);
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <canvas ref="canvasRef" :width="width" :height="height" />
</template>
