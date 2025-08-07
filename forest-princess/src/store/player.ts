import type { Player } from "@aldegad/nuxt-forest-princess/schemas";

export const usePlayer = defineStore("player", () => {
  const player = ref<Player>({
    src: null,
    x: 0,
    y: 0,
    width: 128,
    height: 128,
    speed: 0.3,
    movingTime: 0,
  });

  const move = (dx: number, dy: number) => {
    player.value.x += dx;
    player.value.y += dy;
  };

  return { player, move };
});
