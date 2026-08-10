import { useEffect, type RefObject } from 'react'

/**
 * Shared pointer-tilt engine.
 *
 * There were two near-identical implementations of this in the codebase — an
 * inline rAF loop in ui/Card and `tiltEngine` inside ui/ProfileCard — both
 * lerping rotateX/rotateY toward a pointer position and both driving a glare
 * overlay. This is the one loop; callers supply their own visuals through
 * `onFrame`.
 *
 * Cost characteristics worth preserving:
 *   - Exactly one getBoundingClientRect per frame, and only while the element
 *     is actually hovered. (The original Card read every card's rect on every
 *     scroll event — roughly 1,900 discarded forced layouts per second.)
 *   - The loop exits once the tilt has settled. It does not idle at 60fps.
 *   - `will-change` is the caller's decision, because dropping the promotion
 *     flips text from grayscale to subpixel antialiasing and that is a visible
 *     change, not a free win.
 */

export interface TiltFrame {
  /** Degrees, already lerped toward the target. */
  rotateX: number
  rotateY: number
  /** Pointer position inside the element, 0..1. Centre is 0.5/0.5. */
  ratioX: number
  ratioY: number
  hovering: boolean
}

export interface UseTiltOptions {
  /** When false the hook attaches nothing at all. */
  enabled: boolean
  /** Peak rotation in degrees at the element's edge. */
  maxDeg?: number
  /** Per-frame approach factor. Higher settles faster. */
  lerp?: number
  /** Apply the perspective transform to the element itself. */
  applyTransform?: boolean
  /** Perspective distance used when applyTransform is on. */
  perspective?: number
  /** Called every frame with the current tilt state. */
  onFrame?: (frame: TiltFrame) => void
  /** Called once when the pointer enters and once when it leaves. */
  onHoverChange?: (hovering: boolean) => void
}

const SETTLED_DEG = 0.05

export function useTilt(
  ref: RefObject<HTMLElement | null>,
  {
    enabled,
    maxDeg = 8,
    lerp = 0.18,
    applyTransform = true,
    perspective = 1000,
    onFrame,
    onHoverChange,
  }: UseTiltOptions,
) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    if (applyTransform) {
      el.style.transformStyle = 'preserve-3d'
    }

    let frameId: number | null = null
    let hovering = false
    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0
    let ratioX = 0.5
    let ratioY = 0.5
    // Viewport coordinates of the last pointer event, converted to a ratio
    // inside the frame callback so the layout read happens at most once a frame.
    let pointerX = 0
    let pointerY = 0

    const render = () => {
      if (hovering) {
        const rect = el.getBoundingClientRect()
        ratioX = (pointerX - rect.left) / rect.width
        ratioY = (pointerY - rect.top) / rect.height
        targetX = (0.5 - ratioY) * maxDeg
        targetY = (ratioX - 0.5) * maxDeg
      }

      currentX += (targetX - currentX) * lerp
      currentY += (targetY - currentY) * lerp

      if (applyTransform) {
        el.style.transform = `perspective(${perspective}px) rotateX(${currentX}deg) rotateY(${currentY}deg)`
      }

      onFrame?.({ rotateX: currentX, rotateY: currentY, ratioX, ratioY, hovering })

      const settling =
        Math.abs(targetX - currentX) > SETTLED_DEG || Math.abs(targetY - currentY) > SETTLED_DEG

      if (hovering || settling) {
        frameId = window.requestAnimationFrame(render)
        return
      }

      // Settled and not hovered: stop. This is the branch the original
      // ProfileCard loop could never reach.
      frameId = null
    }

    const start = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(render)
    }

    const handleMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!hovering) {
        hovering = true
        onHoverChange?.(true)
      }
      start()
    }

    const handleLeave = () => {
      if (!hovering) return
      hovering = false
      targetX = 0
      targetY = 0
      onHoverChange?.(false)
      start()
    }

    el.addEventListener('pointermove', handleMove, { passive: true })
    el.addEventListener('pointerleave', handleLeave)
    el.addEventListener('pointercancel', handleLeave)

    return () => {
      el.removeEventListener('pointermove', handleMove)
      el.removeEventListener('pointerleave', handleLeave)
      el.removeEventListener('pointercancel', handleLeave)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
      if (applyTransform) {
        el.style.transform = ''
        el.style.transformStyle = ''
      }
    }
  }, [ref, enabled, maxDeg, lerp, applyTransform, perspective, onFrame, onHoverChange])
}

export default useTilt
