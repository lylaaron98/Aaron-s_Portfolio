import * as THREE from 'three'

const PALETTE = ['#19c3b2', '#7b7bff', '#e0489c', '#38bdf8', '#a78bfa', '#2dd4bf', '#f472b6']

/**
 * One scene behind the whole Warp page: a particle tunnel the camera flies
 * down as you scroll, with a ring for each role placed so the camera passes
 * through it while that role's card is on screen.
 */
export function createWarpScene(canvas: HTMLCanvasElement, ringCount: number) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  const bg = new THREE.Color('#05060d')
  renderer.setClearColor(bg)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(bg, 0.045)
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 120)

  const LENGTH = 110
  const START_Z = 6

  // Tunnel of particles
  const count = 7000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const color = new THREE.Color()
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 2.6 + Math.pow(Math.random(), 0.6) * 9
    positions.set([Math.cos(a) * r, Math.sin(a) * r, START_Z + 10 - Math.random() * (LENGTH + 30)], i * 3)
    color.set(PALETTE[i % 3]).lerp(new THREE.Color('#ffffff'), Math.random() * 0.5)
    colors.set([color.r, color.g, color.b], i * 3)
  }
  const tunnelGeometry = new THREE.BufferGeometry()
  tunnelGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  tunnelGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const tunnel = new THREE.Points(
    tunnelGeometry,
    new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  scene.add(tunnel)

  // Streaks: a few long lines that sell the sense of speed.
  const streakCount = 160
  const streakPositions = new Float32Array(streakCount * 6)
  for (let i = 0; i < streakCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 3.5 + Math.random() * 6
    const z = START_Z - Math.random() * LENGTH
    const len = 0.6 + Math.random() * 1.8
    streakPositions.set([Math.cos(a) * r, Math.sin(a) * r, z, Math.cos(a) * r, Math.sin(a) * r, z - len], i * 6)
  }
  const streakGeometry = new THREE.BufferGeometry()
  streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3))
  const streaks = new THREE.LineSegments(
    streakGeometry,
    new THREE.LineBasicMaterial({ color: 0x9fe8df, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }),
  )
  scene.add(streaks)

  // Rings, one per role, plus a portal ring in the hero.
  const ringGeometry = new THREE.TorusGeometry(2.2, 0.018, 12, 200)
  const haloGeometry = new THREE.TorusGeometry(2.45, 0.006, 8, 200)
  const rings = Array.from({ length: ringCount + 1 }, (_, i) => {
    const group = new THREE.Group()
    const c = new THREE.Color(PALETTE[i % PALETTE.length])
    const main = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({ color: c, transparent: true, blending: THREE.AdditiveBlending }),
    )
    const halo = new THREE.Mesh(
      haloGeometry,
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending }),
    )
    // Tick marks around each ring, like a gauge.
    const ticks = new THREE.Group()
    for (let t = 0; t < 48; t++) {
      const tick = new THREE.Mesh(
        new THREE.PlaneGeometry(0.012, t % 4 === 0 ? 0.22 : 0.1),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
      )
      const a = (t / 48) * Math.PI * 2
      tick.position.set(Math.cos(a) * 2.65, Math.sin(a) * 2.65, 0)
      tick.rotation.z = a - Math.PI / 2
      ticks.add(tick)
    }
    group.add(main, halo, ticks)
    group.position.z = START_Z - 6 - i * 10
    scene.add(group)
    return group
  })

  let progress = 0
  let eased = 0
  const pointer = { x: 0, y: 0 }
  const look = { x: 0, y: 0 }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w < h ? 80 : 65
    camera.updateProjectionMatrix()
  }

  const cameraZ = (p: number) => START_Z - p * LENGTH

  let last = 0
  function render(time: number) {
    // Frame-rate independent easing, so slow devices do not lag behind scroll.
    const dt = Math.min(0.1, last ? time - last : 0.016)
    last = time
    const delta = progress - eased
    eased += delta * (1 - Math.exp(-dt * 6))
    camera.position.z = cameraZ(eased)
    const k = 1 - Math.exp(-dt * 2.5)
    look.x += (pointer.x - look.x) * k
    look.y += (pointer.y - look.y) * k
    camera.position.x = look.x * 0.6
    camera.position.y = -look.y * 0.4
    camera.rotation.z = Math.max(-0.25, Math.min(0.25, delta * 4)) + Math.sin(time * 0.2) * 0.02
    rings.forEach((ring, i) => {
      ring.rotation.z = time * (i % 2 ? 0.08 : -0.06)
      const d = ring.position.z - camera.position.z
      // Fade a ring out just before the camera passes through it.
      const fade = THREE.MathUtils.clamp((-d - 0.5) / 3, 0, 1)
      ring.children.forEach((child) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined
        if (mat) mat.opacity = (child === ring.children[1] ? 0.45 : 1) * fade
      })
      ring.children[2].children.forEach((tick) => {
        ;((tick as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.6 * fade
      })
    })
    tunnel.rotation.z = time * 0.015
    renderer.render(scene, camera)
  }

  return {
    resize,
    render,
    setProgress: (p: number) => (progress = p),
    setPointer: (x: number, y: number) => {
      pointer.x = x
      pointer.y = y
    },
    /** Places ring i where the camera will be at scroll progress p, a little ahead. */
    placeRing: (i: number, p: number) => {
      if (rings[i]) rings[i].position.z = cameraZ(p) - 3.2
    },
    dispose() {
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        mesh.geometry?.dispose()
        ;(mesh.material as THREE.Material | undefined)?.dispose()
      })
      renderer.dispose()
    },
  }
}
