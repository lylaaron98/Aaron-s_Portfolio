import { useLayoutEffect, useRef, useState } from 'react'
import { RESUME_URL } from '../constants/site'
import { skillCategories } from '../data/skills'
import { PROJECTS_DEMO_ROUTE, projectDemoRoute } from '../constants/routes'
import { featuredProjects, moreProjects, roles, statement, stats } from './content'
import { gsap, MOTION_OK, ScrollTrigger, useMotionBudget, useScene, useSmoothScroll } from './motion'
import { addTask, completeTask, trackPageAssets } from './loadProgress'
import Loader from './Loader'
import OrbitContact from './OrbitContact'
import styles from './Orbit.module.css'

// The intro plays once per full page load, not on every return to home.
let introPlayed = false

export default function OrbitHome() {
  const { reduced, allow3d } = useMotionBudget()
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [showLoader, setShowLoader] = useState(() => !introPlayed)
  const [revealed, setRevealed] = useState(() => introPlayed)

  // Register load work before the loader subscribes, so it never reads 100%
  // before the scene has even started.
  useState(() => {
    if (introPlayed) return
    if (allow3d) addTask('scene', 3)
    trackPageAssets(['/assets/profile.webp'])
  })

  useSmoothScroll(!reduced)

  useScene(
    canvas,
    allow3d,
    () => import('./orbitScene').then((m) => m.createOrbitScene),
    (scene) => {
      completeTask('scene')
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

  // Hero entrance, held until the loader lifts.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add(MOTION_OK, () => {
      if (!revealed) {
        gsap.set(`.${styles.char}`, { yPercent: 115 })
        gsap.set(`.${styles.heroFade}`, { opacity: 0, y: 18 })
        return
      }
      gsap.fromTo(`.${styles.char}`, { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.04 })
      gsap.fromTo(
        `.${styles.heroFade}`,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, delay: 0.45, ease: 'power3.out' },
      )
    })
    return () => mm.revert()
  }, [revealed])

  // Scroll-driven animation for the rest of the page.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root)
    const el = root.current!

    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        `.${styles.word}`,
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: `.${styles.statement}`, start: 'top 75%', end: 'bottom 50%', scrub: true },
        },
      )

      gsap.utils.toArray<HTMLElement>(`.${styles.reveal}`, el).forEach((node) => {
        gsap.from(node, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: node, start: 'top 88%' } })
      })

      gsap.from(`.${styles.project}`, {
        opacity: 0,
        y: 80,
        rotateX: -12,
        duration: 1.1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.projectGrid}`, start: 'top 75%' },
      })

      gsap.from(`.${styles.skillGroup}`, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.skillGrid}`, start: 'top 80%' },
      })
    })

    // Horizontal timeline on wide screens; it stacks vertically on phones.
    mm.add(`${MOTION_OK} and (min-width: 900px)`, () => {
      const track = el.querySelector<HTMLElement>(`.${styles.track}`)!
      const distance = () => track.scrollWidth - window.innerWidth
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, el)
      const dots = gsap.utils.toArray<HTMLElement>(`.${styles.dot}`, el)

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

      panels.forEach((panel, index) => {
        gsap.fromTo(
          panel.querySelector(`.${styles.bigYear}`),
          { xPercent: 30 },
          {
            xPercent: -30,
            ease: 'none',
            scrollTrigger: { trigger: panel, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true },
          },
        )
        // The first panel is on screen when the pin starts; it needs no entrance.
        if (index === 0) return
        gsap.from(panel.querySelectorAll(`.${styles.panelBody} > *`), {
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
        gsap.from(panel, { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: panel, start: 'top 88%' } })
      })
    })

    // Fonts and images change layout; re-measure pins once they settle.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => mm.revert()
  }, [])

  const onTilt = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse') return
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    card.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`)
    card.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`)
  }
  const onTiltEnd = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={root} className={styles.page}>
      {showLoader && (
        <Loader
          reduced={reduced}
          onReveal={() => setRevealed(true)}
          onDone={() => {
            introPlayed = true
            setShowLoader(false)
          }}
        />
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={`${styles.eyebrow} ${styles.heroFade}`}>Software Engineer · Singapore</p>
          <h1 id="hero-title" className={styles.title} aria-label="Aaron Lee">
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
            <p className={styles.heroFade}>
              Full stack engineer with a frontend focus, currently at GovTech Singapore. React, TypeScript, Python and
              AWS, with applied AI where it earns its place.
            </p>
            <div className={`${styles.ctas} ${styles.heroFade}`}>
              <a className={styles.primary} href="#experience">
                See my work
              </a>
              <a className={styles.ghost} href={RESUME_URL} target="_blank" rel="noopener noreferrer">
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

      {/* ── About ────────────────────────────────────────────── */}
      <section id="about" className={styles.about} aria-labelledby="about-title">
        <h2 id="about-title" className="sr-only">
          About
        </h2>
        <p className={styles.statement}>
          {statement.split(' ').map((word, i) => (
            <span key={i} className={styles.word}>
              {word}{' '}
            </span>
          ))}
        </p>
        <div className={styles.aboutGrid}>
          <figure className={`${styles.portrait} ${styles.reveal}`}>
            <img src="/assets/profile.webp" alt="Portrait of Aaron Lee" width="720" height="960" loading="lazy" />
            <figcaption>
              <span className={styles.statusDot} aria-hidden="true" /> Open to new roles
            </figcaption>
          </figure>
          <div className={`${styles.aboutText} ${styles.reveal}`}>
            <p className={styles.kicker}>
              <span>01</span> About
            </p>
            <p>
              I’m Aaron, a software engineer with production experience across banking, government, sustainability
              and Japanese enterprise clients, with a BSc in Computer Science (Hons) from Goldsmiths, University of
              London.
            </p>
            <p>
              Today I build Ministry of Manpower products at GovTech: a nationwide survey platform, an AI
              test-generation agent on AWS Bedrock, and the serverless infrastructure behind them. Alongside that I take
              project-based applied AI work in Python and FastAPI. I like owning a feature end to end, from API and data
              design through to a fast, accessible frontend.
            </p>
            <dl className={styles.stats}>
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Experience ───────────────────────────────────────── */}
      <section id="experience" className={styles.timeline} aria-labelledby="experience-title">
        <div className={styles.timelineHead}>
          <h2 id="experience-title" className={styles.sectionHead}>
            <span>02</span> Experience
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
                  {role.company} <span>{role.period}</span>
                </p>
                <ul>
                  {role.description.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className={styles.chips}>
                  {role.tech.map((t) => (
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

      {/* ── Projects ─────────────────────────────────────────── */}
      <section id="projects" className={styles.projects} aria-labelledby="projects-title">
        <div className={styles.projectsHead}>
          <h2 id="projects-title" className={`${styles.sectionHead} ${styles.reveal}`}>
            <span>03</span> Selected projects
          </h2>
          <a href={PROJECTS_DEMO_ROUTE} className={`${styles.ghost} ${styles.reveal}`}>
            All {featuredProjects.length + moreProjects.length} projects →
          </a>
        </div>
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
                  <span className={styles.projectTech}>{project.tech.slice(0, 4).join(' · ')}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <ul className={`${styles.moreList} ${styles.reveal}`} aria-label="More projects">
          {moreProjects.map((project) => (
            <li key={project.title}>
              <a href={projectDemoRoute(project.title)}>
                <span>{project.title}</span>
                <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Skills ───────────────────────────────────────────── */}
      <section id="skills" className={styles.skills} aria-labelledby="skills-title">
        <h2 id="skills-title" className={`${styles.sectionHead} ${styles.reveal}`}>
          <span>04</span> Toolkit
        </h2>
        <div className={styles.skillGrid}>
          {skillCategories.map((group) => (
            <div key={group.title} className={styles.skillGroup}>
              <h3>{group.title}</h3>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <OrbitContact />
    </div>
  )
}
