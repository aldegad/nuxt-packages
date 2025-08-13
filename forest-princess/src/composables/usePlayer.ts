import { playerFront } from "@aldegad/nuxt-forest-princess/assets/image";
import type { Loot, Player, RenderPlayerProps } from "@aldegad/nuxt-forest-princess/schemas";
import type { LootInstance } from "@aldegad/nuxt-forest-princess/store";
import { resizeImage, updatePlayerMovement } from "@aldegad/nuxt-forest-princess/utils";
import { type CommandState, safeRandomUUID } from "@aldegad/nuxt-core";

export const usePlayer = () => {
  const state = reactive<Player>({
    id: safeRandomUUID(),
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

  // 겹치는 영역이 전체 루트 영역의 절반을 넘으면 루팅되게 변경
  const checkLootOverlap = (loots: LootInstance): Loot[] => {
    const pickupLoots: Loot[] = [];
    loots.state.forEach((loot) => {
      // 교집합 영역 계산
      const overlapX = Math.max(0, Math.min(state.x + state.width, loot.x + loot.width) - Math.max(state.x, loot.x));
      const overlapY = Math.max(0, Math.min(state.y + state.height, loot.y + loot.height) - Math.max(state.y, loot.y));
      const overlapArea = overlapX * overlapY;
      const lootArea = loot.width * loot.height;

      // 겹치는 영역이 루트 전체의 절반을 넘으면 루팅
      if (overlapArea > lootArea / 2) {
        pickupLoots.push(loot);
      }
    });
    return pickupLoots;
  };

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
