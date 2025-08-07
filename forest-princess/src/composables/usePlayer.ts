import type { Player } from "@aldegad/nuxt-forest-princess/schemas";
import { type PlayerMovementProps, playerMovement } from "@aldegad/nuxt-forest-princess/utils";

export const usePlayer = () => {
  const player = ref<Player>({
    src: null,
    x: 0,
    y: 0,
    width: 128,
    height: 128,
    speed: 0.3,
    movingTime: 0,
  });

  const move = (props: PlayerMovementProps) => {
    playerMovement(props);
  };

  return { player, move };
};
