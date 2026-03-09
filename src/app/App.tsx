import { lazy, Suspense } from 'react'
import { ThemeProvider } from '../context/ThemeContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/ui/ScrollToTop'

const Hero = lazy(() => import('../components/sections/Hero'))
const About = lazy(() => import('../components/sections/About'))
const Skills = lazy(() => import('../components/sections/Skills'))
const Experience = lazy(() => import('../components/sections/Experience'))
const Projects = lazy(() => import('../components/sections/Projects'))
const Contact = lazy(() => import('../components/sections/Contact'))

function App() {
  return (
    <ThemeProvider>
      <Navbar />
      <main>
        <Suspense>
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Contact />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </ThemeProvider>
  )
}

export default App
