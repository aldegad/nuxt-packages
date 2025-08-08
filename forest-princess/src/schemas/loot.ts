import type { DrawObject } from "./drawObject";
import type { ObjectType } from "./objectType";

export type Loot = DrawObject & {
  type: ObjectType.LOOT;
};

export type AddLootProps = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export type RenderLootProps = {
  ctx: CanvasRenderingContext2D;
  state: Loot;
};
