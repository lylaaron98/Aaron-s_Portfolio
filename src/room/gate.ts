/**
 * Whether the 3D room greets this visit. It is the front door on every home
 * page visit (after the loader), with Skip and Escape always available. It is
 * never shown where it would hurt (no WebGL, data saver) or when the visitor
 * deep-links to a section. `?room` in the URL forces it.
 */

/** Set to '1' to turn the room off in this browser (used by the site's tests). */
export const ROOM_OFF_KEY = 'portfolio-room-off'
export const OPEN_ROOM_EVENT = 'room:open'

/** Opens the room. `fromScreen` starts on the monitor and zooms back out. */
export function openRoom(fromScreen = false) {
  window.dispatchEvent(new CustomEvent(OPEN_ROOM_EVENT, { detail: { fromScreen } }))
}

export function canRenderRoom() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** Reads (and tidies away) the `?room` flag. */
function takeRoomFlag() {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('room')) return false
  params.delete('room')
  const query = params.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
  return true
}

export function shouldShowRoom(onHome: boolean) {
  const forced = takeRoomFlag()
  if (!onHome || !canRenderRoom()) return false
  if (forced) return true
  // Deep links (#projects, #contact) mean the visitor wants that section.
  if (window.location.hash) return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return false
  try {
    return localStorage.getItem(ROOM_OFF_KEY) !== '1'
  } catch {
    return true
  }
}

/** True when WebGL is running on the CPU (blocklisted or missing GPU). */
export function softwareRenderer() {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const info = gl?.getExtension('WEBGL_debug_renderer_info')
    const name = info ? String(gl!.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return /swiftshader|llvmpipe|software|basic render/i.test(name)
  } catch {
    return false
  }
}

/** Phones, touch-first devices, small CPUs and software GL get the lighter scene. */
export function wantsLiteRoom() {
  try {
    // Manual override for testing the full scene on any machine.
    if (localStorage.getItem('portfolio-room-quality') === 'high') return false
  } catch {
    // ignore
  }
  const coarse = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency
  return coarse || (typeof cores === 'number' && cores > 0 && cores <= 4) || softwareRenderer()
}
