import type { Coord } from "@aldegad/nuxt-core/schemas";

export const useThresholdCoord = (_tolerance: number) => {
  const tolerance = ref(_tolerance);
  const accumulated = ref<Coord>({ x: 0, y: 0 });

  const thresholdCoord = (delta: Coord, breakThreshold: boolean = false) => {
    if (breakThreshold) return { x: delta.x, y: delta.y, passed: true };

    accumulated.value.x += delta.x;
    accumulated.value.y += delta.y;
    const passed = Math.abs(accumulated.value.x) > tolerance.value || Math.abs(accumulated.value.y) > tolerance.value;

    if (!passed) {
      return { x: 0, y: 0, passed };
    }

    return { x: delta.x, y: delta.y, passed };
  };

  const resetThresholdCoord = () => {
    accumulated.value = { x: 0, y: 0 };
  };

  return {
    thresholdCoord,
    resetThresholdCoord,
  };
};
