import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: '/', // Absolute root path for LiteSpeed / Hostinger asset resolution
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.source.html')
      },
      output: {
        // Hash de contenido nativo de Vite: el nombre del archivo solo cambia si su
        // contenido cambia. Evita acumular un par de archivos nuevo en cada build
        // (antes se usaba Date.now(), que generaba un nombre distinto SIEMPRE,
        // incluso si el contenido era idéntico) y permite cachear agresivamente
        // los bundles que no cambiaron entre despliegues.
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash][extname]`
      }
    }
  }
})
