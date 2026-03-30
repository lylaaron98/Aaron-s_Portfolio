import { useState } from 'react'
import ShinyText from '../../ui/ShinyText'
import ScrollToTop from '../../ui/ScrollToTop'
import ChromaGrid, { type ChromaItem } from '../../ui/ChromaGrid/ChromaGrid'
import { projects } from '../../../data/projects'
import type { Project } from '../../../types/project'
import Galaxy from './Galaxy'

type ProjectTheme = {
  borderColor: string
  gradient: string
}

type ProjectMedia = {
  src: string
  title: string
  subtitle: string
  isVideo?: boolean
}

const projectThemes: Record<string, ProjectTheme> = {
  'AI Chatbot Assistant': {
    borderColor: '#34d399',
    gradient: 'linear-gradient(155deg, #0f766e, #020617 72%)',
  },
  Otodecks: {
    borderColor: '#f97316',
    gradient: 'linear-gradient(155deg, #9a3412, #020617 70%)',
  },
  MySmartHome: {
    borderColor: '#38bdf8',
    gradient: 'linear-gradient(155deg, #0f4c81, #020617 72%)',
  },
  'Django E-Learning App': {
    borderColor: '#22c55e',
    gradient: 'linear-gradient(155deg, #166534, #020617 72%)',
  },
  'UX Portfolio Microsite': {
    borderColor: '#f59e0b',
    gradient: 'linear-gradient(155deg, #7c2d12, #111827 72%)',
  },
  'Restaurant POS System': {
    borderColor: '#fb7185',
    gradient: 'linear-gradient(155deg, #7f1d1d, #111827 72%)',
  },
}

const aiGallery: ProjectMedia[] = [
  {
    src: encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211044.png'),
    title: 'Assistant Home',
    subtitle: 'Landing state with the main controls and streamlined chat entry point.',
  },
  {
    src: encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211104.png'),
    title: 'Conversation View',
    subtitle: 'Active chat flow showing the assistant response area and prompt history.',
  },
  {
    src: encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211555.png'),
    title: 'Prompt Settings',
    subtitle: 'Configuration panel for tuning the assistant prompt behavior.',
  },
  {
    src: encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211604.png'),
    title: 'Response Controls',
    subtitle: 'Adjustable response settings for tone, context, and generation flow.',
  },
]

const otodecksGallery: ProjectMedia[] = [
  {
    src: encodeURI('/assets/otodecks/Screen Recording 2026-03-02 144811.mp4'),
    title: 'Demo Recording 1',
    subtitle: 'First Otodecks app demo walkthrough.',
    isVideo: true,
  },
  {
    src: encodeURI('/assets/otodecks/Screen Recording 2026-03-05 180152.mp4'),
    title: 'Demo Recording 2',
    subtitle: 'Second Otodecks app demo walkthrough.',
    isVideo: true,
  },
]

const smarthomeGallery: ProjectMedia[] = [
  {
    src: encodeURI('/assets/smarthome/radiodash.png'),
    title: 'Dashboard Overview',
    subtitle: 'Main dashboard for monitoring connected smart-home devices.',
  },
  {
    src: encodeURI('/assets/smarthome/radiostatus.png'),
    title: 'Device Status',
    subtitle: 'Live status view for a connected radio device.',
  },
  {
    src: encodeURI('/assets/smarthome/addradiodeviceexample.png'),
    title: 'Add Device Example',
    subtitle: 'Guided form flow for adding a new radio device to the network.',
  },
  {
    src: encodeURI('/assets/smarthome/radioadd.png'),
    title: 'Add Radio',
    subtitle: 'Input screen for configuring a new radio endpoint.',
  },
  {
    src: encodeURI('/assets/smarthome/radioaddnotify.png'),
    title: 'Add Confirmation',
    subtitle: 'Success feedback after a new radio device is created.',
  },
  {
    src: encodeURI('/assets/smarthome/updateradio.png'),
    title: 'Edit Device',
    subtitle: 'Update flow for changing radio device configuration.',
  },
  {
    src: encodeURI('/assets/smarthome/updateradio2.png'),
    title: 'Update Details',
    subtitle: 'Secondary edit state with more detailed device settings.',
  },
  {
    src: encodeURI('/assets/smarthome/updatedradio.png'),
    title: 'Updated Device',
    subtitle: 'Updated radio card after a successful settings change.',
  },
  {
    src: encodeURI('/assets/smarthome/deleteradioconfirm.png'),
    title: 'Delete Confirm',
    subtitle: 'Confirmation step before removing a radio device.',
  },
  {
    src: encodeURI('/assets/smarthome/deletedradio.png'),
    title: 'Delete Result',
    subtitle: 'State after a radio device has been removed.',
  },
]

