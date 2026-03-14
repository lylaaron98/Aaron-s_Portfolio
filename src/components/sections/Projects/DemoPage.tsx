// SmartHome gallery: screenshots
const smarthomeGallery = [
  { src: encodeURI('/assets/smarthome/1.png'), title: 'Dashboard', subtitle: 'SmartHome dashboard overview.' },
  { src: encodeURI('/assets/smarthome/2.png'), title: 'Device List', subtitle: 'List of connected devices.' },
  { src: encodeURI('/assets/smarthome/3.png'), title: 'Add Device', subtitle: 'Adding a new device to the system.' },
  { src: encodeURI('/assets/smarthome/4.png'), title: 'Device Details', subtitle: 'Detailed view of a device.' },
  { src: encodeURI('/assets/smarthome/5.png'), title: 'Edit Device', subtitle: 'Editing device information.' },
  { src: encodeURI('/assets/smarthome/6.png'), title: 'Notifications', subtitle: 'Device notification example.' },
  { src: encodeURI('/assets/smarthome/7.png'), title: 'Project Structure', subtitle: 'Project folder structure.' },
  { src: encodeURI('/assets/smarthome/addradiodeviceexample.png'), title: 'Add Radio Device', subtitle: 'Adding a radio device.' },
  { src: encodeURI('/assets/smarthome/radioadd.png'), title: 'Radio Add', subtitle: 'Radio add screen.' },
  { src: encodeURI('/assets/smarthome/radioaddnotify.png'), title: 'Radio Add Notification', subtitle: 'Notification after adding radio.' },
  { src: encodeURI('/assets/smarthome/radiodash.png'), title: 'Radio Dashboard', subtitle: 'Dashboard for radio devices.' },
  { src: encodeURI('/assets/smarthome/radiostatus.png'), title: 'Radio Status', subtitle: 'Status of radio devices.' },
  { src: encodeURI('/assets/smarthome/updateradio.png'), title: 'Update Radio', subtitle: 'Updating radio device.' },
  { src: encodeURI('/assets/smarthome/updateradio2.png'), title: 'Update Radio 2', subtitle: 'Another update radio screen.' },
  { src: encodeURI('/assets/smarthome/updatedradio.png'), title: 'Updated Radio', subtitle: 'Radio device updated.' },
  { src: encodeURI('/assets/smarthome/deleteradioconfirm.png'), title: 'Delete Radio Confirm', subtitle: 'Confirm radio device deletion.' },
  { src: encodeURI('/assets/smarthome/deletedradio.png'), title: 'Deleted Radio', subtitle: 'Radio device deleted.' },
]
import ShinyText from '../../ui/ShinyText'
import ScrollToTop from '../../ui/ScrollToTop'
import ChromaGrid, { type ChromaItem } from '../../ui/ChromaGrid/ChromaGrid'
import { projects } from '../../../data/projects'
import type { Project } from '../../../types/project'
import Galaxy from './Galaxy'

const projectThemes: Record<string, { borderColor: string; gradient: string }> = {
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
  G4Met: {
    borderColor: '#c084fc',
    gradient: 'linear-gradient(155deg, #581c87, #020617 72%)',
  },
}

