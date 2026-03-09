import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import styles from './Navbar.module.css'
import { navLinks } from '../../../data/navigation'
import { smoothScrollTo } from '../../../utils/smoothScroll'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(`.${styles.logo}`, { opacity: 0, y: -20, duration: 0.5, delay: 0.1, ease: 'power2.out' })
      gsap.from(`.${styles.navLink}`, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        stagger: 0.08,
        delay: 0.3,
        ease: 'power2.out',
      })
      gsap.from(`.${styles.resumeBtn}`, { opacity: 0, y: -20, duration: 0.4, delay: 0.7, ease: 'power2.out' })
    }, navRef)
    return () => ctx.revert()
  }, [])

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScroll = 0
    const handleScroll = () => {
      const current = window.scrollY
      setScrolled(current > 50)

      if (!navRef.current) return
      if (current > lastScroll && current > 100) {
        gsap.to(navRef.current, { y: '-100%', duration: 0.3, ease: 'power2.out' })
      } else {
        gsap.to(navRef.current, { y: 0, duration: 0.3, ease: 'power2.out' })
      }
      lastScroll = current
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    smoothScrollTo(href)
  }

  return (
    <header ref={navRef} className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
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
