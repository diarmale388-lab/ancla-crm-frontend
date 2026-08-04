import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // Absolute root path for LiteSpeed / Hostinger asset resolution
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-${Date.now()}[extname]`
      }
    }
  }
})
