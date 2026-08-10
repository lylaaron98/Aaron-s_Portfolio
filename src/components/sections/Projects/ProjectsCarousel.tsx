import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import type { Project } from '../../../types/project'
import { useLowPerformanceMode } from '../../../hooks/useMediaQuery'
import Card from '../../ui/Card'
import Badge from '../../ui/Badge'
import { projectDemoRoute } from '../../../constants/routes'
import { cx } from '../../../utils/classNames'
import styles from './Projects.module.css'
import type { ProjectModalState } from './ProjectCardModal'

interface ProjectsCarouselProps {
  heading: string
  projects: Project[]
  emptyMessage?: string
  /** Owned by the section so one dialog serves both rails. */
  onOpenProject: (state: ProjectModalState) => void
}

interface ProjectCardProps {
  project: Project
  index: number
  lowPerformanceMode: boolean
  onOpen: (state: ProjectModalState) => void
}

function ProjectCard({ project, index, lowPerformanceMode, onOpen }: ProjectCardProps) {
  const open = (element: HTMLElement) => {
    onOpen({ project, originRect: element.getBoundingClientRect(), opener: element })
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    open(event.currentTarget)
  }

  const stopPropagation = (event: ReactMouseEvent<HTMLAnchorElement>) => event.stopPropagation()

  return (
    <Card
      gradientOverlay
      topAccent
      tilt={!lowPerformanceMode}
      className={cx(styles.card, project.featured && styles.featured)}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Open details for ${project.title}`}
      onClick={(event) => open(event.currentTarget)}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
        <div className={styles.cardLinks}>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} repository`}
              onClick={stopPropagation}
              className={styles.cardLink}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          )}
          <a
            href={projectDemoRoute(project.title)}
            aria-label={`${project.title} demo page`}
            onClick={stopPropagation}
            className={styles.cardLink}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {project.featured && (
        <Badge variant="outline" className={styles.featuredBadge}>
          Featured
        </Badge>
      )}

      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardDesc}>{project.description}</p>

      <div className={styles.techStack}>
        {project.tech.slice(0, 5).map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
        {project.tech.length > 5 && <span className={styles.techMore}>+{project.tech.length - 5}</span>}
      </div>

      <span className={styles.cardCta} aria-hidden="true">
        View details
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" />
        </svg>
      </span>
    </Card>
  )
}

export default function ProjectsCarousel({
  heading,
  projects,
  emptyMessage = 'No projects to display yet.',
  onOpenProject,
}: ProjectsCarouselProps) {
  const lowPerformanceMode = useLowPerformanceMode()
  const viewportRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const syncControls = () => {
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth
      setCanScrollPrev(viewport.scrollLeft > 8)
      setCanScrollNext(viewport.scrollLeft < maxScrollLeft - 8)
    }

    const requestSync = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        syncControls()
        rafRef.current = null
      })
    }

    syncControls()
    viewport.addEventListener('scroll', requestSync, { passive: true })

    // One observer on the viewport, not one per card. The previous version also
    // observed every child, so an N-card rail fired N+1 callbacks per resize.
    const resizeObserver = new ResizeObserver(requestSync)
    resizeObserver.observe(viewport)

    return () => {
      viewport.removeEventListener('scroll', requestSync)
      resizeObserver.disconnect()
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [projects.length])

  const scrollByPage = useCallback((direction: 'prev' | 'next') => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.scrollBy({
      left: (direction === 'next' ? 1 : -1) * viewport.clientWidth * 0.88,
      behavior: 'smooth',
    })
  }, [])

  // Arrow keys page the rail when focus is inside it.
  const handleRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollByPage('next')
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollByPage('prev')
    }
  }

  return (
    <div className={styles.rail}>
      <div className={styles.railHeader}>
        <h3 className={styles.railHeading}>
          {heading}
          <span className={styles.railCount}>{projects.length}</span>
        </h3>

        {projects.length > 0 && (
          <div className={styles.railControls} role="group" aria-label={`${heading} controls`}>
            <button
              type="button"
              className={styles.railButton}
              onClick={() => scrollByPage('prev')}
              disabled={!canScrollPrev}
              aria-label={`Scroll ${heading} left`}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5 7 10l5.5 5.5" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.railButton}
              onClick={() => scrollByPage('next')}
              disabled={!canScrollNext}
              aria-label={`Scroll ${heading} right`}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 4.5 13 10l-5.5 5.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <p className={styles.emptyState}>{emptyMessage}</p>
      ) : (
        <div
          className={cx(
            styles.railFrame,
            canScrollPrev && styles.fadeStart,
            canScrollNext && styles.fadeEnd,
          )}
        >
          <div
            ref={viewportRef}
            className={styles.railViewport}
            role="region"
            aria-label={`${heading} carousel`}
            tabIndex={0}
            onKeyDown={handleRailKeyDown}
          >
            <ul className={styles.railTrack}>
              {projects.map((project, index) => (
                <li key={project.title} className={styles.railItem}>
                  <ProjectCard
                    project={project}
                    index={index}
                    lowPerformanceMode={lowPerformanceMode}
                    onOpen={onOpenProject}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
