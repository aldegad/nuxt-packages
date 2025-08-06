import { resolve } from "url";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: "src/",
  css: ["~/assets/css/main.css"],
  modules: ["@nuxt/eslint", "@nuxt/test-utils/module", "@pinia/nuxt"],
  components: [],
  imports: {
    scan: false,
  },
  ssr: false,
  devServer: {
    port: 3002,
  },
  nitro: {
    static: true,
  },
  vite: {
    plugins: [tailwindcss() as any],
    server: {
      fs: {
        allow: [resolve(__dirname, "../../")],
      },
    },
  },
});
