import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useScene } from '../orbit/motion'
import { markRoomSeen, wantsLiteRoom } from './gate'
import { localHour, PHASE_HOURS, phaseAt, type Phase } from './timeOfDay'
import type { RoomScene } from './roomScene'
import styles from './RoomIntro.module.css'

type Stage = 'loading' | 'ready' | 'entering' | 'leaving'
type Mode = 'auto' | Phase

const MODES: { id: Mode; label: string }[] = [
  { id: 'auto', label: 'Live' },
  { id: 'dawn', label: 'Dawn' },
  { id: 'day', label: 'Day' },
  { id: 'dusk', label: 'Dusk' },
  { id: 'night', label: 'Night' },
]

const clockLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/**
 * The 3D room front door. Sits over the real site (which is already rendered
 * underneath), flies into the monitor on Enter, then fades away so the page
 * on the monitor becomes the page in the browser.
 */
export default function RoomIntro({ reduced, onExit }: { reduced: boolean; onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enterRef = useRef<HTMLButtonElement>(null)
  const sceneRef = useRef<RoomScene | null>(null)
  const [stage, setStage] = useState<Stage>('loading')
  const [mode, setMode] = useState<Mode>('auto')
  const [clock, setClock] = useState(clockLabel)
  const [hover, setHover] = useState(false)
  const [lite] = useState(wantsLiteRoom)
  const [coarse] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const [screenSrc] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'light' ? '/assets/room/screen-light.webp' : '/assets/room/screen-dark.webp',
  )

  const hour = mode === 'auto' ? localHour() : PHASE_HOURS[mode]
  const phase = phaseAt(hour)

  // Hold the page still while the room is up.
  useLayoutEffect(() => {
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = previous
    }
  }, [])

  useScene(
    canvasRef,
    true,
    () =>
      import('./roomScene').then(
        (m) => (canvas: HTMLCanvasElement) => m.createRoomScene(canvas, { lite, reduced, screenSrc, lightScreen: screenSrc.includes('light'), hour: localHour() }),
      ),
    (scene) => {
      sceneRef.current = scene
      scene.intro()
      // A visitor may already have left while the room was loading.
      setStage((current) => (current === 'loading' ? 'ready' : current))
      return () => {
        sceneRef.current = null
      }
    },
  )

  // Live mode follows the clock; refresh once a minute.
  useEffect(() => {
    sceneRef.current?.setHour(hour)
    if (mode !== 'auto') return
    const id = window.setInterval(() => {
      setClock(clockLabel())
      sceneRef.current?.setHour(localHour())
    }, 60_000)
    return () => window.clearInterval(id)
  }, [mode, hour, stage])

  useEffect(() => {
    if (stage === 'ready') enterRef.current?.focus({ preventScroll: true })
  }, [stage])

  // Hand back to the site once the fade ends; the timer covers browsers or
  // settings where transitionend never fires.
  const exited = useRef(false)
  const finish = useCallback(() => {
    if (exited.current) return
    exited.current = true
    onExit()
  }, [onExit])
  useEffect(() => {
    if (stage !== 'leaving') return
    const id = window.setTimeout(finish, 900)
    return () => window.clearTimeout(id)
  }, [stage, finish])

  const leave = useCallback(() => {
    markRoomSeen()
    setStage('leaving')
  }, [])

  const enter = useCallback(async () => {
    const scene = sceneRef.current
    if (!scene || stage !== 'ready') return
    setStage('entering')
    if (!reduced) await scene.enter()
    leave()
  }, [stage, reduced, leave])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') leave()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [leave])

  const onPointerMove = (event: React.PointerEvent) => {
    const scene = sceneRef.current
    if (!scene || stage !== 'ready') return
    scene.setPointer((event.clientX / innerWidth) * 2 - 1, (event.clientY / innerHeight) * 2 - 1)
    if (event.pointerType === 'mouse') {
      const over = scene.hitMonitor(event.clientX, event.clientY)
      if (over !== hover) {
        setHover(over)
        scene.setHover(over)
      }
    }
  }

  const onClick = (event: React.MouseEvent) => {
    if (sceneRef.current?.hitMonitor(event.clientX, event.clientY)) void enter()
  }

  return (
    <div
      className={styles.room}
      data-stage={stage}
      data-phase={phase}
      data-reduced={reduced || undefined}
      role="region"
      aria-label="3D room intro"
      onTransitionEnd={(event) => {
        if (stage === 'leaving' && event.target === event.currentTarget) finish()
      }}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        data-hover={hover || undefined}
        aria-hidden="true"
        onPointerMove={onPointerMove}
        onClick={onClick}
      />
      <p className={styles.srOnly}>
        A 3D scene of Aaron at his desk, in a studio with a city view. Use Enter portfolio to continue.
      </p>

      {stage === 'loading' && (
        <p className={styles.loading} role="status">
          Setting up the room…
        </p>
      )}

      <div className={styles.top}>
        <div className={styles.brand}>
          <strong>Aaron Lee</strong>
          <span>Software engineer · Singapore</span>
          <a className={styles.credits} href="/assets/room/CREDITS.txt" target="_blank" rel="noreferrer">
            Credits
          </a>
        </div>
        <button type="button" className={styles.skip} onClick={leave}>
          Skip to site
        </button>
      </div>

      <div className={styles.bottom}>
        <div className={styles.time} role="group" aria-label="Lighting">
          {MODES.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={mode === id} onClick={() => setMode(id)}>
              {id === 'auto' ? `${label} ${clock}` : label}
            </button>
          ))}
        </div>

        <div className={styles.cta}>
          <span className={styles.hint} aria-hidden="true">
            {coarse ? 'Tap the monitor' : 'Click the monitor'}
          </span>
          <button ref={enterRef} type="button" className={styles.enter} onClick={() => void enter()} disabled={stage !== 'ready'}>
            Enter portfolio
          </button>
        </div>
      </div>
    </div>
  )
}
