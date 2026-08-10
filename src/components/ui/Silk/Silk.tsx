import { useEffect, useRef } from 'react'

/**
 * Animated silk background.
 *
 * Renders a single full-screen quad with a hand-written fragment shader using
 * raw WebGL. This previously went through three.js + @react-three/fiber, which
 * pulled 868 kB of library in to draw two triangles. The shader source below is
 * unchanged from that version, so the output is pixel-identical.
 *
 * The render loop is gated on both viewport visibility (IntersectionObserver)
 * and tab visibility, so it costs nothing once scrolled past.
 */

type NormalizedRgb = [number, number, number]

const hexToNormalizedRgb = (hex: string): NormalizedRgb => {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  return [r, g, b]
}

// Full-screen quad in clip space. The original drew a unit plane scaled to the
// viewport through projectionMatrix * modelViewMatrix; the result is the same
// screen coverage and the same 0..1 uv range, so vUv semantics are preserved.
const vertexShader = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const fragmentShader = `
precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2 r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2 rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2 uv = rotateUvs(vUv * uScale, uRotation);
  vec2 tex = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// Matches the previous dpr={[1, 1.25]} clamp from the react-three-fiber Canvas.
const MAX_DPR = 1.25

export interface SilkProps {
  speed?: number
  scale?: number
  color?: string
  noiseIntensity?: number
  rotation?: number
}

export default function Silk({
  speed = 5,
  scale = 1,
  color = '#7B7481',
  noiseIntensity = 1.5,
  rotation = 0,
}: SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Latest prop values, read by the render loop without restarting it.
  const propsRef = useRef({ speed, scale, color, noiseIntensity, rotation })
  propsRef.current = { speed, scale, color, noiseIntensity, rotation }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      antialias: false,
      // The shader writes col.a = 1.0, so the canvas is fully opaque. Declaring
      // it opaque lets the compositor skip blending it against the page.
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, vertexShader)
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const aPosition = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(program, 'uTime')
    const uColor = gl.getUniformLocation(program, 'uColor')
    const uSpeed = gl.getUniformLocation(program, 'uSpeed')
    const uScale = gl.getUniformLocation(program, 'uScale')
    const uRotation = gl.getUniformLocation(program, 'uRotation')
    const uNoiseIntensity = gl.getUniformLocation(program, 'uNoiseIntensity')

    let width = 0
    let height = 0
    let didFirstDraw = false
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (w === width && h === height) return
      width = w
      height = h
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      // Resizing clears the drawing buffer. If the loop is paused (tab hidden or
      // hero scrolled away) nothing would repaint it, so redraw immediately.
      if (didFirstDraw) draw()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    let time = 0
    let last = 0
    let rafId: number | null = null
    let inView = true
    let pageVisible = !document.hidden

    const draw = () => {
      const p = propsRef.current
      const [r, g, b] = hexToNormalizedRgb(p.color)
      gl.uniform1f(uTime, time)
      gl.uniform3f(uColor, r, g, b)
      gl.uniform1f(uSpeed, p.speed)
      gl.uniform1f(uScale, p.scale)
      gl.uniform1f(uRotation, p.rotation)
      gl.uniform1f(uNoiseIntensity, p.noiseIntensity)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = (ts: number) => {
      if (last === 0) last = ts
      // Clamp delta so returning to a backgrounded tab doesn't jump the pattern.
      const delta = Math.min((ts - last) / 1000, 1 / 30)
      last = ts

      // Matches the previous useFrame body: uTime += 0.1 * delta
      time += 0.1 * delta

      draw()
      rafId = requestAnimationFrame(frame)
    }

    const sync = () => {
      const shouldRun = inView && pageVisible
      if (shouldRun && rafId === null) {
        last = 0
        rafId = requestAnimationFrame(frame)
      } else if (!shouldRun && rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting)
        sync()
      },
      { threshold: 0 },
    )
    intersectionObserver.observe(canvas)

    const onVisibility = () => {
      pageVisible = !document.hidden
      sync()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Always paint one frame up front. The context is opaque (alpha: false), so
    // a canvas that has never drawn is solid black — which is what a visitor
    // would see if the page loaded in a background tab, or if the hero was
    // already scrolled past on load. Painting once means pausing simply freezes
    // the pattern instead of blanking it.
    resize()
    draw()
    didFirstDraw = true

    sync()

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', onVisibility)
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
