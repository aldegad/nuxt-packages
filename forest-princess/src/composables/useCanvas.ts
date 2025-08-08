import { type AnimatedFrameCallbackProps, animatedFrame, useResizeObserver } from "@aldegad/nuxt-core";

type WatchUpdateCallbackProps = {
  ctx: CanvasRenderingContext2D;
  totalTime: number;
  deltaTime: number;
};

export const useCanvas = ({ canvasRef }: { canvasRef: Ref<HTMLCanvasElement | null> }) => {
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

  watch(canvasRef, (newCanvas) => {
    if (newCanvas) {
      newCanvas.width = newCanvas.clientWidth;
      newCanvas.height = newCanvas.clientHeight;
      ctx.value = newCanvas.getContext("2d");
      ctx.value!.imageSmoothingEnabled = true;
      ctx.value!.imageSmoothingQuality = "high";
    }
  });

  watchResize(() => {
    if (canvasRef.value) {
      canvasRef.value.width = canvasRef.value.clientWidth;
      canvasRef.value.height = canvasRef.value.clientHeight;
    }
  });

  onMounted(() => {
    $animatedFrame = animatedFrame(draw);
  });

  onBeforeUnmount(() => {
    $animatedFrame?.destroy();
  });

  return { ctx, watchUpdate };
};
