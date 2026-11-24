/**
 * Whether the 3D room greets this visit. It is an optional front door: shown
 * once per browser, skipped for returning visitors, and never shown where it
 * would hurt (no WebGL, data saver). `?room` in the URL forces it, which is
 * also how the footer link brings it back.
 */

export const ROOM_SEEN_KEY = 'portfolio-room-seen'
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

export function markRoomSeen() {
  try {
    localStorage.setItem(ROOM_SEEN_KEY, '1')
  } catch {
    // Private mode: the room just shows again next time.
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
    return localStorage.getItem(ROOM_SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

/** True when WebGL is running on the CPU (blocklisted or missing GPU). */
function softwareRenderer() {
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