const otodecksGallery = [
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

const aiGallery = [
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

function createProjectArt(projectTitle: string, label: string, accent: string) {
  const initials = projectTitle
    .split(/\s+/)
    .map((word) => word[0])
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

function buildProjectItems(project: Project): ChromaItem[] {
  const theme = projectThemes[project.title] ?? {
    borderColor: '#94a3b8',
    gradient: 'linear-gradient(155deg, #334155, #020617 72%)',
  }

  const baseItems: ChromaItem[] = [
    {
      image:
        project.title === 'AI Chatbot Assistant'
          ? aiGallery[0].src
          : createProjectArt(project.title, 'Overview', theme.borderColor),
      title: 'Description',
      subtitle: project.description,
      handle: 'Overview',
      location: project.featured ? 'Featured project' : 'Project archive',
      borderColor: theme.borderColor,
      gradient: theme.gradient,
    },
    {
      image: createProjectArt(project.title, 'Video', theme.borderColor),
      title: 'Video',
      subtitle: 'Demo video placeholder. Add a hosted walkthrough when it is ready.',
      handle: 'Media',
      location: 'Ready for embed or external demo link',
      borderColor: theme.borderColor,
      gradient: theme.gradient,
      url: project.live,
    },
    {
      image: createProjectArt(project.title, 'Stack', theme.borderColor),
      title: 'Tech Stack',
      subtitle: project.tech.join(', '),
      handle: 'Build',
      location: `${project.tech.length} technologies`,
      borderColor: theme.borderColor,
      gradient: theme.gradient,
    },
    {
      image: createProjectArt(project.title, 'Source', theme.borderColor),
      title: 'Repository',
      subtitle: 'Open the source repository for implementation details and code history.',
      handle: 'Link',
      location: project.github.replace(/^https?:\/\//, ''),
      borderColor: theme.borderColor,
      gradient: theme.gradient,
      url: project.github,
    },
  ]



  if (project.title === 'Otodecks') {
    // Show Otodecks demo videos in the gallery
    const galleryItems: ChromaItem[] = otodecksGallery.map((item, index) => ({
      image: item.src,
      title: item.title,
      subtitle: item.subtitle,
      handle: `Gallery ${index + 1}`,
      location: 'Otodecks demo video',
      borderColor: theme.borderColor,
      gradient: theme.gradient,
      isVideo: true,
    }))
    return [baseItems[0], ...galleryItems, baseItems[1], baseItems[2], baseItems[3]]
  }

  if (project.title === 'MySmartHome') {
    // Show SmartHome screenshots in the gallery
    const galleryItems: ChromaItem[] = smarthomeGallery.map((item, index) => ({
      image: item.src,
      title: item.title,
      subtitle: item.subtitle,
      handle: `Gallery ${index + 1}`,
      location: 'SmartHome screenshot',
      borderColor: theme.borderColor,
      gradient: theme.gradient,
    }))
    return [baseItems[0], ...galleryItems, baseItems[1], baseItems[2], baseItems[3]]
  }

  if (project.title !== 'AI Chatbot Assistant') {
    return [
      baseItems[0],
      {
        image: createProjectArt(project.title, 'Gallery', theme.borderColor),
        title: 'Gallery',
        subtitle: 'Project screenshots can be added here when you have assets ready.',
        handle: 'Visuals',
        location: 'No local screenshots added yet',
        borderColor: theme.borderColor,
        gradient: theme.gradient,
      },
      baseItems[1],
      baseItems[2],
      baseItems[3],
    ]
  }

  const galleryItems: ChromaItem[] = aiGallery.map((image, index) => ({
    image: image.src,
    title: image.title,
    subtitle: image.subtitle,
    handle: `Gallery ${index + 1}`,
    location: 'AI Chatbot Assistant screenshot',
    borderColor: theme.borderColor,
    gradient: theme.gradient,
  }))

  return [baseItems[0], ...galleryItems, baseItems[1], baseItems[2], baseItems[3]]
}

export default function DemoPage() {
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
        {projects.map((project, idx) => {
          const theme = projectThemes[project.title] ?? {
            borderColor: '#94a3b8',
            gradient: 'linear-gradient(155deg, #334155, #020617 72%)',
          }

          return (
            <section
              key={project.title}
              style={{
                marginTop: idx === 0 ? '2.5rem' : 0,
                marginBottom: '2.5rem',
                padding: '2rem',
                borderRadius: 24,
                border: `1px solid ${theme.borderColor}33`,
                background: 'rgba(10, 15, 28, 0.78)',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.24)',
                backdropFilter: 'blur(10px)',
              }}
            >
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
                <div>
                  <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>{project.title}</h2>
                  <p style={{ maxWidth: 760, color: '#bfc4cf' }}>
                    {project.description}
                  </p>
                </div>
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
                items={buildProjectItems(project)}
                columns={3}
                rows={2}
                radius={240}
                damping={0.45}
                fadeOut={0.6}
                ease="power3.out"
              />
            </section>
          )
        })}
      </div>
    </div>
  )
}
