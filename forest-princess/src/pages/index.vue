<script setup lang="ts">
import { CanvasImg } from "@aldegad/nuxt-forest-princess/components";
import { useCamera, usePlayer, useTrees } from "@aldegad/nuxt-forest-princess/composables";
import { commandMap } from "@aldegad/nuxt-forest-princess/schemas";
import { useCanvas, useInventory, useLoots } from "@aldegad/nuxt-forest-princess/store";
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
      console.log("newCanvas", newCanvas);
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

  // 데모: 루팅 아이템 5개 사전 배치
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
  ]);
});
</script>

<template>
  <div class="states-center relative flex h-screen justify-center">
    <canvas ref="canvasRef" class="h-full w-full" />

    <!-- 인벤토리 UI (DOM) -->
    <div class="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2 rounded-md bg-white/70 p-2 shadow">
      <template v-for="slotNum in inventory.state.slots" :key="slotNum">
        <div class="relative h-10 w-10 rounded border border-slate-300 bg-white">
          <div v-if="inventory.state.items[slotNum - 1]" class="absolute inset-1 rounded bg-slate-400/80">
            <CanvasImg :src="inventory.state.items[slotNum - 1]!.src" :width="32" :height="32" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
