import * as THREE from 'three'

import { LAYERS } from './layers'

/**
 * Isometric "system stack" for Blueprint: four slabs drawn like a technical
 * drawing. Scroll progress pulls them apart and turns the stack, and the
 * label anchors are projected to screen so HTML labels can follow each slab.
 */
export function createBlueprintScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  camera.position.set(10, 8.2, 10)
  camera.lookAt(0, 0, 0)

  const ink = new THREE.Color('#13213f')
  const accent = new THREE.Color('#e8541e')
  const stack = new THREE.Group()
  scene.add(stack)

  const slabs = LAYERS.map((_, i) => {
    const group = new THREE.Group()
    const geometry = new THREE.BoxGeometry(3.2, 0.22, 2.4)
    const top = i === 0
    const face = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: top ? accent : ink,
        transparent: true,
        opacity: top ? 0.9 : 0.06 + i * 0.03,
        depthWrite: false,
      }),
    )
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.85 }),
    )
    group.add(face, edges)

    // Inner detail: a grid of "modules" etched into each slab.
    const cells = new THREE.Group()
    const cols = 4 - (i % 2)
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < 2; r++) {
        const w = 2.6 / cols - 0.12
        const cell = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, 0.9)),
          new THREE.LineBasicMaterial({ color: top ? 0xffffff : ink, transparent: true, opacity: top ? 0.7 : 0.35 }),
        )
        cell.rotation.x = -Math.PI / 2
        cell.position.set(-1.3 + w / 2 + c * (w + 0.12) + 0.06, 0.111, -0.5 + r * 1.0)
        cells.add(cell)
      }
    }
    group.add(cells)
    stack.add(group)
    return group
  })

  // Connector pins between layers
  const pinMaterial = new THREE.LineDashedMaterial({ color: accent, dashSize: 0.08, gapSize: 0.06 })
  const pins = [-1.2, 1.2].flatMap((x) =>
    [-0.8, 0.8].map((z) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1, z)])
      const line = new THREE.Line(geometry, pinMaterial)
      stack.add(line)
      return line
    }),
  )

  let progress = 0
  const anchor = new THREE.Vector3()
  const anchors = LAYERS.map(() => ({ x: 0, y: 0 }))

  function layout() {
    const gap = 0.34 + progress * 0.95
    const total = gap * (slabs.length - 1)
    slabs.forEach((slab, i) => {
      slab.position.y = total / 2 - i * gap
    })
    pins.forEach((pin) => {
      pin.position.y = -total / 2
      pin.scale.y = total
      pin.computeLineDistances()
    })
    stack.rotation.y = progress * 0.55
  }

  let aspect = 1
  function frame() {
    // Zoom out as the stack opens so it always fits, leaving room for labels.
    const size = (aspect < 1 ? 4.6 / aspect : 3.8) * (1 + progress * 0.75)
    camera.left = (-size * aspect) / 2
    camera.right = (size * aspect) / 2
    camera.top = size / 2
    camera.bottom = -size / 2
    camera.updateProjectionMatrix()
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas
    renderer.setSize(w, h, false)
    aspect = w / h
    frame()
  }

  function render(time: number) {
    layout()
    frame()
    stack.position.y = Math.sin(time * 0.8) * 0.04
    renderer.render(scene, camera)
    const { clientWidth: w, clientHeight: h } = canvas
    slabs.forEach((slab, i) => {
      anchor.set(1.6, 0, 1.2)
      slab.localToWorld(anchor)
      anchor.project(camera)
      anchors[i].x = (anchor.x * 0.5 + 0.5) * w
      anchors[i].y = (-anchor.y * 0.5 + 0.5) * h
    })
  }

  return {
    resize,
    render,
    anchors,
    setProgress: (p: number) => (progress = p),
    dispose() {
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        mesh.geometry?.dispose()
        const material = mesh.material as THREE.Material | undefined
        material?.dispose()
      })
      renderer.dispose()
    },
  }
}
