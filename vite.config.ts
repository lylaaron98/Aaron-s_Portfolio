import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-three/fiber') || id.includes('three')) {
            return 'three-stack'
          }

          if (id.includes('gsap')) {
            return 'gsap'
          }

          if (id.includes('react-icons')) {
            return 'icons'
          }
        },
      },
    },
  },
  base: './',
})
