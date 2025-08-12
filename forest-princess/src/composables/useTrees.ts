import { treeIdle } from "@aldegad/nuxt-forest-princess/assets/image";
import type { AddTreeProps, RenderTreeProps, Tree } from "@aldegad/nuxt-forest-princess/schemas";
import { resizeImage } from "@aldegad/nuxt-forest-princess/utils";
import { safeRandomUUID } from "@aldegad/nuxt-core";

export const useTrees = () => {
  const baseWidth = 196;
  const baseHeight = 196;

  const sprite = ref<CanvasImageSource | null>(null);
  const trees = reactive<Tree[]>([]);

  const loadSprite = () => {
    const img = new Image();
    img.src = treeIdle;
    img.onload = () => {
      sprite.value = resizeImage(img, baseWidth, baseHeight);
      trees.forEach((t) => (t.src = sprite.value));
    };
  };

  const add = ({ x, y, width = baseWidth, height = baseHeight }: AddTreeProps) => {
    trees.push({ id: safeRandomUUID(), srcUrl: treeIdle, src: sprite.value, x, y, width, height });
  };

  const set = (list: Array<AddTreeProps>) => {
    trees.length = 0;
    trees.push(
      ...list.map(({ x, y, width = baseWidth, height = baseHeight }) => ({
        id: safeRandomUUID(),
        srcUrl: treeIdle,
        src: sprite.value,
        x,
        y,
        width,
        height,
      })),
    );
  };

  const clear = () => {
    trees.length = 0;
  };

  const render = ({ ctx, state }: RenderTreeProps) => {
    if (!sprite.value) return;
    ctx.save();
    ctx.drawImage(sprite.value, state.x, state.y, state.width, state.height);
    ctx.restore();
  };

  const init = () => {
    loadSprite();
  };

  init();

  return { state: trees, add, set, clear, render };
};
