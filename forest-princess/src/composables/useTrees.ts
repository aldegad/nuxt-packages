import { treeIdle } from "@aldegad/nuxt-forest-princess/assets/image";
import type { AddTreeProps, RenderTreeProps, Tree } from "@aldegad/nuxt-forest-princess/schemas";
import { resizeImage } from "@aldegad/nuxt-forest-princess/utils";

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
      // 스프라이트 로드 후 기존 인스턴스들의 src를 공유 스프라이트로 연결
      trees.forEach((t) => (t.src = sprite.value));
    };
  };

  const add = ({ x, y, width = baseWidth, height = baseHeight }: AddTreeProps) => {
    trees.push({ src: sprite.value, x, y, width, height });
  };

  const set = (list: Array<AddTreeProps>) => {
    trees.length = 0;
    trees.push(
      ...list.map(({ x, y, width = baseWidth, height = baseHeight }) => ({
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

  const render = ({ ctx, instance }: RenderTreeProps) => {
    if (!sprite.value) return;
    ctx.save();
    ctx.drawImage(sprite.value, instance.x, instance.y, instance.width, instance.height);
    ctx.restore();
  };

  const init = () => {
    loadSprite();
  };

  init();

  return { instance: trees, add, set, clear, render };
};
