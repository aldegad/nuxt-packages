<script setup lang="ts">
import { useCamera, useCanvas, usePlayer, useTrees } from "@aldegad/nuxt-forest-princess/composables";
import { commandMap } from "@aldegad/nuxt-forest-princess/schemas";
import { drawObjects } from "@aldegad/nuxt-forest-princess/utils";
import { useCommand } from "@aldegad/nuxt-core";

const canvas = ref<HTMLCanvasElement | null>(null);

const player = usePlayer();
const trees = useTrees();
const camera = useCamera();

const { watchUpdate } = useCanvas({ canvas });
const { command } = useCommand({ map: commandMap });

watchUpdate(({ ctx, deltaTime }) => {
  camera.setViewport(ctx.canvas.width, ctx.canvas.height);
  camera.setFollowTarget(player.instance);
  camera.update({ deltaTime });
  ctx.save();
  // 좀 더 이쁜 초록색으로 변경 (파스텔톤)
  ctx.fillStyle = "#7ed957";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
  // 업데이트 분리
  player.update({ command, deltaTime });

  camera.begin(ctx);
  drawObjects(ctx, [...trees.instance.map((t) => ({ instance: t, render: trees.render })), player]);
  camera.end(ctx);
});

onMounted(() => {
  // 데모: 여러 그루의 나무 배치
  trees.set([
    { x: 100, y: 320 },
    { x: 280, y: 260 },
    { x: 420, y: 360 },
  ]);
});
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <canvas ref="canvas" width="1024" height="768" class="border border-slate-100 shadow-lg"></canvas>
  </div>
</template>
