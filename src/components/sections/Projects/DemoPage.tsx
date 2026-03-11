import ShinyText from '../../ui/ShinyText'
import ScrollToTop from '../../ui/ScrollToTop'
import { projects } from '../../../data/projects'
import type { Project } from '../../../types/project'
import Galaxy from './Galaxy'

export default function DemoPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '2rem', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Galaxy />
      </div>
      <ScrollToTop />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <a
          href="#projects"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            color: '#bfc4cf',
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}
        >
          <span aria-hidden="true">←</span>
          <span>Back to portfolio</span>
        </a>
        <h1 style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '1.5rem' }}>
          <ShinyText
            text="Project Demos"
            speed={2}
            delay={0}
            disabled={false}
            className="shiny-header"
          />
        </h1>
        {projects.map((project: Project, idx: number) => (
          <section
            key={project.title}
            style={{
              marginBottom: '3rem',
              marginTop: idx === 0 ? '2.5rem' : undefined,
              border: '1px solid #222',
              borderRadius: 12,
              padding: '2rem',
              background: '#181c24'
            }}
          >
            <h2 style={{ marginBottom: '1rem' }}>{project.title}</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Description:</strong>
              <div style={{ border: '1px dashed #444', minHeight: 60, padding: '1rem', marginTop: 8, color: '#bfc4cf' }}>
                {project.description}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Gallery:</strong>
              <div style={{ border: '1px dashed #444', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Gallery Placeholder
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong>Video:</strong>
              <div style={{ border: '1px dashed #444', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                Video Placeholder
              </div>
            </div>
            <div>
              <strong>Tech Stack:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {project.tech.map((t: string) => (
                  <span key={t} style={{ background: '#23283a', color: '#bfc4cf', borderRadius: 6, padding: '2px 10px', fontSize: 13 }}>{t}</span>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
