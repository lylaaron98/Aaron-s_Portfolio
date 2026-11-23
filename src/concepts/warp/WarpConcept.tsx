import { useLayoutEffect, useRef, useState } from 'react'
import ConceptSwitcher from '../shared/ConceptSwitcher'
import { featuredProjects, intro, links, roles, skillGroups } from '../shared/content'
import { gsap, MOTION_OK, ScrollTrigger, useDisplayFont, useMotionBudget, useSmoothScroll } from '../shared/motion'
import { useScene } from '../shared/useScene'
import styles from './Warp.module.css'

const FONT = 'https://fonts.googleapis.com/css2?family=Syne:wght@600..800&display=swap'

export default function WarpConcept() {
  const { reduced, allow3d } = useMotionBudget()
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(-1)
  useDisplayFont(FONT)
  useSmoothScroll(!reduced)

  useScene(
    canvas,
    allow3d,
    () => import('./warpScene').then((m) => (c: HTMLCanvasElement) => m.createWarpScene(c, roles.length)),
    (scene) => {
      const onMove = (e: PointerEvent) =>
        scene.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)
      window.addEventListener('pointermove', onMove)

      const page = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => scene.setProgress(self.progress),
      })

      const place = () => {
        const max = ScrollTrigger.maxScroll(window) || 1
        scene.placeRing(0, 0)
        document.querySelectorAll<HTMLElement>(`.${styles.role}`).forEach((el, i) => {
          const center = el.offsetTop + el.offsetHeight / 2 - innerHeight / 2
          scene.placeRing(i + 1, Math.max(0, center) / max)
        })
      }
      place()
      ScrollTrigger.addEventListener('refresh', place)

      return () => {
        window.removeEventListener('pointermove', onMove)
        ScrollTrigger.removeEventListener('refresh', place)
        page.kill()
      }
    },
  )

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root)
    const el = root.current!

    const roleEls = gsap.utils.toArray<HTMLElement>(`.${styles.role}`, el)
    const triggers = roleEls.map((roleEl, i) =>
      ScrollTrigger.create({
        trigger: roleEl,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) setActive(i)
          else if (i === 0 && self.direction < 0) setActive(-1)
          else if (i === roleEls.length - 1 && self.direction > 0) setActive(-1)
        },
      }),
    )

    mm.add(MOTION_OK, () => {
      gsap.from(`.${styles.heroTitle} span`, {
        opacity: 0,
        z: -400,
        yPercent: 40,
        filter: 'blur(12px)',
        duration: 1.6,
        ease: 'expo.out',
        stagger: 0.12,
      })
      gsap.from(`.${styles.heroSub} > *`, { opacity: 0, y: 20, duration: 1, stagger: 0.1, delay: 0.7 })

      gsap.to(`.${styles.heroInner}`, {
        scale: 1.5,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: `.${styles.hero}`, start: 'top top', end: 'bottom top', scrub: true },
      })

      // Each role card flies in from depth, holds, then flies past.
      roleEls.forEach((roleEl, i) => {
        const card = roleEl.querySelector(`.${styles.card}`)
        const side = i % 2 === 0 ? -1 : 1
        gsap
          .timeline({ scrollTrigger: { trigger: roleEl, start: 'top bottom', end: 'bottom 25%', scrub: 0.6 } })
          .fromTo(card, { z: -900, rotateY: side * -28, opacity: 0 }, { z: 0, rotateY: 0, opacity: 1, ease: 'power2.out', duration: 0.4 })
          .to(card, { z: 0, duration: 0.2 })
          .to(card, { z: 500, rotateY: side * 14, opacity: 0, ease: 'power2.in', duration: 0.4 })
      })

      gsap.utils.toArray<HTMLElement>(`.${styles.reveal}`, el).forEach((node) => {
        gsap.from(node, { opacity: 0, y: 50, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: node, start: 'top 85%' } })
      })
    })

    // 3D carousel of projects, pinned and turned by scroll.
    mm.add(`${MOTION_OK} and (min-width: 900px)`, () => {
      const ringEl = el.querySelector<HTMLElement>(`.${styles.carousel}`)!
      gsap.to(ringEl, {
        rotateY: -360 + 360 / featuredProjects.length,
        ease: 'none',
        scrollTrigger: {
          trigger: `.${styles.projects}`,
          pin: true,
          start: 'top top',
          end: '+=220%',
          scrub: 0.8,
        },
      })
    })

    return () => {
      triggers.forEach((t) => t.kill())
      mm.revert()
    }
  }, [])

  const step = 360 / featuredProjects.length

  return (
    <div ref={root} className={styles.page}>
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
      <div className={styles.backdrop} aria-hidden="true" />
      <a href="#warp-main" className={styles.skip}>
        Skip to content
      </a>
      <header className={styles.nav}>
        <a href="/concepts/warp" className={styles.logo}>
          <span aria-hidden="true" className={styles.logoMark} />
          Aaron Lee
        </a>
        <nav aria-label="Sections">
          <a href="#warp-work">Journey</a>
          <a href="#warp-projects">Projects</a>
          <a href="#warp-contact">Contact</a>
        </nav>
      </header>

      <nav
        className={`${styles.altimeter} ${active >= 0 ? styles.altimeterOn : ''}`}
        aria-label="Experience timeline"
      >
        <ol>
          {roles.map((role, i) => (
            <li key={role.id}>
              <a href={`#warp-${role.id}`} aria-current={i === active ? 'step' : undefined}>
                <span className={styles.altYear}>{role.year}</span>
                <span className={styles.altName}>{role.org}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <main id="warp-main">
        <section className={styles.hero} aria-labelledby="warp-title">
          <div className={styles.heroInner}>
            <p className={styles.kicker}>Software Engineer · Singapore</p>
            <h1 id="warp-title" className={styles.heroTitle}>
              <span>Aaron</span> <span>Lee</span>
            </h1>
            <div className={styles.heroSub}>
              <p>Frontend-first full stack engineer. React, TypeScript, Python and AWS, with applied AI on top.</p>
              <p className={styles.ctas}>
                <a href="#warp-work" className={styles.primary}>
                  Start the journey
                </a>
                <a href={links.resume} className={styles.ghost} target="_blank" rel="noopener noreferrer">
                  Résumé
                </a>
              </p>
            </div>
          </div>
          <p className={styles.hint} aria-hidden="true">
            Scroll to fly through
          </p>
        </section>

        <section className={styles.intro} aria-label="About">
          <p className={`${styles.glass} ${styles.reveal}`}>{intro}</p>
        </section>

        <section id="warp-work" className={styles.work} aria-labelledby="warp-work-title">
          <h2 id="warp-work-title" className={`${styles.h2} ${styles.reveal}`}>
            The journey <span>so far</span>
          </h2>
          <ol className={styles.roles}>
            {roles.map((role, i) => (
              <li key={role.id} id={`warp-${role.id}`} className={`${styles.role} ${i % 2 ? styles.right : ''}`}>
                <article className={`${styles.card} ${styles.glass}`}>
                  <p className={styles.cardTop}>
                    <span>{role.period}</span>
                    <span>{role.sector}</span>
                  </p>
                  <h3>{role.role}</h3>
                  <p className={styles.cardOrg}>{role.company}</p>
                  <ul>
                    {role.description.slice(0, 3).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className={styles.chips}>
                    {role.tech.slice(0, 7).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </p>
                  <span className={styles.cardYear} aria-hidden="true">
                    {role.year}
                  </span>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section id="warp-projects" className={styles.projects} aria-labelledby="warp-projects-title">
          <h2 id="warp-projects-title" className={styles.h2}>
            Selected <span>projects</span>
          </h2>
          <div className={styles.scene3d}>
            <ul className={styles.carousel} style={{ ['--count' as string]: featuredProjects.length }}>
              {featuredProjects.map((project, i) => (
                <li key={project.title} className={styles.slide} style={{ ['--angle' as string]: `${i * step}deg` }}>
                  <a href={project.href} className={styles.slideCard}>
                    <img src={project.cover} alt="" loading="lazy" />
                    <span className={styles.slideText}>
                      <strong>{project.title}</strong>
                      <span>{project.summary}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.skills} aria-labelledby="warp-skills-title">
          <h2 id="warp-skills-title" className={`${styles.h2} ${styles.reveal}`}>
            Toolkit
          </h2>
          <div className={styles.skillGrid}>
            {skillGroups.map((group) => (
              <div key={group.title} className={`${styles.glass} ${styles.reveal}`}>
                <h3>{group.title}</h3>
                <p className={styles.chips}>
                  {group.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="warp-contact" className={styles.contact} aria-labelledby="warp-contact-title">
          <h2 id="warp-contact-title" className={styles.reveal}>
            Next stop: <span>your team.</span>
          </h2>
          <p className={styles.ctas}>
            <a href={links.email} className={styles.primary}>
              Get in touch
            </a>
            <a href={links.github} className={styles.ghost} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={links.linkedin} className={styles.ghost} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </p>
        </section>
      </main>
      <ConceptSwitcher current="warp" />
    </div>
  )
}
