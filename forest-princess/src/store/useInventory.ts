import type { Loot } from "@aldegad/nuxt-forest-princess/schemas";
import { useLoots } from "./useLoots";

export const useInventory = defineStore("inventory", () => {
  const lootInstance = useLoots();

  const state = reactive({
    ref: null as HTMLDivElement | null,
    slotRefs: [] as HTMLDivElement[],
    items: [] as Loot[],
    slotLength: 5,
    itemsQueue: [] as Loot[],
  });

  const pickup = (loots: Loot[]) => {
    for (let i = 0; i < loots.length; i++) {
      if (state.items.length + state.itemsQueue.length < state.slotLength) {
        state.itemsQueue.push(loots[i]!);
        lootInstance.removeById(loots[i]!.id);
      } else {
        break;
      }
    }
  };

  return {
    state,
    pickup,
  };
});

export type InventoryInstance = ReturnType<typeof useInventory>;
