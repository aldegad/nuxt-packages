import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@aldegad/nuxt-core": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "NuxtCore",
      fileName: "nuxt-core",
    },
    rollupOptions: {
      // 외부 의존성으로 처리할 패키지들
      external: ["vue", "vue-router", "pinia"],
      output: {
        // UMD 빌드에서 사용할 전역 변수들
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          pinia: "Pinia",
        },
      },
    },
  },
});
