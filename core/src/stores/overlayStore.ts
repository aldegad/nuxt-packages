import { defineStore } from "pinia";
import type { ModelOverlay } from "@aldegad/nuxt-core/schemas";
import { safeRandomUUID } from "@aldegad/nuxt-core/utils";

export const useOverlayStore = defineStore("overlay", {
  state: () => ({
    overlays: new Map<string, ModelOverlay>(),
  }),
  actions: {
    async addOverlay(overlay: Omit<ModelOverlay, "id" | "visible">) {
      const id = safeRandomUUID();
      this.overlays.set(id, {
        id,
        visible: false,
        ...overlay,
        onClose: () => {
          this.removeOverlay(id);
        },
      });
      await nextTick();
      this.overlays.get(id)!.visible = true;
      return id;
    },
    removeOverlay(id: string) {
      const target = this.overlays.get(id);
      if (target) {
        target.visible = false;
        setTimeout(() => {
          this.overlays.delete(id);
          // 애니메이션 기다리기
        }, 300);
      }
    },
  },
});
