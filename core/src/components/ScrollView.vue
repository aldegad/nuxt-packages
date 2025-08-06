<script setup lang="ts">
import type { OverlayScrollbarsComponentRef } from "overlayscrollbars-vue";
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import { ref } from "vue";

const scrollRef = ref<OverlayScrollbarsComponentRef>();

const scrollTo = (position: number | { top?: number; left?: number }) => {
  const options: ScrollToOptions = {};
  if (typeof position === "number") {
    options.top = position;
  } else {
    if (position.top) {
      options.top = position.top;
    }
    if (position.left) {
      options.left = position.left;
    }
  }
  scrollRef.value?.osInstance()?.elements().viewport.scrollTo(options);
};
const scrollToBottom = () => {
  scrollRef.value?.osInstance()?.elements().viewport.scrollTo({
    top: scrollRef.value?.osInstance()?.elements().viewport.scrollHeight,
  });
};
const scrollToTop = (position: number = 0) => {
  scrollRef.value?.osInstance()?.elements().viewport.scrollTo({ top: position });
};

// Expose method to parent components
defineExpose({
  scrollTo,
  scrollToBottom,
  scrollToTop,
});
</script>

<template>
  <OverlayScrollbarsComponent
    ref="scrollRef"
    aria-label="scroll-view"
    data-component="scroll-view"
    :options="{
      scrollbars: {
        autoHide: 'leave',
        autoHideDelay: 500,
      },
    }"
    defer
  >
    <slot></slot>
  </OverlayScrollbarsComponent>
</template>

<style scoped>
[data-overlayscrollbars="host"] {
  --scroll-bar-width: 8px;
  --scroll-handle-width: 4px;
  --scroll-handle-color: var(--color-slate-600);
  --scroll-handle-hover-color: var(--color-slate-200);
  --scroll-handle-border-radius: var(--radius-md);
}
:deep(.os-scrollbar-vertical.os-scrollbar) {
  width: var(--scroll-bar-width) !important; /* 스크롤바 전체 넓비 */
}
:deep(.os-scrollbar-vertical .os-scrollbar-handle) {
  background-color: var(--scroll-handle-color) !important; /* 스크롤바 색상 */
  width: var(--scroll-handle-width) !important; /* 스크롤바 넓이 */
  border-radius: var(--scroll-handle-border-radius) !important;
}
:deep(.os-scrollbar-vertical .os-scrollbar-handle:hover) {
  background-color: var(--scroll-handle-hover-color) !important; /* 스크롤바 호버 색상 */
}

:deep(.os-scrollbar-horizontal.os-scrollbar) {
  height: var(--scroll-bar-width) !important; /* 스크롤바 전체 넓비 */
}
:deep(.os-scrollbar-horizontal .os-scrollbar-handle) {
  background-color: var(--scroll-handle-color) !important; /* 스크롤바 색상 */
  height: var(--scroll-handle-width) !important; /* 스크롤바 넓이 */
  border-radius: var(--scroll-handle-border-radius) !important;
}
:deep(.os-scrollbar-horizontal .os-scrollbar-handle:hover) {
  background-color: var(--scroll-handle-hover-color) !important; /* 스크롤바 호버 색상 */
}
</style>
