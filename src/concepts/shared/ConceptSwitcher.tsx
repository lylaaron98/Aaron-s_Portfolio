import styles from './ConceptSwitcher.module.css'

export const CONCEPTS = [
  {
    slug: 'orbit',
    letter: 'A',
    name: 'Orbit',
    tagline: 'Dark and cinematic',
    summary:
      'A live 3D particle core in the hero, a statement that lights up word by word, and a pinned horizontal timeline you scroll sideways through.',
  },
  {
    slug: 'blueprint',
    letter: 'B',
    name: 'Blueprint',
    tagline: 'Light and editorial',
    summary:
      'An engineering-drawing look. A 3D system stack that pulls apart as you scroll, and a vertical timeline whose line draws itself while the year counter follows you.',
  },
  {
    slug: 'warp',
    letter: 'C',
    name: 'Warp',
    tagline: 'Immersive 3D flythrough',
    summary:
      'The whole page sits inside one 3D scene. Scrolling flies the camera through a ring for each role, with a scroll-driven 3D carousel of projects.',
  },
] as const

export type ConceptSlug = (typeof CONCEPTS)[number]['slug']

/** Floating pill to hop between drafts while reviewing them. */
export default function ConceptSwitcher({ current }: { current: ConceptSlug }) {
  return (
    <nav className={styles.switcher} aria-label="Design concepts">
      <a href="/concepts" className={styles.home}>
        Drafts
      </a>
      {CONCEPTS.map((concept) => (
        <a
          key={concept.slug}
          href={`/concepts/${concept.slug}`}
          aria-current={concept.slug === current ? 'page' : undefined}
          className={styles.link}
        >
          <span aria-hidden="true">{concept.letter}</span>
          <span className={styles.name}>{concept.name}</span>
        </a>
      ))}
    </nav>
  )
}
