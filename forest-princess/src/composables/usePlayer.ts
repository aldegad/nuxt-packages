import { playerFront } from "@aldegad/nuxt-forest-princess/assets/image";
import type { Loot, Player, RenderPlayerProps } from "@aldegad/nuxt-forest-princess/schemas";
import { resizeImage, updatePlayerMovement } from "@aldegad/nuxt-forest-princess/utils";
import type { CommandState } from "@aldegad/nuxt-core";
import type { LootInstance } from "./useLoots";

export const usePlayer = () => {
  const state = reactive<Player>({
    src: null,
    x: 0,
    y: 0,
    width: 128,
    height: 128,
    speed: 0.3,
    movingTime: 0,
    sway: 0,
    swayAngle: 0,
  });

  const loadSprite = () => {
    const playerImage = new Image();
    playerImage.src = playerFront;

    playerImage.onload = () => {
      state.src = resizeImage(playerImage, state.width, state.height);
    };
  };

  const update = (props: { command: CommandState; deltaTime: number }) => {
    updatePlayerMovement({ player: state, ...props });
  };

  const checkLootOverlap = (loots: LootInstance): void => {
    const pickupLoots: string[] = [];
    loots.state.forEach((loot, id) => {
      const isOverlapped =
        state.x < loot.x + loot.width &&
        state.x + state.width > loot.x &&
        state.y < loot.y + loot.height &&
        state.y + state.height > loot.y;
      if (isOverlapped) pickupLoots.push(id);
    });
    // pickupLoots.forEach((loot) => pickupLoot(loot));
  };

  /* const pickupLoot = (loot: Loot) => {
    console.log("pickupLoot", loot);
  }; */

  const render = ({ ctx, state }: RenderPlayerProps) => {
    ctx.save();
    const waistOffset = state.height * 0.75;
    ctx.translate(state.x + state.width / 2, state.y + state.height / 2 + waistOffset);
    ctx.rotate(state.swayAngle);
    if (state.src) {
      ctx.drawImage(state.src, -state.width / 2, -state.height / 2 - waistOffset, state.width, state.height);
    }
    ctx.restore();
  };

  const init = () => {
    loadSprite();
  };

  init();

  return { state, update, render, checkLootOverlap };
};
