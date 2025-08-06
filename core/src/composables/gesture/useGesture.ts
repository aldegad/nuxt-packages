import type { Ref } from "vue";
import { GestureState } from "@aldegad/nuxt-core/schemas";
import { coordFromEvent } from "@aldegad/nuxt-core/utils";
import { useGestureContext } from "./useGestureContext";
import { useThresholdCoord } from "./useThresholdCoord";

type UseGestureProps = {
  targetRef: Ref<HTMLElement | null>;
};

export const useGesture = ({ targetRef }: UseGestureProps) => {
  let removeGestureEvents: (() => void) | null = null;
  /* let holdMoveStartCoord: Coord = { x: 0, y: 0 };
  let holdMoveDeltaAcc: Coord = { x: 0, y: 0 }; */

  const { gesture, updateGestureState, updateGestureModel } = useGestureContext({
    targetRef,
  });
  const { thresholdCoord, resetThresholdCoord } = useThresholdCoord(3);

  const handleMouseDown = async (e: MouseEvent) => {
    if (!targetRef.value) return;
    resetThresholdCoord();
    updateGestureState(GestureState.HOLD_DOWN);
    await nextTick();
    updateGestureState(GestureState.HOLD);
    updateGestureModel(coordFromEvent(e));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!targetRef.value) return;
    const coord = coordFromEvent(e);

    const delta = {
      x: coord.x - gesture.model.x,
      y: coord.y - gesture.model.y,
    };

    if (gesture.state === GestureState.IDLE || gesture.state === GestureState.HOLD_MOVE) {
      // idle 이면 아무것도 안해
      updateGestureModel(coord, { x: delta.x, y: delta.y });
      return;
    }

    if (gesture.state === GestureState.HOLD) {
      // hold 상태일 경우는 threshold 체크
      const { passed } = thresholdCoord(delta);
      if (passed) {
        updateGestureState(GestureState.HOLD_MOVE);
        updateGestureModel(coord, { x: delta.x, y: delta.y });
      }
      return;
    }

    // 세가지 상태가 모두 아닌 경우, 움직이면 idle로 초기화
    updateGestureState(GestureState.IDLE);
    updateGestureModel(coord, { x: delta.x, y: delta.y });
  };

  const handleMouseUp = async (e: MouseEvent) => {
    if (!targetRef.value) return;
    const prevState = gesture.state;
    updateGestureModel(coordFromEvent(e));
    updateGestureState(GestureState.HOLD_UP);

    if (prevState === GestureState.HOLD) {
      await nextTick();
      updateGestureState(GestureState.CLICK);
    }
    await nextTick();
    updateGestureState(GestureState.IDLE);
  };

  const handleMouseWheel = (e: WheelEvent) => {
    if (!targetRef.value) return;
    e.preventDefault();

    updateGestureState(GestureState.WHEEL);
    updateGestureModel(coordFromEvent(e), {
      x: e.deltaX,
      y: e.deltaY,
    });
  };

  // cleaned up events
  const handleMouseEnter = (e: MouseEvent) => {
    if (!targetRef.value) return;
    handleMouseIdle(e);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    if (!targetRef.value) return;
    handleMouseIdle(e);
  };

  const handleMouseOut = (e: MouseEvent) => {
    if (!targetRef.value) return;
    handleMouseIdle(e);
  };

  const handleMouseIdle = (e: MouseEvent) => {
    if (!targetRef.value) return;
  };

  const createGestureEvents = (target: HTMLElement) => {
    target.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseout", handleMouseOut);
    target.addEventListener("wheel", handleMouseWheel, { passive: false });

    const _removeGestureEvents = () => {
      target.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseout", handleMouseOut);
      target.removeEventListener("wheel", handleMouseWheel);
    };

    return _removeGestureEvents;
  };

  watch(
    () => targetRef.value,
    (newTarget) => {
      removeGestureEvents?.();
      if (newTarget) {
        removeGestureEvents = createGestureEvents(newTarget);
      }
    },
    { immediate: true },
  );

  return {
    gesture,
  };
};
