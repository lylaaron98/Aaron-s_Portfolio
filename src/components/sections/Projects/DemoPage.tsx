import { useCallback, useEffect, useMemo, useState } from 'react'
import ScrollToTop from '../../ui/ScrollToTop'
import ChromaGrid from '../../ui/ChromaGrid/ChromaGrid'
import { projects } from '../../../data/projects'
import { buildProjectItems } from '../../../data/projectMedia'
import type { Project } from '../../../types/project'
import {
  PROJECTS_DEMO_ROUTE,
  demoSlugFromHash,
  projectDemoRoute,
  slugifyProject,
} from '../../../constants/routes'
import { cx } from '../../../utils/classNames'
import styles from './DemoPage.module.css'

function categoryLabel(project: Project) {
  return project.category === 'client' ? 'Client project' : 'Personal project'
}

function hostOf(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** Full-bleed image preview, opened from the media grid. */
function Lightbox({ src, title, onClose }: { src: string; title?: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div
      className={styles.lightbox}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Project screenshot'}
    >
      <button type="button" className={styles.lightboxClose} onClick={onClose} aria-label="Close preview">
        <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" d="M5 5 15 15" />
          <path strokeLinecap="round" d="M15 5 5 15" />
        </svg>
      </button>
      <img
        src={src}
        alt={title || 'Project screenshot'}
        className={styles.lightboxImage}
        onClick={(event) => event.stopPropagation()}
      />
      {title && <p className={styles.lightboxCaption}>{title}</p>}
    </div>
  )
}

/** Landing view when no slug is present: every project, linked to its page. */
function DemoIndex() {
  return (
    <>
      <header className={styles.indexHeader}>
        <p className={styles.eyebrow}>Demos</p>
        <h1 className={styles.indexTitle}>Project demos</h1>
        <p className={styles.indexLede}>
          Recordings, screenshots and live builds for each project. Pick one to open its page.
        </p>
      </header>

      <ul className={styles.indexGrid}>
        {projects.map((project) => (
          <li key={project.title}>
            <a href={projectDemoRoute(project.title)} className={styles.indexCard}>
              <span className={styles.indexCardMeta}>{categoryLabel(project)}</span>
              <span className={styles.indexCardTitle}>{project.title}</span>
              <span className={styles.indexCardDesc}>{project.description}</span>
              <span className={styles.indexCardCta} aria-hidden="true">
                Open
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

function ProjectView({ project }: { project: Project }) {
  const [preview, setPreview] = useState<{ src: string; title?: string } | null>(null)

  // Rebuilt only when the project changes, not on every lightbox toggle.
  const items = useMemo(() => buildProjectItems(project), [project])

  const index = projects.findIndex((candidate) => candidate.title === project.title)
  const previous = index > 0 ? projects[index - 1] : null
  const next = index >= 0 && index < projects.length - 1 ? projects[index + 1] : null

  const closePreview = useCallback(() => setPreview(null), [])

  return (
    <>
      <header className={styles.projectHeader}>
        <p className={styles.eyebrow}>
          {categoryLabel(project)}
          {project.featured && <span className={styles.featuredDot}>Featured</span>}
        </p>
        <h1 className={styles.projectTitle}>{project.title}</h1>
        <p className={styles.projectDescription}>{project.description}</p>

        <div className={styles.techRow}>
          {project.tech.map((tech) => (
            <span key={tech} className={styles.techChip}>
              {tech}
            </span>
          ))}
        </div>

        {(project.live || project.github) && (
          <div className={styles.actions}>
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer" className={styles.primaryAction}>
                Open live build
                <span className={styles.actionHost}>{hostOf(project.live)}</span>
              </a>
            )}
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.secondaryAction}>
                Repository
              </a>
            )}
          </div>
        )}
      </header>

      <section className={styles.mediaSection} aria-label={`${project.title} media`}>
        <h2 className={styles.sectionTitle}>
          Media
          <span className={styles.sectionCount}>{items.length}</span>
        </h2>
        <ChromaGrid
          items={items}
          columns={3}
          rows={Math.max(1, Math.ceil(items.length / 3))}
          radius={240}
          damping={0.45}
          fadeOut={0.6}
          ease="power3.out"
          onImageClick={(image, title) => setPreview({ src: image, title })}
        />
      </section>

      {(previous || next) && (
        <nav className={styles.pager} aria-label="Other projects">
          {previous ? (
            <a href={projectDemoRoute(previous.title)} className={cx(styles.pagerLink, styles.pagerPrev)}>
              <span className={styles.pagerLabel}>Previous</span>
              <span className={styles.pagerTitle}>{previous.title}</span>
            </a>
          ) : (
            <span />
          )}
          {next && (
            <a href={projectDemoRoute(next.title)} className={cx(styles.pagerLink, styles.pagerNext)}>
              <span className={styles.pagerLabel}>Next</span>
              <span className={styles.pagerTitle}>{next.title}</span>
            </a>
          )}
        </nav>
      )}

      {preview && <Lightbox src={preview.src} title={preview.title} onClose={closePreview} />}
    </>
  )
}

export default function DemoPage() {
  const [slug, setSlug] = useState(() => demoSlugFromHash(window.location.hash) ?? '')

  useEffect(() => {
    const onHashChange = () => setSlug(demoSlugFromHash(window.location.hash) ?? '')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const project = useMemo(
    () => (slug ? projects.find((candidate) => slugifyProject(candidate.title) === slug) : undefined),
    [slug],
  )

  const notFound = Boolean(slug) && !project

  return (
    <div className={styles.page}>
      <div className={styles.ambience} aria-hidden="true" />
      <div className={styles.dots} aria-hidden="true" />
      <ScrollToTop />

      <div className={styles.inner}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <a href="#projects" className={styles.crumb}>
            <span aria-hidden="true">&larr;</span> Selected work
          </a>
          {slug && (
            <>
              <span className={styles.crumbSep} aria-hidden="true">
                /
              </span>
              <a href={PROJECTS_DEMO_ROUTE} className={styles.crumb}>
                Demos
              </a>
            </>
          )}
        </nav>

        {project && <ProjectView key={project.title} project={project} />}

        {notFound && (
          <div className={styles.notFound}>
            <p className={styles.eyebrow}>Not found</p>
            <h1 className={styles.projectTitle}>No demo for that link</h1>
            <p className={styles.projectDescription}>
              The project may have been renamed. Pick one from the list instead.
            </p>
            <a href={PROJECTS_DEMO_ROUTE} className={styles.primaryAction}>
              All demos
            </a>
          </div>
        )}

        {!slug && <DemoIndex />}
      </div>
    </div>
  )
}
