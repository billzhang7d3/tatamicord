/// <reference types="vite/types/importMeta.d.ts" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
    coverage: {
      include: [ "src/**" ],
      exclude: [
        "blank.ts",
        "postcss.config.cjs",
        "src/main.tsx",
        "src/theme.ts",
        "src/vite-env.d.ts"
      ]
    }
  },
})
