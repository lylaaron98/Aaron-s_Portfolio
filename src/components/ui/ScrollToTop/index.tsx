import { useState, useEffect } from 'react'
import { scrollToTop } from '../../../utils/smoothScroll'
import styles from './ScrollToTop.module.css'

const SCROLL_THRESHOLD = 400

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      className={`${styles.button} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      type="button"
      aria-label="Scroll to top"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  )
}
