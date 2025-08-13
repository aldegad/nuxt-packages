export type FollowTarget = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CameraState = {
  x: number; // world top-left
  y: number; // world top-left
  width: number; // viewport width
  height: number; // viewport height
  zoom: number;
};

export type Bounds = {
  width: number;
  height: number;
} | null;
