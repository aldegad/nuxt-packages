import { useRoute } from "vue-router";

export const useVueRoute = () => {
  const route = useRoute();
  return route;
};
