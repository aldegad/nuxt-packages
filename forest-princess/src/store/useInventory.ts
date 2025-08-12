import type { Loot } from "@aldegad/nuxt-forest-princess/schemas";
import { useCanvas } from "./useCanvas";
import { useLoots } from "./useLoots";

export const useInventory = defineStore("inventory", () => {
  const canvas = useCanvas();
  const lootInstance = useLoots();
  const state = reactive({
    items: [] as Loot[],
    slots: 5,
  });

  const pickup = (loots: Loot[]) => {
    for (let i = 0; i < loots.length; i++) {
      if (state.items.length < state.slots) {
        state.items.push(loots[i]!);
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
