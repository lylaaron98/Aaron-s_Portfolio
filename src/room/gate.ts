/**
 * Whether the 3D room greets this visit. It is an optional front door: shown
 * once per browser, skipped for returning visitors, and never shown where it
 * would hurt (no WebGL, data saver). `?room` in the URL forces it, which is
 * also how the footer link brings it back.
 */

export const ROOM_SEEN_KEY = 'portfolio-room-seen'
export const OPEN_ROOM_EVENT = 'room:open'

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

/** Phones, touch-first devices and small CPUs get the lighter scene. */
export function wantsLiteRoom() {
  const coarse = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches
  const cores = navigator.hardwareConcurrency
  return coarse || (typeof cores === 'number' && cores > 0 && cores <= 4)
}
