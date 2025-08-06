import { storeToRefs } from "pinia";
import type { ModelOverlay } from "@aldegad/nuxt-core/schemas";
import { useOverlayStore } from "@aldegad/nuxt-core/stores";

export const useOverlayContext = () => {
  const overlayStore = useOverlayStore();
  const { overlays } = storeToRefs(overlayStore);
  const { addOverlay: _addOverlay, removeOverlay: _removeOverlay } = overlayStore;

  const addOverlay = (overlay: Omit<ModelOverlay, "id" | "visible">) => {
    return _addOverlay(overlay);
  };

  const removeOverlay = (id: string) => {
    _removeOverlay(id);
  };

  return {
    overlays,
    addOverlay,
    removeOverlay,
  };
};
