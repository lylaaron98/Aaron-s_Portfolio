import { lazy, Suspense, useEffect } from 'react'
import { ThemeProvider } from '../context/ThemeContext'
import OrbitNav from '../orbit/OrbitNav'
import OrbitFooter from '../orbit/OrbitFooter'
import OrbitHome from '../orbit/OrbitHome'
import { smoothScrollTo } from '../utils/smoothScroll'
import { demoSlugFromPath, pathFromLegacyHash, slugifyProject } from '../constants/routes'
import { projects } from '../data/projects'
import { interceptLinkClicks, navigate, useLocation } from '../utils/router'

const DemoPage = lazy(() => import('../components/sections/Projects/DemoPage'))

// Old shared links used #/projects/demo/<slug>. Move them to the real path
// before the first render so they land on the right page.
const HOME_TITLE = document.title

function titleFor(slug: string | null) {
  if (slug === null) return HOME_TITLE
  if (!slug) return 'Project demos — Aaron Lee'
  const project = projects.find((candidate) => slugifyProject(candidate.title) === slug)
  return project ? `${project.title} — Aaron Lee` : 'Project not found — Aaron Lee'
}

const legacyPath = pathFromLegacyHash(window.location.hash)
if (legacyPath) window.history.replaceState(null, '', legacyPath)

function App() {
  const { pathname, hash } = useLocation()
  const slug = demoSlugFromPath(pathname)
  const isDemoPage = slug !== null

  useEffect(() => {
    document.title = titleFor(slug)
  }, [slug])

  useEffect(() => interceptLinkClicks(), [])

  useEffect(() => {
    if (isDemoPage) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    if (!hash) return

    requestAnimationFrame(() => smoothScrollTo(hash))
  }, [pathname, hash, isDemoPage])

  // An unknown path renders the home page; tidy the address bar to match.
  useEffect(() => {
    if (!isDemoPage && pathname !== '/') navigate(`/${hash}`, { replace: true })
  }, [isDemoPage, pathname, hash])

  return (
    <ThemeProvider>
      <OrbitNav />
      <main id="main">
        {isDemoPage ? (
          <Suspense fallback={null}>
            <DemoPage />
          </Suspense>
        ) : (
          <OrbitHome />
        )}
      </main>
      <OrbitFooter />
    </ThemeProvider>
  )
}

export default App
