// uno.config.ts
import {
    defineConfig,
    presetUno,
    presetWind  } from 'unocss'
  
  export default defineConfig({
    shortcuts: [
      // ...
    ],
    theme: {
      colors: {
        // ...
      }
    },
    presets: [
      presetUno(),
      presetWind(),
    ],
  })