export const PROJECTS_DEMO_ROUTE = '/projects'

/** The hash route used before project pages had real URLs. Still redirected. */
const LEGACY_DEMO_HASH = '#/projects/demo'

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

/** `/projects/property-website-builder-agent-crm` */
export function projectDemoRoute(title: string): string {
  return `${PROJECTS_DEMO_ROUTE}/${slugifyProject(title)}`
}

/**
 * Returns the slug for a project page, `''` for the projects index, or null
 * when the path is not a project route at all.
 */
export function demoSlugFromPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '')
  if (path !== PROJECTS_DEMO_ROUTE && !path.startsWith(`${PROJECTS_DEMO_ROUTE}/`)) return null
  return path.slice(PROJECTS_DEMO_ROUTE.length).replace(/^\/+/, '').split('/')[0] ?? ''
}

/** Maps an old `#/projects/demo/slug` link to its path, or null. */
export function pathFromLegacyHash(hash: string): string | null {
  if (!hash.startsWith(LEGACY_DEMO_HASH)) return null
  const slug = hash.slice(LEGACY_DEMO_HASH.length).replace(/^\/+/, '').split(/[/?#]/)[0]
  return slug ? `${PROJECTS_DEMO_ROUTE}/${slug}` : PROJECTS_DEMO_ROUTE
}
