import type { CommandState } from "@aldegad/nuxt-core";
import type { DrawObject } from "./drawObject";

export type Player = DrawObject & {
  speed: number;
  movingTime: number;
  sway: number;
  swayAngle: number;
};

export type PlayerMovementProps = {
  player: Player;
  command: CommandState;
  deltaTime: number;
};

export type RenderPlayerProps = {
  ctx: CanvasRenderingContext2D;
  state: Player;
};
