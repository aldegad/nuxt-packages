import type { Coord } from "@aldegad/nuxt-core/schemas";

export const coordFromEvent = (e: MouseEvent | TouchEvent): Coord => {
  let clientX: number;
  let clientY: number;

  if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent) {
    const touch = e.touches[0] || e.changedTouches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    clientX = (e as MouseEvent).clientX;
    clientY = (e as MouseEvent).clientY;
  }

  return { x: clientX, y: clientY };
};
