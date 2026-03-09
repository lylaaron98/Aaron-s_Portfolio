import { useRef, useEffect, type HTMLAttributes } from 'react'
import gsap from 'gsap'
import styles from './Card.module.css'
import { cx } from '../../../utils/classNames'

type CardVariant = 'default' | 'navy'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift + glow effect (default: true) */
  hoverable?: boolean
  /** Background variant: 'default' = navy-light, 'navy' = navy */
  variant?: CardVariant
  /** Show a gradient overlay on hover */
  gradientOverlay?: boolean
  /** Show a top-edge gradient line on hover */
  topAccent?: boolean
  /** Enable 3D tilt on hover (default: true) */
  tilt?: boolean
}

export default function Card({
  hoverable = true,
  variant = 'default',
  gradientOverlay = false,
  topAccent = false,
  tilt = true,
  className,
  children,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !tilt) return

    el.style.transformStyle = 'preserve-3d'

    const glareEl = document.createElement('div')
    glareEl.style.cssText = `
      position: absolute; inset: 0; pointer-events: none;
      border-radius: inherit; z-index: 10;
      opacity: 0; transition: opacity 0.3s ease;
    `
    el.appendChild(glareEl)

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      gsap.to(el, {
        rotateX: (0.5 - y) * 8,
        rotateY: (x - 0.5) * 8,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
      })

      glareEl.style.opacity = '1'
      glareEl.style.background = `radial-gradient(
        circle at ${x * 100}% ${y * 100}%,
        rgba(100, 255, 218, 0.1) 0%,
        transparent 60%
      )`
    }

    const handleLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
      glareEl.style.opacity = '0'
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      if (el.contains(glareEl)) el.removeChild(glareEl)
    }
  }, [tilt])

  return (
    <div
      ref={ref}
      className={cx(
        styles.card,
        hoverable && styles.hoverable,
        variant === 'navy' && styles.navy,
        gradientOverlay && styles.gradientOverlay,
        topAccent && styles.topAccent,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
