import { playerFront } from "@aldegad/nuxt-forest-princess/assets/image";
import type { Player, RenderPlayerProps } from "@aldegad/nuxt-forest-princess/schemas";
import { resizeImage, updatePlayerMovement } from "@aldegad/nuxt-forest-princess/utils";
import type { CommandState } from "@aldegad/nuxt-core";

export const usePlayer = () => {
  const instance = reactive<Player>({
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
      instance.src = resizeImage(playerImage, instance.width, instance.height);
    };
  };

  const init = () => {
    loadSprite();
  };

  const update = (props: { command: CommandState; deltaTime: number }) => {
    updatePlayerMovement({ player: instance, ...props });
  };

  const render = ({ ctx, instance }: RenderPlayerProps) => {
    ctx.save();
    const waistOffset = instance.height * 0.75;
    ctx.translate(instance.x + instance.width / 2, instance.y + instance.height / 2 + waistOffset);
    ctx.rotate(instance.swayAngle);
    if (instance.src) {
      ctx.drawImage(
        instance.src,
        -instance.width / 2,
        -instance.height / 2 - waistOffset,
        instance.width,
        instance.height,
      );
    }
    ctx.restore();
  };

  init();

  return { instance, update, render };
};