const restaurantPosGallery: ProjectMedia[] = [
  {
    src: encodeURI('/assets/restaurant_pos/Screen Recording 2026-02-27 122053.mp4'),
    title: 'Restaurant POS Demo',
    subtitle: 'Walkthrough of the waiter, kitchen, cashier, and manager flows in the POS app.',
    isVideo: true,
  },
]

const djangoElearningGallery: ProjectMedia[] = [
  {
    src: encodeURI('/assets/django_elearning_app/Screen Recording 2024-09-09 143026.mp4'),
    title: 'Django E-Learning Demo',
    subtitle:
      'Walkthrough of the student, teacher, course management, and chat experiences in the Django platform.',
    isVideo: true,
  },
]

const fallbackTheme: ProjectTheme = {
  borderColor: '#94a3b8',
  gradient: 'linear-gradient(155deg, #334155, #020617 72%)',
}

const mediaByProjectTitle: Record<string, ProjectMedia[]> = {
  'AI Chatbot Assistant': aiGallery,
  Otodecks: otodecksGallery,
  MySmartHome: smarthomeGallery,
  'Django E-Learning App': djangoElearningGallery,
  'Restaurant POS System': restaurantPosGallery,
}

function createProjectArt(projectTitle: string, label: string, accent: string) {
  const initials = projectTitle
    .split(/\s+/)
    .map((word) => word[0] ?? '')
    .join('')
    .slice(0, 3)
    .toUpperCase()

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>
      <rect width="1200" height="750" rx="42" fill="url(#bg)" />
      <circle cx="220" cy="155" r="100" fill="rgba(255,255,255,0.08)" />
      <circle cx="998" cy="118" r="72" fill="rgba(255,255,255,0.08)" />
      <circle cx="930" cy="610" r="136" fill="rgba(255,255,255,0.08)" />
      <text x="86" y="440" fill="white" font-family="Arial, sans-serif" font-size="208" font-weight="700">${initials}</text>
      <text x="90" y="536" fill="white" font-family="Arial, sans-serif" font-size="62" font-weight="700">${label}</text>
      <text x="92" y="610" fill="rgba(255,255,255,0.72)" font-family="Arial, sans-serif" font-size="42">${projectTitle}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function formatExternalLocation(url: string | undefined, fallback: string) {
  return url ? url.replace(/^https?:\/\//, '') : fallback
}

function buildGalleryItems(project: Project, theme: ProjectTheme): ChromaItem[] {
  if (project.images?.length) {
    return project.images.map((image, index) => ({
      image,
      title: `Screenshot ${index + 1}`,
      subtitle:
        project.title === 'UX Portfolio Microsite'
          ? 'UX Portfolio Microsite screenshot from the upm_portfolio_site gallery.'
          : `${project.title} screenshot`,
      handle: `Gallery ${index + 1}`,
      location: `${project.title} gallery`,
      borderColor: theme.borderColor,
      gradient: theme.gradient,
      previewable: true,
    }))
  }

  const projectMedia = mediaByProjectTitle[project.title]
  if (projectMedia?.length) {
    return projectMedia.map((item, index) => ({
      image: item.src,
      title: item.title,
      subtitle: item.subtitle,
      handle: `Gallery ${index + 1}`,
      location: item.isVideo ? `${project.title} demo video` : `${project.title} gallery`,
      borderColor: theme.borderColor,
      gradient: theme.gradient,
      isVideo: item.isVideo,
      previewable: !item.isVideo,
    }))
  }

  return [
    {
      image: createProjectArt(project.title, 'Gallery', theme.borderColor),
      title: 'Gallery',
      subtitle: 'Project screenshots can be added here when assets are ready.',
      handle: 'Visuals',
      location: 'No local screenshots added yet',
      borderColor: theme.borderColor,
      gradient: theme.gradient,
      previewable: false,
    },
  ]
}

function buildProjectItems(project: Project): ChromaItem[] {
  const theme = projectThemes[project.title] ?? fallbackTheme
  const galleryItems = buildGalleryItems(project, theme)
  const actionItems: ChromaItem[] = []

  if (!project.hideLiveDemoCard) {
    actionItems.push({
      image: createProjectArt(project.title, 'Live', theme.borderColor),
      title: 'Live Demo',
      subtitle: project.live
        ? 'Open the deployed build or shared walkthrough for this project.'
        : 'This demo is shared privately or has not been published yet.',
      handle: 'Demo',
      location: formatExternalLocation(project.live, 'Shared privately'),
      borderColor: theme.borderColor,
      gradient: theme.gradient,
      url: project.live || undefined,
      previewable: false,
    })
  }

  actionItems.push({
      image: createProjectArt(project.title, 'Source', theme.borderColor),
      title: 'Repository',
      subtitle: project.github
        ? 'Open the source repository for implementation details and commit history.'
        : 'Repository access is private for this project.',
      handle: 'Code',
      location: formatExternalLocation(project.github, 'Private repository'),
      borderColor: theme.borderColor,
      gradient: theme.gradient,
      url: project.github || undefined,
      previewable: false,
    })

  return [...galleryItems, ...actionItems]
}

function DemoPage() {
  const [activeProjectTitle, setActiveProjectTitle] = useState(projects[0]?.title ?? '')
  const [modalImg, setModalImg] = useState<string | null>(null)
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined)
  const projectGroups = [
    {
      title: 'Side Projects',
      projects: projects.filter((project) => project.category === 'personal'),
    },
    {
      title: 'Client Projects',
      projects: projects.filter((project) => project.category === 'client'),
    },
  ]

  const closeModal = () => {
    setModalImg(null)
    setModalTitle(undefined)
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '2rem', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Galaxy />
      </div>
      <ScrollToTop />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1320, margin: '0 auto' }}>
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
          <span aria-hidden="true">&larr;</span>
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

        {projectGroups.map((group, groupIndex) => (
          <div key={group.title} style={{ marginTop: groupIndex === 0 ? '2rem' : '3.5rem' }}>
            <h2
              style={{
                margin: '0 0 1.5rem',
                color: '#bfc4cf',
                fontSize: '1.45rem',
                letterSpacing: '0.04em',
              }}
            >
              {group.title}
            </h2>

            {group.projects.map((project, index) => {
              const theme = projectThemes[project.title] ?? fallbackTheme
              const isOpen = activeProjectTitle === project.title
              const projectItems = buildProjectItems(project)

              return (
                <section
                  key={project.title}
                  style={{
                    marginTop: index === 0 ? 0 : '2.5rem',
                    marginBottom: '2.5rem',
                    padding: '2rem',
                    borderRadius: 24,
                    border: `1px solid ${theme.borderColor}33`,
                    background: 'rgba(10, 15, 28, 0.78)',
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.24)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveProjectTitle(isOpen ? '' : project.title)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: '2rem',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      marginBottom: isOpen ? '1.5rem' : 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`project-demo-${groupIndex}-${index}`}
                  >
                    <span>{project.title}</span>
                    <span style={{ fontSize: '1.5rem', marginLeft: 8 }}>{isOpen ? '-' : '+'}</span>
                  </button>

                  {isOpen && (
                    <div id={`project-demo-${groupIndex}-${index}`}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          flexWrap: 'wrap',
                          marginBottom: '1.5rem',
                        }}
                      >
                        <p style={{ maxWidth: 760, color: '#bfc4cf', margin: 0 }}>{project.description}</p>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            justifyContent: 'flex-end',
                          }}
                        >
                          {project.tech.map((tech) => (
                            <span
                              key={tech}
                              style={{
                                borderRadius: 999,
                                border: `1px solid ${theme.borderColor}66`,
                                color: '#d8deea',
                                background: 'rgba(15, 23, 42, 0.72)',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.8rem',
                                letterSpacing: '0.04em',
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <ChromaGrid
                        items={projectItems}
                        columns={3}
                        rows={Math.max(2, Math.ceil(projectItems.length / 3))}
                        radius={240}
                        damping={0.45}
                        fadeOut={0.6}
                        ease="power3.out"
                        onImageClick={(image, title) => {
                          setModalImg(image)
                          setModalTitle(title)
                        }}
                      />
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        ))}

        {modalImg && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={closeModal}
          >
            <img
              src={modalImg}
              alt={modalTitle || 'Project screenshot'}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: 16,
                boxShadow: '0 8px 40px #000',
                background: '#18181b',
              }}
              onClick={(event) => event.stopPropagation()}
            />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                closeModal()
              }}
              style={{
                position: 'fixed',
                top: 32,
                right: 48,
                fontSize: 32,
                color: '#fff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                zIndex: 10001,
              }}
              aria-label="Close image preview"
            >
              x
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DemoPage
