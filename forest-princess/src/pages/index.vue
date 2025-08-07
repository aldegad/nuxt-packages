<script setup lang="ts">
import { playerFront } from "@aldegad/nuxt-forest-princess/assets/image";
import { useCanvas } from "@aldegad/nuxt-forest-princess/composables";
import { commandMap } from "@aldegad/nuxt-forest-princess/schemas";
import { usePlayer } from "@aldegad/nuxt-forest-princess/store";
import { playerMovement, resizeImage } from "@aldegad/nuxt-forest-princess/utils";
import { useCommand } from "@aldegad/nuxt-core";

const canvas = ref<HTMLCanvasElement | null>(null);

const playerStore = usePlayer();
const { player } = storeToRefs(playerStore);

const playerImage = new Image();
playerImage.src = playerFront;

playerImage.onload = () => {
  player.value.src = resizeImage(playerImage, 128, 128);
};

const { watchUpdate } = useCanvas({ canvas });
const { command } = useCommand({ map: commandMap });

watchUpdate(({ ctx, deltaTime }) => {
  playerMovement({ ctx, player, command, deltaTime });
});

onMounted(() => {});
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <canvas ref="canvas" width="1024" height="768" class="border border-slate-100 shadow-lg"></canvas>
  </div>
</template>
