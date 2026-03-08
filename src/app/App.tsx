import { lazy, Suspense } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const Hero = lazy(() => import('../components/sections/Hero'))
const About = lazy(() => import('../components/sections/About'))
const Skills = lazy(() => import('../components/sections/Skills'))
const Projects = lazy(() => import('../components/sections/Projects'))
const Contact = lazy(() => import('../components/sections/Contact'))

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

export default App
