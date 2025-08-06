type WatchUpdateCallbackProps = {
  ctx: CanvasRenderingContext2D;
  deltaTime: number;
};

export const useCanvas = ({ canvas }: { canvas: Ref<HTMLCanvasElement | null> }) => {
  const ctx = ref<CanvasRenderingContext2D | null>(null);
  let watchUpdateCallback: ((props: WatchUpdateCallbackProps) => void) | null = null;
  let lastTimestamp = 0;

  const draw = (timestamp: number = 0) => {
    if (!ctx.value) return;
    ctx.value.clearRect(0, 0, canvas.value!.width, canvas.value!.height);

    const deltaTime = lastTimestamp ? timestamp - lastTimestamp : 0;
    lastTimestamp = timestamp;

    watchUpdateCallback?.({ ctx: ctx.value, deltaTime });

    requestAnimationFrame(draw);
  };

  const watchUpdate = (callback: (props: WatchUpdateCallbackProps) => void) => {
    watchUpdateCallback = callback;
  };

  watch(canvas, (newCanvas) => {
    if (newCanvas) {
      ctx.value = newCanvas.getContext("2d");
    }
  });

  onMounted(() => {
    lastTimestamp = 0;
    requestAnimationFrame(draw);
  });

  onBeforeUnmount(() => {
    ctx.value = null;
  });

  return { ctx, watchUpdate };
};
