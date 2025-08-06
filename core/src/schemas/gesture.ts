export type Gesture = {
  state: GestureState;
  model: GestureModel;
};

export enum GestureState {
  IDLE = "IDLE",
  HOLD_DOWN = "HOLD_DOWN",
  HOLD = "HOLD",
  HOLD_MOVE = "HOLD_MOVE",
  HOLD_UP = "HOLD_UP",
  CLICK = "CLICK",
  WHEEL = "WHEEL",
}

export type GestureModel = {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  domRect: ModelRect;
  domVector: ModelVector;
  svgVector: ModelVector;
};

export type ModelRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ModelVector = {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
};
