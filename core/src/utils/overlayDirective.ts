import { useOverlayContext } from "@aldegad/nuxt-core/composables";
import type { ModelOverlay } from "@aldegad/nuxt-core/schemas";

interface OverlayHtmlElement extends HTMLElement {
  _overlay: {
    id: string | null;
    removeOverlay: (id: string) => void;
  };
}

export const overlayDirective = (defaultProps: ModelOverlay) => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mounted(el: OverlayHtmlElement, binding: DirectiveBinding<any>) {
      const { addOverlay, removeOverlay } = useOverlayContext();

      el._overlay = {
        id: null,
        removeOverlay,
      };

      el.addEventListener("mouseenter", async () => {
        el._overlay.id = await addOverlay({
          target: el,
          ...defaultProps,
          ...binding.value,
        });
      });

      el.addEventListener("mouseleave", () => {
        if (el._overlay.id) {
          removeOverlay(el._overlay.id);
        }
      });
    },
    beforeUnmount(el: OverlayHtmlElement) {
      if (el._overlay.id) {
        el._overlay.removeOverlay(el._overlay.id);
      }
    },
  };
};
