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

  useEffect(() => {
    if (!hasFinePointer || prefersReducedMotion) {
      return
    }

    const animate = () => {
      const points = pointsRef.current
      const target = targetRef.current

      points[0].x += (target.x - points[0].x) * 0.24
      points[0].y += (target.y - points[0].y) * 0.24

      for (let index = 1; index < points.length; index += 1) {
        points[index].x += (points[index - 1].x - points[index].x) * 0.18
        points[index].y += (points[index - 1].y - points[index].y) * 0.18
      }

      points.forEach((point, index) => {
        const node = trailRefs.current[index]
        if (!node) return

        node.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%)`
      })

      frameRef.current = window.requestAnimationFrame(animate)
    }

    const handleMove = (event: MouseEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
    }

    document.addEventListener('mousemove', handleMove, { passive: true })
    frameRef.current = window.requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [hasFinePointer, prefersReducedMotion])

  if (!hasFinePointer || prefersReducedMotion) {
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
