/**
 * Media catalogue for the project demo pages.
 *
 * Extracted from DemoPage.tsx, which was 569 lines of which ~340 were this.
 * Videos stream from GitHub LFS media; those URLs resolve against the
 * repository path, so the .mp4 files must stay under public/assets in git
 * even though vite.config.ts strips them from the build output.
 */
import type { ChromaItem } from '../components/ui/ChromaGrid/ChromaGrid'
import type { Project } from '../types/project'

export type ProjectTheme = {
  borderColor: string
  gradient: string
}

export type ProjectMedia = {
  src: string
  fallbackSrc?: string
  title: string
  subtitle: string
  isVideo?: boolean
}

const GITHUB_LFS_MEDIA_BASE = 'https://media.githubusercontent.com/media/lylaaron98/Aaron-s_Portfolio/main'

function createHostedVideoSrc(assetPath: string) {
  return encodeURI(`${GITHUB_LFS_MEDIA_BASE}/public${assetPath}`)
}

export const projectThemes: Record<string, ProjectTheme> = {
  'Property Website Builder & Agent CRM': {
    borderColor: '#eab308',
    gradient: 'linear-gradient(155deg, #854d0e, #020617 72%)',
  },
  'AI Architectural Drawing Platform': {
    borderColor: '#a78bfa',
    gradient: 'linear-gradient(155deg, #4c1d95, #020617 72%)',
  },
  'Workforce Scheduling Platform': {
    borderColor: '#60a5fa',
    gradient: 'linear-gradient(155deg, #1e3a8a, #020617 72%)',
  },
  'DeFi Portfolio Dashboard': {
    borderColor: '#4ade80',
    gradient: 'linear-gradient(155deg, #14532d, #020617 72%)',
  },
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
  'Lifestyle App': {
    borderColor: '#2dd4bf',
    gradient: 'linear-gradient(155deg, #115e59, #1e1b4b 72%)',
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
    src: encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211044.webp'),
    title: 'Assistant Home',
    subtitle: 'Landing state with the main controls and streamlined chat entry point.',
  },
  {
    src: encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211104.webp'),
    title: 'Conversation View',
    subtitle: 'Active chat flow showing the assistant response area and prompt history.',
  },
  {
    src: encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211555.webp'),
    title: 'Prompt Settings',
    subtitle: 'Configuration panel for tuning the assistant prompt behavior.',
  },
  {
    src: encodeURI('/assets/ai_chatbot_assistant/Screenshot 2026-03-12 211604.webp'),
    title: 'Response Controls',
    subtitle: 'Adjustable response settings for tone, context, and generation flow.',
  },
]

const otodecksGallery: ProjectMedia[] = [
  {
    src: createHostedVideoSrc('/assets/otodecks/Screen Recording 2026-03-02 144811.mp4'),
    title: 'Demo Recording 1',
    subtitle: 'First Otodecks app demo walkthrough.',
    isVideo: true,
  },
  {
    src: createHostedVideoSrc('/assets/otodecks/Screen Recording 2026-03-05 180152.mp4'),
    title: 'Demo Recording 2',
    subtitle: 'Second Otodecks app demo walkthrough.',
    isVideo: true,
  },
]

