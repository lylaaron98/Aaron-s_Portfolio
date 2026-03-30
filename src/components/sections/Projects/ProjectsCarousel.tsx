import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react'
import type { Project } from '../../../types/project'
import { useGsapStaggerReveal } from '../../../hooks/useGsapReveal'
import { useLowPerformanceMode } from '../../../hooks/useMediaQuery'
import Card from '../../ui/Card'
import Badge from '../../ui/Badge'
import { PROJECTS_DEMO_ROUTE } from '../../../constants/routes'
import styles from './Projects.module.css'
import ProjectCardModal, { type ProjectModalState, type RectSnapshot } from './ProjectCardModal'

interface ProjectsCarouselProps {
  heading: string
  projects: Project[]
  emptyMessage?: string
  cardClassName: string
}

interface ProjectCardProps {
  project: Project
  cardClassName: string
  lowPerformanceMode: boolean
  onOpen: (projectState: ProjectModalState) => void
}

function ProjectCard({ project, cardClassName, lowPerformanceMode, onOpen }: ProjectCardProps) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onOpen({
      project,
      originRect: event.currentTarget.getBoundingClientRect(),
      opener: event.currentTarget,
    })
  }

  const stopPropagation = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation()
  }

  return (
    <Card
      gradientOverlay
      tilt={!lowPerformanceMode}
      className={`${styles.card} ${styles.cardInteractive} ${cardClassName} ${project.featured ? styles.featured : ''}`}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Open details for ${project.title}`}
      onClick={(event) => {
        const opener = event.currentTarget
        const rect: RectSnapshot = opener.getBoundingClientRect()

        onOpen({
          project,
          originRect: rect,
          opener,
        })
      }}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardIcons}>
          <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
          <div className={styles.links}>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} GitHub repository`}
                onClick={stopPropagation}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            )}
            <a href={PROJECTS_DEMO_ROUTE} aria-label={`${project.title} demo page`} onClick={stopPropagation}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        {project.featured && <Badge variant="outline" className={styles.featuredBadge}>Featured</Badge>}
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardDesc}>{project.description}</p>
      </div>
      <div className={styles.techStack}>
        {project.tech.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>
    </Card>
  )
}

export default function ProjectsCarousel({
  heading,
  projects,
  emptyMessage = 'No projects to display yet.',
  cardClassName,
}: ProjectsCarouselProps) {
  const lowPerformanceMode = useLowPerformanceMode()
  const viewportRef = useGsapStaggerReveal<HTMLDivElement>(`.${styles.carouselItem}`, { stagger: 0.12 })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(projects.length > 0)
  const [activeProject, setActiveProject] = useState<ProjectModalState | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const syncControls = () => {
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth
      setCanScrollPrev(viewport.scrollLeft > 8)
      setCanScrollNext(viewport.scrollLeft < maxScrollLeft - 8)
    }

    const requestSync = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = window.requestAnimationFrame(() => {
        syncControls()
        rafRef.current = null
      })
    }

    syncControls()
    viewport.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)

    let resizeObserver: ResizeObserver | null = null

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(requestSync)
      resizeObserver.observe(viewport)
      Array.from(viewport.children).forEach((child) => resizeObserver?.observe(child))
    }

    return () => {
      viewport.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
      resizeObserver?.disconnect()

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [projects.length, viewportRef])

  const scrollByPage = (direction: 'prev' | 'next') => {
    const viewport = viewportRef.current
    if (!viewport) return

    viewport.scrollBy({
      left: (direction === 'next' ? 1 : -1) * viewport.clientWidth * 0.92,
      behavior: 'smooth',
    })
  }

  return (
    <div className={styles.carouselSection}>
      <div className={styles.carouselHeader}>
        <h2 className={styles.subheading}>{heading}</h2>
        {projects.length > 0 && (
          <div className={styles.carouselControls} role="group" aria-label={`${heading} carousel controls`}>
            <button
              type="button"
              className={styles.carouselButton}
              onClick={() => scrollByPage('prev')}
              disabled={!canScrollPrev}
              aria-label={`Scroll ${heading} projects left`}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5 7 10l5.5 5.5" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.carouselButton}
              onClick={() => scrollByPage('next')}
              disabled={!canScrollNext}
              aria-label={`Scroll ${heading} projects right`}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 4.5 13 10l-5.5 5.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>{emptyMessage}</div>
      ) : (
        <div
          ref={viewportRef}
          className={styles.carouselViewport}
          role="region"
          aria-label={`${heading} projects carousel`}
        >
          <div className={styles.carouselTrack}>
            {projects.map((project) => (
              <div key={project.title} className={styles.carouselItem}>
                <ProjectCard
                  project={project}
                  cardClassName={cardClassName}
                  lowPerformanceMode={lowPerformanceMode}
                  onOpen={setActiveProject}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <ProjectCardModal
        state={activeProject}
        onClosed={() => setActiveProject(null)}
      />
    </div>
  )
}
