import { logIdle } from "@aldegad/nuxt-forest-princess/assets/image";
import { type AddLootProps, type Loot, ObjectType, type RenderLootProps } from "@aldegad/nuxt-forest-princess/schemas";
import { resizeImage } from "@aldegad/nuxt-forest-princess/utils";
import { safeRandomUUID } from "@aldegad/nuxt-core";

export const useLoots = () => {
  const baseWidth = 48;
  const baseHeight = 48;

  const sprite = ref<CanvasImageSource | null>(null);
  const state = reactive(new Map<string, Loot>());

  const loadSprite = () => {
    const lootImage = new Image();
    lootImage.src = logIdle;
    lootImage.onload = () => {
      sprite.value = resizeImage(lootImage, baseWidth, baseHeight);
      Object.values(state).forEach((l) => (l.src = sprite.value));
    };
  };

  const add = ({ x, y, width = baseWidth, height = baseHeight }: AddLootProps) => {
    state.set(safeRandomUUID(), { type: ObjectType.LOOT, src: sprite.value, x, y, width, height });
  };

  const set = (list: Array<AddLootProps>) => {
    const newLoots: Loot[] = list.map(({ x, y, width = baseWidth, height = baseHeight }) => ({
      type: ObjectType.LOOT,
      src: sprite.value,
      x,
      y,
      width,
      height,
    }));
    state.clear();
    newLoots.forEach((l) => state.set(safeRandomUUID(), l));
  };

  const clear = () => {
    state.clear();
  };

  const removeById = (id: string) => {
    state.delete(id);
  };

  const render = ({ ctx, state }: RenderLootProps) => {
    if (!sprite.value) return;
    ctx.save();
    ctx.drawImage(sprite.value, state.x, state.y, state.width, state.height);
    ctx.restore();
  };

  const init = () => {
    loadSprite();
  };

  init();

  return { state, add, set, clear, removeById, render };
};

export type LootInstance = ReturnType<typeof useLoots>;
