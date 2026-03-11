import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DemoPage from '../components/sections/Projects/DemoPage';
import { ThemeProvider } from '../context/ThemeContext'
import Navbar from '../components/layout/Navbar'
import CursorOverlay from '../components/ui/CursorOverlay'
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
      <Router>
        <CursorOverlay />
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <Suspense>
                  <Hero />
                  <About />
                  <Skills />
                  <Experience />
                  <Projects />
                  <Contact />
                </Suspense>
              }
            />
            <Route path="/demo" element={<DemoPage />} />
          </Routes>
        </main>
        <Footer />
        <ScrollToTop />
      </Router>
    </ThemeProvider>
  )
}

export default App