const smarthomeGallery: ProjectMedia[] = [
  {
    src: encodeURI('/assets/smarthome/radiodash.webp'),
    title: 'Dashboard Overview',
    subtitle: 'Main dashboard for monitoring connected smart-home devices.',
  },
  {
    src: encodeURI('/assets/smarthome/radiostatus.webp'),
    title: 'Device Status',
    subtitle: 'Live status view for a connected radio device.',
  },
  {
    src: encodeURI('/assets/smarthome/addradiodeviceexample.webp'),
    title: 'Add Device Example',
    subtitle: 'Guided form flow for adding a new radio device to the network.',
  },
  {
    src: encodeURI('/assets/smarthome/radioadd.webp'),
    title: 'Add Radio',
    subtitle: 'Input screen for configuring a new radio endpoint.',
  },
  {
    src: encodeURI('/assets/smarthome/radioaddnotify.webp'),
    title: 'Add Confirmation',
    subtitle: 'Success feedback after a new radio device is created.',
  },
  {
    src: encodeURI('/assets/smarthome/updateradio.webp'),
    title: 'Edit Device',
    subtitle: 'Update flow for changing radio device configuration.',
  },
  {
    src: encodeURI('/assets/smarthome/updateradio2.webp'),
    title: 'Update Details',
    subtitle: 'Secondary edit state with more detailed device settings.',
  },
  {
    src: encodeURI('/assets/smarthome/updatedradio.webp'),
    title: 'Updated Device',
    subtitle: 'Updated radio card after a successful settings change.',
  },
  {
    src: encodeURI('/assets/smarthome/deleteradioconfirm.webp'),
    title: 'Delete Confirm',
    subtitle: 'Confirmation step before removing a radio device.',
  },
  {
    src: encodeURI('/assets/smarthome/deletedradio.webp'),
    title: 'Delete Result',
    subtitle: 'State after a radio device has been removed.',
  },
]

const restaurantPosGallery: ProjectMedia[] = [
  {
    src: createHostedVideoSrc('/assets/restaurant_pos/Screen Recording 2026-02-27 122053.mp4'),
    title: 'Restaurant POS Demo',
    subtitle: 'Walkthrough of the waiter, kitchen, cashier, and manager flows in the POS app.',
    isVideo: true,
  },
]

const djangoElearningGallery: ProjectMedia[] = [
  {
    src: createHostedVideoSrc('/assets/django_elearning_app/Screen Recording 2024-09-09 143026.mp4'),
    title: 'Django E-Learning Demo',
    subtitle:
      'Walkthrough of the student, teacher, course management, and chat experiences in the Django platform.',
    isVideo: true,
  },
]

const propertyBuilderGallery: ProjectMedia[] = [
  {
    src: encodeURI('/assets/property_website_builder/landing-hero.webp'),
    title: 'Builder Landing',
    subtitle: 'Marketing entry point for the agent website builder, with live condo launch data behind it.',
  },
  {
    src: encodeURI('/assets/property_website_builder/features.webp'),
    title: 'Feature Overview',
    subtitle: 'Instant subdomain deployment, daily-synced listing data, and per-agent theming controls.',
  },
]

const workforceSchedulingGallery: ProjectMedia[] = [
  {
    src: encodeURI('/assets/workforce_scheduling/schedule-calendar.webp'),
    title: 'Schedule Calendar',
    subtitle: 'Date-based worker allocation across job dates, localized in Japanese for on-site supervisors.',
  },
  {
    src: encodeURI('/assets/workforce_scheduling/employee-master.webp'),
    title: 'Employee Master',
    subtitle: 'Employee master record management feeding the scheduling assignments.',
  },
]

export const fallbackTheme: ProjectTheme = {
  borderColor: '#94a3b8',
  gradient: 'linear-gradient(155deg, #334155, #020617 72%)',
}

export const mediaByProjectTitle: Record<string, ProjectMedia[]> = {
  'Property Website Builder & Agent CRM': propertyBuilderGallery,
  'Workforce Scheduling Platform': workforceSchedulingGallery,
  'AI Chatbot Assistant': aiGallery,
  Otodecks: otodecksGallery,
  MySmartHome: smarthomeGallery,
  'Django E-Learning App': djangoElearningGallery,
  'Restaurant POS System': restaurantPosGallery,
}

export function createProjectArt(projectTitle: string, label: string, accent: string) {
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

export function buildGalleryItems(project: Project, theme: ProjectTheme): ChromaItem[] {
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
      fallbackImage: item.fallbackSrc,
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

export function buildProjectItems(project: Project): ChromaItem[] {
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
