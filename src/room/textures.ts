import * as THREE from 'three'

/**
 * Procedural surface textures, drawn once into canvases. They give the room
 * real material variation (wood grain, polished concrete, woven fabric)
 * without downloading any image files.
 */

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Tileable value noise on a grid, bilinearly smoothed. */
function valueNoise(seed: number, cells: number) {
  const random = rng(seed)
  const grid = Array.from({ length: cells * cells }, random)
  const at = (x: number, y: number) => grid[(((y % cells) + cells) % cells) * cells + (((x % cells) + cells) % cells)]
  return (u: number, v: number) => {
    const x = u * cells
    const y = v * cells
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = x - x0
    const fy = y - y0
    const sx = fx * fx * (3 - 2 * fx)
    const sy = fy * fy * (3 - 2 * fy)
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx
    return a + (b - a) * sy
  }
}

function fbm(seed: number, base: number, octaves = 4) {
  const layers = Array.from({ length: octaves }, (_, i) => valueNoise(seed + i * 101, base << i))
  return (u: number, v: number) => {
    let sum = 0
    let amp = 0.5
    let norm = 0
    for (const layer of layers) {
      sum += layer(u, v) * amp
      norm += amp
      amp *= 0.5
    }
    return sum / norm
  }
}

function pixels(width: number, height: number, shade: (u: number, v: number) => [number, number, number]) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = shade(x / width, y / height)
      const i = (y * width + x) * 4
      image.data[i] = r
      image.data[i + 1] = g
      image.data[i + 2] = b
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  return canvas
}

function toTexture(canvas: HTMLCanvasElement, color: boolean, repeat: [number, number] = [1, 1]) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(...repeat)
  texture.anisotropy = 8
  return texture
}

const clamp = (v: number) => Math.max(0, Math.min(255, v))

/** Oak: long grain along u, with slow figure and fine pores. */
export function woodTextures(size = 512) {
  const figure = fbm(7, 3)
  const pores = fbm(19, 64, 2)
  const grain = (u: number, v: number) => {
    const warp = figure(u * 0.5, v) * 6
    const ring = 0.5 + 0.5 * Math.sin((v * 38 + warp) * Math.PI)
    return ring * 0.7 + pores(u * 4, v) * 0.3
  }
  const map = pixels(size * 2, size / 2, (u, v) => {
    const g = grain(u, v)
    const tone = 0.82 + figure(u, v * 2) * 0.3
    return [clamp((178 - g * 46) * tone), clamp((132 - g * 40) * tone), clamp((90 - g * 34) * tone)]
  })
  const rough = pixels(size, size / 4, (u, v) => {
    const g = grain(u * 2, v * 4)
    const r = 120 + g * 70
    return [r, r, r]
  })
  return { map: toTexture(map, true), roughness: toTexture(rough, false) }
}

/** Polished microcement: soft clouding, trowel marks, a few joints. */
export function concreteTextures(size = 512) {
  const cloud = fbm(3, 4)
  const speck = fbm(11, 128, 2)
  const map = pixels(size, size, (u, v) => {
    const c = cloud(u, v)
    const s = speck(u, v)
    const joint = Math.min(Math.abs(u - 0.5), Math.abs(u), Math.abs(1 - u)) < 0.0015 ? -18 : 0
    const base = 196 + (c - 0.5) * 38 + (s - 0.5) * 14 + joint
    return [clamp(base + 4), clamp(base + 1), clamp(base - 4)]
  })
  const rough = pixels(size / 2, size / 2, (u, v) => {
    const r = 70 + cloud(u * 1.7, v * 1.7) * 90
    return [r, r, r]
  })
  return { map: toTexture(map, true, [2, 2]), roughness: toTexture(rough, false, [2, 2]) }
}

/** Matte plaster: barely-there mottling so large walls are not flat. */
export function plasterTexture(size = 256) {
  const cloud = fbm(23, 6)
  return toTexture(
    pixels(size, size, (u, v) => {
      const c = 236 + (cloud(u, v) - 0.5) * 12
      return [clamp(c), clamp(c - 2), clamp(c - 6)]
    }),
    true,
    [3, 2],
  )
}

