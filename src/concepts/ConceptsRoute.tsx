import { lazy, Suspense, useEffect } from 'react'
import ConceptsIndex from './ConceptsIndex'

const concepts = {
  orbit: lazy(() => import('./orbit/OrbitConcept')),
  blueprint: lazy(() => import('./blueprint/BlueprintConcept')),
  warp: lazy(() => import('./warp/WarpConcept')),
}

/**
 * Draft redesigns, reachable only by URL. They are kept off search engines and
 * out of the main bundle: each concept is its own lazily loaded chunk.
 */
export default function ConceptsRoute({ slug }: { slug: string }) {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const Concept = Object.hasOwn(concepts, slug) ? concepts[slug as keyof typeof concepts] : null

  useEffect(() => {
    document.title = Concept ? `Concept: ${slug} — Aaron Lee` : 'Redesign drafts — Aaron Lee'
    window.scrollTo(0, 0)
  }, [Concept, slug])

  if (!Concept) return <ConceptsIndex />
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07080d' }} />}>
      <Concept />
    </Suspense>
  )
}
