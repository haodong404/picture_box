import solid from "solid-start/vite";
import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import presetWind from "@unocss/preset-wind";

export default defineConfig({
  plugins: [
    UnoCSS({
      presets: [presetWind()],
    }),
    solid({ ssr: false }),
  ],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
