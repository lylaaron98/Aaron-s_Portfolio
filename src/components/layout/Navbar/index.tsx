import { useState, useEffect, useRef } from 'react'
import styles from './Navbar.module.css'
import { cx } from '../../../utils/classNames'
import { useTheme } from '../../../context/ThemeContext'
import { navLinks } from '../../../data/navigation'
import { PROJECTS_DEMO_ROUTE } from '../../../constants/routes'
import Logo from '../../ui/Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScrollRef = useRef(0)
  const hiddenRef = useRef(false)
  const scrolledRef = useRef(false)
  const { theme, toggleTheme } = useTheme()

  // Hide on scroll down, show on scroll up.
  useEffect(() => {
    let rafId: number | null = null

    const updateFromScroll = () => {
      const current = window.scrollY
      const nextScrolled = current > 24
      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled
        setScrolled(nextScrolled)
      }

      const shouldHide = current > lastScrollRef.current && current > 120
      if (shouldHide !== hiddenRef.current) {
        hiddenRef.current = shouldHide
        setHidden(shouldHide)
      }

      lastScrollRef.current = current
    }

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        updateFromScroll()
        rafId = null
      })
    }

    updateFromScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <header className={cx(styles.navbar, scrolled && styles.scrolled, hidden && styles.navbarHidden)}>
      <div className={styles.inner}>
        <a href="#hero" className={styles.logo} aria-label="Aaron Lee — home">
          <Logo variant="solid" />
        </a>

        <nav className={styles.nav} aria-label="Primary">
          <div className={styles.navLinks}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </a>
            ))}
            <a href={PROJECTS_DEMO_ROUTE} className={cx(styles.navLink, styles.demoLink)}>
              Demo
            </a>
          </div>

          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            type="button"
            role="switch"
            aria-checked={theme === 'light'}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className={styles.toggleTrack}>
              <span className={cx(styles.toggleThumb, theme === 'light' && styles.toggleLight)}>
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
