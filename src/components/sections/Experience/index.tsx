import { useLayoutEffect, useRef } from 'react'
import { experiences } from '../../../data/experience'
import Badge from '../../ui/Badge'
import sectionStyles from '../../ui/SectionContainer/SectionContainer.module.css'
import { gsap, MOTION_OK } from '../../../orbit/motion'
import styles from './Experience.module.css'

const SECTOR: Record<string, string> = {
  'GovTech Singapore (Hybrid)': 'Public sector',
  'Freelance (project-based), Remote': 'Applied AI',
  'Corporate Bank, Singapore': 'Banking',
  'Capgemini, Singapore': 'Consulting',
  'Univers (Envision Group), Singapore': 'Sustainability',
  'Daiso Singapore': 'Retail',
  'International Data Corporation (IDC), Singapore': 'Research',
}

const roles = experiences.map((exp) => ({
  ...exp,
  year: exp.startDate.split(' ').pop() ?? '',
  sector: SECTOR[exp.company] ?? 'Engineering',
}))

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Orbit's scroll-along timeline in the site's own theme. On wide screens the
 * section pins and scrolling moves sideways through one panel per role, with
 * year chips and a progress bar tracking position. Phones and reduced motion
 * get the same panels stacked vertically.
 */
export default function Experience() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = root.current!
    const mm = gsap.matchMedia(el)

    mm.add(`${MOTION_OK} and (min-width: 900px)`, () => {
      const track = el.querySelector<HTMLElement>(`.${styles.track}`)!
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, el)
      const chips = gsap.utils.toArray<HTMLElement>(`.${styles.chip}`, el)
      const distance = () => track.scrollWidth - window.innerWidth

      const scroll = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 0.8,
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const active = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)))
            chips.forEach((chip, i) => chip.classList.toggle(styles.chipOn, i <= active))
          },
        },
      })

      gsap.to(`.${styles.fill}`, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, scrub: true },
      })

      panels.forEach((panel, index) => {
        gsap.fromTo(
          panel.querySelector(`.${styles.year}`),
          { xPercent: 30 },
          {
            xPercent: -30,
            ease: 'none',
            scrollTrigger: { trigger: panel, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true },
          },
        )
        // The first panel is already on screen when the pin starts.
        if (index === 0) return
        gsap.from(panel.querySelectorAll(`.${styles.body} > *`), {
          opacity: 0,
          y: 30,
          stagger: 0.05,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: panel, containerAnimation: scroll, start: 'left 85%' },
        })
      })
    })

    mm.add(`${MOTION_OK} and (max-width: 899px)`, () => {
      gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, el).forEach((panel) => {
        gsap.from(panel, { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 88%' } })
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={root} id="experience" className={styles.section} aria-labelledby="experience-title">
      <div className={styles.ambience} aria-hidden="true" />
      <div className={styles.head}>
        <div className={sectionStyles.header}>
          <span className={sectionStyles.eyebrow}>03 — timeline</span>
          <h2 id="experience-title" className={sectionStyles.title}>
            Experience
          </h2>
          <span className={sectionStyles.rule} aria-hidden="true" />
        </div>
        <ol className={styles.chips} aria-hidden="true">
          {roles.map((role, i) => (
            <li key={i} className={styles.chip}>
              {role.year}
            </li>
          ))}
        </ol>
      </div>

      <ol className={styles.track}>
        {roles.map((role, index) => (
          <li key={`${role.company}-${role.startDate}`} className={styles.panel}>
            <span className={styles.year} aria-hidden="true">
              {role.year}
            </span>
            <article className={styles.body}>
              <p className={styles.index}>
                {pad(index + 1)} / {pad(roles.length)} · {role.sector}
              </p>
              <h3 className={styles.role}>{role.role}</h3>
              <p className={styles.company}>
                {role.company}{' '}
                <time className={styles.date}>
                  {role.startDate} – {role.endDate ?? 'Present'}
                </time>
              </p>
              <ul className={styles.bullets}>
                {role.description.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className={styles.tech}>
                {role.tech.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ol>

      <div className={styles.progress} aria-hidden="true">
        <div className={styles.fill} />
      </div>
    </section>
  )
}
