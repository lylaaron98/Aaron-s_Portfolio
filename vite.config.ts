import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Keep the demo screen recordings out of the build.
 *
 * The four .mp4 files under public/assets are ~274 MB and were making dist
 * 282 MB. They are never fetched from the deployed site: DemoPage streams them
 * from GitHub's LFS media host, whose URLs resolve against the *repository*
 * path `public/assets/...`. So the files have to stay exactly where they are in
 * git — moving them would break the hosted URLs — but there is no reason to
 * copy them into the bundle. Vite's publicDir is all-or-nothing, so the copy is
 * undone after the fact.
 */
function stripPublicVideos(): Plugin {
  const EXTENSIONS = new Set(['.mp4', '.mov', '.webm'])

  return {
    name: 'strip-public-videos',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      if (!fs.existsSync(outDir)) return

      let removed = 0
      let bytes = 0

      const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            walk(full)
            // Tidy up directories the removals just emptied.
            if (fs.readdirSync(full).length === 0) fs.rmdirSync(full)
            continue
          }
          if (!EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue

          bytes += fs.statSync(full).size
          fs.unlinkSync(full)
          removed += 1
        }
      }

      walk(outDir)

      if (removed > 0) {
        const mb = (bytes / 1024 / 1024).toFixed(1)
        this.info(`stripped ${removed} video file(s) from dist, saving ${mb} MB`)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripPublicVideos()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 950,
    rollupOptions: {
      output: {
        manualChunks(id) {
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
