import type { WatchUpdateCallbackProps } from "@aldegad/nuxt-forest-princess/schemas";
import { type AnimatedFrameCallbackProps, animatedFrame, useResizeObserver } from "@aldegad/nuxt-core";

export const useCanvas = defineStore("canvas", () => {
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  let $animatedFrame: ReturnType<typeof animatedFrame> | null = null;
  let watchUpdateCallback: ((props: WatchUpdateCallbackProps) => void) | null = null;

  const { watchResize } = useResizeObserver({ ref: canvasRef });

  const draw = ({ totalTime, deltaTime }: AnimatedFrameCallbackProps) => {
    if (!ctx.value) return;
    ctx.value.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height);
    watchUpdateCallback?.({ ctx: ctx.value, totalTime, deltaTime });
  };

  const watchUpdate = (callback: (props: WatchUpdateCallbackProps) => void) => {
    watchUpdateCallback = callback;
  };

  watch(canvasRef, (newCanvas, _, onCleanup) => {
    if (newCanvas) {
      newCanvas.width = newCanvas.clientWidth;
      newCanvas.height = newCanvas.clientHeight;
      ctx.value = newCanvas.getContext("2d");
      ctx.value!.imageSmoothingEnabled = false;
      ctx.value!.imageSmoothingQuality = "low";
      $animatedFrame = animatedFrame(draw);
      onCleanup(() => {
        $animatedFrame?.destroy();
      });
    }
  });

  watchResize(() => {
    if (canvasRef.value) {
      canvasRef.value.width = canvasRef.value.clientWidth;
      canvasRef.value.height = canvasRef.value.clientHeight;
    }
  });

  return { ref: canvasRef, ctx, watchUpdate };
});

export type CanvasInstance = ReturnType<typeof useCanvas>;