/** Woven fabric for the chair and rug. */
export function fabricTexture(base: [number, number, number], size = 256, scale = 64) {
  const fuzz = fbm(31, 32, 2)
  return toTexture(
    pixels(size, size, (u, v) => {
      const weave = (Math.sin(u * scale * Math.PI * 2) * Math.sin(v * scale * Math.PI * 2)) * 0.5 + 0.5
      const f = 0.85 + weave * 0.15 + (fuzz(u, v) - 0.5) * 0.12
      return [clamp(base[0] * f), clamp(base[1] * f), clamp(base[2] * f)]
    }),
    true,
  )
}

/** Rug: woven field with a border band. */
export function rugTexture(size = 512) {
  const fuzz = fbm(41, 48, 3)
  return toTexture(
    pixels(size, size, (u, v) => {
      const r = Math.hypot(u - 0.5, v - 0.5)
      const band = r > 0.4 && r < 0.43 ? 1 : 0
      const f = 0.85 + (fuzz(u, v) - 0.5) * 0.35
      const c = band ? [150, 132, 110] : [72, 74, 86]
      return [clamp(c[0] * f), clamp(c[1] * f), clamp(c[2] * f)]
    }),
    true,
  )
}

/** Soft round shadow used as a contact-shadow decal under furniture. */
export function contactShadowTexture(size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(0.5, 'rgba(0,0,0,0.25)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

/**
 * Soft glow around a screen: full inside the w x h rectangle, fading to
 * nothing across `margin` on every side. Sized in metres, so the falloff is
 * even on wide and tall screens alike.
 */
export function screenGlowTexture(w: number, h: number, margin: number, res = 256) {
  const totalW = w + margin * 2
  const totalH = h + margin * 2
  const scale = res / Math.max(totalW, totalH)
  const cw = Math.max(8, Math.round(totalW * scale))
  const ch = Math.max(8, Math.round(totalH * scale))
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(cw, ch)
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const dx = Math.max(0, Math.abs((x + 0.5) / scale - totalW / 2) - w / 2)
      const dy = Math.max(0, Math.abs((y + 0.5) / scale - totalH / 2) - h / 2)
      const f = Math.max(0, 1 - Math.hypot(dx, dy) / margin)
      const i = (y * cw + x) * 4
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255
      img.data[i + 3] = Math.round(255 * f * f * f)
    }
  }
  ctx.putImageData(img, 0, 0)
  return new THREE.CanvasTexture(canvas)
}

/** Soft dot for dust motes and steam. */
export function softDotTexture(size = 64) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

/** Scrolling code for the side monitor. */
export function codeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const random = rng(5)
  ctx.fillStyle = '#0d1020'
  ctx.fillRect(0, 0, 256, 512)
  const palette = ['#7c83ff', '#19c3b2', '#e0489c', '#c9cde2', '#6f7597', '#ffd79a']
  let indent = 0
  for (let y = 10; y < 512; y += 13) {
    if (random() < 0.12) continue
    indent = Math.max(0, Math.min(4, indent + (random() < 0.3 ? 1 : random() < 0.3 ? -1 : 0)))
    ctx.fillStyle = '#3a3f5c'
    ctx.fillRect(4, y, 6, 5)
    let x = 18 + indent * 14
    const tokens = 1 + Math.floor(random() * 4)
    for (let t = 0; t < tokens && x < 236; t++) {
      const w = 12 + random() * 46
      ctx.fillStyle = palette[Math.floor(random() * palette.length)]
      ctx.globalAlpha = 0.85
      ctx.fillRect(x, y, Math.min(w, 240 - x), 5)
      ctx.globalAlpha = 1
      x += w + 6
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 0.6)
  return texture
}

/** Aurora print for the wall. */
export function auroraPrint() {
  const canvas = document.createElement('canvas')
  canvas.width = 360
  canvas.height = 480
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f4f1ec'
  ctx.fillRect(0, 0, 360, 480)
  ctx.fillStyle = '#0b0f1e'
  ctx.fillRect(30, 30, 300, 420)
  const blob = (x: number, y: number, r: number, c: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, c)
    g.addColorStop(1, 'rgba(11,15,30,0)')
    ctx.fillStyle = g
    ctx.fillRect(30, 30, 300, 420)
  }
  blob(120, 150, 190, '#5b5bf0')
  blob(260, 280, 170, '#19c3b2')
  blob(140, 400, 150, '#e0489c')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
