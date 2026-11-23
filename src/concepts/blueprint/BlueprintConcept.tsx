import { useLayoutEffect, useRef, useState } from 'react'
import ConceptSwitcher from '../shared/ConceptSwitcher'
import { featuredProjects, intro, links, roles, skillGroups } from '../shared/content'
import { gsap, MOTION_OK, ScrollTrigger, useDisplayFont, useMotionBudget, useSmoothScroll } from '../shared/motion'
import { useScene } from '../shared/useScene'
import { LAYERS } from './layers'
import styles from './Blueprint.module.css'

const FONT = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap'

/** A year whose digits roll like an odometer when it changes. */
function RollingYear({ value }: { value: string }) {
  return (
    <span className={styles.roller} aria-hidden="true">
      {value.split('').map((digit, i) => (
        <span key={i} className={styles.rollerCol}>
          <span className={styles.rollerStrip} style={{ transform: `translateY(${-Number(digit) * 10}%)` }}>
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

export default function BlueprintConcept() {
  const { reduced, allow3d } = useMotionBudget()
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const preview = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState<string | null>(null)
  useDisplayFont(FONT)
  useSmoothScroll(!reduced)

  useScene(
    canvas,
    allow3d,
    () => import('./blueprintScene').then((m) => m.createBlueprintScene),
    (scene) => {
      let progress = 0
      const trigger = ScrollTrigger.create({
        trigger: `.${styles.hero}`,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progress = self.progress
          scene.setProgress(Math.min(1, progress * 1.6))
        },
      })
      const place = () => {
        scene.anchors.forEach((point, i) => {
          const label = labels.current[i]
          if (!label) return
          label.style.transform = `translate(${point.x + 30}px, ${point.y - 14}px)`
          label.style.opacity = String(Math.min(1, Math.max(0, (progress - 0.12 - i * 0.04) * 5)))
        })
      }
      gsap.ticker.add(place)
      return () => {
        gsap.ticker.remove(place)
        trigger.kill()
      }
    },
  )

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(root)
    const el = root.current!

    // The year counter follows whichever role is at the middle of the screen.
    // This runs with or without motion: it is state, not animation.
    const entries = gsap.utils.toArray<HTMLElement>(`.${styles.entry}`, el)
    const triggers = entries.map((entry, i) =>
      ScrollTrigger.create({
        trigger: entry,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(i),
      }),
    )

    mm.add(MOTION_OK, () => {
      gsap.from(`.${styles.heroLine} > span`, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08 })
      gsap.from(`.${styles.heroAside} > *`, { opacity: 0, y: 14, duration: 0.8, stagger: 0.08, delay: 0.5 })

      gsap.fromTo(
        `.${styles.lineFill}`,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: `.${styles.entries}`, start: 'top 55%', end: 'bottom 55%', scrub: 0.3 },
        },
      )

      entries.forEach((entry) => {
        gsap.from(entry.querySelectorAll(`.${styles.entryBody} > *`), {
          opacity: 0,
          x: 40,
          duration: 0.9,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: entry, start: 'top 75%' },
        })
      })

      gsap.utils.toArray<HTMLElement>(`.${styles.reveal}`, el).forEach((node) => {
        gsap.from(node, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: node, start: 'top 85%' } })
      })

      gsap.from(`.${styles.row}`, {
        opacity: 0,
        y: 24,
        stagger: 0.06,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.rows}`, start: 'top 75%' },
      })

      // Hover preview follows the cursor.
      const x = gsap.quickTo(preview.current, 'x', { duration: 0.5, ease: 'power3' })
      const y = gsap.quickTo(preview.current, 'y', { duration: 0.5, ease: 'power3' })
      const move = (e: PointerEvent) => {
        x(e.clientX)
        y(e.clientY)
      }
      window.addEventListener('pointermove', move)
      return () => window.removeEventListener('pointermove', move)
    })

    return () => {
      triggers.forEach((t) => t.kill())
      mm.revert()
    }
  }, [])

  const current = roles[active]
  const hoveredProject = featuredProjects.find((p) => p.title === hovered)

  return (
    <div ref={root} className={styles.page}>
      <a href="#bp-main" className={styles.skip}>
        Skip to content
      </a>
      <header className={styles.nav}>
        <a href="/concepts/blueprint" className={styles.logo}>
          Aaron Lee
        </a>
        <nav aria-label="Sections">
          <a href="#bp-work">Experience</a>
          <a href="#bp-projects">Projects</a>
          <a href={links.resume} target="_blank" rel="noopener noreferrer">
            Résumé
          </a>
          <a href="#bp-contact" className={styles.navCta}>
            Contact
          </a>
        </nav>
      </header>

      <main id="bp-main">
        <section className={styles.hero} aria-labelledby="bp-title">
          <div className={styles.heroSticky}>
            <div className={styles.heroText}>
              <p className={styles.label}>Sheet 01 — Software Engineer, Singapore</p>
              <h1 id="bp-title" className={styles.heroTitle}>
                <span className={styles.heroLine}>
                  <span>Interfaces,</span>
                </span>
                <span className={styles.heroLine}>
                  <span>
                    <em>engineered</em>
                  </span>
                </span>
                <span className={styles.heroLine}>
                  <span>end to end.</span>
                </span>
              </h1>
              <div className={styles.heroAside}>
                <p>
                  I’m Aaron, a full stack engineer with a frontend bias. Currently at GovTech Singapore, building
                  services for the Ministry of Manpower.
                </p>
                <a href="#bp-work" className={styles.button}>
                  Read the timeline ↓
                </a>
              </div>
            </div>
            <div className={styles.stage}>
              <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
              {!allow3d && (
                <ul className={styles.stackFallback} aria-hidden="true">
                  {LAYERS.map((layer) => (
                    <li key={layer.name}>{layer.name}</li>
                  ))}
                </ul>
              )}
              {allow3d &&
                LAYERS.map((layer, i) => (
                  <div
                    key={layer.name}
                    ref={(node) => {
                      labels.current[i] = node
                    }}
                    className={styles.layerLabel}
                    aria-hidden="true"
                  >
                    <strong>
                      {String(i + 1).padStart(2, '0')} {layer.name}
                    </strong>
                    <span>{layer.detail}</span>
                  </div>
                ))}
              <p className={styles.stageCaption} aria-hidden="true">
                Fig. 1 — the stack I work across.{allow3d && ' Scroll to explode.'}
              </p>
            </div>
          </div>
        </section>

        <section className={styles.about} aria-label="About">
          <p className={`${styles.aboutText} ${styles.reveal}`}>{intro}</p>
        </section>

        <section id="bp-work" className={styles.work} aria-labelledby="bp-work-title">
          <div className={styles.workHead}>
            <p className={styles.label}>Sheet 02</p>
            <h2 id="bp-work-title" className={`${styles.h2} ${styles.reveal}`}>
              Experience, <em>in sequence</em>
            </h2>
          </div>
          <div className={styles.workGrid}>
            <aside className={styles.counter} aria-hidden="true">
              <div className={styles.counterInner}>
                <span className={styles.label}>
                  {String(active + 1).padStart(2, '0')} / {String(roles.length).padStart(2, '0')} · {current.sector}
                </span>
                <RollingYear value={current.year} />
                <span className={styles.counterOrg}>{current.org}</span>
              </div>
            </aside>
            <div className={styles.line} aria-hidden="true">
              <div className={styles.lineFill} />
            </div>
            <ol className={styles.entries}>
              {roles.map((role, i) => (
                <li key={role.id} className={`${styles.entry} ${i <= active ? styles.entryReached : ''}`}>
                  <span className={styles.node} aria-hidden="true" />
                  <article className={styles.entryBody}>
                    <p className={styles.label}>{role.period}</p>
                    <h3>{role.role}</h3>
                    <p className={styles.entryOrg}>
                      {role.company} <span>· {role.sector}</span>
                    </p>
                    <ul>
                      {role.description.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <p className={styles.tags}>{role.tech.join(' / ')}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="bp-projects" className={styles.projects} aria-labelledby="bp-projects-title">
          <div className={styles.workHead}>
            <p className={styles.label}>Sheet 03</p>
            <h2 id="bp-projects-title" className={`${styles.h2} ${styles.reveal}`}>
              Selected <em>projects</em>
            </h2>
          </div>
          <ul className={styles.rows}>
            {featuredProjects.map((project, i) => (
              <li key={project.title} className={styles.row}>
                <a
                  href={project.href}
                  onPointerEnter={() => setHovered(project.title)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(null)}
                >
                  <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.rowTitle}>{project.title}</span>
                  <span className={styles.rowSummary}>{project.summary}</span>
                  <span className={styles.rowMeta}>{project.category === 'client' ? 'Client' : 'Personal'} ↗</span>
                  <img className={styles.rowThumb} src={project.cover} alt="" loading="lazy" />
                </a>
              </li>
            ))}
          </ul>
          <div ref={preview} className={`${styles.preview} ${hoveredProject && !reduced ? styles.previewOn : ''}`} aria-hidden="true">
            {hoveredProject && <img src={hoveredProject.cover} alt="" />}
          </div>
        </section>

        <section className={styles.marquee} aria-label="Toolkit">
          <h2 className="sr-only">Toolkit</h2>
          {skillGroups.map((group, i) => (
            <div key={group.title} className={styles.marqueeRow} data-reverse={i % 2 === 1}>
              <ul className={styles.marqueeTrack}>
                {[...group.items, ...group.items].map((item, n) => (
                  <li key={n} aria-hidden={n >= group.items.length}>
                    {item}
                    <span aria-hidden="true">✳</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section id="bp-contact" className={styles.contact} aria-labelledby="bp-contact-title">
          <p className={styles.label}>Sheet 04</p>
          <h2 id="bp-contact-title" className={styles.reveal}>
            Have a system that needs a <em>careful</em> frontend?
          </h2>
          <p className={styles.contactLinks}>
            <a href={links.email} className={styles.button}>
              Email me →
            </a>
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </p>
        </section>
      </main>
      <ConceptSwitcher current="blueprint" />
    </div>
  )
}
