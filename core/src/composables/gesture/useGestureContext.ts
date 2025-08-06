import type { Ref } from "vue";
import { useResizeObserver } from "@aldegad/nuxt-core/composables";
import { GestureState } from "@aldegad/nuxt-core/schemas";
import type { Coord, Gesture, GestureModel } from "@aldegad/nuxt-core/schemas";
import { svgVectorFromCoord } from "@aldegad/nuxt-core/utils";

type UseGestureContextProps = {
  targetRef: Ref<HTMLElement | SVGSVGElement | null>;
};

export const useGestureContext = ({ targetRef }: UseGestureContextProps) => {
  const gesture = reactive<Gesture>({
    state: GestureState.IDLE,
    model: {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      domRect: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
      domVector: {
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0,
      },
      svgVector: {
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0,
      },
    },
  });

  const { watchResize } = useResizeObserver({ ref: targetRef });

  const updateGestureState = (state: GestureState) => {
    gesture.state = state;
    if (state === GestureState.IDLE) {
      enableUserSelection();
    } else {
      disableUserSelection();
    }
  };

  const updateGestureModel = (coord: Coord, delta?: Coord) => {
    if (!targetRef.value) return;

    const isSvg = targetRef.value instanceof SVGSVGElement;

    const newGestureModel: GestureModel = {
      x: coord.x,
      y: coord.y,
      deltaX: delta?.x ?? 0,
      deltaY: delta?.y ?? 0,
      domRect: gesture.model.domRect,
      domVector: {
        x: coord.x - gesture.model.domRect.left,
        y: coord.y - gesture.model.domRect.top,
        deltaX: delta?.x ?? 0,
        deltaY: delta?.y ?? 0,
      },
      svgVector: isSvg
        ? svgVectorFromCoord(coord, delta ?? { x: 0, y: 0 }, targetRef.value as SVGSVGElement)
        : {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
          },
    };
    gesture.model = newGestureModel;
  };

  const updateGestureRect = () => {
    if (!targetRef.value) return;
    const rect = targetRef.value.getBoundingClientRect();
    gesture.model.domRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const disableUserSelection = () => {
    document.body.classList.add("no-user-select");
  };

  const enableUserSelection = () => {
    document.body.classList.remove("no-user-select");
  };

  watchResize(() => {
    updateGestureRect();
  });

  return {
    gesture,
    updateGestureState,
    updateGestureModel,
  };
};
