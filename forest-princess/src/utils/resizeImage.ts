export const resizeImage = (image: HTMLImageElement, targetWidth: number, targetHeight: number): HTMLCanvasElement => {
  const stepsCanvas = document.createElement("canvas");
  const stepsCtx = stepsCanvas.getContext("2d")!;

  // 초기 사이즈는 원본
  let currentWidth = image.width;
  let currentHeight = image.height;

  stepsCanvas.width = currentWidth;
  stepsCanvas.height = currentHeight;

  stepsCtx.imageSmoothingEnabled = true;
  stepsCtx.imageSmoothingQuality = "high";

  stepsCtx.drawImage(image, 0, 0);

  while (currentWidth * 0.5 > targetWidth) {
    const nextCanvas = document.createElement("canvas");
    const nextCtx = nextCanvas.getContext("2d")!;
    currentWidth = Math.max(targetWidth, currentWidth * 0.5);
    currentHeight = Math.max(targetHeight, currentHeight * 0.5);

    nextCanvas.width = currentWidth;
    nextCanvas.height = currentHeight;

    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = "high";
    nextCtx.drawImage(stepsCanvas, 0, 0, currentWidth, currentHeight);

    stepsCanvas.width = currentWidth;
    stepsCanvas.height = currentHeight;
    stepsCtx.drawImage(nextCanvas, 0, 0);
  }

  return stepsCanvas;
};
