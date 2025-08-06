import type { Ref } from "vue";

type UseResizeObserverProps = {
  ref: Ref<HTMLElement | SVGSVGElement | null>;
};
export const useResizeObserver = ({ ref }: UseResizeObserverProps) => {
  let watchCallback: (() => void) | null = null;
  const watchResize = (callback: () => void) => {
    watchCallback = callback;
  };
  const resizeObserver = new ResizeObserver(() => {
    watchCallback?.();
  });

  watch(ref, (newRef, _, onCleanup) => {
    if (newRef) {
      resizeObserver.observe(newRef);
      watchCallback?.();
      onCleanup(() => {
        resizeObserver.disconnect();
      });
    }
  });

  return {
    watchResize,
  };
};
