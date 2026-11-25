import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import type { Post } from './post'
import { gsap } from '../orbit/motion'
import { lightingAt, panoramaDirection, skyBlendAt, SKIES, type Phase } from './timeOfDay'
import { createSkyline } from './skyline'
import { createAvatar } from './avatar'
import {
  auroraPrint,
  codeTexture,
  contactShadowTexture,
  fabricTexture,
  plasterTexture,
  rugTexture,
  screenGlowTexture,
  softDotTexture,
  woodTextures,
} from './textures'

/**
 * The landing room: a minimal studio on a high floor, floor-to-ceiling glass
 * onto a skyline, a desk with two monitors and a figure at work.
 *
 * Realism comes from light more than geometry: image-based lighting rebuilt
 * for the time of day (the window panel in it is the soft daylight), fill
 * from the window and the screen, soft sun
 * shadows, contact shadows, procedural wood/concrete/fabric, and bloom on
 * bright sources. Everything is generated in code, so there are no model
 * downloads; the only image is the screenshot on the monitor.
 */

export interface RoomOptions {
  /** Lighter build for phones and weak GPUs: no post-processing or shadows. */
  lite: boolean
  /** Frame cap (0 = every frame). Software GL gets a low cap so the page stays responsive. */
  maxFps?: number
  /** Screenshot shown on the main monitor (matches the visitor's theme). */
  screenSrc: string
  /** True when the screenshot is the light theme (a brighter screen). */
  lightScreen: boolean
  /** Phones zoom into a phone on the desk (showing this screenshot) instead of the monitor. */
  phoneScreenSrc?: string
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
  /**
   * Where the floating "click to enter" label sits, in canvas CSS pixels:
   * just above the screen you click. Hidden once the camera starts zooming.
   */
  labelAnchor(): { x: number; y: number; visible: boolean }
  /** Flies the camera into the main monitor until it fills the viewport. */
  enter(): Promise<void>
  /** Gentle dolly-in on first view. */
  intro(): void
  /** Starts on the monitor (as if leaving the site) and pulls back to the room. */
  zoomOut(): Promise<void>
}

const SCREEN_W = 0.84
const SCREEN_H = 0.525
const DESK_TOP = 0.74
// The standing desk's travel: 74 cm sitting, 108 cm standing.
const DESK_LIFT = 0.34
const MONITOR = new THREE.Vector3(-0.15, 1.13, -1.6)
const SIDE_MONITOR = new THREE.Vector3(0.66, 1.16, -1.5)
// A phone lying flat on the desk, right of the mouse; its top points away.
const PHONE = new THREE.Vector3(0.5, 0, -1.2)
const PHONE_SCREEN_W = 0.0695
const PHONE_SCREEN_H = 0.1505
// How far the click-me glow spreads past each screen's edge, in metres.
const MONITOR_GLOW = 0.11
const PHONE_GLOW = 0.075
const GLOW_COLOR = '#2fe0cc'

