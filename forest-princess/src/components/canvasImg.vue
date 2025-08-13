<script setup lang="ts">
const props = defineProps<{
  src: CanvasImageSource | null;
  width: number;
  height: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (canvasRef.value && props.src) {
    const ctx = canvasRef.value.getContext("2d");
    if (ctx) {
      ctx.drawImage(props.src, 0, 0, props.width, props.height);
    }
  }
});
</script>

<template>
  <canvas ref="canvasRef" :width="width" :height="height" />
</template>
