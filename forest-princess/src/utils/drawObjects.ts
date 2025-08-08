import type { DrawObject } from "@aldegad/nuxt-forest-princess/schemas";

export type WorldObject = {
  state: DrawObject;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (props: { ctx: CanvasRenderingContext2D; state: any }) => void;
};

export const drawObjects = (ctx: CanvasRenderingContext2D, objects: WorldObject[]) => {
  const drawables = [
    ...objects.map((o) => ({
      yBottom: o.state.y + o.state.height,
      draw: () => o.render({ ctx, state: o.state }),
    })),
  ];

  drawables.sort((a, b) => a.yBottom - b.yBottom).forEach((d) => d.draw());
};
