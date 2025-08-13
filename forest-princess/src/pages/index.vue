<script setup lang="ts">
import { Inventory } from "@aldegad/nuxt-forest-princess/components";
import { usePlayer, useTrees } from "@aldegad/nuxt-forest-princess/composables";
import { commandMap } from "@aldegad/nuxt-forest-princess/schemas";
import { useCamera, useCanvas, useInventory, useLoots } from "@aldegad/nuxt-forest-princess/store";
import { drawObjects } from "@aldegad/nuxt-forest-princess/utils";
import { useCommand } from "@aldegad/nuxt-core";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvas = useCanvas();
const { command } = useCommand({ map: commandMap });

const camera = useCamera();
const player = usePlayer();
const trees = useTrees();
const inventory = useInventory();
const loots = useLoots();

const rect = ref<{ src: CanvasImageSource | null; rect: DOMRect | null }>({ src: null, rect: null });

canvas.watchUpdate(({ ctx, deltaTime }) => {
  ctx.save();

  // 카메라
  camera.setViewport(ctx.canvas.width, ctx.canvas.height);
  camera.setFollowTarget(player.state);
  camera.update({ deltaTime });

  // 배경
  ctx.fillStyle = "#7ed957";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();

  // 데이터 업데이트
  player.update({ command, deltaTime });
  const pickedupLoots = player.checkLootOverlap(loots);
  inventory.pickup(pickedupLoots);
  /* const loot = Array.from(loots.state.values())[0];
  rect.value = {
    src: loot?.src || null,
    rect: worldRectToWindowRect({
      worldX: loot?.x || 0,
      worldY: loot?.y || 0,
      worldW: loot?.width || 0,
      worldH: loot?.height || 0,
      camera: camera.state.value,
      canvasEl: ctx.canvas,
    }),
  }; */

  // 렌더
  camera.begin(ctx);
  drawObjects(ctx, [
    ...trees.state.map((tree) => ({ state: tree, render: trees.render })),
    ...Array.from(loots.state.values()).map((loot) => ({ state: loot, render: loots.render })),
    player,
  ]);
  camera.end(ctx);
});

watch(
  canvasRef,
  (newCanvas) => {
    if (newCanvas) {
      canvas.ref = newCanvas;
    }
  },
  { immediate: true },
);

onMounted(() => {
  // 데모: 여러 그루의 나무 배치
  trees.set([
    { x: 100, y: 320 },
    { x: 280, y: 260 },
    { x: 420, y: 360 },
  ]);

  // 데모: 루팅 아이템 사전 배치
  loots.set([
    { x: 180, y: 340 },
    { x: 360, y: 340 },
    { x: 520, y: 420 },
    { x: 640, y: 280 },
    { x: 760, y: 360 },
    { x: 200, y: 500 },
    { x: 450, y: 180 },
    { x: 680, y: 480 },
    { x: 320, y: 120 },
    { x: 580, y: 240 },
    { x: 120, y: 200 },
    { x: 400, y: 300 },
    { x: 600, y: 160 },
    { x: 800, y: 440 },
    { x: 240, y: 380 },
    { x: 480, y: 520 },
    { x: 720, y: 200 },
    { x: 160, y: 460 },
    { x: 540, y: 320 },
    { x: 380, y: 140 },
  ]);
});
</script>

<template>
  <div class="states-center relative flex h-screen justify-center">
    <canvas ref="canvasRef" class="h-full w-full" />

    <!-- 인벤토리 UI (DOM) -->
    <Inventory />
    <!-- <CanvasImg
      :src="rect?.src || null"
      :width="rect?.rect?.width || 0"
      :height="rect?.rect?.height || 0"
      class="fixed top-0 left-0 z-10 border border-red-500 bg-white"
      :style="{
        transform: `translate(${rect?.rect?.left || 0}px, ${rect?.rect?.top || 0}px)`,
        width: (rect?.rect?.width || 0) + 'px',
        height: (rect?.rect?.height || 0) + 'px',
      }"
    /> -->
  </div>
</template>
