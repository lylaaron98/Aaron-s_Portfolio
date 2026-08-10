import styles from './Projects.module.css'
import { projects } from '../../../data/projects'
import SectionContainer from '../../ui/SectionContainer'
import ProjectsCarousel from './ProjectsCarousel'


export default function Projects() {
  const personalProjects = projects.filter((p) => p.category === 'personal')
  const clientProjects = projects.filter((p) => p.category === 'client')

  return (
    <SectionContainer id="projects" number="04" title="Selected work" meta="portfolio">
      <ProjectsCarousel
        heading="Personal Projects"
        projects={personalProjects}
        cardClassName={styles['card-personal']}
      />
      <ProjectsCarousel
        heading="Client Projects"
        projects={clientProjects}
        emptyMessage="No client projects to display yet."
        cardClassName={styles['card-client']}
      />
    </SectionContainer>
  )
}
