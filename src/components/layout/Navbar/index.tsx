import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './Navbar.module.css'
import { useTheme } from '../../../context/ThemeContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const lastScrollRef = useRef(0)
  const hiddenRef = useRef(false)
  const scrolledRef = useRef(false)
  const { theme, toggleTheme } = useTheme()

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.logo}`, { opacity: 0, y: -20, duration: 0.5, delay: 0.1, ease: 'power2.out' })
    }, navRef)
    return () => ctx.revert()
  }, [])

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      const nextScrolled = current > 50
      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled
        setScrolled(nextScrolled)
      }

      if (!navRef.current) return

      const shouldHide = current > lastScrollRef.current && current > 100
      if (shouldHide !== hiddenRef.current) {
        hiddenRef.current = shouldHide
        gsap.to(navRef.current, {
          y: shouldHide ? '-100%' : 0,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      lastScrollRef.current = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header ref={navRef} className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <a href="#hero" className={styles.logo}>
          <span className={styles.logoBracket}>&lt;</span>
          <span className={styles.shinyText}>Aaron</span>
          <span className={styles.logoBracket}> /&gt;</span>
        </a>

        <nav className={styles.nav}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className={styles.toggleTrack}>
              <span className={`${styles.toggleThumb} ${theme === 'light' ? styles.toggleLight : ''}`}>
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </span>
            </span>
          </button>
        </nav>
      </div>
    </header>
  )
}
