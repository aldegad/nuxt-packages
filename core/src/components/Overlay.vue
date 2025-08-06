<script setup lang="ts">
import OverlayBackdrop from "./OverlayBackdrop.vue";
import { useInheritAttrs } from "../composables";
import type { ModelOverlay } from "../schemas";
import { safeFloatingPivot, tw } from "../utils";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ModelOverlay>(), {
  transition: "fade",
  teleport: "#teleports",
  offset: () => ({ x: 8, y: 8 }),
});

const emit = defineEmits<{
  close: [];
}>();

const { inheritClass, restAttrs } = useInheritAttrs();

const contentRef = ref<HTMLDivElement>();
const overlayDomReady = ref(false);
const parentVisible = ref(false);
const childrenVisible = ref(false);
const pivot = ref({ left: 0, top: 0 });
const timer = ref<NodeJS.Timeout | null>(null);
const className = computed(() => tw("fixed z-1000", inheritClass));
const teleport = computed(() => {
  return props.teleport || "#teleports";
});

const openOverlay = async () => {
  timer.value = setTimeout(async () => {
    await nextTick();
    parentVisible.value = true;
    await nextTick();
    childrenVisible.value = true;
    await nextTick();
    pivot.value = calculatePivot();
    childrenVisible.value = true;
  }, props.delay || 0);
};

const closeOverlay = async () => {
  await nextTick();
  if (timer.value) {
    clearTimeout(timer.value);
    timer.value = null;
  }
  childrenVisible.value = false;
  await nextTick();
  parentVisible.value = false;
};

const calculatePivot = () => {
  const contentEl = contentRef.value?.firstElementChild;
  if (!props.target || !contentEl) {
    return {
      left: 0,
      top: 0,
    };
  }
  const pivot = safeFloatingPivot({
    target: props.target!,
    popover: contentEl as HTMLElement,
    position: props.position,
    offset: props.offset,
  });
  return pivot;
};

watch(
  () => props.visible,
  (value) => {
    if (value) {
      openOverlay();
    } else {
      closeOverlay();
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  overlayDomReady.value = !!document.querySelector(teleport.value);
});
</script>

<template>
  <Teleport v-if="overlayDomReady" :to="teleport">
    <transition name="none">
      <div v-if="parentVisible" aria-label="overlay" data-component="overlay" :class="className" v-bind="restAttrs">
        <template v-if="backdrop">
          <transition name="fade">
            <OverlayBackdrop v-if="childrenVisible" :class="backdropClass" @click="emit('close')" />
          </transition>
        </template>
        <div ref="contentRef" class="contents">
          <transition :name="transition">
            <slot v-if="childrenVisible" :pivot="pivot" />
          </transition>
        </div>
      </div>
    </transition>
  </Teleport>
</template>
