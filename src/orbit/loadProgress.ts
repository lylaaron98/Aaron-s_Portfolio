/**
 * Real load progress for the intro loader. Each task carries a weight; the
 * loader shows the share of weight that has finished, so the 0–100 counter
 * tracks actual work (fonts, the 3D scene, key images, the page load) rather
 * than a fixed timer.
 */
type Listener = (progress: number) => void

const tasks = new Map<string, { weight: number; done: boolean }>()
const listeners = new Set<Listener>()

function progress() {
  let total = 0
  let done = 0
  tasks.forEach((task) => {
    total += task.weight
    if (task.done) done += task.weight
  })
  return total ? done / total : 0
}

const emit = () => listeners.forEach((listener) => listener(progress()))

/** Registers a task; calling the returned function marks it finished. */
export function addTask(name: string, weight = 1) {
  if (!tasks.has(name)) tasks.set(name, { weight, done: false })
  emit()
  return () => completeTask(name)
}

export function completeTask(name: string) {
  const task = tasks.get(name)
  if (!task || task.done) return
  task.done = true
  emit()
}

/** Tracks a promise as a task. Failures count as finished: never hang the intro. */
export function trackPromise(name: string, promise: Promise<unknown>, weight = 1) {
  const finish = addTask(name, weight)
  promise.then(finish, finish)
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  listener(progress())
  return () => {
    listeners.delete(listener)
  }
}

function loadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/** The work every first load waits on. The 3D scene registers itself. */
export function trackPageAssets(images: string[]) {
  trackPromise('fonts', document.fonts?.ready ?? Promise.resolve(), 2)
  trackPromise(
    'window',
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true })),
    1,
  )
  images.forEach((src) => trackPromise(`img:${src}`, loadImage(src), 1))
}
