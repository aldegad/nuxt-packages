import { type AnimatedFrameCallbackProps, animatedFrame } from "@aldegad/nuxt-core";

type WatchUpdateCallbackProps = {
  ctx: CanvasRenderingContext2D;
  totalTime: number;
  deltaTime: number;
};

export const useCanvas = ({ canvas }: { canvas: Ref<HTMLCanvasElement | null> }) => {
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  let $animatedFrame: ReturnType<typeof animatedFrame> | null = null;
  let watchUpdateCallback: ((props: WatchUpdateCallbackProps) => void) | null = null;

  const draw = ({ totalTime, deltaTime }: AnimatedFrameCallbackProps) => {
    if (!ctx.value) return;
    ctx.value.clearRect(0, 0, canvas.value!.width, canvas.value!.height);

    watchUpdateCallback?.({ ctx: ctx.value, totalTime, deltaTime });
  };

  const watchUpdate = (callback: (props: WatchUpdateCallbackProps) => void) => {
    watchUpdateCallback = callback;
  };

  watch(canvas, (newCanvas) => {
    if (newCanvas) {
      ctx.value = newCanvas.getContext("2d");
      ctx.value!.imageSmoothingEnabled = true;
      ctx.value!.imageSmoothingQuality = "high";
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
