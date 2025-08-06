<script setup lang="ts">
import type { ClassNameValue } from "tailwind-merge";
import { computed, ref, watch } from "vue";
import { Overlay } from "../components";
import type { PivotDir } from "../schemas";
import { tw } from "../utils";

const props = withDefaults(
  defineProps<{
    type?: "overlap" | "button";
    color?: string | null;
    opacity?: number | null;
    showOpacity?: boolean;
    position?: PivotDir;
  }>(),
  {
    type: "overlap",
    showOpacity: true,
    opacity: 1,
    position: "top",
  },
);

const emit = defineEmits<{
  change: [payload: { color: string; opacity: number }];
}>();
const attrs = useAttrs();

const targetRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const hueCanvasRef = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;
const _color = ref<string>("");
const _opacity = ref<number>(1);
const visible = ref(false);
const hue = ref(240);
const classNames = computed(() => {
  if (props.type === "button") {
    return tw("relative h-5 w-5 cursor-pointer rounded-md opacity-100", attrs.class as ClassNameValue);
  } else {
    return tw("absolute top-0 left-0 h-full w-full opacity-0", attrs.class as ClassNameValue);
  }
});

const handleClick = () => {
  visible.value = true;
};

const handleClose = () => {
  visible.value = false;
};

const handleChange = () => {
  emit("change", { color: _color.value, opacity: _opacity.value });
};

const handleOpacityChange = () => {
  emit("change", { color: _color.value, opacity: _opacity.value });
};

const handleCanvasClick = (event: MouseEvent) => {
  if (!canvasRef.value || !ctx) return;
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const [r, g, b] = pixel;
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  _color.value = hex;
  emit("change", { color: hex, opacity: _opacity.value });
};

const handleHueClick = (event: MouseEvent) => {
  if (!hueCanvasRef.value || !ctx) return;
  const canvas = hueCanvasRef.value;
  const rect = canvas.getBoundingClientRect();
  const y = event.clientY - rect.top;
  console.log(y, rect.height);
  const huePercent = y / rect.height;
  console.log(huePercent);
  hue.value = Math.round(huePercent * 360);
  drawSVBox(hue.value); // 좌측 S/V 박스 갱신
};

const drawSVBox = (hueValue: number) => {
  if (!canvasRef.value || !ctx) return;
  const canvas = canvasRef.value;
  const width = canvas.width;
  const height = canvas.height;

  const imageData = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    const brightness = 100 - (y / height) * 100;
    for (let x = 0; x < width; x++) {
      const saturation = (x / width) * 100;
      const [r, g, b] = hslToRgb(hueValue, saturation, brightness);
      const index = (y * width + x) * 4;
      imageData.data[index] = r;
      imageData.data[index + 1] = g;
      imageData.data[index + 2] = b;
      imageData.data[index + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
};

const drawHueSlider = () => {
  if (!hueCanvasRef.value) return;
  const canvas = hueCanvasRef.value;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);

  for (let i = 0; i <= 360; i += 60) {
    gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

// HSL → RGB 변환 함수
const hslToRgb = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
};

const setupCanvas = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;

  // Retina 대응 (기본 DPR 고려)
  // const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;
  // console.log(dpr, canvas.width, canvas.height);

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  // scale 해줘야 텍스처 왜곡 없음
  // context.scale(dpr, dpr);
  ctx = context;
};

watch(
  visible,
  (visible) => {
    if (visible) {
      _color.value = props.color ?? "";
      _opacity.value = props.opacity ?? 1;
    }
  },
  { immediate: true },
);

watch(canvasRef, (canvas) => {
  if (!canvas) return;
  setupCanvas();
  drawSVBox(hue.value);
  drawHueSlider();
});
</script>

<template>
  <div ref="targetRef" aria-label="color picker" data-component="color-picker" :class="classNames" @click="handleClick">
    <div
      v-if="type === 'button'"
      class="h-full w-full rounded-md"
      :style="{
        backgroundColor: color || 'transparent',
        opacity: opacity || 1,
      }"
    />
    <Overlay
      :visible="visible"
      :target="targetRef"
      :position="position"
      :backdrop="true"
      backdrop-class="bg-transparent"
      @close="handleClose"
    >
      <template #default="{ pivot }">
        <div
          class="fixed flex flex-col gap-2 rounded-lg bg-white p-2"
          :style="{
            left: `${pivot.left}px`,
            top: `${pivot.top}px`,
          }"
        >
          <div class="flex gap-2">
            <canvas ref="canvasRef" class="cursor-color h-64 w-64 rounded-md" @click="handleCanvasClick"></canvas>
            <canvas ref="hueCanvasRef" class="hue-slider h-64 w-6 rounded-md" @click="handleHueClick" />
          </div>
          <div class="flex w-full items-center gap-2">
            <div class="h-8 w-8 rounded-md" :style="{ backgroundColor: _color }" />
            <input
              v-model="_color"
              class="h-8 flex-1 rounded-md bg-slate-100 px-2 text-sm"
              type="text"
              @update:model-value="handleChange"
            />
            <input
              v-if="showOpacity"
              v-model="_opacity"
              class="h-8 w-12 rounded-md bg-slate-100 px-2 text-sm"
              type="number"
              @update:model-value="handleOpacityChange"
            />
          </div>
        </div>
      </template>
    </Overlay>
  </div>
</template>
