import type { PivotDir } from "./pivot";

export type ModelOverlay = {
  id?: string;
  visible?: boolean;
  transition?: "fade" | "slide-up";
  teleport?: "#teleports" | string;
  target?: HTMLElement | null;
  position?: PivotDir;
  offset?: { x: number; y: number };
  delay?: number;
  backdrop?: boolean;
  backdropClass?: string;
  onClose?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
