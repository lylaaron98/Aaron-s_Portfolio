import * as THREE from 'three'
import { gsap } from '../orbit/motion'
import { lightingAt, skyBodyAt } from './timeOfDay'

/**
 * The landing room: a minimal studio on a high floor, a floor-to-ceiling
 * window onto a skyline, a desk with two monitors and a low-poly figure at
 * work. Everything is built from primitives and canvas textures, so the scene
 * costs no model downloads; the only image is the screenshot on the monitor.
 */

export interface RoomOptions {
  /** Lighter build for phones and weak GPUs: no shadows, fewer buildings. */
  lite: boolean
  /** Screenshot shown on the main monitor (matches the visitor's theme). */
  screenSrc: string
  hour: number
  reduced: boolean
}

export interface RoomScene {
  resize(): void
  render(time: number): void
  dispose(): void
  setHour(hour: number): void
  setPointer(x: number, y: number): void
  /** True when the client point is over the main monitor. */
  hitMonitor(clientX: number, clientY: number): boolean
  setHover(on: boolean): void
  /** Flies the camera into the main monitor until it fills the viewport. */
  enter(): Promise<void>
  /** Gentle dolly-in on first view. */
  intro(): void
}

const SCREEN_W = 0.84
const SCREEN_H = 0.525
const MONITOR = new THREE.Vector3(-0.15, 1.13, -1.6)

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  draw(canvas.getContext('2d')!)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** A capsule stretched between two points: arms, legs, chair parts. */
function limb(from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material) {
  const length = from.distanceTo(to)
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, Math.max(length, 0.001), 3, 8), material)
  mesh.position.copy(from).add(to).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize())
  mesh.castShadow = true
  return mesh
}

function box(w: number, h: number, d: number, material: THREE.Material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

const std = (color: string, roughness = 0.8, metalness = 0, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra })

