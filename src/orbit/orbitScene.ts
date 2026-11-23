import * as THREE from 'three'
import { SIMPLEX_3D } from './noise.glsl'

/**
 * Hero scene for Orbit: a breathing particle core (a Fibonacci sphere pushed
 * around by simplex noise), a faint wireframe shell, and a tilted ring of dust.
 * Scroll progress scatters the core outward as the hero leaves the screen.
 */
export function createOrbitScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0, 7)

  const group = new THREE.Group()
  scene.add(group)

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPixelRatio: { value: renderer.getPixelRatio() },
  }

  // Core
  const count = 9000
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    positions.set([Math.cos(theta) * r * 1.6, y * 1.6, Math.sin(theta) * r * 1.6], i * 3)
    seeds[i] = Math.random()
  }
  const coreGeometry = new THREE.BufferGeometry()
  coreGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  coreGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))

  const coreMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      ${SIMPLEX_3D}
      uniform float uTime;
      uniform float uProgress;
      uniform float uPixelRatio;
      attribute float aSeed;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 dir = normalize(position);
        float n = snoise(dir * 1.4 + vec3(uTime * 0.18));
        float n2 = snoise(dir * 3.2 - vec3(uTime * 0.11));
        float swell = 1.0 + n * 0.22 + n2 * 0.06;
        float scatter = uProgress * (1.5 + aSeed * 3.5);
        vec3 p = dir * 1.6 * swell + dir * scatter;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.0 + aSeed * 2.5) * uPixelRatio * (4.5 / -mv.z);

        vec3 indigo = vec3(0.36, 0.36, 0.94);
        vec3 teal = vec3(0.10, 0.76, 0.70);
        vec3 magenta = vec3(0.88, 0.28, 0.61);
        float t = smoothstep(-0.6, 0.6, n);
        vColor = mix(mix(indigo, teal, t), magenta, smoothstep(0.35, 0.9, n2 + aSeed * 0.3));
        vAlpha = (0.45 + 0.55 * smoothstep(-0.5, 0.8, n)) * (1.0 - uProgress * 0.85);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a * vAlpha);
      }
    `,
  })
  const core = new THREE.Points(coreGeometry, coreMaterial)
  group.add(core)

  // Wireframe shell
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.35, 1)),
    new THREE.LineBasicMaterial({ color: 0x8b90ff, transparent: true, opacity: 0.12 }),
  )
  group.add(shell)

  // Dust ring
  const ringCount = 2200
  const ringPositions = new Float32Array(ringCount * 3)
  for (let i = 0; i < ringCount; i++) {
    const a = Math.random() * Math.PI * 2
    const radius = 3 + Math.pow(Math.random(), 2) * 1.4
    ringPositions.set([Math.cos(a) * radius, (Math.random() - 0.5) * 0.12, Math.sin(a) * radius], i * 3)
  }
  const ringGeometry = new THREE.BufferGeometry()
  ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3))
  const ring = new THREE.Points(
    ringGeometry,
    new THREE.PointsMaterial({
      color: 0x9fe8df,
      size: 0.018,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  ring.rotation.set(1.15, 0, 0.35)
  group.add(ring)

  const pointer = { x: 0, y: 0 }
  const eased = { x: 0, y: 0 }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Keep the core framed on narrow screens.
    camera.position.z = w < h ? 9.5 : 7
    camera.updateProjectionMatrix()
  }

  function render(time: number) {
    uniforms.uTime.value = time
    eased.x += (pointer.x - eased.x) * 0.05
    eased.y += (pointer.y - eased.y) * 0.05
    group.rotation.y = time * 0.06 + eased.x * 0.5
    group.rotation.x = eased.y * 0.3
    shell.rotation.y = -time * 0.04
    ring.rotation.y = time * 0.05
    const p = uniforms.uProgress.value
    group.position.y = p * 1.2
    ;(shell.material as THREE.LineBasicMaterial).opacity = 0.12 * (1 - p)
    ;(ring.material as THREE.PointsMaterial).opacity = 0.55 * (1 - p)
    renderer.render(scene, camera)
  }

  return {
    resize,
    render,
    setProgress: (p: number) => (uniforms.uProgress.value = p),
    setPointer: (x: number, y: number) => {
      pointer.x = x
      pointer.y = y
    },
    dispose() {
      coreGeometry.dispose()
      coreMaterial.dispose()
      ringGeometry.dispose()
      shell.geometry.dispose()
      renderer.dispose()
    },
  }
}
