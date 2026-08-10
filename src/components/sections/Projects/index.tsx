import { useMemo, useState } from 'react'
import { projects } from '../../../data/projects'
import SectionContainer from '../../ui/SectionContainer'
import ProjectsCarousel from './ProjectsCarousel'
import ProjectCardModal, { type ProjectModalState } from './ProjectCardModal'

export default function Projects() {
  // One dialog for the whole section. There used to be one mounted per rail,
  // so the page carried two portals, two Escape listeners and two scroll locks.
  const [activeProject, setActiveProject] = useState<ProjectModalState | null>(null)

  const { personal, client } = useMemo(
    () => ({
      personal: projects.filter((project) => project.category === 'personal'),
      client: projects.filter((project) => project.category === 'client'),
    }),
    [],
  )

  return (
    <SectionContainer
      id="projects"
      number="04"
      title="Selected work"
      meta="portfolio"
      lede="Client deliveries and personal builds. Open any card for the detail, or jump straight to a project's demo page."
    >
      <ProjectsCarousel heading="Client Projects" projects={client} onOpenProject={setActiveProject} />
      <ProjectsCarousel heading="Personal Projects" projects={personal} onOpenProject={setActiveProject} />

      <ProjectCardModal state={activeProject} onClosed={() => setActiveProject(null)} />
    </SectionContainer>
  )
}
