export const PROJECTS_DEMO_ROUTE = '#/projects/demo'

// Combining diacritical marks. Built from escapes so the source stays ASCII.
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')

/**
 * Derived, not stored on the project. Titles are the single source of truth, so
 * there is no second field to keep in sync — the trade-off is that renaming a
 * project changes its URL, which is the right call for a portfolio where
 * nothing is deep-linked from outside yet.
 */
export function slugifyProject(title: string): string {
  return title
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** `#/projects/demo/property-website-builder-agent-crm` */
export function projectDemoRoute(title: string): string {
  return `${PROJECTS_DEMO_ROUTE}/${slugifyProject(title)}`
}

/**
 * Returns the slug for a project page, `''` for the demo index, or null when
 * the hash is not a demo route at all.
 */
export function demoSlugFromHash(hash: string): string | null {
  if (!hash.startsWith(PROJECTS_DEMO_ROUTE)) return null

  const rest = hash.slice(PROJECTS_DEMO_ROUTE.length).replace(/^\/+/, '')
  return rest.split(/[/?#]/)[0] ?? ''
}
