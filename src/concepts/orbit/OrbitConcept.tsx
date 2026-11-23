import { useLayoutEffect, useRef } from 'react'
import ConceptSwitcher from '../shared/ConceptSwitcher'
import { featuredProjects, intro, links, roles, skillGroups } from '../shared/content'
import { gsap, MOTION_OK, ScrollTrigger, useDisplayFont, useMotionBudget, useSmoothScroll } from '../shared/motion'
import { useScene } from '../shared/useScene'
import styles from './Orbit.module.css'

const FONT = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400..700&display=swap'

export default function OrbitConcept() {
  const { reduced, allow3d } = useMotionBudget()
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  useDisplayFont(FONT)
  useSmoothScroll(!reduced)

  useScene(
    canvas,
    allow3d,
    () => import('./orbitScene').then((m) => m.createOrbitScene),
    (scene) => {
      const onMove = (e: PointerEvent) =>
        scene.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1)
      window.addEventListener('pointermove', onMove)
      const trigger = ScrollTrigger.create({
        trigger: `.${styles.hero}`,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => scene.setProgress(self.progress),
      })
      return () => {
        window.removeEventListener('pointermove', onMove)
        trigger.kill()
      }
    },
  )

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root)

    mm.add(MOTION_OK, () => {
      // Hero entrance
      gsap.from(`.${styles.char}`, { yPercent: 115, duration: 1.1, ease: 'expo.out', stagger: 0.035, delay: 0.15 })
      gsap.from(`.${styles.heroMeta} > *`, { opacity: 0, y: 16, duration: 0.9, stagger: 0.08, delay: 0.6, ease: 'power3.out' })

      // Statement lights up word by word
      gsap.fromTo(
        `.${styles.word}`,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: `.${styles.statement}`, start: 'top 75%', end: 'bottom 45%', scrub: true },
        },
      )

      // Section headings slide in
      gsap.utils.toArray<HTMLElement>(`.${styles.sectionHead}`).forEach((el) => {
        gsap.from(el, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } })
      })

      // Projects rise in
      gsap.from(`.${styles.project}`, {
        opacity: 0,
        y: 80,
        rotateX: -12,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.projects}`, start: 'top 70%' },
      })
    })

    // Horizontal timeline on wide screens only; it stacks vertically on phones.
    mm.add(`${MOTION_OK} and (min-width: 900px)`, () => {
      const track = root.current!.querySelector<HTMLElement>(`.${styles.track}`)!
      const distance = () => track.scrollWidth - window.innerWidth
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`)
      const dots = gsap.utils.toArray<HTMLElement>(`.${styles.dot}`)

      const scroll = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: `.${styles.timeline}`,
          pin: true,
          scrub: 0.8,
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const active = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)))
            dots.forEach((dot, i) => dot.classList.toggle(styles.dotActive, i <= active))
          },
        },
      })

      gsap.to(`.${styles.progressFill}`, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: `.${styles.timeline}`, start: 'top top', end: () => `+=${distance()}`, scrub: true },
      })

      panels.forEach((panel) => {
        gsap.fromTo(
          panel.querySelector(`.${styles.bigYear}`),
          { xPercent: 30 },
          {
            xPercent: -30,
            ease: 'none',
            scrollTrigger: { trigger: panel, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true },
          },
        )
        gsap.from(panel.querySelectorAll(`.${styles.panelBody} > *`), {
          opacity: 0,
          y: 30,
          stagger: 0.06,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: panel, containerAnimation: scroll, start: 'left 70%' },
        })
      })
    })

    mm.add(`${MOTION_OK} and (max-width: 899px)`, () => {
      gsap.utils.toArray<HTMLElement>(`.${styles.panel}`).forEach((panel) => {
        gsap.from(panel, { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 85%' } })
      })
    })

    return () => mm.revert()
  }, [])

  // 3D tilt on project cards
  const onTilt = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -10}deg`)
    el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`)
  }
  const onTiltEnd = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={root} className={styles.page}>
      <a href="#orbit-main" className={styles.skip}>
        Skip to content
      </a>
      <header className={styles.nav}>
        <a href="/concepts/orbit" className={styles.logo}>
          AL<span>.</span>
        </a>
        <nav aria-label="Sections">
          <a href="#orbit-work">Work</a>
          <a href="#orbit-projects">Projects</a>
          <a href="#orbit-contact">Contact</a>
        </nav>
      </header>

      <main id="orbit-main">
        <section className={styles.hero} aria-labelledby="orbit-title">
          <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Software Engineer · Singapore</p>
            <h1 id="orbit-title" className={styles.title} aria-label="Aaron Lee">
              {['Aaron', 'Lee'].map((word) => (
                <span key={word} className={styles.titleLine} aria-hidden="true">
                  {word.split('').map((ch, i) => (
                    <span key={i} className={styles.char}>
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <div className={styles.heroMeta}>
              <p>Full stack and frontend engineer, building with React, TypeScript, Python and AWS, with applied AI where it earns its place.</p>
              <div className={styles.ctas}>
                <a className={styles.primary} href="#orbit-work">
                  See my work
                </a>
                <a className={styles.ghost} href={links.resume} target="_blank" rel="noopener noreferrer">
                  Résumé
                </a>
              </div>
            </div>
          </div>
          <div className={styles.scrollCue} aria-hidden="true">
            <span />
            Scroll
          </div>
        </section>

        <section className={styles.statement} aria-label="About">
          <p>
            {intro.split(' ').map((word, i) => (
              <span key={i} className={styles.word}>
                {word}{' '}
              </span>
            ))}
          </p>
        </section>

        <section id="orbit-work" className={styles.timeline} aria-labelledby="orbit-work-title">
          <div className={styles.timelineHead}>
            <h2 id="orbit-work-title" className={styles.sectionHead}>
              <span>01</span> Experience
            </h2>
            <ol className={styles.dots} aria-hidden="true">
              {roles.map((role) => (
                <li key={role.id} className={styles.dot}>
                  {role.year}
                </li>
              ))}
            </ol>
          </div>
          <ol className={styles.track}>
            {roles.map((role, index) => (
              <li key={role.id} className={styles.panel}>
                <span className={styles.bigYear} aria-hidden="true">
                  {role.year}
                </span>
                <article className={styles.panelBody}>
                  <p className={styles.panelIndex}>
                    {String(index + 1).padStart(2, '0')} / {String(roles.length).padStart(2, '0')} · {role.sector}
                  </p>
                  <h3>{role.role}</h3>
                  <p className={styles.org}>
                    {role.org} <span>{role.period}</span>
                  </p>
                  <ul>
                    {role.description.slice(0, 2).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p className={styles.chips}>
                    {role.tech.slice(0, 6).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </p>
                </article>
              </li>
            ))}
          </ol>
          <div className={styles.progress} aria-hidden="true">
            <div className={styles.progressFill} />
          </div>
        </section>

        <section id="orbit-projects" className={styles.projects} aria-labelledby="orbit-projects-title">
          <h2 id="orbit-projects-title" className={styles.sectionHead}>
            <span>02</span> Selected projects
          </h2>
          <ul className={styles.projectGrid}>
            {featuredProjects.map((project) => (
              <li key={project.title}>
                <a href={project.href} className={styles.project} onPointerMove={onTilt} onPointerLeave={onTiltEnd}>
                  <span className={styles.projectImage}>
                    <img src={project.cover} alt="" loading="lazy" />
                  </span>
                  <span className={styles.projectText}>
                    <span className={styles.projectCat}>{project.category === 'client' ? 'Client work' : 'Personal'}</span>
                    <strong>{project.title}</strong>
                    <span>{project.summary}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.stack} aria-labelledby="orbit-stack-title">
          <h2 id="orbit-stack-title" className={styles.sectionHead}>
            <span>03</span> Toolkit
          </h2>
          <div className={styles.stackGrid}>
            {skillGroups.map((group) => (
              <div key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="orbit-contact" className={styles.contact} aria-labelledby="orbit-contact-title">
          <h2 id="orbit-contact-title">
            Let’s build something <em>considered.</em>
          </h2>
          <div className={styles.ctas}>
            <a className={styles.primary} href={links.email}>
              Email me
            </a>
            <a className={styles.ghost} href={links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a className={styles.ghost} href={links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </section>
      </main>
      <ConceptSwitcher current="orbit" />
    </div>
  )
}
