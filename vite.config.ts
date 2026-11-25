import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const r = (p: string) => path.resolve(import.meta.dirname, p)

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': r('./src') },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        index: r('index.html'),
        hakkimda: r('hakkimda.html'),
        projeler: r('projeler.html'),
        blog: r('blog.html'),
        galeri: r('galeri.html'),
        iletisim: r('iletisim.html'),
      },
    },
  },
})
