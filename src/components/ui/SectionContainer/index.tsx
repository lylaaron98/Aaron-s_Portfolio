import { useEffect, useRef, type HTMLAttributes } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './SectionContainer.module.css'
import { cx } from '../../../utils/classNames'

gsap.registerPlugin(ScrollTrigger)

interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  id?: string
  background?: 'navy' | 'navy-light'
  /** Section number shown before the title (e.g. "01") */
  number?: string
  /** Section heading text rendered beside the number */
  title?: string
}

export default function SectionContainer({
  id,
  background = 'navy',
  number,
  title,
  className,
  children,
  ...props
}: SectionContainerProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return

    gsap.set(el, { opacity: 0, y: 30 })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
        })
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section
      id={id}
      className={cx(
        styles.section,
        background === 'navy-light' ? styles.bgLight : styles.bgNavy,
        className
      )}
      {...props}
    >
      <div className="container">
        {title && (
          <h2 ref={titleRef} className={styles.sectionTitle}>
            {number && <span className={styles.num}>{number}.</span>}
            {title}
            <span className={styles.line} />
          </h2>
        )}
        {children}
      </div>
    </section>
  )
}
