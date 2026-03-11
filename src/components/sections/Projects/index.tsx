import styles from './Projects.module.css'
import { useGsapStaggerReveal } from '../../../hooks/useGsapReveal'
import { projects } from '../../../data/projects'
import SectionContainer from '../../ui/SectionContainer'
import Card from '../../ui/Card'
import Badge from '../../ui/Badge'
import { PROJECTS_DEMO_ROUTE } from '../../../constants/routes'

export default function Projects() {
  const ref = useGsapStaggerReveal<HTMLDivElement>(`.${styles.card}`, { stagger: 0.12 })

  return (
    <SectionContainer id="projects" title="Projects">
      <div ref={ref} className={styles.grid}>
        {projects.map((project) => (
          <Card
            key={project.title}
            gradientOverlay
            tilt
            className={`${styles.card} ${project.featured ? styles.featured : ''}`}
          >
            <div className={styles.cardTop}>
              <div className={styles.cardIcons}>
                <svg className={styles.folderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                </svg>
                <div className={styles.links}>
                  <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </a>
                  <a href={PROJECTS_DEMO_ROUTE} aria-label={`${project.title} demo page`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                </div>
              </div>
              {project.featured && <Badge variant="outline" className={styles.featuredBadge}>Featured</Badge>}
              <h3 className={styles.cardTitle}>{project.title}</h3>
              <p className={styles.cardDesc}>{project.description}</p>
            </div>
            <div className={styles.techStack}>
              {project.tech.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
