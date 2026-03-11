import { useEffect, useState } from 'react'
import { ThemeProvider } from '../context/ThemeContext'
import Navbar from '../components/layout/Navbar'
import CursorOverlay from '../components/ui/CursorOverlay'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/ui/ScrollToTop'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Experience from '../components/sections/Experience'
import Projects from '../components/sections/Projects'
import Contact from '../components/sections/Contact'
import DemoPage from '../components/sections/Projects/DemoPage'
import { smoothScrollTo } from '../utils/smoothScroll'
import { PROJECTS_DEMO_ROUTE } from '../constants/routes'

function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const isDemoPage = hash.startsWith(PROJECTS_DEMO_ROUTE)

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash)

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (isDemoPage) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    if (!hash || hash.startsWith('#/')) return

    requestAnimationFrame(() => smoothScrollTo(hash))
  }, [hash, isDemoPage])

  return (
    <ThemeProvider>
      <CursorOverlay />
      <Navbar />
      <main>
        {isDemoPage ? (
          <DemoPage />
        ) : (
          <>
            <Hero />
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
