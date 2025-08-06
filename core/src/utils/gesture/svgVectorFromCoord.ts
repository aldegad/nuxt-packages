import type { Coord, ModelVector } from "@aldegad/nuxt-core/schemas";

export const svgVectorFromCoord = (coord: Coord, delta: Coord, svgEl: SVGSVGElement | null): ModelVector => {
  if (!svgEl)
    return {
      ...coord,
      deltaX: 0,
      deltaY: 0,
    };

  const pt = svgEl.createSVGPoint();
  pt.x = coord.x;
  pt.y = coord.y;
  const svgStart = pt.matrixTransform(svgEl.getScreenCTM()?.inverse());

  const pt2 = svgEl.createSVGPoint();
  pt2.x = coord.x + delta.x;
  pt2.y = coord.y + delta.y;
  const svgEnd = pt2.matrixTransform(svgEl.getScreenCTM()?.inverse());

  return {
    x: svgStart.x,
    y: svgStart.y,
    deltaX: svgEnd.x - svgStart.x,
    deltaY: svgEnd.y - svgStart.y,
  };
};