export function createRoomScene(canvas: HTMLCanvasElement, options: RoomOptions): RoomScene {
  const { lite } = options
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: lite, powerPreference: 'high-performance' })
  // CPU-rendered WebGL draws at half resolution so each frame stays cheap.
  renderer.setPixelRatio(options.maxFps ? 0.3 : Math.min(window.devicePixelRatio, lite ? 1.5 : 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.shadowMap.enabled = !lite
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#cfe4f7', 60, 330)
  const camera = new THREE.PerspectiveCamera(42, 1, 0.03, 900)

  const disposables: { dispose(): void }[] = []
  let disposed = false
  const track = <T extends { dispose(): void }>(item: T) => (disposables.push(item), item)

  const add = <T extends THREE.Object3D>(object: T, parent: THREE.Object3D = scene, shadows = true) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = shadows
        child.receiveShadow = true
      }
    })
    parent.add(object)
    return object
  }
  const rounded = (w: number, h: number, d: number, r: number, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat)
    mesh.position.set(x, y, z)
    return mesh
  }

  // ── Materials ──────────────────────────────────────────────────────────
  const wood = woodTextures()
  const plaster = track(plasterTexture())
  ;[wood.map, wood.roughness].forEach(track)

  // Scanned materials (CC0, Poly Haven): oak laminate floor and an oak desk.
  const textureLoader = new THREE.TextureLoader()
  const scanned = (src: string, color: boolean, repeat: [number, number], rotate = 0) => {
    const t = track(textureLoader.load(src))
    t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(...repeat)
    t.center.set(0.5, 0.5)
    t.rotation = rotate
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    return t
  }
  const plank: [number, number] = [5.5, 6]
  const floorMat = track(
    new THREE.MeshStandardMaterial({
      map: scanned('/assets/room/tex/floor-color.webp', true, plank, Math.PI / 2),
      normalMap: scanned('/assets/room/tex/floor-normal.webp', false, plank, Math.PI / 2),
      normalScale: new THREE.Vector2(0.6, 0.6),
      roughnessMap: scanned('/assets/room/tex/floor-rough.webp', false, plank, Math.PI / 2),
      roughness: 1,
      metalness: 0,
    }),
  )
  const wallMat = track(new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.95 }))
  const oak = track(
    new THREE.MeshPhysicalMaterial({ map: wood.map, roughnessMap: wood.roughness, roughness: 1, clearcoat: 0.35, clearcoatRoughness: 0.35 }),
  )
  const deskMat = track(
    new THREE.MeshPhysicalMaterial({
      map: scanned('/assets/room/tex/desk-color.webp', true, [1, 1]),
      roughnessMap: wood.roughness,
      roughness: 0.9,
      clearcoat: 0.3,
      clearcoatRoughness: 0.3,
    }),
  )
  const blackMetal = track(new THREE.MeshStandardMaterial({ color: '#1a1b1f', roughness: 0.38, metalness: 0.75 }))
  const alu = track(new THREE.MeshStandardMaterial({ color: '#b9bcc2', roughness: 0.3, metalness: 0.9 }))
  const spaceGrey = track(new THREE.MeshStandardMaterial({ color: '#3b3d43', roughness: 0.35, metalness: 0.8 }))
  const plasticBlack = track(new THREE.MeshStandardMaterial({ color: '#141518', roughness: 0.45 }))
  const ceramic = track(new THREE.MeshPhysicalMaterial({ color: '#f3f1ec', roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1 }))
  const shadowTex = track(contactShadowTexture())
  const shadowMat = track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, color: '#000000', opacity: 0.85 }))

  const contactShadow = (x: number, y: number, z: number, w: number, d: number, opacity = 1, parent: THREE.Object3D = scene) => {
    const plane = new THREE.Mesh(track(new THREE.PlaneGeometry(w, d)), opacity === 1 ? shadowMat : track(shadowMat.clone()))
    plane.rotation.x = -Math.PI / 2
    plane.position.set(x, y + 0.002, z)
    ;(plane.material as THREE.MeshBasicMaterial).opacity *= opacity
    plane.renderOrder = 1
    parent.add(plane)
  }

  // ── View ───────────────────────────────────────────────────────────────
  const skyline = createSkyline(scene, lite)

  // ── Room shell ─────────────────────────────────────────────────────────
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(6.4, 7)), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, 1)
  add(floor)

  const ceiling = new THREE.Mesh(track(new THREE.PlaneGeometry(6.4, 7)), wallMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, 3, 1)
  add(ceiling)

  const leftWall = new THREE.Mesh(track(new THREE.PlaneGeometry(7, 3)), wallMat)
  leftWall.rotation.y = Math.PI / 2
  leftWall.position.set(-3.2, 1.5, 1)
  add(leftWall)
  const rightWall = leftWall.clone()
  rightWall.rotation.y = -Math.PI / 2
  rightWall.position.x = 3.2
  add(rightWall)

  // Skirting where the walls meet the floor.
  add(rounded(0.012, 0.08, 7, 0.004, wallMat, -3.19, 0.04, 1), scene, false)

  // Glazing: slim mullions, a sill, faint glass and sheer curtains.
  const glazing = new THREE.Group()
  glazing.add(rounded(6.4, 0.05, 0.12, 0.01, blackMetal, 0, 0.025, -2.4))
  glazing.add(rounded(6.4, 0.08, 0.1, 0.01, blackMetal, 0, 2.96, -2.4))
  for (let i = 0; i <= 5; i++) glazing.add(rounded(0.045, 3, 0.07, 0.008, blackMetal, -3.2 + i * 1.28, 1.5, -2.4))
  add(glazing, scene, false)
  const glass = new THREE.Mesh(
    track(new THREE.PlaneGeometry(6.4, 3)),
    track(new THREE.MeshPhysicalMaterial({ color: '#dfe8ee', transparent: true, opacity: 0.06, roughness: 0.04, metalness: 0, depthWrite: false })),
  )
  glass.position.set(0, 1.5, -2.38)
  scene.add(glass)

  const curtainGeo = track(new THREE.PlaneGeometry(0.85, 2.92, 64, 1))
  {
    const pos = curtainGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      pos.setZ(i, Math.sin(x * 30) * 0.03 + Math.sin(x * 11) * 0.015)
    }
    curtainGeo.computeVertexNormals()
  }
  const curtainMat = track(
    new THREE.MeshStandardMaterial({ color: '#f4f0e8', roughness: 1, transparent: true, opacity: 0.82, side: THREE.DoubleSide, emissive: '#fff6e8', emissiveIntensity: 0 }),
  )
  for (const x of [-2.72, 2.72]) {
    const curtain = new THREE.Mesh(curtainGeo, curtainMat)
    curtain.position.set(x, 1.48, -2.25)
    curtain.castShadow = !lite
    scene.add(curtain)
  }

  // Recessed ceiling slot light.
  const slotMat = track(new THREE.MeshStandardMaterial({ color: '#fff2df', emissive: '#ffe4c4', emissiveIntensity: 0 }))
  add(new THREE.Mesh(track(new THREE.BoxGeometry(3.2, 0.01, 0.05)), slotMat).translateY(2.995).translateZ(0.2), scene, false)

  // Rug.
  const rugMap = track(rugTexture())
  const rug = new THREE.Mesh(track(new THREE.CylinderGeometry(1.25, 1.25, 0.012, 64)), track(new THREE.MeshStandardMaterial({ map: rugMap, roughness: 1 })))
  rug.position.set(-0.1, 0.006, -0.55)
  add(rug, scene, false)

  // ── Desk ───────────────────────────────────────────────────────────────
  // A motorised sit-stand desk. Everything on the top rides in `deskTop`,
  // which lifts; the feet and outer columns stay on the floor.
  const deskTop = new THREE.Group()
  scene.add(deskTop)
  add(rounded(1.7, 0.035, 0.75, 0.008, deskMat, 0, DESK_TOP - 0.0175, -1.45), deskTop)
  const legMat = track(new THREE.MeshStandardMaterial({ color: '#2a2b30', roughness: 0.45, metalness: 0.6 }))
  for (const x of [-0.7, 0.7]) {
    // Foot on the floor, outer column, and the inner stage that slides out of it.
    add(rounded(0.07, 0.035, 0.68, 0.012, legMat, x, 0.0175, -1.45))
    add(rounded(0.085, 0.6, 0.06, 0.006, legMat, x, 0.33, -1.45))
    add(rounded(0.07, 0.5, 0.048, 0.005, blackMetal, x, 0.43, -1.45), deskTop)
    // Bracket under the top.
    add(rounded(0.06, 0.03, 0.62, 0.006, legMat, x, DESK_TOP - 0.05, -1.45), deskTop)
    contactShadow(x, 0, -1.45, 0.3, 0.85, 0.75)
  }
  add(rounded(1.34, 0.04, 0.05, 0.006, legMat, 0, DESK_TOP - 0.06, -1.45), deskTop)
  contactShadow(0, 0, -1.42, 2.1, 1.1, 0.55)

  // Control panel under the front edge, with a small height readout.
  const panel = new THREE.Group()
  panel.position.set(0.42, DESK_TOP - 0.05, -1.1)
  panel.add(rounded(0.13, 0.03, 0.05, 0.008, plasticBlack))
  const readout = document.createElement('canvas')
  readout.width = 64
  readout.height = 24
  const readoutTex = track(new THREE.CanvasTexture(readout))
  const readoutCtx = readout.getContext('2d')!
  let shownCm = -1
  const showHeight = (cm: number) => {
    if (cm === shownCm) return
    shownCm = cm
    readoutCtx.fillStyle = '#05070a'
    readoutCtx.fillRect(0, 0, 64, 24)
    readoutCtx.fillStyle = '#7ff5e6'
    readoutCtx.font = 'bold 18px monospace'
    readoutCtx.textAlign = 'center'
    readoutCtx.textBaseline = 'middle'
    readoutCtx.fillText(String(cm), 32, 13)
    readoutTex.needsUpdate = true
  }
  showHeight(74)
  const display = new THREE.Mesh(track(new THREE.PlaneGeometry(0.04, 0.015)), track(new THREE.MeshBasicMaterial({ map: readoutTex, toneMapped: false })))
  display.position.set(-0.03, 0, -0.0255)
  display.rotation.y = Math.PI
  panel.add(display)
  for (const bx of [0.012, 0.038]) panel.add(rounded(0.018, 0.012, 0.006, 0.003, legMat, bx, 0, -0.026))
  add(panel, deskTop)
  // Where the hand goes to press the buttons, in desk space.
  const panelGrip = new THREE.Vector3(0.45, DESK_TOP - 0.04, -1.07)

  // Main monitor.
  const monitor = new THREE.Group()
  monitor.position.copy(MONITOR)
  // Mac-style display: thin aluminium body, edge-to-edge black glass, slim even border.
  const shell = rounded(SCREEN_W + 0.036, SCREEN_H + 0.036, 0.018, 0.01, alu)
  shell.position.z = -0.005
  monitor.add(shell)
  const bezel = rounded(SCREEN_W + 0.032, SCREEN_H + 0.032, 0.004, 0.008, plasticBlack, 0, 0, 0.005)
  monitor.add(bezel)
  // Soft glow around the screen that says "click me": pulses gently, brightens on hover.
  const halo = new THREE.Mesh(
    track(new THREE.PlaneGeometry(SCREEN_W + MONITOR_GLOW * 2, SCREEN_H + MONITOR_GLOW * 2)),
    track(
      new THREE.MeshBasicMaterial({
        color: GLOW_COLOR,
        map: track(screenGlowTexture(SCREEN_W, SCREEN_H, MONITOR_GLOW)),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
  )
  halo.position.z = -0.02
  monitor.add(halo)
  const placeholder = new THREE.CanvasTexture(document.createElement('canvas'))
  const screenMat = track(new THREE.MeshBasicMaterial({ color: '#0b0f1e' }))
  const screen = new THREE.Mesh(track(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H)), screenMat)
  screen.position.z = 0.0075
  monitor.add(screen)
  new THREE.TextureLoader().load(options.screenSrc, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    screenMat.map = track(texture)
    screenMat.color.set(options.lightScreen ? '#e9ebf2' : '#ffffff')
    screenMat.needsUpdate = true
    placeholder.dispose()
  })
  // A glossy coat over the screen catches window reflections.
  const coat = new THREE.Mesh(
    track(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H)),
    track(new THREE.MeshPhysicalMaterial({ color: '#000000', transparent: true, opacity: 0.12, roughness: 0.08, metalness: 0, depthWrite: false })),
  )
  coat.position.z = 0.008
  monitor.add(coat)
  // Mac-style stand: one slanted aluminium plate folding into a flat foot.
  const standH = MONITOR.y - DESK_TOP - 0.02
  const standPlate = rounded(0.17, standH, 0.012, 0.004, alu, 0, -standH / 2 - 0.02, -0.07)
  standPlate.rotation.x = 0.12
  monitor.add(standPlate)
  monitor.add(rounded(0.17, 0.006, 0.2, 0.003, alu, 0, -MONITOR.y + DESK_TOP + 0.003, -0.02))
  add(monitor, deskTop)
  contactShadow(MONITOR.x, DESK_TOP, MONITOR.z - 0.03, 0.34, 0.3, 0.8, deskTop)

  // Side monitor, portrait, scrolling code.
  const codeTex = track(codeTexture())
  const side = new THREE.Group()
  side.position.copy(SIDE_MONITOR)
  side.rotation.y = -0.5
  side.add(rounded(0.335, 0.555, 0.02, 0.008, alu, 0, 0, -0.006))
  side.add(rounded(0.325, 0.545, 0.006, 0.004, plasticBlack, 0, 0, 0.004))
  const sideScreen = new THREE.Mesh(track(new THREE.PlaneGeometry(0.31, 0.53)), track(new THREE.MeshBasicMaterial({ map: codeTex })))
  sideScreen.position.z = 0.0075
  side.add(sideScreen)
  const sideStandH = SIDE_MONITOR.y - 0.27 - DESK_TOP
  const sidePlate = rounded(0.11, sideStandH + 0.08, 0.01, 0.004, alu, 0, -0.27 - sideStandH / 2 + 0.04, -0.05)
  sidePlate.rotation.x = 0.1
  side.add(sidePlate)
  side.add(rounded(0.11, 0.006, 0.15, 0.003, alu, 0, -SIDE_MONITOR.y + DESK_TOP + 0.003, -0.02))
  add(side, deskTop)
  contactShadow(SIDE_MONITOR.x, DESK_TOP, SIDE_MONITOR.z, 0.22, 0.24, 0.8, deskTop)

  // Keyboard with individual keycaps.
  const keyboardPos = new THREE.Vector3(-0.12, DESK_TOP, -1.2)
  const keyboard = new THREE.Group()
  keyboard.position.copy(keyboardPos)
  keyboard.add(rounded(0.44, 0.014, 0.135, 0.005, spaceGrey, 0, 0.007, 0))
  const capGeo = track(new RoundedBoxGeometry(0.0235, 0.008, 0.0225, 2, 0.003))
  const capMat = track(new THREE.MeshStandardMaterial({ color: '#222328', roughness: 0.55 }))
  const caps = new THREE.InstancedMesh(capGeo, capMat, 15 * 5)
  const dummy = new THREE.Object3D()
  let ci = 0
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 15; c++) {
      if (r === 4 && c > 3 && c < 10) continue
      dummy.position.set(-0.196 + c * 0.028 + (r % 2) * 0.006, 0.018, -0.052 + r * 0.026)
      dummy.updateMatrix()
      caps.setMatrixAt(ci++, dummy.matrix)
    }
  }
  caps.count = ci
  keyboard.add(caps)
  keyboard.add(rounded(0.16, 0.008, 0.0225, 0.003, capMat, -0.002, 0.018, 0.052))
  add(keyboard, deskTop)
  contactShadow(keyboardPos.x, DESK_TOP, keyboardPos.z, 0.55, 0.2, 0.6, deskTop)

  const mouse = new THREE.Group()
  mouse.position.set(0.2, DESK_TOP, -1.2)
  const mouseBody = new THREE.Mesh(track(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2)), spaceGrey)
  mouseBody.scale.set(0.031, 0.02, 0.055)
  mouse.add(mouseBody)
  add(mouse)
  const pad = new THREE.Mesh(
    track(new RoundedBoxGeometry(0.26, 0.003, 0.22, 2, 0.001)),
    track(new THREE.MeshStandardMaterial({ map: track(fabricTexture([38, 40, 46], 128, 48)), roughness: 1 })),
  )
  pad.position.set(0.21, DESK_TOP + 0.0015, -1.22)
  add(pad, deskTop, false)

  // Phone: flat on the desk. On phones it's the way in, lit with the site.
  const phone = new THREE.Group()
  phone.position.set(PHONE.x, DESK_TOP, PHONE.z)
  // Latest-generation iPhone look: titanium frame, near edge-to-edge glass,
  // Dynamic Island, side buttons.
  const titanium = track(new THREE.MeshStandardMaterial({ color: '#a7a39c', roughness: 0.32, metalness: 0.9 }))
  const phoneBody = rounded(PHONE_SCREEN_W + 0.0045, 0.0082, PHONE_SCREEN_H + 0.0048, 0.0042, titanium, 0, 0.0041, 0)
  phone.add(phoneBody)
  const phoneGlass = rounded(PHONE_SCREEN_W + 0.0028, 0.0006, PHONE_SCREEN_H + 0.003, 0.0003, plasticBlack, 0, 0.0086, 0)
  phone.add(phoneGlass)
  const island = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.0028, 0.0085, 4, 12)), track(new THREE.MeshBasicMaterial({ color: '#000000' })))
  island.rotation.set(-Math.PI / 2, 0, Math.PI / 2)
  island.scale.set(1, 1, 0.2)
  island.position.set(0, 0.0095, -PHONE_SCREEN_H / 2 + 0.0055)
  phone.add(island)
  const phoneSide = (PHONE_SCREEN_W + 0.0045) / 2
  phone.add(rounded(0.0012, 0.003, 0.014, 0.0005, titanium, phoneSide, 0.0041, -0.03))
  phone.add(rounded(0.0012, 0.003, 0.01, 0.0005, titanium, -phoneSide, 0.0041, -0.04))
  phone.add(rounded(0.0012, 0.003, 0.01, 0.0005, titanium, -phoneSide, 0.0041, -0.026))
  phone.add(rounded(0.0012, 0.003, 0.008, 0.0005, titanium, phoneSide, 0.0041, 0.01))
  const phoneScreenMat = track(new THREE.MeshBasicMaterial({ color: '#05060a' }))
  const phoneScreen = new THREE.Mesh(track(new THREE.PlaneGeometry(PHONE_SCREEN_W, PHONE_SCREEN_H)), phoneScreenMat)
  phoneScreen.rotation.x = -Math.PI / 2
  phoneScreen.position.y = 0.0093
  phone.add(phoneScreen)
  const phoneHalo = new THREE.Mesh(
    track(new THREE.PlaneGeometry(PHONE_SCREEN_W + PHONE_GLOW * 2, PHONE_SCREEN_H + PHONE_GLOW * 2)),
    track(
      new THREE.MeshBasicMaterial({
        color: GLOW_COLOR,
        map: track(screenGlowTexture(PHONE_SCREEN_W, PHONE_SCREEN_H, PHONE_GLOW)),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
  )
  phoneHalo.rotation.x = -Math.PI / 2
  phoneHalo.position.y = 0.0004
  // Brighter than the monitor glow: on a phone the phone is only a few pixels wide.
  ;(phoneHalo.material as THREE.MeshBasicMaterial).color.multiplyScalar(1.6)
  phone.add(phoneHalo)
  add(phone, deskTop)
  contactShadow(PHONE.x, DESK_TOP, PHONE.z, 0.12, 0.2, 0.7, deskTop)
  if (options.phoneScreenSrc) {
    new THREE.TextureLoader().load(options.phoneScreenSrc, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      phoneScreenMat.map = track(texture)
      phoneScreenMat.color.set(options.lightScreen ? '#e9ebf2' : '#ffffff')
      phoneScreenMat.needsUpdate = true
    })
  }

  // Mug: lathe-turned ceramic with coffee in it.
  const mug = new THREE.Group()
  mug.position.set(-0.46, DESK_TOP, -1.17)
  const mugProfile = [
    [0, 0],
    [0.036, 0],
    [0.04, 0.006],
    [0.041, 0.095],
    [0.037, 0.095],
    [0.036, 0.012],
    [0, 0.012],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  mug.add(new THREE.Mesh(track(new THREE.LatheGeometry(mugProfile, 40)), ceramic))
  const handle = new THREE.Mesh(track(new THREE.TorusGeometry(0.026, 0.007, 10, 24, Math.PI)), ceramic)
  handle.rotation.z = Math.PI / 2
  handle.position.set(-0.04, 0.05, 0)
  mug.add(handle)
  const coffee = new THREE.Mesh(
    track(new THREE.CircleGeometry(0.036, 32)),
    track(new THREE.MeshPhysicalMaterial({ color: '#2b160c', roughness: 0.1, clearcoat: 1 })),
  )
  coffee.rotation.x = -Math.PI / 2
  coffee.position.y = 0.08
  mug.add(coffee)
  add(mug)

  // Architect lamp.
  const lamp = new THREE.Group()
  lamp.position.set(-0.7, DESK_TOP, -1.68)
  lamp.add(new THREE.Mesh(track(new THREE.CylinderGeometry(0.07, 0.075, 0.018, 32)), blackMetal).translateY(0.009))
  const arm = (a: THREE.Vector3, b: THREE.Vector3) => {
    const m = new THREE.Mesh(track(new THREE.CylinderGeometry(0.007, 0.007, a.distanceTo(b), 10)), blackMetal)
    m.position.copy(a).add(b).multiplyScalar(0.5)
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
    lamp.add(m)
  }
  const j1 = new THREE.Vector3(0, 0.018, 0)
  const j2 = new THREE.Vector3(0.06, 0.4, 0.04)
  const j3 = new THREE.Vector3(0.24, 0.44, 0.16)
  arm(j1, j2)
  arm(j2, j3)
  lamp.add(new THREE.Mesh(track(new THREE.SphereGeometry(0.012, 12, 8)), blackMetal).translateX(j2.x).translateY(j2.y).translateZ(j2.z))
  const shadeMat = track(new THREE.MeshStandardMaterial({ color: '#1a1b1f', roughness: 0.35, metalness: 0.6, side: THREE.DoubleSide }))
  const shade = new THREE.Mesh(track(new THREE.ConeGeometry(0.065, 0.09, 32, 1, true)), shadeMat)
  shade.position.set(j3.x, j3.y - 0.03, j3.z)
  lamp.add(shade)
  const bulbMat = track(new THREE.MeshBasicMaterial({ color: '#fff3e0' }))
  const bulb = new THREE.Mesh(track(new THREE.CircleGeometry(0.055, 24)), bulbMat)
  bulb.rotation.x = Math.PI / 2
  bulb.position.set(j3.x, j3.y - 0.07, j3.z)
  lamp.add(bulb)
  add(lamp, deskTop)
  const lampLight = new THREE.SpotLight('#ffc98f', 0, 2.4, 0.85, 0.85, 1.6)
  lampLight.position.set(lamp.position.x + j3.x, DESK_TOP + j3.y - 0.07, lamp.position.z + j3.z)
  lampLight.target.position.set(lampLight.position.x + 0.15, DESK_TOP, lampLight.position.z + 0.25)
  deskTop.add(lampLight, lampLight.target)

  // ── Chair ──────────────────────────────────────────────────────────────
  const chairFabric = track(new THREE.MeshStandardMaterial({ map: track(fabricTexture([46, 48, 56])), roughness: 1 }))
  const chair = new THREE.Group()
  chair.position.set(-0.1, 0, -0.62)
  chair.add(rounded(0.5, 0.07, 0.48, 0.03, chairFabric, 0, 0.455, 0))
  const back = rounded(0.46, 0.46, 0.06, 0.03, chairFabric, 0, 0.82, 0.25)
  back.rotation.x = 0.12
  chair.add(back)
  chair.add(rounded(0.06, 0.32, 0.03, 0.01, blackMetal, 0, 0.6, 0.27))
  for (const sx of [-1, 1]) {
    chair.add(rounded(0.03, 0.2, 0.03, 0.008, blackMetal, sx * 0.25, 0.56, 0.05))
    chair.add(rounded(0.06, 0.025, 0.24, 0.01, plasticBlack, sx * 0.25, 0.67, 0.0))
  }
  chair.add(new THREE.Mesh(track(new THREE.CylinderGeometry(0.025, 0.03, 0.34, 20)), alu).translateY(0.24))
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const leg = rounded(0.3, 0.025, 0.04, 0.01, alu, Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.15)
    leg.rotation.y = -a
    chair.add(leg)
    const caster = new THREE.Mesh(track(new THREE.SphereGeometry(0.025, 12, 8)), plasticBlack)
    caster.position.set(Math.cos(a) * 0.3, 0.025, Math.sin(a) * 0.3)
    chair.add(caster)
  }
  add(chair)
  const chairShadow = new THREE.Group()
  scene.add(chairShadow)
  contactShadow(-0.1, 0.012, -0.62, 0.9, 0.9, 1, chairShadow)

  // ── Plant ──────────────────────────────────────────────────────────────
  const plant = new THREE.Group()
  plant.position.set(1.5, 0, -1.85)
  const pot = new THREE.Mesh(
    track(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.14, 0), new THREE.Vector2(0.19, 0.38), new THREE.Vector2(0.18, 0.39)].map((p) => p), 40)),
    ceramic,
  )
  plant.add(pot)
  const soil = new THREE.Mesh(track(new THREE.CircleGeometry(0.175, 24)), track(new THREE.MeshStandardMaterial({ color: '#2d2118', roughness: 1 })))
  soil.rotation.x = -Math.PI / 2
  soil.position.y = 0.36
  plant.add(soil)
  const leafShape = new THREE.Shape()
  leafShape.moveTo(0, 0)
  leafShape.bezierCurveTo(0.12, 0.05, 0.14, 0.24, 0, 0.36)
  leafShape.bezierCurveTo(-0.14, 0.24, -0.12, 0.05, 0, 0)
  const leafGeo = track(new THREE.ShapeGeometry(leafShape, 12))
  {
    const pos = leafGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      pos.setZ(i, -y * y * 0.9 + Math.abs(x) * 0.25)
    }
    leafGeo.computeVertexNormals()
  }
  const leafMat = track(new THREE.MeshStandardMaterial({ color: '#3d7445', roughness: 0.5, side: THREE.DoubleSide }))
  const stemMat = track(new THREE.MeshStandardMaterial({ color: '#4f7a3c', roughness: 0.7 }))
  for (let i = 0; i < 13; i++) {
    const a = i * 2.39996
    const tilt = 0.35 + (i % 4) * 0.18
    const len = 0.35 + (i % 3) * 0.16
    const stem = new THREE.Group()
    stem.position.y = 0.36
    stem.rotation.set(0, a, tilt)
    const stalk = new THREE.Mesh(track(new THREE.CylinderGeometry(0.006, 0.008, len, 6)), stemMat)
    stalk.position.y = len / 2
    stem.add(stalk)
    const leaf = new THREE.Mesh(leafGeo, leafMat)
    leaf.position.y = len
    leaf.rotation.set(-0.6 - (i % 3) * 0.3, 0, 0)
    leaf.scale.setScalar(0.9 + (i % 5) * 0.12)
    stem.add(leaf)
    plant.add(stem)
  }
  add(plant)
  contactShadow(1.5, 0, -1.85, 0.6, 0.6)

  // ── Real furniture (desktop) ───────────────────────────────────────────
  // Potted plant: CC-BY 4.0 Eric Chadwick / Darmstadt Graphics Group, from a
  // CC0 scan by Rico Cilliers. Velvet sofa: CC-BY 4.0 Eric Chadwick / Wayfair.
  // Both from the Khronos glTF sample assets; see /assets/room/CREDITS.txt.
  const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const loadedTextures: THREE.Texture[] = []
  const place = (
    url: string,
    fit: { height?: number; length?: number },
    at: THREE.Vector3,
    rotationY: number,
    onPlaced?: (root: THREE.Object3D) => void,
  ) =>
    gltfLoader.load(url, (gltf) => {
      if (disposed) return
      const root = gltf.scene
      const lights: THREE.Object3D[] = []
      root.traverse((child) => {
        if ((child as THREE.Light).isLight) lights.push(child)
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          const mat = child.material as THREE.MeshStandardMaterial
          for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'] as const) {
            const t = mat[key]
            if (t) {
              t.anisotropy = 8
              loadedTextures.push(t)
            }
          }
        }
      })
      lights.forEach((light) => light.removeFromParent())
      root.rotation.y = rotationY
      root.updateMatrixWorld(true)
      let box = new THREE.Box3().setFromObject(root)
      const size = box.getSize(new THREE.Vector3())
      const scale = fit.height ? fit.height / size.y : fit.length! / Math.max(size.x, size.z)
      root.scale.setScalar(scale)
      root.updateMatrixWorld(true)
      box = new THREE.Box3().setFromObject(root)
      const center = box.getCenter(new THREE.Vector3())
      root.position.set(at.x - center.x, at.y - box.min.y, at.z - center.z)
      scene.add(root)
      onPlaced?.(root)
    })
  if (!lite) {
    place('/assets/room/models/plant.glb', { height: 1.35 }, new THREE.Vector3(1.5, 0, -1.85), 0.6, () => {
      plant.visible = false
    })
    place('/assets/room/models/sofa.glb', { length: 2.1 }, new THREE.Vector3(-2.72, 0, -0.75), Math.PI / 2, () => {
      contactShadow(-2.72, 0, -0.75, 1.2, 2.4, 0.8)
    })
  }

  // ── Left wall: shelf, books, print ──────────────────────────────────────
  const shelf = new THREE.Group()
  shelf.position.set(-3.18, 0, -0.4)
  shelf.add(rounded(0.24, 0.03, 1.2, 0.005, oak, 0.12, 1.25, 0))
  const bookColours = ['#5b5bf0', '#19c3b2', '#e0489c', '#ebe8e3', '#2a2c33', '#b38558', '#41455a', '#d8cfc0']
  let bz = -0.5
  for (let i = 0; i < 11; i++) {
    const h = 0.18 + ((i * 37) % 10) / 100
    const w = 0.025 + ((i * 13) % 4) / 100
    const book = rounded(0.17, h, w, 0.004, track(new THREE.MeshStandardMaterial({ color: bookColours[i % bookColours.length], roughness: 0.8 })), 0.11, 1.265 + h / 2, bz)
    if (i === 10) book.rotation.x = 0.25
    shelf.add(book)
    bz += w + 0.006
  }
  const vase = new THREE.Mesh(track(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 24)), ceramic)
  vase.position.set(0.12, 1.345, 0.35)
  shelf.add(vase)
  add(shelf)

  const print = new THREE.Group()
  print.position.set(-3.17, 1.85, 1.1)
  print.rotation.y = Math.PI / 2
  print.add(rounded(0.96, 1.26, 0.03, 0.006, oak))
  const art = new THREE.Mesh(track(new THREE.PlaneGeometry(0.9, 1.2)), track(new THREE.MeshStandardMaterial({ map: track(auroraPrint()), roughness: 0.9 })))
  art.position.z = 0.016
  print.add(art)
  add(print, scene, false)

  // ── Figure ─────────────────────────────────────────────────────────────
  const avatar = createAvatar(scene, {
    keyboard: keyboardPos.clone().setY(DESK_TOP + 0.02),
    mouse,
    mug,
    mainMonitor: MONITOR,
    sideMonitor: SIDE_MONITOR,
  })
  contactShadow(-0.1, 0.012, -1.15, 0.5, 0.35, 0.7)

  // ── Atmosphere: dust in the light, steam off the coffee ─────────────────
  const dot = track(softDotTexture())
  const dustCount = lite ? 120 : 260
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) dustPos.set([(Math.random() * 2 - 1) * 2.6, 0.2 + Math.random() * 2.6, -2.2 + Math.random() * 2.8], i * 3)
  const dustGeo = track(new THREE.BufferGeometry())
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const particleVertex = (body: string) => /* glsl */ `
    uniform float uTime; uniform float uSize; attribute float seed; varying float vAlpha;
    void main() { ${body} }`
  const dustUniforms = { uTime: { value: 0 }, uOpacity: { value: 0 }, uMap: { value: dot }, uSize: { value: 1 } }
  const dust = new THREE.Points(
    dustGeo,
    track(
      new THREE.ShaderMaterial({
        uniforms: dustUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: particleVertex(`
          vec3 p = position;
          float s = fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453);
          p.x += sin(uTime * 0.11 + s * 30.0) * 0.12;
          p.y += mod(uTime * 0.012 + s, 1.0) * 0.25 + sin(uTime * 0.2 + s * 9.0) * 0.05;
          p.z += cos(uTime * 0.09 + s * 20.0) * 0.1;
          vAlpha = 0.4 + 0.6 * s;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (6.0 + s * 6.0) / -mv.z;
          gl_Position = projectionMatrix * mv;`).replace('attribute float seed;', ''),
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap; uniform float uOpacity; varying float vAlpha;
          void main() { gl_FragColor = vec4(vec3(1.0, 0.95, 0.85), texture2D(uMap, gl_PointCoord).a * uOpacity * vAlpha); }`,
      }),
    ),
  )
  scene.add(dust)

  const steamCount = 22
  const steamGeo = track(new THREE.BufferGeometry())
  steamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(steamCount * 3), 3))
  steamGeo.setAttribute('seed', new THREE.BufferAttribute(Float32Array.from({ length: steamCount }, () => Math.random()), 1))
  const steamUniforms = { uTime: { value: 0 }, uMap: { value: dot }, uSize: { value: 1 } }
  const steam = new THREE.Points(
    steamGeo,
    track(
      new THREE.ShaderMaterial({
        uniforms: steamUniforms,
        transparent: true,
        depthWrite: false,
        vertexShader: particleVertex(`
          float t = fract(uTime * 0.22 + seed);
          vec3 p = vec3(sin(t * 6.0 + seed * 20.0) * 0.012 * (1.0 + t * 2.0), 0.09 + t * 0.2, cos(t * 5.0 + seed * 9.0) * 0.01);
          vAlpha = sin(t * 3.14159) * 0.16;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (30.0 + t * 70.0) / -mv.z;
          gl_Position = projectionMatrix * mv;`),
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap; varying float vAlpha;
          void main() { gl_FragColor = vec4(vec3(0.95), texture2D(uMap, gl_PointCoord).a * vAlpha); }`,
      }),
    ),
  )
  steam.frustumCulled = false
  mug.add(steam)

  // ── Lights ─────────────────────────────────────────────────────────────
  const hemi = new THREE.HemisphereLight('#ffffff', '#444444', 1)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight('#ffffff', 2)
  sun.target.position.set(0, 0.6, -0.8)
  scene.add(sun, sun.target)
  if (!lite) {
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -3.4, right: 3.4, top: 3.4, bottom: -3.4, near: 1, far: 50 })
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.015
    sun.shadow.radius = 4
  }
  // Soft fill from the glass (no shadows; the sun does those).
  const windowLight = new THREE.DirectionalLight('#cfe4f7', 1)
  windowLight.position.set(0, 1.8, -6)
  windowLight.target.position.set(0, 0.8, 0)
  scene.add(windowLight, windowLight.target)
  // Screen spill onto the desk, keyboard and the figure's hands.
  const screenLight = new THREE.PointLight('#c8d2ff', options.lightScreen ? 1.6 : 0.9, 2.2, 1.6)
  screenLight.position.set(MONITOR.x, MONITOR.y - 0.05, MONITOR.z + 0.25)
  scene.add(screenLight)
  const downlights = [new THREE.Vector3(-1.1, 2.98, 0.4), new THREE.Vector3(0.9, 2.98, -0.6)].map((p) => {
    const light = new THREE.SpotLight('#ffd9ae', 0, 5, 0.75, 0.9, 1.5)
    light.position.copy(p)
    light.target.position.set(p.x, 0, p.z)
    scene.add(light, light.target)
    return light
  })

  // Image-based lighting rebuilt for each time of day: a box of the room's
  // own colours with a bright window panel, so reflections match the scene.
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envScene = new THREE.Scene()
  const envWallMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide })
  const envWindowMat = new THREE.MeshBasicMaterial()
  const envWarmMat = new THREE.MeshBasicMaterial()
  envScene.add(new THREE.Mesh(new THREE.BoxGeometry(6.4, 3, 7), envWallMat))
  const envWindow = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.9), envWindowMat)
  envWindow.position.set(0, 0, -3.45)
  envScene.add(envWindow)
  const envWarm = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.3), envWarmMat)
  envWarm.position.set(0, 1.45, 0)
  envWarm.rotation.x = Math.PI / 2
  envScene.add(envWarm)
  let envTarget: THREE.WebGLRenderTarget | null = null

  // ── Post-processing (desktop, loaded on demand) ────────────────────────
  let post: Post | null = null
  if (!lite) {
    void import('./post').then(({ createPost }) => {
      if (disposed) return
      post = createPost(renderer, scene, camera)
      post.setSize(Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight))
      renderer.toneMapping = THREE.NoToneMapping
    })
  }
  let bloomBase = 0.3

  // ── Time of day ────────────────────────────────────────────────────────
  const sunDir = new THREE.Vector3()
  // Photographic skies load on demand and stay cached for the session.
  const skyCache = new Map<Phase, THREE.Texture>()
  const skyTexture = (phase: Phase, onReady: () => void) => {
    const src = SKIES[phase].src
    if (!src) return null
    const cached = skyCache.get(phase)
    if (cached) return cached
    const tex = textureLoader.load(src, () => {
      if (!disposed) onReady()
    })
    tex.colorSpace = THREE.NoColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.minFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    skyCache.set(phase, tex)
    loadedTextures.push(tex)
    return tex
  }
  const MOON = new THREE.Vector3(-0.3, 0.5, -0.8).normalize()
  const bodyDir = (phase: Phase) => {
    const sky = SKIES[phase]
    if (!sky.sun) return MOON.clone()
    const d = panoramaDirection(sky.sun[0], sky.sun[1], sky.center)
    return new THREE.Vector3(d.x, Math.max(d.y, 0.06), d.z).normalize()
  }
  let currentHour = Number.NaN
  // Only the photos change when one finishes loading: no lighting rebuild.
  const applySky = (hour: number) => {
    const blend = skyBlendAt(hour)
    const refresh = () => {
      if (currentHour === hour) applySky(hour)
    }
    const ready = (t: THREE.Texture | null) => (t?.image ? t : null)
    const texA = ready(skyTexture(blend.a, refresh))
    const texB = ready(skyTexture(blend.b, refresh))
    // A phase without a photo (night) fades to the procedural sky.
    const strength = (texA ? 1 - blend.t : 0) + (texB ? blend.t : 0)
    const first = texA ?? texB
    const second = texA && texB ? texB : null
    const skyA = texA ? SKIES[blend.a] : SKIES[blend.b]
    skyline.setPhotos(
      first,
      second,
      blend.t,
      skyA.center,
      SKIES[blend.b].center,
      second ? THREE.MathUtils.lerp(SKIES[blend.a].gain, SKIES[blend.b].gain, blend.t) : skyA.gain,
      first && !second && SKIES[blend.a].src && SKIES[blend.b].src ? 1 : strength,
    )
  }
  const setHour = (hour: number) => {
    if (hour === currentHour) return
    currentHour = hour
    const L = lightingAt(hour)
    const blend = skyBlendAt(hour)
    const nightness = (blend.a === 'night' ? 1 - blend.t : 0) + (blend.b === 'night' ? blend.t : 0)
    const body = { isDay: nightness < 0.5 }
    sunDir.copy(bodyDir(blend.a)).lerp(bodyDir(blend.b), blend.t).normalize()
    applySky(hour)
    skyline.update(L, sunDir, body.isDay)
    ;(scene.fog as THREE.Fog).color.set(L.skyHorizon)

    sun.color.set(body.isDay ? L.sun : '#9fb0ff')
    sun.intensity = L.sunIntensity * (body.isDay ? 1.1 : 0.5)
    sun.position.copy(sunDir).multiplyScalar(20).add(sun.target.position)
    hemi.color.set(L.hemiSky)
    hemi.groundColor.set(L.hemiGround)
    hemi.intensity = L.hemiIntensity * 0.35

    windowLight.color.set(L.skyHorizon).lerp(new THREE.Color(L.skyTop), 0.3)
    windowLight.intensity = L.window * 0.3
    curtainMat.emissiveIntensity = (L.window / 4) * 0.35
    lampLight.intensity = L.interior * 3.5
    bulbMat.color.set('#3a3530').lerp(new THREE.Color('#fff3e0'), L.interior)
    downlights.forEach((d) => (d.intensity = L.interior * 7))
    slotMat.emissiveIntensity = L.interior * 2.2
    renderer.toneMappingExposure = L.exposure
    dustUniforms.uOpacity.value = Math.max(0, 1 - L.city * 1.6) * 0.35
    bloomBase = L.bloom

    const wallTone = new THREE.Color(L.hemiSky).multiplyScalar(0.12 + L.hemiIntensity * 0.22)
    wallTone.add(new THREE.Color('#ffcf9e').multiplyScalar(L.interior * 0.18))
    envWallMat.color.copy(wallTone)
    envWindowMat.color.set(L.skyHorizon).multiplyScalar(0.4 + L.window * 0.45)
    envWarmMat.color.set('#ffe0bb').multiplyScalar(L.interior * 2.5)
    envTarget?.dispose()
    envTarget = pmrem.fromScene(envScene, 0.03)
    scene.environment = envTarget.texture
    scene.environmentIntensity = 0.9
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
  const usePhone = Boolean(options.phoneScreenSrc)
  // ── Sit-stand routine ──────────────────────────────────────────────────
  // Every so often he raises the desk and stands, or sits and lowers it.
  // The desk only moves while he's seated with a hand on the panel, as you
  // would with a real one: up = raise, then stand; down = sit, then lower.
  const desk = {
    lift: 0,
    liftFrac: 0,
    stand: 0,
    wantUp: false,
    // Seconds his hand spends reaching the panel before the motor starts.
    reach: 0,
    next: 14 + Math.random() * 10,
  }
  // Screenshot hook: localStorage portfolio-room-desk = "<liftFrac>,<stand>"
  // pins the desk and pose (e.g. "1,1" standing at full height).
  let deskPinned = false
  try {
    const pin = localStorage.getItem('portfolio-room-desk')?.split(',').map(Number)
    if (pin && pin.length === 2 && pin.every((n) => n >= 0 && n <= 1)) {
      ;[desk.liftFrac, desk.stand] = pin
      deskPinned = true
    }
  } catch {
    // Storage blocked: no pin.
  }
  const RAISE_TIME = 7
  const STAND_TIME = 1.8
  const panelWorld = new THREE.Vector3()
  const stepDesk = (time: number, dt: number) => {
    if (options.reduced && !deskPinned) return false
    if (!entering && !deskPinned && time > desk.next) {
      desk.wantUp = !desk.wantUp
      desk.next = time + 28 + Math.random() * 30
    }
    // Freeze mid-zoom so the camera's target doesn't move under it.
    if (entering) return false
    let moving = false
    if (deskPinned) moving = desk.liftFrac > 0 && desk.liftFrac < 1
    const drive = (dir: number) => {
      moving = true
      desk.reach += dt
      if (desk.reach > 0.8) desk.liftFrac = THREE.MathUtils.clamp(desk.liftFrac + (dir * dt) / RAISE_TIME, 0, 1)
    }
    if (deskPinned) {
      // Hold the pinned pose.
    } else if (desk.wantUp) {
      if (desk.liftFrac < 1) drive(1)
      else {
        desk.reach = 0
        desk.stand = Math.min(1, desk.stand + dt / STAND_TIME)
      }
    } else if (desk.stand > 0) desk.stand = Math.max(0, desk.stand - dt / STAND_TIME)
    else if (desk.liftFrac > 0) drive(-1)
    else desk.reach = 0
    const f = desk.liftFrac
    desk.lift = DESK_LIFT * f * f * (3 - 2 * f)
    deskTop.position.y = desk.lift
    showHeight(Math.round((DESK_TOP + desk.lift) * 100))
    // The chair rolls back out of the way as he gets up.
    const s = desk.stand * desk.stand * (3 - 2 * desk.stand)
    chair.position.z = -0.62 + 0.4 * s
    chair.rotation.y = 0.25 * s
    chairShadow.position.z = 0.4 * s
    return moving
  }

  const fitDistance = (fov: number, w: number, h: number) => {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(fov / 2))
    return Math.min(h / 2 / tanHalf, w / 2 / (tanHalf * aspect)) * 0.97
  }
  // Camera spot (and aim) where the chosen screen just covers the viewport.
  // The phone is seen from straight above; the hair of z offset keeps the
  // look-at stable and puts the phone's top at the top of the frame.
  const focusView = (fov: number) =>
    usePhone
      ? {
          px: PHONE.x,
          py: DESK_TOP + desk.lift + 0.0093 + fitDistance(fov, PHONE_SCREEN_W, PHONE_SCREEN_H),
          pz: PHONE.z + 0.002,
          tx: PHONE.x,
          ty: DESK_TOP + desk.lift,
          tz: PHONE.z,
        }
      : {
          px: MONITOR.x,
          py: MONITOR.y + desk.lift,
          pz: MONITOR.z + 0.0075 + fitDistance(fov, SCREEN_W, SCREEN_H),
          tx: MONITOR.x,
          ty: MONITOR.y + desk.lift,
          tz: MONITOR.z,
        }
  // Over his right shoulder, so the camera never passes through the figure.
  const waypoint = () => (usePhone ? { px: 0.62, py: 1.45 + desk.lift, pz: -0.62 } : { px: 0.35, py: 1.7 + desk.lift, pz: -0.5 })

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const hitTargets = usePhone ? [phoneScreen, phoneBody, phoneGlass] : [screen, bezel, shell]

  let hover = false
  // Just above the top edge of whichever screen is the way in.
  const labelWorld = usePhone
    ? new THREE.Vector3(PHONE.x, DESK_TOP + 0.025, PHONE.z - PHONE_SCREEN_H / 2)
    : new THREE.Vector3(MONITOR.x, MONITOR.y + SCREEN_H / 2 + 0.07, MONITOR.z)
  const labelPoint = new THREE.Vector3()
  const lookTarget = new THREE.Vector3()
  let last = 0

  return {
    resize() {
      const { clientWidth: w, clientHeight: h } = canvas
      if (!w || !h) return
      renderer.setSize(w, h, false)
      post?.setSize(w, h)
      aspect = w / h
      camera.aspect = aspect
      if (!entering) Object.assign(rig, home())
      camera.updateProjectionMatrix()
    },

    render(time) {
      const minStep = options.maxFps ? 1 / options.maxFps : 0
      if (minStep && time - last < minStep && time > last) return
      const dt = Math.min(Math.max(0.05, minStep), Math.max(0, time - last))
      last = time
      const t = options.reduced ? 0 : time
      skyline.tick(t)
      dustUniforms.uTime.value = t
      steamUniforms.uTime.value = t
      if (!options.reduced) codeTex.offset.y = (time * 0.02) % 1
      const deskMoving = stepDesk(time, dt)
      panelWorld.copy(panelGrip)
      panelWorld.y += desk.lift
      avatar.update(time, dt, options.reduced, { lift: desk.lift, stand: desk.stand, deskMoving, panel: panelWorld })

      pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 3)
      pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 3)
      const sway = options.reduced ? 0 : 1 - rig.zoom
      // A faint handheld drift keeps the frame alive.
      const driftX = Math.sin(t * 0.37) * 0.012 + Math.sin(t * 0.91) * 0.005
      const driftY = Math.sin(t * 0.29 + 1) * 0.008
      camera.position.set(rig.px + (pointer.sx * 0.18 + driftX) * sway, rig.py + (-pointer.sy * 0.1 + driftY) * sway, rig.pz)
      lookTarget.set(rig.tx, rig.ty, rig.tz)
      camera.lookAt(lookTarget)
      if (camera.fov !== rig.fov) {
        camera.fov = rig.fov
        camera.updateProjectionMatrix()
      }

      // Idle: a slow breathing glow so the way in is obvious. Hover: full.
      // Fades out as the camera zooms in, so it never tints the page.
      const haloMat = (usePhone ? phoneHalo : halo).material as THREE.MeshBasicMaterial
      // The phone is tiny on screen, so it gets a stronger idle glow than the monitor.
      const [low, high, lit] = usePhone ? [0.42, 0.75, 0.9] : [0.13, 0.3, 0.75]
      const idle = options.reduced ? (low + high) / 2 : low + (high - low) * (0.5 + 0.5 * Math.sin(time * 2))
      const glow = (hover ? lit : idle) * (1 - rig.zoom)
      haloMat.opacity += (glow - haloMat.opacity) * Math.min(1, dt * 8)

      if (post) {
        // Bloom fades out on the way in, so the last frame matches the page.
        post.render(dt, bloomBase * 2.2 * (1 - rig.zoom))
      } else {
        renderer.render(scene, camera)
      }
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

    labelAnchor() {
      labelPoint.copy(labelWorld)
      labelPoint.y += desk.lift
      labelPoint.project(camera)
      const { clientWidth: w, clientHeight: h } = canvas
      return {
        x: ((labelPoint.x + 1) / 2) * w,
        y: ((1 - labelPoint.y) / 2) * h,
        visible: rig.zoom < 0.02 && !entering && labelPoint.z < 1,
      }
    },

    intro() {
      if (options.reduced) return
      const end = home()
      gsap.fromTo(
        rig,
        { px: end.px + 1.1, py: end.py + 0.35, pz: end.pz + 1.6 },
        { px: end.px, py: end.py, pz: end.pz, duration: 2.8, ease: 'power3.out' },
      )
    },

    zoomOut() {
      const end = home()
      if (options.reduced) {
        Object.assign(rig, end, { zoom: 0 })
        return Promise.resolve()
      }
      entering = true
      hover = false
      gsap.killTweensOf(rig)
      Object.assign(rig, { ...focusView(end.fov), fov: end.fov, zoom: 1 })
      return new Promise((resolve) => {
        gsap
          .timeline({
            delay: 0.35,
            onComplete: () => {
              entering = false
              resolve()
            },
          })
          // The way in, reversed: back over his right shoulder, then home.
          .to(rig, { ...waypoint(), duration: 0.85, ease: 'power2.in' }, 0)
          .to(rig, { zoom: 0, duration: 1.7, ease: 'power2.inOut' }, 0)
          .to(rig, { tx: end.tx, ty: end.ty, tz: end.tz, duration: 1.1, ease: 'power2.inOut' }, 0.6)
          .to(rig, { px: end.px, py: end.py, pz: end.pz, duration: 1.1, ease: 'power3.out' }, 0.85)
      })
    },

    enter() {
      entering = true
      hover = false
      const { tx, ty, tz, ...target } = focusView(rig.fov)
      return new Promise((resolve) => {
        gsap.killTweensOf(rig)
        gsap
          .timeline({ onComplete: () => resolve() })
          .to(rig, { tx, ty, tz, duration: 0.8, ease: 'power2.inOut' }, 0)
          .to(rig, { zoom: 1, duration: 1.7, ease: 'power2.inOut' }, 0)
          // Over his right shoulder first, then square on to the screen.
          .to(rig, { ...waypoint(), duration: 0.85, ease: 'power2.in' }, 0.05)
          .to(rig, { ...target, duration: 0.85, ease: 'power2.out' }, 0.9)
      })
    },

    dispose() {
      gsap.killTweensOf(rig)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose()
          ;(Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => m.dispose())
        }
      })
      envScene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          ;(object.material as THREE.Material).dispose()
        }
      })
      envTarget?.dispose()
      pmrem.dispose()
      disposed = true
      loadedTextures.forEach((t) => t.dispose())
      post?.dispose()
      skyline.dispose()
      avatar.dispose()
      disposables.forEach((item) => item.dispose())
      renderer.dispose()
    },
  }
}
