import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'
import type { Project } from '../../../types/project'
import Badge from '../../ui/Badge'
import { projectDemoRoute } from '../../../constants/routes'
import { cx } from '../../../utils/classNames'
import styles from './Projects.module.css'

const OPEN_DURATION_MS = 460
const CLOSE_DURATION_MS = 340

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

function snapshotRect(rect: DOMRect | RectSnapshot): RectSnapshot {
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

function getOriginRect(state: ProjectModalState): RectSnapshot {
  if (state.opener?.isConnected) return snapshotRect(state.opener.getBoundingClientRect())
  return state.originRect
}

/**
 * FLIP: express the card's rect as a transform of the shell's own final rect.
 *
 * The previous implementation animated top/left/width/height/border-radius with
 * a matching `will-change`. Those are layout properties — every frame of a
 * 520ms transition forced a full layout and paint of a full-screen dialog, and
 * `will-change` could not help because there is no layer to promote for layout.
 * Transform and opacity are the only two things the compositor can animate on
 * its own, so that is all this animates now.
 */
function flipTransform(from: RectSnapshot, to: DOMRect): string {
  const scaleX = Math.max(from.width, 1) / Math.max(to.width, 1)
  const scaleY = Math.max(from.height, 1) / Math.max(to.height, 1)
  const dx = from.left + from.width / 2 - (to.left + to.width / 2)
  const dy = from.top + from.height / 2 - (to.top + to.height / 2)

  return `translate3d(${dx}px, ${dy}px, 0) scale(${scaleX}, ${scaleY})`
}

export default function ProjectCardModal({ state, onClosed }: ProjectCardModalProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const [displayState, setDisplayState] = useState<ProjectModalState | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [phase, setPhase] = useState<ModalPhase>('closed')

  const galleryImages = useMemo(() => displayState?.project.images ?? [], [displayState])

  const clearPendingClose = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const clearPendingFrame = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const resetModal = useCallback(() => {
    setDisplayState(null)
    setActiveImage(null)
    setPhase('closed')
  }, [])

  // Adopt a newly opened project.
  useEffect(() => {
    if (!state) return

    clearPendingClose()
    clearPendingFrame()

    setDisplayState(state)
    setActiveImage(state.project.images?.[0] ?? null)
    setPhase('opening')
  }, [clearPendingClose, clearPendingFrame, state])

  /**
   * The FLIP measure-and-invert, before the browser paints. The shell is
   * already at its final geometry in the DOM; we stamp on the inverse transform
   * with transitions off, then release it on the next frame so the transition
   * runs from card to dialog.
   */
  useLayoutEffect(() => {
    const shell = shellRef.current
    if (!shell || phase !== 'opening' || !displayState) return

    const target = shell.getBoundingClientRect()
    shell.style.transition = 'none'
    shell.style.transform = flipTransform(getOriginRect(displayState), target)
    shell.style.opacity = '0.4'

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        shell.style.transition = ''
        shell.style.transform = ''
        shell.style.opacity = ''
        setPhase('open')
        closeButtonRef.current?.focus({ preventScroll: true })
        rafRef.current = null
      })
    })

    return clearPendingFrame
  }, [clearPendingFrame, displayState, phase])

  const requestClose = useCallback(() => {
    const shell = shellRef.current
    if (!displayState || phase === 'closing' || phase === 'closed') return

    clearPendingFrame()
    setPhase('closing')

    if (shell) {
      // Fly back to wherever the card is now — it may have scrolled since.
      shell.style.transform = flipTransform(getOriginRect(displayState), shell.getBoundingClientRect())
      shell.style.opacity = '0.4'
    }

    const opener = displayState.opener
    clearPendingClose()
    closeTimeoutRef.current = window.setTimeout(() => {
      opener?.focus({ preventScroll: true })
      resetModal()
      onClosed()
      closeTimeoutRef.current = null
    }, CLOSE_DURATION_MS)
  }, [clearPendingClose, clearPendingFrame, displayState, onClosed, phase, resetModal])

  // Escape to close, and lock the page behind the dialog.
  useEffect(() => {
    if (!displayState) return

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose()
        return
      }

      // Minimal focus trap: keep Tab inside the dialog.
      if (event.key !== 'Tab') return
      const shell = shellRef.current
      if (!shell) return

      const focusable = shell.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [displayState, requestClose])

  useEffect(
    () => () => {
      clearPendingFrame()
      clearPendingClose()
    },
    [clearPendingClose, clearPendingFrame],
  )

  if (!displayState) return null

  const project = displayState.project
  const demoHref = projectDemoRoute(project.title)
  const showLiveDemo = Boolean(project.live && project.live !== project.github)
  const shellStyle: CSSProperties = {
    ['--open-duration' as string]: `${OPEN_DURATION_MS}ms`,
    ['--close-duration' as string]: `${CLOSE_DURATION_MS}ms`,
  }

  return createPortal(
    <div
      className={cx(styles.modalOverlay, phase !== 'closing' && styles.modalOverlayVisible)}
      onClick={requestClose}
    >
      <div
        ref={shellRef}
        className={cx(styles.modalShell, phase === 'closing' && styles.modalShellClosing)}
        style={shellStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
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

        <div className={styles.modalScrollArea}>
          <div className={cx(styles.modalContent, phase === 'open' && styles.modalContentVisible)}>
            <div className={styles.modalLayout}>
              <div className={styles.modalHero}>
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={`${project.title} preview`}
                    className={styles.modalHeroImage}
                    // The first gallery image is the LCP candidate once the
                    // dialog opens, so it is the one thing here not lazied.
                    decoding="async"
                    width={1200}
                    height={750}
                  />
                ) : (
                  <div className={styles.modalHeroFallback}>
                    <span className={styles.modalHeroEyebrow}>{getProjectLabel(project)}</span>
                    <h2 className={styles.modalHeroTitle}>{project.title}</h2>
                    <div className={styles.modalHeroTags}>
                      {project.tech.slice(0, 4).map((tech) => (
                        <span key={tech} className={styles.modalHeroTag}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalHeader}>
                  <div className={styles.modalLabelRow}>
                    <span className={styles.modalCategory}>{getProjectLabel(project)}</span>
                    {project.featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                  <h2 id="project-modal-title" className={styles.modalTitle}>
                    {project.title}
                  </h2>
                  <p className={styles.modalDescription}>{project.description}</p>
                </div>

                <div className={styles.modalActions}>
                  <a href={demoHref} className={styles.modalPrimaryAction}>
                    Open demo page
                    <svg aria-hidden="true" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" />
                    </svg>
                  </a>
                  {showLiveDemo && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.modalSecondaryAction}
                    >
                      Live site
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.modalSecondaryAction}
                    >
                      Repository
                    </a>
                  )}
                </div>

                <section className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Technology</h3>
                  <div className={styles.modalTechGrid}>
                    {project.tech.map((tech) => (
                      <Badge key={tech} className={styles.modalTechBadge}>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </section>

                {galleryImages.length > 0 && (
                  <section className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}>
                      Gallery
                      <span className={styles.modalSectionCount}>{galleryImages.length}</span>
                    </h3>
                    <div className={styles.modalGallery}>
                      {galleryImages.map((image, index) => (
                        <button
                          key={image}
                          type="button"
                          className={cx(styles.modalThumb, activeImage === image && styles.modalThumbActive)}
                          onClick={() => setActiveImage(image)}
                          aria-label={`Show screenshot ${index + 1} of ${galleryImages.length}`}
                          aria-pressed={activeImage === image}
                        >
                          <img
                            src={image}
                            alt=""
                            className={styles.modalThumbImage}
                            loading="lazy"
                            decoding="async"
                            width={320}
                            height={200}
                          />
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
