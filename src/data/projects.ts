import type { Project } from '../types/project'

export const projects: Project[] = [
  {
    title: 'E-Commerce Platform',
    description:
      'A full-stack e-commerce web application featuring product listings, cart management, secure Stripe payments, and an admin dashboard. Built with React on the frontend and a Node.js/Express REST API backed by PostgreSQL.',
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'Docker'],
    github: 'https://github.com',
    live: 'https://example.com',
    featured: true,
  },
  {
    title: 'FitTrack Mobile App',
    description:
      'Cross-platform fitness tracking mobile app with workout logging, progress charts, and personalized plans. Syncs data in real-time with Firebase and sends push notifications via Expo.',
    tech: ['React Native', 'Expo', 'Firebase', 'TypeScript', 'Redux'],
    github: 'https://github.com',
    live: 'https://example.com',
    featured: true,
  },
  {
    title: 'Task Manager Dashboard',
    description:
      'A productivity web dashboard with drag-and-drop task boards (Kanban style), team collaboration, real-time updates, and rich filtering. Built entirely in React with TypeScript and WebSockets.',
    tech: ['React', 'TypeScript', 'WebSockets', 'Node.js', 'MongoDB'],
    github: 'https://github.com',
    live: 'https://example.com',
    featured: false,
  },
  {
    title: 'Weather Now App',
    description:
      'A mobile weather application delivering real-time forecasts, interactive weather maps, severe weather alerts, and hourly/weekly breakdowns. Uses OpenWeatherMap API with location services.',
    tech: ['React Native', 'Expo', 'OpenWeatherMap API', 'Geolocation', 'TypeScript'],
    github: 'https://github.com',
    live: 'https://example.com',
    featured: false,
  },
]
