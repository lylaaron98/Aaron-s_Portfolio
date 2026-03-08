import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'
import { navLinks } from '../../../data/navigation'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <a href="#hero" className={styles.logo} onClick={() => handleNavClick('#hero')}>
          <span className={styles.logoBracket}>&lt;</span>
          Aaron
          <span className={styles.logoBracket}> /&gt;</span>
        </a>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.navLink}
              style={{ animationDelay: `${i * 0.1}s` }}
              onClick={(e) => { e.preventDefault(); handleNavClick(link.href) }}
            >
              <span className={styles.navNum}>0{i + 1}.</span> {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className={styles.resumeBtn}
            onClick={(e) => { e.preventDefault(); handleNavClick('#contact') }}
          >
            Hire Me
          </a>
        </nav>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}
    </header>
  )
}
