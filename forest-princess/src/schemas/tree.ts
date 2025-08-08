import type { DrawObject } from "./drawObject";

export type Tree = DrawObject;

export type AddTreeProps = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type RenderTreeProps = {
  ctx: CanvasRenderingContext2D;
  instance: Tree;
};
