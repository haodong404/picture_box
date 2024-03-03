import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import UnoCSS from "unocss/vite";
import TOML from "@ltd/j-toml";
import fs from "fs";

const raw = fs.readFileSync("../Cargo.toml", "utf-8");
const cargo_toml: any = TOML.parse(raw);

export default defineConfig({
  plugins: [
    solidPlugin(),
    UnoCSS({
      configFile: "./uno.config.ts"
    }),
  ],
  
  define: {
    FRONTEND_VERSION: JSON.stringify(process.env.npm_package_version),
    CORE_VERSION: JSON.stringify(cargo_toml.package.version),
    MOCK: false,
  },
  server: {
    port: 3000,
    proxy: {
      "/api/pictures": "http://localhost:7709",
    },
  },
  build: {
    target: "esnext",
  },
});
