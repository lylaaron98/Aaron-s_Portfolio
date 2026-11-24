/**
 * Lighting for the room, keyed to the hour of day. A handful of keyframes are
 * blended continuously, so 07:10 sits between dawn and day rather than
 * snapping to one of them.
 */

export type Phase = 'dawn' | 'day' | 'dusk' | 'night'

export interface Lighting {
  skyTop: string
  skyHorizon: string
  sun: string
  sunIntensity: number
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  /** 0–1: lit windows across the skyline. */
  city: number
  /** 0–1: star visibility. */
  stars: number
  /** Desk lamp and ceiling strip, 0–1. */
  interior: number
  exposure: number
  /** Cloud tint and cover, 0–1. */
  cloud: string
  clouds: number
  /** Soft daylight through the glass (rect light), arbitrary units. */
  window: number
  /** Bloom strength. */
  bloom: number
}

interface Key extends Lighting {
  hour: number
}

const NIGHT: Omit<Key, 'hour'> = {
  skyTop: '#05060f',
  skyHorizon: '#1a1f3d',
  sun: '#8ea2ff',
  sunIntensity: 0.35,
  hemiSky: '#2b3266',
  hemiGround: '#0b0c14',
  hemiIntensity: 0.35,
  city: 1,
  stars: 1,
  interior: 1,
  exposure: 1.05,
  cloud: '#2a3052',
  clouds: 0.35,
  window: 0.5,
  bloom: 0.55,
}

const DAWN: Omit<Key, 'hour'> = {
  skyTop: '#3f5c9e',
  skyHorizon: '#f4b48a',
  sun: '#ffb47a',
  sunIntensity: 1.6,
  hemiSky: '#9fb2e6',
  hemiGround: '#5a4a48',
  hemiIntensity: 0.7,
  city: 0.35,
  stars: 0.15,
  interior: 0.35,
  exposure: 1,
  cloud: '#ffc2a8',
  clouds: 0.6,
  window: 2.2,
  bloom: 0.35,
}

const DAY: Omit<Key, 'hour'> = {
  skyTop: '#3d7fe0',
  skyHorizon: '#cfe4f7',
  sun: '#fff4e2',
  sunIntensity: 2.6,
  hemiSky: '#e4efff',
  hemiGround: '#b5a892',
  hemiIntensity: 1.6,
  city: 0,
  stars: 0,
  interior: 0,
  exposure: 1.05,
  cloud: '#ffffff',
  clouds: 0.55,
  window: 4,
  bloom: 0.18,
}

const DUSK: Omit<Key, 'hour'> = {
  skyTop: '#2a2a6b',
  skyHorizon: '#ff7a59',
  sun: '#ff8a4c',
  sunIntensity: 1.3,
  hemiSky: '#8d7fc9',
  hemiGround: '#4a3338',
  hemiIntensity: 0.65,
  city: 0.6,
  stars: 0.2,
  interior: 0.6,
  exposure: 1,
  cloud: '#ff9e7a',
  clouds: 0.65,
  window: 2,
  bloom: 0.4,
}

const KEYS: Key[] = [
  { hour: 0, ...NIGHT },
  { hour: 5.25, ...NIGHT },
  { hour: 6.6, ...DAWN },
  { hour: 8.5, ...DAY },
  { hour: 17, ...DAY },
  { hour: 18.8, ...DUSK },
  { hour: 20.2, ...NIGHT },
  { hour: 24, ...NIGHT },
]

/** Hours used when a visitor picks a phase instead of following the clock. */
export const PHASE_HOURS: Record<Phase, number> = { dawn: 6.6, day: 13, dusk: 18.8, night: 22.5 }

export function phaseAt(hour: number): Phase {
  if (hour >= 5.5 && hour < 7.5) return 'dawn'
  if (hour >= 7.5 && hour < 17.75) return 'day'
  if (hour >= 17.75 && hour < 19.75) return 'dusk'
  return 'night'
}

export function localHour(date = new Date()) {
  return date.getHours() + date.getMinutes() / 60
}

function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t)
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function lightingAt(hour: number): Lighting {
  const h = ((hour % 24) + 24) % 24
  let i = 0
  while (i < KEYS.length - 2 && KEYS[i + 1].hour <= h) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const raw = (h - a.hour) / (b.hour - a.hour || 1)
  const t = raw * raw * (3 - 2 * raw)
  return {
    skyTop: mixHex(a.skyTop, b.skyTop, t),
    skyHorizon: mixHex(a.skyHorizon, b.skyHorizon, t),
    sun: mixHex(a.sun, b.sun, t),
    sunIntensity: lerp(a.sunIntensity, b.sunIntensity, t),
    hemiSky: mixHex(a.hemiSky, b.hemiSky, t),
    hemiGround: mixHex(a.hemiGround, b.hemiGround, t),
    hemiIntensity: lerp(a.hemiIntensity, b.hemiIntensity, t),
    city: lerp(a.city, b.city, t),
    stars: lerp(a.stars, b.stars, t),
    interior: lerp(a.interior, b.interior, t),
    exposure: lerp(a.exposure, b.exposure, t),
    cloud: mixHex(a.cloud, b.cloud, t),
    clouds: lerp(a.clouds, b.clouds, t),
    window: lerp(a.window, b.window, t),
    bloom: lerp(a.bloom, b.bloom, t),
  }
}

/**
 * Where the sun (or moon) sits for a given hour, as an angle across the
 * window: 0 = left horizon, 1 = right horizon, with an elevation 0–1.
 */
export function skyBodyAt(hour: number) {
  const h = ((hour % 24) + 24) % 24
  const isDay = h >= 6 && h < 19
  const span = isDay ? (h - 6) / 13 : ((h + 24 - 19) % 24) / 11
  return { isDay, across: span, elevation: Math.sin(Math.PI * Math.min(Math.max(span, 0), 1)) }
}
