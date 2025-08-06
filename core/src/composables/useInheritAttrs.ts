import type { ClassNameValue } from "tailwind-merge";
import { computed, mergeProps, useAttrs } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InheritAttrsProps<T extends Record<string, any>> = {
  props?: T;
};
/**
 * 이 composable(useInheritAttrs)는 컴포넌트에서 defineOptions({ inheritAttrs: false })와 함께 사용해야 합니다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useInheritAttrs = <T extends Record<string, any> = Record<string, any>>(
  payload: InheritAttrsProps<T> = {},
) => {
  const { props } = payload;
  const attrs = useAttrs();
  const restAttrs = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
  });
  const mergedAttrs = computed(() => {
    return mergeProps(restAttrs.value, {
      ...props,
    });
  });

  return {
    inheritClass: attrs.class as ClassNameValue,
    restAttrs,
    mergedAttrs,
  };
};
