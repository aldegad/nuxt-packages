import type { PivotDir } from "@aldegad/nuxt-core/schemas";

type SafeFloatingPivotProps = {
  position?: PivotDir;
  offset?: { x: number; y: number };
  target?: HTMLElement;
  popover?: HTMLElement;
};

// prettier-ignore
const orderMap: Record<PivotDir, PivotDir[]> = {
  "top": ["top", "bottom", "right", "left", "top-right", "top-left", "bottom-right", "bottom-left"],
  "bottom": ["bottom", "top", "right", "left", "bottom-right", "bottom-left", "top-right", "top-left"],
  "left": ["left", "right", "top", "bottom", "top-left", "bottom-left", "top-right", "bottom-right"],
  "right": ["right", "left", "top", "bottom", "top-right", "bottom-right", "top-left", "bottom-left"],
  "top-left": ["top-left", "top", "left", "bottom", "right", "bottom-left", "top-right", "bottom-right"],
  "top-right": ["top-right", "top", "right", "bottom", "left", "bottom-right", "top-left", "bottom-left"],
  "bottom-left": ["bottom-left", "bottom", "left", "top", "right", "top-left", "bottom-right", "top-right"],
  "bottom-right": ["bottom-right", "bottom", "right", "top", "left", "top-right", "bottom-left", "top-left"],
};

export const safeFloatingPivot = (props: SafeFloatingPivotProps) => {
  const { target, popover, position, offset: _offset } = props;
  if (!target || !popover) return { left: 0, top: 0 };
  const offset = { x: _offset?.x ?? 0, y: _offset?.y ?? 0 };

  const targetRect = target.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const x = targetRect.left;
  const y = targetRect.top;
  const width = targetRect.width;
  const height = targetRect.height;
  const popoverWidth = popoverRect.width;
  const popoverHeight = popoverRect.height;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const placements: Record<PivotDir, () => { left: number; top: number }> = {
    top: () => ({
      left: x + width / 2 - popoverWidth / 2,
      top: y - popoverHeight - offset.y,
    }),
    bottom: () => ({
      left: x + width / 2 - popoverWidth / 2,
      top: y + height + offset.y,
    }),
    right: () => ({
      left: x + width + offset.x,
      top: y + height / 2 - popoverHeight / 2,
    }),
    left: () => ({
      left: x - popoverWidth - offset.x,
      top: y + height / 2 - popoverHeight / 2,
    }),
    "top-left": () => ({
      left: x - popoverWidth - offset.x,
      top: y - popoverHeight - offset.y,
    }),
    "top-right": () => ({
      left: x + width + offset.x,
      top: y - popoverHeight - offset.y,
    }),
    "bottom-left": () => ({
      left: x - popoverWidth - offset.x,
      top: y + height + offset.y,
    }),
    "bottom-right": () => ({
      left: x + width + offset.x,
      top: y + height + offset.y,
    }),
  };

  const tryOrder = orderMap[(position ?? "right") as PivotDir];

  let chosen: { left: number; top: number } | null = null;
  for (const dir of tryOrder) {
    const pos = placements[dir]();
    const fits =
      pos.left >= 0 &&
      pos.top >= 0 &&
      pos.left + popoverWidth <= viewportWidth &&
      pos.top + popoverHeight <= viewportHeight;
    if (fits) {
      chosen = pos;
      break;
    }
  }
  // 모두 안 맞으면 첫 번째 방향 기준으로 화면 내 최대한 보정
  if (!chosen) {
    const pos = placements[tryOrder[0] as PivotDir]();
    let left = pos.left;
    let top = pos.top;
    if (left + popoverWidth > viewportWidth) left = viewportWidth - popoverWidth;
    if (left < 0) left = 0;
    if (top + popoverHeight > viewportHeight) top = viewportHeight - popoverHeight;
    if (top < 0) top = 0;
    chosen = { left, top };
  }

  return {
    left: chosen.left,
    top: chosen.top,
  };
};
