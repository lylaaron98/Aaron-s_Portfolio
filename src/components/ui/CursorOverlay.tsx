import { useEffect, useRef } from 'react'
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

const TRAIL_SIZES = [24, 18, 14, 10]

export default function CursorOverlay() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const trailRefs = useRef<Array<HTMLDivElement | null>>([])
  const targetRef = useRef({ x: -100, y: -100 })
  const pointsRef = useRef(TRAIL_SIZES.map(() => ({ x: -100, y: -100 })))
  const frameRef = useRef<number | null>(null)
  const lastMoveAtRef = useRef(0)
  const constrainedDevice =
    typeof navigator !== 'undefined' &&
    navigator.hardwareConcurrency > 0 &&
    navigator.hardwareConcurrency <= 4
  const isEnabled = hasFinePointer && !prefersReducedMotion && !constrainedDevice

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    const stopAnimation = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }

    const animate = (timestamp: number) => {
      const points = pointsRef.current
      const target = targetRef.current
      let maxDelta = 0

      points[0].x += (target.x - points[0].x) * 0.24
      points[0].y += (target.y - points[0].y) * 0.24
      maxDelta = Math.max(maxDelta, Math.abs(target.x - points[0].x), Math.abs(target.y - points[0].y))

      for (let index = 1; index < points.length; index += 1) {
        points[index].x += (points[index - 1].x - points[index].x) * 0.18
        points[index].y += (points[index - 1].y - points[index].y) * 0.18
        maxDelta = Math.max(
          maxDelta,
          Math.abs(points[index - 1].x - points[index].x),
          Math.abs(points[index - 1].y - points[index].y),
        )
      }

      points.forEach((point, index) => {
        const node = trailRefs.current[index]
        if (!node) return

        node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`
      })

      if (maxDelta > 0.35 || timestamp - lastMoveAtRef.current < 120) {
        frameRef.current = window.requestAnimationFrame(animate)
        return
      }

      frameRef.current = null
    }

    const startAnimation = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(animate)
      }
    }

    const handleMove = (event: MouseEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
      lastMoveAtRef.current = performance.now()
      startAnimation()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation()
      }
    }

    document.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopAnimation()
    }
  }, [isEnabled])

  if (!isEnabled) {
    return null
  }

  return (
    <>
      {TRAIL_SIZES.map((size, index) => (
        <div
          key={size}
          ref={(node) => {
            trailRefs.current[index] = node
          }}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: `${size}px`,
            height: `${size}px`,
            pointerEvents: 'none',
            zIndex: 9999,
            borderRadius: '50%',
            opacity: 1 - index * 0.18,
            background: 'rgba(192, 192, 200, 0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 14px rgba(192,192,200,0.12)',
            willChange: 'transform',
          }}
        />
      ))}
    </>
  )
}
