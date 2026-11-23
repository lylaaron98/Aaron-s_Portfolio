import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { projects } from './src/data/projects'
import { PROJECTS_DEMO_ROUTE, projectDemoRoute } from './src/constants/routes'
import { SITE_URL } from './src/constants/site'

interface PageMeta {
  path: string
  title: string
  description: string
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Writes a real HTML file for every project page, each with its own title,
 * description, canonical URL and social preview tags, plus sitemap.xml.
 *
 * The app is still a client-rendered SPA; this only makes sure crawlers and
 * link previews (LinkedIn, Slack) see the right metadata for /projects/<slug>
 * without running JavaScript. Vercel serves these files before falling back
 * to index.html.
 */
function prerenderProjectPages(): Plugin {
  return {
    name: 'prerender-project-pages',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')

      const pages: PageMeta[] = [
        {
          path: PROJECTS_DEMO_ROUTE,
          title: 'Project demos — Aaron Lee',
          description:
            'Recordings, screenshots and live builds for client and personal projects by Aaron Lee, software engineer in Singapore.',
        },
        ...projects.map((project) => ({
          path: projectDemoRoute(project.title),
          title: `${project.title} — Aaron Lee`,
          description: project.summary,
        })),
      ]

      for (const page of pages) {
        const url = `${SITE_URL}${page.path}`
        const title = escapeHtml(page.title)
        const description = escapeHtml(page.description)

        const html = template
          .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`)
          .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`)
          .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`)
          .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${description}$2`)

        const file = path.join(outDir, page.path.replace(/^\//, ''), 'index.html')
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, html)
      }

      const today = new Date().toISOString().slice(0, 10)
      const urls = ['/', ...pages.map((page) => page.path)]
      const sitemap =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
        '\n</urlset>\n'
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap)

      this.info(`prerendered ${pages.length} project pages and sitemap.xml`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderProjectPages()],
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
  // Absolute, so assets resolve from nested routes such as /projects/<slug>.
  base: '/',
})
