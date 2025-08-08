import type { DrawObject } from "@aldegad/nuxt-forest-princess/schemas";

export type WorldObject = {
  instance: DrawObject;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (props: { ctx: CanvasRenderingContext2D; instance: any }) => void;
};

export const drawObjects = (ctx: CanvasRenderingContext2D, objects: WorldObject[]) => {
  const drawables = [
    ...objects.map((o) => ({
      yBottom: o.instance.y + o.instance.height,
      draw: () => o.instance.src && o.render({ ctx, instance: o.instance }),
    })),
  ];

  drawables.sort((a, b) => a.yBottom - b.yBottom).forEach((d) => d.draw());
};
