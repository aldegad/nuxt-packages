<script setup lang="ts">
import { useCamera, useCanvas, useLoots, usePlayer, useTrees } from "@aldegad/nuxt-forest-princess/composables";
import { commandMap } from "@aldegad/nuxt-forest-princess/schemas";
import { drawObjects } from "@aldegad/nuxt-forest-princess/utils";
import { useCommand } from "@aldegad/nuxt-core";

const canvasRef = ref<HTMLCanvasElement | null>(null);

const { watchUpdate } = useCanvas({ canvasRef });
const { command } = useCommand({ map: commandMap });

const camera = useCamera();
const player = usePlayer();
const trees = useTrees();
const loots = useLoots();

// 인벤토리 5칸과 슬롯 DOM 요소 참조
const inventory = ref<(string | null)[]>([null, null, null, null, null]);

watchUpdate(({ ctx, deltaTime }) => {
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
  player.checkLootOverlap(loots);

  // 렌더
  camera.begin(ctx);
  drawObjects(ctx, [
    ...trees.state.map((tree) => ({ state: tree, render: trees.render })),
    ...Array.from(loots.state.values()).map((loot) => ({ state: loot, render: loots.render })),
    player,
  ]);
  camera.end(ctx);
});

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
  ]);
});
</script>

<template>
  <div class="states-center relative flex h-screen justify-center">
    <canvas ref="canvasRef" class="h-full w-full"></canvas>

    <!-- 인벤토리 UI (DOM) -->
    <div class="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2 rounded-md bg-white/70 p-2 shadow">
      <template v-for="(id, i) in inventory" :key="i">
        <div class="relative h-10 w-10 rounded border border-slate-300 bg-white">
          <div v-if="id" class="absolute inset-1 rounded bg-slate-400/80"></div>
        </div>
      </template>
    </div>
  </div>
</template>
