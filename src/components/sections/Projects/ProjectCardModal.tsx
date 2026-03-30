import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { Project } from '../../../types/project'
import Badge from '../../ui/Badge'
import { PROJECTS_DEMO_ROUTE } from '../../../constants/routes'
import { cx } from '../../../utils/classNames'
import styles from './Projects.module.css'

const CLOSE_DURATION_MS = 420

export interface RectSnapshot {
  top: number
  left: number
  width: number
  height: number
}

export interface ProjectModalState {
  project: Project
  originRect: RectSnapshot
  opener: HTMLElement | null
}

interface ProjectCardModalProps {
  state: ProjectModalState | null
  onClosed: () => void
}

type ModalPhase = 'closed' | 'opening' | 'open' | 'closing'

function getProjectLabel(project: Project) {
  return project.category === 'client' ? 'Client Project' : 'Personal Project'
}

function hasDedicatedLiveDemo(project: Project) {
  return Boolean(project.live && project.live !== project.github)
}

function hasPortfolioDemo(project: Project) {
  return !project.hideLiveDemoCard
}

function snapshotRect(rect: DOMRect | RectSnapshot): RectSnapshot {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function getTargetRect(): RectSnapshot {
  const isCompact = window.innerWidth <= 680
  const padding = isCompact ? 12 : 24
  const width = Math.min(1120, window.innerWidth - padding * 2)
  const height = Math.min(isCompact ? window.innerHeight * 0.94 : window.innerHeight * 0.9, 920)

  return {
    top: Math.max(padding, (window.innerHeight - height) / 2),
    left: Math.max(padding, (window.innerWidth - width) / 2),
    width,
    height,
  }
}

function getOriginRect(state: ProjectModalState): RectSnapshot {
  if (state.opener?.isConnected) {
    return snapshotRect(state.opener.getBoundingClientRect())
  }

  return state.originRect
}

function getRadius(rect: RectSnapshot) {
  return rect.width >= 720 ? 32 : 24
}

export default function ProjectCardModal({ state, onClosed }: ProjectCardModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openRafRef = useRef<number | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const [displayState, setDisplayState] = useState<ProjectModalState | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [phase, setPhase] = useState<ModalPhase>('closed')
  const [shellRect, setShellRect] = useState<RectSnapshot | null>(null)
  const galleryImages = useMemo(() => displayState?.project.images ?? [], [displayState])

  const clearPendingOpenAnimation = () => {
    if (openRafRef.current !== null) {
      window.cancelAnimationFrame(openRafRef.current)
      openRafRef.current = null
    }
  }

  const clearPendingClose = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const resetModal = () => {
    setDisplayState(null)
    setActiveImage(null)
    setShellRect(null)
    setPhase('closed')
  }

  useEffect(() => {
    if (!state) {
      if (phase !== 'closing') {
        resetModal()
      }

      return
    }

    clearPendingClose()
    clearPendingOpenAnimation()

    setDisplayState(state)
    setActiveImage(state.project.images?.[0] ?? null)
    setShellRect(getOriginRect(state))
    setPhase('opening')

    openRafRef.current = window.requestAnimationFrame(() => {
      openRafRef.current = window.requestAnimationFrame(() => {
        setShellRect(getTargetRect())
        setPhase('open')
        closeButtonRef.current?.focus()
        openRafRef.current = null
      })
    })

    return clearPendingOpenAnimation
  }, [state])

  useEffect(() => {
    if (!displayState) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose()
      }
    }

    const handleResize = () => {
      if (phase === 'closing') return

      setShellRect(getTargetRect())
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [displayState, phase])

  useEffect(() => {
    return () => {
      clearPendingOpenAnimation()
      clearPendingClose()
    }
  }, [])

  const requestClose = () => {
    if (!displayState || phase === 'closing' || phase === 'closed') return

    clearPendingOpenAnimation()

    const currentState = displayState
    setPhase('closing')
    setShellRect(getOriginRect(currentState))

    clearPendingClose()
    closeTimeoutRef.current = window.setTimeout(() => {
      currentState.opener?.focus()
      resetModal()
      onClosed()
      closeTimeoutRef.current = null
    }, CLOSE_DURATION_MS)
  }

  if (!displayState || !shellRect) return null

  const project = displayState.project
  const showPortfolioDemo = hasPortfolioDemo(project)
  const showDedicatedLiveDemo = hasDedicatedLiveDemo(project)
  const shellStyle: CSSProperties = {
    top: `${shellRect.top}px`,
    left: `${shellRect.left}px`,
    width: `${shellRect.width}px`,
    height: `${shellRect.height}px`,
    borderRadius: `${getRadius(shellRect)}px`,
  }

  const renderHero = () => {
    if (activeImage) {
      return (
        <div className={styles.modalHeroMedia}>
          <img src={activeImage} alt={`${project.title} preview`} className={styles.modalHeroImage} />
        </div>
      )
    }

    return (
      <div className={styles.modalHeroFallback} data-category={project.category}>
        <span className={styles.modalHeroEyebrow}>{getProjectLabel(project)}</span>
        <h2 className={styles.modalHeroTitle}>{project.title}</h2>
        <p className={styles.modalHeroSummary}>
          {project.featured ? 'Featured build with a polished delivery focus.' : 'Built with a strong engineering and product mindset.'}
        </p>
        <div className={styles.modalHeroTags}>
          {project.tech.slice(0, 4).map((tech) => (
            <span key={tech} className={styles.modalHeroTag}>{tech}</span>
          ))}
        </div>
      </div>
    )
  }

  return createPortal(
    <div
      className={cx(
        styles.modalOverlay,
        phase !== 'closing' && styles.modalOverlayVisible,
      )}
      onClick={requestClose}
    >
      <div
        className={cx(
          styles.modalShell,
          phase === 'closing' && styles.modalShellClosing,
        )}
        style={shellStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalScrollArea}>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.modalClose}
            onClick={requestClose}
            aria-label={`Close ${project.title} details`}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M5 5 15 15" />
              <path strokeLinecap="round" d="M15 5 5 15" />
            </svg>
          </button>

          <div
            className={cx(
              styles.modalContent,
              phase === 'open' && styles.modalContentVisible,
            )}
          >
            <div className={styles.modalLayout}>
              <div className={styles.modalHero}>
                {renderHero()}
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalHeader}>
                  <div className={styles.modalLabelRow}>
                    <span className={styles.modalCategory}>{getProjectLabel(project)}</span>
                    {project.featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                  <h2 id="project-modal-title" className={styles.modalTitle}>{project.title}</h2>
                  <p className={styles.modalDescription}>{project.description}</p>
                </div>

                <div className={styles.modalActions}>
                  {showPortfolioDemo && (
                    <a href={PROJECTS_DEMO_ROUTE} className={styles.modalPrimaryAction}>
                      View Demo Page
                    </a>
                  )}
                  {showDedicatedLiveDemo && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={showPortfolioDemo ? styles.modalSecondaryAction : styles.modalPrimaryAction}
                    >
                      Open Live Demo
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={showPortfolioDemo || showDedicatedLiveDemo ? styles.modalSecondaryAction : styles.modalPrimaryAction}
                    >
                      View Repository
                    </a>
                  )}
                </div>

                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Technology Stack</h3>
                  <div className={styles.modalTechGrid}>
                    {project.tech.map((tech) => (
                      <Badge key={tech} className={styles.modalTechBadge}>{tech}</Badge>
                    ))}
                  </div>
                </section>

                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Project Snapshot</h3>
                  <div className={styles.modalSummaryGrid}>
                    <div className={styles.modalSummaryCard}>
                      <span className={styles.modalSummaryLabel}>Category</span>
                      <strong>{getProjectLabel(project)}</strong>
                    </div>
                    <div className={styles.modalSummaryCard}>
                      <span className={styles.modalSummaryLabel}>Delivery</span>
                      <strong>{project.featured ? 'Featured Portfolio Work' : 'Portfolio Project'}</strong>
                    </div>
                    <div className={styles.modalSummaryCard}>
                      <span className={styles.modalSummaryLabel}>Screens</span>
                      <strong>{galleryImages.length > 0 ? `${galleryImages.length} captured views` : 'Preview on request'}</strong>
                    </div>
                  </div>
                </section>

                {galleryImages.length > 0 && (
                  <section className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>Gallery</h3>
                    <div className={styles.modalGallery}>
                      {galleryImages.map((image, index) => (
                        <button
                          key={`${project.title}-gallery-${index}`}
                          type="button"
                          className={`${styles.modalThumb} ${activeImage === image ? styles.modalThumbActive : ''}`}
                          onClick={() => setActiveImage(image)}
                          aria-label={`Show screenshot ${index + 1} for ${project.title}`}
                        >
                          <img src={image} alt={`${project.title} screenshot ${index + 1}`} className={styles.modalThumbImage} />
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
