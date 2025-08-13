import type { CameraState } from "@aldegad/nuxt-forest-princess/schemas";

type WorldPointToWindowProps = {
  worldX: number;
  worldY: number;
  camera: CameraState;
  canvasEl: HTMLCanvasElement;
};

type WorldRectToWindowRectProps = {
  worldX: number;
  worldY: number;
  worldW: number;
  worldH: number;
  camera: CameraState;
  canvasEl: HTMLCanvasElement;
};

export function worldPointToWindow({ worldX, worldY, camera, canvasEl }: WorldPointToWindowProps) {
  const rect = canvasEl.getBoundingClientRect();
  // Convert from canvas pixel space -> CSS pixels (handles devicePixelRatio)
  const scaleX = rect.width / canvasEl.width;
  const scaleY = rect.height / canvasEl.height;

  // Apply same transform as camera.begin(): scale(zoom) then translate(-x, -y)
  const screenX = (worldX - camera.x) * camera.zoom;
  const screenY = (worldY - camera.y) * camera.zoom;

  // To window (viewport) coords
  return {
    x: rect.left + screenX * scaleX,
    y: rect.top + screenY * scaleY,
  };
}

export function worldRectToWindowRect({
  worldX,
  worldY,
  worldW,
  worldH,
  camera,
  canvasEl,
}: WorldRectToWindowRectProps) {
  const topLeft = worldPointToWindow({ worldX, worldY, camera, canvasEl });
  const bottomRight = worldPointToWindow({ worldX: worldX + worldW, worldY: worldY + worldH, camera, canvasEl });
  return new DOMRect(
    topLeft.x,
    topLeft.y,
    Math.round(bottomRight.x - topLeft.x),
    Math.round(bottomRight.y - topLeft.y),
  );
}
