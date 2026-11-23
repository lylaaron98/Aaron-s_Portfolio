import { useEffect, useState } from 'react'
import { RESUME_URL } from '../constants/site'
import { useLocation } from '../utils/router'
import styles from './OrbitNav.module.css'

const LINKS = [
  { href: '/#about', label: 'About' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#contact', label: 'Contact' },
]

export default function OrbitNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 40)
  // Off the home page there is no hero behind the bar, so keep it solid.
  const { pathname } = useLocation()
  const solid = scrolled || open || pathname !== '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`${styles.nav} ${solid ? styles.solid : ''}`}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <a href="/" className={styles.logo} aria-label="Aaron Lee, home">
        AL<span>.</span>
      </a>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="orbit-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <span className={styles.burger} aria-hidden="true" />
      </button>
      <nav id="orbit-menu" className={`${styles.links} ${open ? styles.open : ''}`} aria-label="Main">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        <a href={RESUME_URL} className={styles.resume} target="_blank" rel="noopener noreferrer">
          Résumé
        </a>
      </nav>
    </header>
  )
}
