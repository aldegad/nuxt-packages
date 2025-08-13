import type { Loot } from "./loot";

export type Inventory = {};

export type InventoryQueueItem = Loot & {
  startX: number;
  startY: number;
  startW: number;
  startH: number;
  endX: number;
  endY: number;
  endScale: number;
};
