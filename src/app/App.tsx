import { lazy, Suspense, useEffect, useState } from 'react'
import { ThemeProvider } from '../context/ThemeContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/ui/ScrollToTop'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Experience from '../components/sections/Experience'
import Projects from '../components/sections/Projects'
import Contact from '../components/sections/Contact'
import Statement from '../components/sections/Statement'
import Loader from '../orbit/Loader'
import { addTask, trackPageAssets } from '../orbit/loadProgress'
import { useMotionBudget, useSmoothScroll } from '../orbit/motion'
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

// The intro plays once per full page load, and only when it lands on home.
const landedOnHome = demoSlugFromPath(window.location.pathname) === null

function App() {
  const { pathname, hash } = useLocation()
  const slug = demoSlugFromPath(pathname)
  const isDemoPage = slug !== null
  const { reduced, allow3d } = useMotionBudget()
  const [showLoader, setShowLoader] = useState(landedOnHome)
  const [introPending, setIntroPending] = useState(landedOnHome)

  // Register the load work before the loader subscribes, so it cannot read
  // 100% before the 3D scene has started.
  useState(() => {
    if (!landedOnHome) return
    if (allow3d) addTask('scene', 3)
    trackPageAssets(['/assets/profile.webp'])
  })

  useSmoothScroll(!reduced)

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
      {showLoader && (
        <Loader reduced={reduced} onReveal={() => setIntroPending(false)} onDone={() => setShowLoader(false)} />
      )}
      <Navbar />
      <main>
        {isDemoPage ? (
          <Suspense fallback={null}>
            <DemoPage />
          </Suspense>
        ) : (
          <>
            <Hero introPending={introPending} />
            <Statement />
            <About />
            <Skills />
            <Experience />
            <Projects />
            <Contact />
          </>
        )}
      </main>
      {!isDemoPage && <Footer />}
      <ScrollToTop />
    </ThemeProvider>
  )
}

export default App
