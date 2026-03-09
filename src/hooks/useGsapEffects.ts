import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Magnetic hover effect — element subtly follows the cursor when hovered.
 * Great for buttons, social icons, and interactive elements.
 */
export function useMagneticHover<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      })
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [strength])

  return ref
}

/**
 * 3D tilt effect — card tilts towards cursor on hover.
 * Adds depth with perspective transform and dynamic lighting.
 */
export function useTilt<T extends HTMLElement>(
  options: { maxTilt?: number; speed?: number; glare?: boolean } = {}
) {
  const ref = useRef<T>(null)
  const { maxTilt = 8, speed = 0.4, glare = true } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Add perspective to parent if needed
    el.style.transformStyle = 'preserve-3d'

    let glareEl: HTMLDivElement | null = null
    if (glare) {
      glareEl = document.createElement('div')
      glareEl.style.cssText = `
        position: absolute; inset: 0; pointer-events: none;
        border-radius: inherit; z-index: 10;
        background: linear-gradient(
          135deg,
          rgba(100, 255, 218, 0.08) 0%,
          transparent 80%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
      `
      el.appendChild(glareEl)
    }

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const rotateX = (0.5 - y) * maxTilt
      const rotateY = (x - 0.5) * maxTilt

      gsap.to(el, {
        rotateX,
        rotateY,
        duration: speed,
        ease: 'power2.out',
        transformPerspective: 1000,
      })

      if (glareEl) {
        glareEl.style.opacity = '1'
        glareEl.style.background = `radial-gradient(
          circle at ${x * 100}% ${y * 100}%,
          rgba(100, 255, 218, 0.1) 0%,
          transparent 60%
        )`
      }
    }

    const handleLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
      if (glareEl) {
        glareEl.style.opacity = '0'
      }
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      if (glareEl && el.contains(glareEl)) {
        el.removeChild(glareEl)
      }
    }
  }, [maxTilt, speed, glare])

  return ref
}

/**
 * Floating animation — gentle continuous up/down bob.
 * Perfect for hero decorative elements or scroll indicators.
 */
export function useFloating<T extends HTMLElement>(
  options: { distance?: number; duration?: number } = {}
) {
  const ref = useRef<T>(null)
  const { distance = 10, duration = 2.5 } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const tween = gsap.to(el, {
      y: -distance,
      duration,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })

    return () => { tween.kill() }
  }, [distance, duration])

  return ref
}

/**
 * Text scramble reveal — characters scramble before resolving to final text.
 * Use for section headings or featured text.
 */
export function useTextScramble<T extends HTMLElement>(
  text: string,
  options: { duration?: number; trigger?: boolean } = {}
) {
  const ref = useRef<T>(null)
  const { duration = 1.5, trigger = true } = options
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'

  useEffect(() => {
    const el = ref.current
    if (!el || !trigger) return

    const obj = { progress: 0 }
    el.textContent = ''

    gsap.to(obj, {
      progress: 1,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        const p = obj.progress
        const resolved = Math.floor(p * text.length)
        let display = ''
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') {
            display += ' '
          } else if (i < resolved) {
            display += text[i]
          } else {
            display += chars[Math.floor(Math.random() * chars.length)]
          }
        }
        el.textContent = display
      },
      onComplete: () => {
        el.textContent = text
      },
    })
  }, [text, duration, trigger])

  return ref
}

/**
 * Parallax scroll effect — element moves at a different rate during scroll.
 * Speed < 1 = slower than scroll, > 1 = faster.
 */
export function useParallax<T extends HTMLElement>(speed = 0.5) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScroll = () => {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2 - window.innerHeight / 2
      gsap.set(el, { y: center * (speed - 1) * 0.3 })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return ref
}
