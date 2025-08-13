import type { Bounds, CameraState, FollowTarget } from "~/schemas";

export const useCamera = defineStore("camera", () => {
  const state = ref<CameraState>({ x: 0, y: 0, width: 0, height: 0, zoom: 1 });
  const followTarget = ref<FollowTarget | Ref<FollowTarget> | null>(null);
  const isFollowEnabled = ref(true);
  const bounds = ref<Bounds>(null);

  const setViewport = (width: number, height: number) => {
    state.value.width = width;
    state.value.height = height;
  };

  const setZoom = (zoom: number) => {
    state.value.zoom = Math.max(0.1, zoom);
  };

  const setPosition = (x: number, y: number) => {
    state.value.x = x;
    state.value.y = y;
  };

  const moveBy = (dx: number, dy: number) => {
    state.value.x += dx;
    state.value.y += dy;
  };

  const setBounds = (nextBounds: Bounds) => {
    bounds.value = nextBounds;
  };

  const enableFollow = () => (isFollowEnabled.value = true);
  const disableFollow = () => (isFollowEnabled.value = false);
  const isFollowTargetRef = (v: unknown): v is Ref<FollowTarget> => {
    const obj = v as Record<string, unknown> | null;
    return !!obj && typeof obj === "object" && "value" in obj;
  };

  const toFollowTarget = (v: FollowTarget | Ref<FollowTarget> | null): FollowTarget | null => {
    if (v == null) return null;
    return isFollowTargetRef(v) ? v.value : v;
  };

  const setFollowTarget = (target: Ref<FollowTarget> | FollowTarget | null) => {
    followTarget.value = target;
  };

  const clampToBounds = () => {
    if (!bounds.value) return;
    const b = bounds.value;
    const vw = state.value.width / state.value.zoom;
    const vh = state.value.height / state.value.zoom;
    state.value.x = Math.min(Math.max(0, state.value.x), Math.max(0, b.width - vw));
    state.value.y = Math.min(Math.max(0, state.value.y), Math.max(0, b.height - vh));
  };

  const update = ({ deltaTime }: { deltaTime: number }) => {
    if (isFollowEnabled.value && followTarget.value) {
      const t = toFollowTarget(followTarget.value)!;
      const targetCenterX = t.x + t.width / 2;
      const targetCenterY = t.y + t.height / 2;
      const desiredX = targetCenterX - state.value.width / (2 * state.value.zoom);
      const desiredY = targetCenterY - state.value.height / (2 * state.value.zoom);

      // 지수 보간으로 부드럽게 추적
      const k = 0.008; // 추적 강도
      const alpha = 1 - Math.exp(-k * deltaTime);
      state.value.x += (desiredX - state.value.x) * alpha;
      state.value.y += (desiredY - state.value.y) * alpha;

      clampToBounds();
    }
  };

  const begin = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.scale(state.value.zoom, state.value.zoom);
    ctx.translate(-Math.floor(state.value.x), -Math.floor(state.value.y));
  };

  const end = (ctx: CanvasRenderingContext2D) => {
    ctx.restore();
  };

  return {
    state,
    setViewport,
    setZoom,
    setPosition,
    moveBy,
    setBounds,
    enableFollow,
    disableFollow,
    setFollowTarget,
    update,
    begin,
    end,
  };
});

export type CameraInstance = ReturnType<typeof useCamera>;
