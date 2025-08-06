<script setup lang="ts">
import { useCanvas } from "~/composables/useCanvas";
import { useInput } from "~/composables/useInput";

const canvas = ref<HTMLCanvasElement | null>(null);
const rect = {
  x: 200,
  y: 130,
  width: 50,
  height: 50,
  speed: 0.5,
};

const { watchUpdate } = useCanvas({ canvas });
const { input } = useInput();

watchUpdate(({ ctx, deltaTime }) => {
  if (input.left) {
    rect.x -= rect.speed * deltaTime;
  }
  if (input.right) {
    rect.x += rect.speed * deltaTime;
  }
  ctx.fillStyle = "skyblue";
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
});
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <canvas ref="canvas" width="1024" height="768" class="border border-slate-100"></canvas>
  </div>
</template>