export function createRoomScene(canvas: HTMLCanvasElement, options: RoomOptions): RoomScene {
  const { lite } = options
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.25 : 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = !lite
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#cfe4f7', 40, 260)
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 600)

  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(item: T) => {
    disposables.push(item)
    return item
  }

  // ── Sky ────────────────────────────────────────────────────────────────
  const skyUniforms = {
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSun: { value: new THREE.Vector2(0.5, 0.5) },
    uSunColor: { value: new THREE.Color() },
    uIsDay: { value: 1 },
    uStars: { value: 0 },
    uTime: { value: 0 },
  }
  const sky = new THREE.Mesh(
    track(new THREE.PlaneGeometry(900, 420)),
    track(
      new THREE.ShaderMaterial({
        uniforms: skyUniforms,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop, uHorizon, uSunColor;
          uniform vec2 uSun;
          uniform float uIsDay, uStars, uTime;
          varying vec2 vUv;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          void main() {
            float h = smoothstep(0.4, 0.68, vUv.y);
            vec3 col = mix(uHorizon, uTop, h);
            vec2 d = (vUv - uSun) * vec2(2.0, 1.0);
            float dist = length(d);
            float disc = smoothstep(0.012, 0.009, dist);
            float glow = exp(-dist * (uIsDay > 0.5 ? 9.0 : 22.0)) * (uIsDay > 0.5 ? 0.55 : 0.25);
            col += uSunColor * (glow + disc * (uIsDay > 0.5 ? 1.6 : 1.1));
            vec2 cell = floor(vUv * vec2(900.0, 420.0));
            float star = step(0.9965, hash(cell));
            float twinkle = 0.6 + 0.4 * sin(uTime * 2.0 + hash(cell + 3.1) * 40.0);
            col += vec3(star * twinkle * uStars * smoothstep(0.43, 0.52, vUv.y));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `,
      }),
    ),
  )
  sky.position.set(0, 40, -230)
  scene.add(sky)

  // ── Skyline (seen from a high floor: tops sit around eye level) ──────────
  const windowTex = track(
    canvasTexture(64, 128, (ctx) => {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, 64, 128)
      for (let y = 4; y < 128; y += 6) {
        for (let x = 3; x < 64; x += 6) {
          const r = Math.random()
          if (r < 0.32) {
            ctx.fillStyle = r < 0.08 ? '#bfe0ff' : '#ffd79a'
            ctx.fillRect(x, y, 3, 3)
          }
        }
      }
    }),
  )
  const cityMaterial = track(std('#1b2133', 0.9, 0.1, { emissive: '#ffffff', emissiveMap: windowTex, emissiveIntensity: 1 }))
  windowTex.wrapS = windowTex.wrapT = THREE.RepeatWrapping
  windowTex.repeat.set(3, 10)
  const buildingCount = lite ? 110 : 200
  const city = new THREE.InstancedMesh(track(new THREE.BoxGeometry(1, 1, 1)), cityMaterial, buildingCount)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < buildingCount; i++) {
    const z = -45 - Math.random() * 150
    const spread = 30 + -z * 1.1
    const x = (Math.random() * 2 - 1) * spread
    const w = 6 + Math.random() * 12
    // Tops land a little below to a little above eye level.
    const top = -26 + Math.random() * 30 + (Math.abs(x) < 40 ? 8 : 0)
    const height = 160
    dummy.position.set(x, top - height / 2, z)
    dummy.scale.set(w, height, 6 + Math.random() * 12)
    dummy.updateMatrix()
    city.setMatrixAt(i, dummy.matrix)
  }
  scene.add(city)

  // ── Room shell ─────────────────────────────────────────────────────────
  const floorMat = track(std('#cfc9bf', 0.5))
  const wallMat = track(std('#ebe8e3', 0.92))
  const frameMat = track(std('#16171b', 0.5, 0.4))

  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(6.4, 7)), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, 1)
  floor.receiveShadow = true
  scene.add(floor)

  const ceiling = new THREE.Mesh(track(new THREE.PlaneGeometry(6.4, 7)), wallMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, 3, 1)
  scene.add(ceiling)

  const leftWall = new THREE.Mesh(track(new THREE.PlaneGeometry(7, 3)), wallMat)
  leftWall.rotation.y = Math.PI / 2
  leftWall.position.set(-3.2, 1.5, 1)
  leftWall.receiveShadow = true
  scene.add(leftWall)

  const rightWall = leftWall.clone()
  rightWall.rotation.y = -Math.PI / 2
  rightWall.position.x = 3.2
  scene.add(rightWall)

  // Floor-to-ceiling glazing on the back wall: slim black mullions only.
  const glazing = new THREE.Group()
  glazing.add(box(6.4, 0.06, 0.08, frameMat, 0, 0.03, -2.4))
  glazing.add(box(6.4, 0.08, 0.08, frameMat, 0, 2.96, -2.4))
  for (let i = 0; i <= 5; i++) glazing.add(box(0.045, 3, 0.06, frameMat, -3.2 + i * 1.28, 1.5, -2.4))
  glazing.children.forEach((m) => (m.castShadow = false))
  scene.add(glazing)

  // Ceiling light strip.
  const stripMat = track(std('#fff2df', 0.4, 0, { emissive: '#ffe2bd', emissiveIntensity: 0 }))
  scene.add(box(2.4, 0.02, 0.06, stripMat, 0, 2.985, -0.4))

  // ── Desk ───────────────────────────────────────────────────────────────
  const oak = track(std('#b38558', 0.55))
  const black = track(std('#1b1c21', 0.45, 0.3))
  const deskTop = 0.74
  scene.add(box(1.7, 0.04, 0.75, oak, 0, deskTop - 0.02, -1.45))
  for (const x of [-0.8, 0.8]) {
    scene.add(box(0.04, deskTop - 0.04, 0.04, black, x, (deskTop - 0.04) / 2, -1.15))
    scene.add(box(0.04, deskTop - 0.04, 0.04, black, x, (deskTop - 0.04) / 2, -1.75))
    scene.add(box(0.04, 0.04, 0.64, black, x, 0.02, -1.45))
  }

  // Main monitor.
  const monitor = new THREE.Group()
  monitor.position.copy(MONITOR)
  const bezel = box(SCREEN_W + 0.035, SCREEN_H + 0.035, 0.025, black)
  monitor.add(bezel)
  const halo = new THREE.Mesh(
    track(new THREE.PlaneGeometry(SCREEN_W + 0.09, SCREEN_H + 0.09)),
    track(new THREE.MeshBasicMaterial({ color: '#19c3b2', transparent: true, opacity: 0, toneMapped: false })),
  )
  halo.position.z = -0.014
  monitor.add(halo)
  const screenTex = canvasTexture(16, 10, (ctx) => {
    ctx.fillStyle = '#0b0f1e'
    ctx.fillRect(0, 0, 16, 10)
  })
  const screenMat = track(new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }))
  const screen = new THREE.Mesh(track(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H)), screenMat)
  screen.position.z = 0.0135
  monitor.add(screen)
  new THREE.TextureLoader().load(options.screenSrc, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    screenMat.map = track(texture)
    screenMat.needsUpdate = true
    screenTex.dispose()
  })
  monitor.add(box(0.05, 0.3, 0.03, black, 0, -0.38, -0.03))
  monitor.add(box(0.24, 0.012, 0.16, black, 0, -MONITOR.y + deskTop + 0.006, 0.02))
  scene.add(monitor)

  // Second monitor, portrait, scrolling code.
  const codeTex = track(
    canvasTexture(256, 512, (ctx) => {
      ctx.fillStyle = '#0d1020'
      ctx.fillRect(0, 0, 256, 512)
      const palette = ['#7c83ff', '#19c3b2', '#e0489c', '#c9cde2', '#6f7597', '#ffd79a']
      let indent = 0
      for (let y = 10; y < 512; y += 13) {
        if (Math.random() < 0.12) continue
        indent = Math.max(0, Math.min(4, indent + (Math.random() < 0.3 ? 1 : Math.random() < 0.3 ? -1 : 0)))
        let x = 14 + indent * 14
        const tokens = 1 + Math.floor(Math.random() * 4)
        for (let t = 0; t < tokens && x < 236; t++) {
          const w = 12 + Math.random() * 46
          ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)]
          ctx.globalAlpha = 0.85
          ctx.fillRect(x, y, Math.min(w, 240 - x), 5)
          x += w + 6
        }
      }
    }),
  )
  codeTex.wrapT = THREE.RepeatWrapping
  codeTex.repeat.set(1, 0.6)
  const side = new THREE.Group()
  side.position.set(0.66, 1.16, -1.5)
  side.rotation.y = -0.5
  side.add(box(0.335, 0.555, 0.022, black))
  const sideScreen = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.31, 0.53)),
    track(new THREE.MeshBasicMaterial({ map: codeTex, toneMapped: false })),
  )
  sideScreen.position.z = 0.012
  side.add(sideScreen)
  side.add(box(0.04, 0.16, 0.03, black, 0, -0.35, -0.02))
  side.add(box(0.18, 0.012, 0.14, black, 0, -1.16 + deskTop + 0.006, 0))
  scene.add(side)

  // Keyboard, mouse, mug, lamp.
  const keyMat = track(std('#2a2c33', 0.6))
  scene.add(box(0.44, 0.018, 0.14, black, -0.12, deskTop + 0.009, -1.24))
  scene.add(box(0.42, 0.006, 0.12, keyMat, -0.12, deskTop + 0.02, -1.24))
  const mouse = new THREE.Mesh(track(new THREE.SphereGeometry(0.03, 12, 8)), black)
  mouse.scale.set(1, 0.5, 1.5)
  mouse.position.set(0.24, deskTop + 0.012, -1.24)
  scene.add(mouse)
  const mug = new THREE.Mesh(track(new THREE.CylinderGeometry(0.04, 0.036, 0.1, 18)), track(std('#f4f2ee', 0.4)))
  mug.position.set(-0.62, deskTop + 0.05, -1.28)
  mug.castShadow = true
  scene.add(mug)

  const lamp = new THREE.Group()
  lamp.position.set(-0.7, deskTop, -1.68)
  lamp.add(box(0.14, 0.015, 0.14, black, 0, 0.008, 0))
  lamp.add(limb(new THREE.Vector3(0, 0.01, 0), new THREE.Vector3(0.05, 0.38, 0.05), 0.008, black))
  lamp.add(limb(new THREE.Vector3(0.05, 0.38, 0.05), new THREE.Vector3(0.2, 0.42, 0.14), 0.008, black))
  const shadeMat = track(std('#1b1c21', 0.4, 0.2, { emissive: '#ffcf96', emissiveIntensity: 0, side: THREE.DoubleSide }))
  const shade = new THREE.Mesh(track(new THREE.ConeGeometry(0.06, 0.08, 20, 1, true)), shadeMat)
  shade.position.set(0.21, 0.4, 0.15)
  lamp.add(shade)
  scene.add(lamp)
  const lampLight = new THREE.PointLight('#ffc98f', 0, 4, 2)
  lampLight.position.set(-0.49, deskTop + 0.34, -1.53)
  scene.add(lampLight)

  // Chair.
  const chairMat = track(std('#2b2d35', 0.7))
  const chair = new THREE.Group()
  chair.position.set(-0.1, 0, -0.5)
  chair.add(box(0.5, 0.07, 0.48, chairMat, 0, 0.47, 0))
  chair.add(box(0.46, 0.38, 0.05, chairMat, 0, 0.8, 0.24))
  chair.add(box(0.04, 0.3, 0.04, black, 0, 0.66, 0.24))
  chair.add(box(0.05, 0.38, 0.05, black, 0, 0.24, 0))
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const leg = box(0.3, 0.03, 0.04, black, Math.cos(a) * 0.15, 0.05, Math.sin(a) * 0.15)
    leg.rotation.y = -a
    chair.add(leg)
  }
  scene.add(chair)

  // ── Avatar: a stylised, faceless figure at the keyboard ───────────────────
  const skin = track(std('#d8a98a', 0.7))
  const hoodie = track(std('#363b78', 0.85))
  const pants = track(std('#24262d', 0.85))
  const hair = track(std('#191615', 0.9, 0, { flatShading: true }))
  const teal = track(std('#19c3b2', 0.35, 0.2))
  const white = track(std('#f3f3f1', 0.6))

  const avatar = new THREE.Group()
  avatar.position.set(-0.1, 0, -0.52)
  scene.add(avatar)
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

  for (const sx of [-0.1, 0.1]) {
    avatar.add(limb(v(sx, 0.56, 0.02), v(sx, 0.56, -0.38), 0.07, pants))
    avatar.add(limb(v(sx, 0.56, -0.4), v(sx, 0.1, -0.44), 0.058, pants))
    const shoe = box(0.1, 0.07, 0.22, white, sx, 0.04, -0.5)
    avatar.add(shoe)
  }

  const torso = new THREE.Group()
  torso.position.set(0, 0.56, 0.04)
  avatar.add(torso)
  const chest = limb(v(0, 0.08, 0), v(0, 0.42, -0.04), 0.16, hoodie)
  chest.scale.set(1.15, 1, 0.8)
  torso.add(chest)
  const hood = new THREE.Mesh(track(new THREE.TorusGeometry(0.1, 0.035, 8, 18)), hoodie)
  hood.position.set(0, 0.55, 0.02)
  hood.rotation.x = Math.PI / 2.4
  torso.add(hood)

  const head = new THREE.Group()
  head.position.set(0, 0.7, -0.05)
  torso.add(head)
  const skull = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.115, 2)), skin)
  skull.scale.set(0.95, 1.08, 1)
  skull.castShadow = true
  head.add(skull)
  const hairCap = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.122, 1)), hair)
  hairCap.scale.set(1, 0.85, 1.02)
  hairCap.position.set(0, 0.035, 0.012)
  head.add(hairCap)
  head.add(limb(v(0, 0.06, 0.0), v(0, -0.1, 0.02), 0.04, skin))
  // Headphones in the brand teal.
  const band = new THREE.Mesh(track(new THREE.TorusGeometry(0.128, 0.012, 6, 24, Math.PI)), black)
  band.position.y = 0.01
  head.add(band)
  for (const sx of [-0.125, 0.125]) {
    const cup = new THREE.Mesh(track(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 16)), teal)
    cup.rotation.z = Math.PI / 2
    cup.position.set(sx, -0.01, 0)
    head.add(cup)
  }

  const arms: { upper: THREE.Mesh; fore: THREE.Mesh; side: number }[] = []
  const buildArm = (side: number, lift = 0) => {
    const shoulder = v(side * 0.2, 0.42, -0.02)
    const elbow = v(side * 0.23, 0.2, -0.24)
    const hand = v(side * 0.12, 0.2 + lift, -0.66)
    const upper = limb(shoulder, elbow, 0.055, hoodie)
    const fore = limb(elbow, hand, 0.045, hoodie)
    const palm = new THREE.Mesh(track(new THREE.SphereGeometry(0.038, 10, 8)), skin)
    palm.position.copy(hand)
    palm.scale.set(1, 0.6, 1.3)
    fore.userData.palm = palm
    torso.add(upper, fore, palm)
    return { upper, fore, side }
  }
  arms.push(buildArm(-1), buildArm(1))

  // Rug and plant soften the floor.
  const rug = new THREE.Mesh(track(new THREE.CylinderGeometry(1.15, 1.15, 0.01, 48)), track(std('#3c3f4d', 1)))
  rug.position.set(-0.1, 0.005, -0.6)
  rug.receiveShadow = true
  scene.add(rug)

  const plant = new THREE.Group()
  plant.position.set(1.45, 0, -1.85)
  const pot = new THREE.Mesh(track(new THREE.CylinderGeometry(0.17, 0.13, 0.36, 20)), track(std('#efece6', 0.6)))
  pot.position.y = 0.18
  pot.castShadow = true
  plant.add(pot)
  const leafMat = track(std('#5a9f63', 0.75, 0, { flatShading: true }))
  const leafGeo = track(new THREE.IcosahedronGeometry(0.16, 0))
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(leafGeo, leafMat)
    const a = (i / 9) * Math.PI * 2
    leaf.position.set(Math.cos(a) * 0.12, 0.55 + (i % 3) * 0.18, Math.sin(a) * 0.12)
    leaf.scale.set(0.6, 1.6, 0.35)
    leaf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5)
    leaf.castShadow = true
    plant.add(leaf)
  }
  scene.add(plant)

  // Left wall: a floating shelf and an aurora print.
  const shelf = new THREE.Group()
  shelf.position.set(-3.18, 0, -0.4)
  shelf.add(box(0.24, 0.03, 1.2, oak, 0.12, 1.25, 0))
  const bookColours = ['#5b5bf0', '#19c3b2', '#e0489c', '#ebe8e3', '#2a2c33', '#b38558']
  let bz = -0.5
  for (let i = 0; i < 9; i++) {
    const h = 0.18 + Math.random() * 0.1
    const w = 0.03 + Math.random() * 0.03
    shelf.add(box(0.17, h, w, track(std(bookColours[i % bookColours.length], 0.8)), 0.11, 1.265 + h / 2, bz))
    bz += w + 0.008
  }
  scene.add(shelf)

  const art = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.9, 1.2)),
    track(
      new THREE.MeshStandardMaterial({
        roughness: 0.9,
        map: track(
          canvasTexture(180, 240, (ctx) => {
            ctx.fillStyle = '#0b0f1e'
            ctx.fillRect(0, 0, 180, 240)
            const blob = (x: number, y: number, r: number, c: string) => {
              const g = ctx.createRadialGradient(x, y, 0, x, y, r)
              g.addColorStop(0, c)
              g.addColorStop(1, 'transparent')
              ctx.fillStyle = g
              ctx.fillRect(0, 0, 180, 240)
            }
            blob(50, 70, 110, '#5b5bf0')
            blob(140, 140, 100, '#19c3b2')
            blob(70, 210, 90, '#e0489c')
          }),
        ),
      }),
    ),
  )
  art.rotation.y = Math.PI / 2
  art.position.set(-3.17, 1.85, 1.1)
  scene.add(art)
  scene.add(box(0.03, 1.26, 0.96, black, -3.19, 1.85, 1.1))

  // ── Lights ─────────────────────────────────────────────────────────────
  const hemi = new THREE.HemisphereLight('#ffffff', '#444444', 1)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight('#ffffff', 2)
  sun.target.position.set(0, 0.6, -0.6)
  scene.add(sun, sun.target)
  if (!lite) {
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -3.5
    sun.shadow.camera.right = 3.5
    sun.shadow.camera.top = 3.5
    sun.shadow.camera.bottom = -3.5
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 40
    sun.shadow.bias = -0.0008
    sun.shadow.normalBias = 0.02
  }
  const screenGlow = new THREE.PointLight('#9fb0ff', 0.6, 3.2, 2)
  screenGlow.position.set(MONITOR.x, MONITOR.y, MONITOR.z + 0.45)
  scene.add(screenGlow)
  const ceilingLight = new THREE.PointLight('#ffe2bd', 0, 7, 1.6)
  ceilingLight.position.set(0, 2.85, -0.2)
  scene.add(ceilingLight)

  // ── Time of day ────────────────────────────────────────────────────────
  const setHour = (hour: number) => {
    const L = lightingAt(hour)
    const body = skyBodyAt(hour)
    skyUniforms.uTop.value.set(L.skyTop)
    skyUniforms.uHorizon.value.set(L.skyHorizon)
    skyUniforms.uSunColor.value.set(body.isDay ? L.sun : '#dfe6ff')
    skyUniforms.uIsDay.value = body.isDay ? 1 : 0
    skyUniforms.uStars.value = L.stars
    skyUniforms.uSun.value.set(0.36 + body.across * 0.28, 0.42 + body.elevation * 0.2)
    ;(scene.fog as THREE.Fog).color.set(L.skyHorizon)

    sun.color.set(L.sun)
    sun.intensity = L.sunIntensity
    sun.position.set(-9 + body.across * 18, 2.5 + body.elevation * 9, -12)
    hemi.color.set(L.hemiSky)
    hemi.groundColor.set(L.hemiGround)
    hemi.intensity = L.hemiIntensity

    cityMaterial.emissiveIntensity = L.city * 1.4
    cityMaterial.color.set('#1b2133').lerp(new THREE.Color('#8e9bb4'), 1 - Math.min(1, L.city * 1.4))
    lampLight.intensity = L.interior * 2.2
    shadeMat.emissiveIntensity = L.interior * 2
    ceilingLight.intensity = L.interior * 4
    stripMat.emissiveIntensity = L.interior * 1.5
    screenGlow.intensity = 0.4 + L.interior * 1.4
    renderer.toneMappingExposure = L.exposure
  }
  setHour(options.hour)

  // ── Camera rig ─────────────────────────────────────────────────────────
  const rig = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, fov: 42, zoom: 0 }
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  let aspect = 1

  const home = () =>
    aspect < 0.85
      ? { px: 1.05, py: 1.62, pz: 2.15, tx: -0.12, ty: 1.0, tz: -1.45, fov: 62 }
      : aspect < 1.3
        ? { px: 1.55, py: 1.6, pz: 1.75, tx: -0.14, ty: 1.0, tz: -1.45, fov: 50 }
        : { px: 1.75, py: 1.55, pz: 1.3, tx: -0.16, ty: 1.02, tz: -1.5, fov: 42 }
  Object.assign(rig, home())
  let entering = false

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const hitTargets = [screen, bezel]

  let hover = false
  const lookTarget = new THREE.Vector3()
  const clock = { last: 0 }

  return {
    resize() {
      const { clientWidth: w, clientHeight: h } = canvas
      if (!w || !h) return
      renderer.setSize(w, h, false)
      aspect = w / h
      camera.aspect = aspect
      if (!entering) Object.assign(rig, home())
      camera.updateProjectionMatrix()
    },

    render(time) {
      const dt = Math.min(0.05, time - clock.last || 0)
      clock.last = time
      skyUniforms.uTime.value = time

      if (!options.reduced) {
        // Typing, breathing, a glance between the monitors now and then.
        arms.forEach(({ fore, side }, i) => {
          const tap = Math.max(0, Math.sin(time * 11 + i * 1.7)) * 0.006
          fore.position.y += (tap - (fore.userData.tap ?? 0))
          ;(fore.userData.palm as THREE.Mesh).position.y += tap - (fore.userData.tap ?? 0)
          fore.userData.tap = tap
          void side
        })
        torso.scale.y = 1 + Math.sin(time * 1.6) * 0.008
        const glance = Math.sin(time * 0.35) > 0.75 ? -0.45 : 0
        head.rotation.y += (glance - head.rotation.y) * Math.min(1, dt * 3)
        head.rotation.x = Math.sin(time * 0.8) * 0.03 + 0.08
        codeTex.offset.y = (time * 0.02) % 1
      }

      pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 3)
      pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 3)
      const sway = options.reduced ? 0 : 1 - rig.zoom
      camera.position.set(rig.px + pointer.sx * 0.18 * sway, rig.py - pointer.sy * 0.1 * sway, rig.pz)
      lookTarget.set(rig.tx, rig.ty, rig.tz)
      camera.lookAt(lookTarget)
      if (camera.fov !== rig.fov) {
        camera.fov = rig.fov
        camera.updateProjectionMatrix()
      }

      const haloMat = halo.material as THREE.MeshBasicMaterial
      haloMat.opacity += ((hover ? 0.85 : 0) - haloMat.opacity) * Math.min(1, dt * 8)

      renderer.render(scene, camera)
    },

    setHour,

    setPointer(x, y) {
      pointer.x = x
      pointer.y = y
    },

    hitMonitor(clientX, clientY) {
      const rect = canvas.getBoundingClientRect()
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      return raycaster.intersectObjects(hitTargets, false).length > 0
    },

    setHover(on) {
      hover = on
    },

    intro() {
      if (options.reduced) return
      const end = home()
      gsap.fromTo(
        rig,
        { px: end.px + 1.1, py: end.py + 0.35, pz: end.pz + 1.6 },
        { px: end.px, py: end.py, pz: end.pz, duration: 2.6, ease: 'power3.out' },
      )
    },

    enter() {
      entering = true
      hover = false
      // Distance at which the screen covers the whole viewport.
      const fov = rig.fov
      const tanHalf = Math.tan(THREE.MathUtils.degToRad(fov / 2))
      const distance = Math.min(SCREEN_H / 2 / tanHalf, SCREEN_W / 2 / (tanHalf * aspect)) * 0.97
      const target = { px: MONITOR.x, py: MONITOR.y, pz: MONITOR.z + 0.0135 + distance, tx: MONITOR.x, ty: MONITOR.y, tz: MONITOR.z, zoom: 1 }
      return new Promise((resolve) => {
        gsap.killTweensOf(rig)
        gsap
          .timeline({ onComplete: () => resolve() })
          .to(rig, { tx: target.tx, ty: target.ty, tz: target.tz, duration: 0.8, ease: 'power2.inOut' }, 0)
          .to(rig, { zoom: 1, duration: 1.7, ease: 'power2.inOut' }, 0)
          // Over his right shoulder first, so the camera never passes through
          // the figure, then square on to the screen.
          .to(rig, { px: 0.35, py: 1.7, pz: -0.45, duration: 0.85, ease: 'power2.in' }, 0.05)
          .to(rig, { px: target.px, py: target.py, pz: target.pz, duration: 0.85, ease: 'power2.out' }, 0.9)
      })
    },

    dispose() {
      gsap.killTweensOf(rig)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          ;(Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => m.dispose())
        }
      })
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
    },
  }
}
