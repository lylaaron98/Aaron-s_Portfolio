'use client'
import { useEffect, useMemo, useRef, type CSSProperties, type MutableRefObject } from 'react'
import { cn } from '../../utils/classNames'

export const BackgroundRippleEffect = ({
  className,
  style,
  rows = 8,
  cols = 27,
  cellSize = 56,
  interactive = false,
  animate = false,
}: {
  className?: string
  style?: CSSProperties
  rows?: number
  cols?: number
  cellSize?: number
  interactive?: boolean
  animate?: boolean
}) => {
  const cellRefs = useRef<Array<HTMLDivElement | null>>([])
  const rootRef = useRef<HTMLDivElement>(null)

  const applyRipple = (origin: { row: number; col: number }) => {
    cellRefs.current.forEach((cell, idx) => {
      if (!cell) return

      const rowIdx = Math.floor(idx / cols)
      const colIdx = idx % cols
      const distance = Math.hypot(origin.row - rowIdx, origin.col - colIdx)
      const delay = Math.max(0, distance * 55)
      const duration = 200 + distance * 80

      cell.style.setProperty('--delay', `${delay}ms`)
      cell.style.setProperty('--duration', `${duration}ms`)
      cell.classList.remove('animate-cell-ripple')
    })

    window.requestAnimationFrame(() => {
      cellRefs.current.forEach((cell) => cell?.classList.add('animate-cell-ripple'))
    })
  }

  useEffect(() => {
    if (!animate || interactive) {
      return
    }

    let timeoutId: number | null = null
    let cancelled = false
    let inView = false

    const triggerRipple = () => {
      const row = Math.max(1, Math.min(rows - 2, Math.floor(Math.random() * rows)))
      const col = Math.max(1, Math.min(cols - 2, Math.floor(Math.random() * cols)))

      applyRipple({ row, col })

      if (cancelled) return
      timeoutId = window.setTimeout(triggerRipple, 1800 + Math.round(Math.random() * 1200))
    }

    const stop = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    // Every section mounts one of these. Without gating, all five kept firing
    // ripples across 240 cells each on a timer, forever, regardless of whether
    // the section was anywhere near the viewport.
    const schedule = () => {
      if (!inView || document.hidden || timeoutId !== null) return
      timeoutId = window.setTimeout(triggerRipple, 500)
    }

    const host = rootRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting)
        if (inView) schedule()
        else stop()
      },
      { threshold: 0 },
    )
    if (host) observer.observe(host)

    const onVisibility = () => {
      if (document.hidden) stop()
      else schedule()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      stop()
    }
  }, [animate, cols, interactive, rows])

  return (
    <div
      ref={rootRef}
      className={cn(
        'absolute inset-0 h-full w-full',
        '[--cell-border-color:var(--color-neutral-300)] [--cell-fill-color:var(--color-neutral-100)] [--cell-shadow-color:var(--color-neutral-500)]',
        'dark:[--cell-border-color:var(--color-neutral-700)] dark:[--cell-fill-color:var(--color-neutral-900)] dark:[--cell-shadow-color:var(--color-neutral-800)]',
        className,
      )}
      style={style}
    >
        <div className="relative h-auto w-auto overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
          <DivGrid
            className="mask-radial-from-20% mask-radial-at-top opacity-60"
            rows={rows}
            cols={cols}
            cellSize={cellSize}
            borderColor='var(--cell-border-color)'
            fillColor='var(--cell-fill-color)'
            cellRefs={cellRefs}
            onCellClick={(row, col) => {
              if (!interactive) return
              applyRipple({ row, col })
            }}
            interactive={interactive}
          />
        </div>
    </div>
  )
}

type DivGridProps = {
  className?: string
  rows: number
  cols: number
  cellSize: number
  borderColor: string
  cellRefs: MutableRefObject<Array<HTMLDivElement | null>>
  fillColor: string
  onCellClick?: (row: number, col: number) => void
  interactive?: boolean
}

const DivGrid = ({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = '#3f3f46',
  cellRefs,
  fillColor = 'rgba(14,165,233,0.3)',
  onCellClick = () => {},
  interactive = false,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  )

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: 'auto',
    // Lets the browser skip paint for grids that are scrolled out of view. The
    // size is fixed and declared above, so this costs no layout stability.
    contentVisibility: 'auto',
    containIntrinsicSize: `${rows * cellSize}px ${cols * cellSize}px`,
  }

  return (
    <div className={cn('relative z-[3]', className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols)
        const colIdx = idx % cols

        return (
          <div
            key={idx}
            ref={(node) => {
              cellRefs.current[idx] = node
            }}
            className={cn(
              // No static will-change here. It used to sit on all 1,200 cells at
              // once, permanently hinting the compositor to promote every one of
              // them; the ripple class now carries it only while animating.
              'cell relative border-[0.5px] opacity-30 transition-opacity duration-150 dark:shadow-[0px_0px_24px_1px_var(--cell-shadow-color)_inset]',
              interactive && 'hover:opacity-70',
              !interactive && 'pointer-events-none',
            )}
            style={{
              backgroundColor: fillColor,
              borderColor,
            }}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        )
      })}
    </div>
  )
}
