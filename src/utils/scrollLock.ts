/**
 * Page scroll lock shared by every overlay (loader, 3D room, dialogs).
 *
 * Overlays overlap: the room mounts before the loader has gone. If each one
 * saved and restored `overflow` itself, the last to close could put back a
 * stale "hidden" and leave the page unable to scroll by touch. A shared count
 * unlocks only when the last lock is released.
 */
let locks = 0

export function lockScroll(): () => void {
  locks += 1
  if (locks === 1) {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }
  let released = false
  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks === 0) {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }
}
