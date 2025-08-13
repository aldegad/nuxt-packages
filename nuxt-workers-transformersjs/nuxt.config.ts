import { fileURLToPath, resolve } from "url";
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["nuxt-workers"],
  alias: {
    "@aldegad/nuxt-transformersjs": fileURLToPath(
      new URL("./src", import.meta.url),
    ),
  },
  css: ["~/assets/css/main.css"],
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
    server: {
      fs: {
        allow: [resolve(__dirname, "../../")],
      },
    },
  },
});
