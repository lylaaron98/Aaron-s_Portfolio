import { useEffect, type RefObject } from 'react'
import { runWhileVisible } from './motion'

export interface SceneHandle {
  resize(): void
  render(time: number): void
  dispose(): void
}

/**
 * Lazily imports a WebGL scene, sizes it to its canvas and renders it only
 * while on screen. `onReady` receives the scene so scroll handlers can drive it.
 */
export function useScene<T extends SceneHandle>(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
  load: () => Promise<(canvas: HTMLCanvasElement) => T>,
  onReady?: (scene: T) => void | (() => void),
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!enabled || !canvas) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    load().then((create) => {
      if (cancelled) return
      const scene = create(canvas)
      scene.resize()
      const observer = new ResizeObserver(() => scene.resize())
      observer.observe(canvas)
      const stop = runWhileVisible(canvas, (t) => scene.render(t))
      const detach = onReady?.(scene)
      canvas.dataset.ready = 'true'
      cleanup = () => {
        detach?.()
        stop()
        observer.disconnect()
        scene.dispose()
      }
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
    // load/onReady are static per concept.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, canvasRef])
}
