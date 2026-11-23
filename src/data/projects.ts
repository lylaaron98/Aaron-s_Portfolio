import type { Project } from '../types/project'

export const projects: Project[] = [
  {
    title: 'Property Website Builder & Agent CRM',
    summary:
      'Multi-tenant SaaS that gives Singapore property agents a branded site and a lead CRM, with listings kept current automatically.',
    highlights: [
      'Per-agent sites at their own slug with a live-preview customiser, secured by Supabase row-level security',
      'A Playwright scraper on daily cron keeps 90+ new condo launches synced with no manual entry',
      'Visitor tracking feeds a lead-scoring engine and an eight-stage Kanban pipeline',
    ],
    description:
      'A multi-tenant SaaS on Next.js and Supabase that provisions Singapore property agents a branded site at their own slug, with a live-preview customizer for section toggles, theming, and copy editing, secured by row-level security policies. A Playwright scraper on daily cron jobs keeps 90+ new condo launches synced through new-listing detection and scrape logging, so agent sites stay current without manual entry. The visitor tracking and CRM layer feeds page-view, scroll-depth, form, and WhatsApp events into a lead scoring engine and an eight-stage pipeline with Kanban and list views, alongside a blog CMS and a mobile-first redesign at a 390px primary viewport.',
    tech: ['Next.js', 'Supabase', 'TypeScript', 'Playwright', 'Row-Level Security', 'Cron Jobs', 'Tailwind CSS'],
    github: '',
    live: 'https://property-website-clone3.vercel.app',
    featured: true,
    category: 'personal',
  },
  {
    title: 'AI Architectural Drawing Platform',
    summary:
      'Restores faded scanned blueprints into clean vector plans, removing the manual redrawing step for legacy drawings.',
    highlights: [
      'Four-stage pipeline: OpenCV cleanup, Hough line extraction, Tesseract 5 OCR and Claude Vision quality checks',
      'Swappable model stages, so OCR and vision models can be benchmarked and replaced without a rewrite',
      'Shipped on Firebase with camera capture, Japanese localisation and SVG export',
    ],
    description:
      'A computer vision and OCR platform in Python and FastAPI that restores faded scanned blueprints, removing the manual redrawing step for legacy plans. The four-stage restoration pipeline runs OpenCV enhancement to strip noise and yellowing, Hough Transform line extraction for walls, centerlines, and dimension lines, Tesseract 5 LSTM OCR for dimensions and room labels, and Claude Vision analysis to classify drawing type and grade output quality. Structured as modular, swappable model stages so open-source OCR and vision models can be benchmarked and replaced without rewriting the pipeline; shipped on Firebase with upload and on-site camera capture, Japanese localization, and vector SVG export.',
    tech: ['Python', 'FastAPI', 'OpenCV', 'Hough Transform', 'Tesseract 5 LSTM', 'Claude Vision', 'Firebase'],
    github: '',
    live: 'https://wonq-drawing-poc-5337a.web.app',
    featured: true,
    category: 'client',
  },
  {
    title: 'Workforce Scheduling Platform',
    summary:
      "Scheduling app for a Japanese contractor, delivered as a deployed proof of concept inside the client's short evaluation window.",
    highlights: [
      'Managers allocate workers across job dates and maintain the employee master from one screen',
      'Fully localised in Japanese, with a language selector',
      'Mobile-first, so on-site supervisors can use it from the field',
    ],
    description:
      'A client-facing scheduling app for a Japanese contractor. Managers allocate workers across job dates and maintain an employee master record from one responsive interface, shipped fully localized in Japanese with a language selector. Delivered as a working, deployed proof-of-concept inside the client’s short evaluation window, and built mobile-first so on-site supervisors could use it from the field.',
    tech: ['React', 'TypeScript', 'i18n', 'Mobile-First', 'Vercel'],
    github: '',
    live: 'https://work-scheduling-poc.vercel.app',
    featured: true,
    category: 'client',
  },
  {
    title: 'DeFi Portfolio Dashboard',
    summary:
      'Web3 portfolio dashboard on a layered Next.js architecture built to absorb new features without rewrites. In progress: the wallet desk is live, other views are next.',
    highlights: [
      'Feature-first App Router structure with repository, service and use-case layers on Prisma',
      'Wallet connection through wagmi, RainbowKit and WalletConnect',
      'Wallet desk with balances, allocation, quick exchange and market snapshots',
    ],
    description:
      'A Web3 portfolio tracking platform built with Next.js and wagmi. Feature-first Next.js App Router architecture with repository, service, and use-case layers backed by Prisma, structured to absorb feature expansion without cross-cutting rewrites, with wallet connectivity through wagmi, RainbowKit, and WalletConnect on Tailwind CSS and Mantine UI.',
    tech: ['Next.js', 'wagmi', 'RainbowKit', 'WalletConnect', 'Prisma', 'Tailwind CSS', 'Mantine UI'],
    github: '',
    live: '',
    featured: false,
    category: 'personal',
  },
  {
    title: 'AI Chatbot Assistant',
    summary:
      'FAQ support chatbot on Groq LLM APIs, prototyped for internal support queries at Capgemini.',
    highlights: [
      'Streamlit interface with real-time responses and session memory',
      'Context handling across a conversation',
      'Tunable parameters and tone settings for FAQ automation',
    ],
    description:
      'Intelligent support interface using Streamlit and GroqAI APIs for real-time conversational responses. Features dynamic context handling, custom parameter tuning for FAQ automation, session memory, and adjustable tone settings. Deployed as an internal prototype at Capgemini.',
    tech: ['Python', 'Streamlit', 'GroqAI', 'AI/ML'],
    github: 'https://github.com/lylaaron98/AI_Chatbot',
    live: '',
    featured: false,
    category: 'personal',
  },
  {
    title: 'Lifestyle App',
    summary:
      'Local-first, cross-platform life organiser that brings spending, savings, calendar and journaling into one app.',
    highlights: [
      'Expo and React Native in a pnpm monorepo, with Expo Router and AsyncStorage persistence',
      'Expense tracking, savings pots, calendar feeds and a daily mood journal',
      'Context-aware AI assistant on Gemini or Groq, with an Express and OpenAPI backend scaffolded',
    ],
    description:
      'A local-first lifestyle management app built with Expo and React Native in a pnpm monorepo. It brings together finance tracking, savings pots, calendar integrations, daily mood journaling, profile preferences, light/dark theming, and a context-aware AI assistant powered by Gemini or Groq directly from the client, with AsyncStorage persistence and scaffolded Express, OpenAPI, and Drizzle packages ready for backend expansion.',
    tech: ['Expo', 'React Native', 'TypeScript', 'Expo Router', 'AsyncStorage', 'Gemini/Groq'],
    github: '',
    live: '',
    featured: false,
    category: 'personal',
  },
  {
    title: 'Otodecks',
    summary:
      'Two-deck DJ mixer in C++ and JUCE with real-time playback, EQ, cue points and a track library.',
    highlights: [
      'Real-time audio playback, mixing and waveform display',
      'Custom event-driven UI: knobs, sliders, cue and loop controls',
      'Latency tuning for smooth track blending',
    ],
    description:
      'A fully interactive DJ deck simulator built with C++ and the JUCE framework, featuring real-time audio playback, mixing, and waveform visualization. Includes modular audio components, custom event-driven UI with responsive knobs, sliders, and cue buttons, with latency optimization for seamless track blending.',
    tech: ['C++', 'JUCE', 'Audio Processing', 'Real-time DSP'],
    github: 'https://github.com/lylaaron98/Otodecks',
    live: '',
    featured: false,
    category: 'personal',
  },
  {
    title: 'MySmartHome',
    summary:
      'Web dashboard for monitoring and controlling household devices over a network.',
    highlights: [
      'Node.js and Express REST API with SQL storage for device data',
      'Complete add, update and delete flows for devices, with confirmations',
      'Server-rendered EJS interface with vanilla JavaScript controls',
    ],
    description:
      'A responsive Smart Home Web Dashboard enabling remote control and monitoring of household appliances over a network. Built with Node.js, Express.js, and SQL for device data storage, with a templated UI using EJS, CSS3, and vanilla JavaScript for dynamic appliance controls.',
    tech: ['Node.js', 'Express.js', 'SQL', 'EJS', 'JavaScript', 'REST APIs'],
    github: 'https://github.com/lylaaron98/SmartHomeApp',
    live: '',
    featured: false,
    category: 'personal',
  },
  {
    title: 'Django E-Learning App',
    summary:
      'E-learning platform with separate student and teacher roles, course enrolment and real-time chat.',
    highlights: [
      'Custom student and teacher authentication, course creation and enrolment',
      'Course materials, feedback and REST endpoints with Django REST Framework',
      'Live chat over Django Channels and WebSockets',
    ],
    description:
      'A Django 5.1 eLearning platform with custom student and teacher authentication, course creation and enrollment workflows, downloadable course materials, enrollment-based feedback, REST API endpoints, and real-time chat powered by Django Channels and WebSockets.',
    tech: ['Python', 'Django 5.1', 'Django REST Framework', 'Django Channels', 'WebSockets', 'SQLite', 'Bootstrap 5'],
    github: '',
    live: '',
    featured: false,
    category: 'personal',
  },
  {
    title: 'Restaurant POS System',
    summary:
      'Point-of-sale system for a restaurant client, with dedicated waiter, kitchen, cashier and manager workflows.',
    highlights: [
      'Live table status, order management and a kitchen queue',
      'Payments and manager analytics behind JWT role-based access',
      'Tested React and Express codebase with Zustand and Ant Design',
    ],
    description:
      'A modern restaurant Point of Sale platform built for a client with role-based workflows for waiters, kitchen staff, cashiers, and managers. It includes live table status tracking, order management, kitchen queue updates, payment processing, manager analytics, JWT authentication, and a tested React plus Express architecture.',
    tech: ['React', 'TypeScript', 'Express.js', 'MongoDB', 'Zustand', 'Ant Design'],
    github: 'https://github.com/lylaaron98/codingo_projects/tree/main/restaurant-pos',
    live: '',
    featured: true,
    category: 'client',
    hideLiveDemoCard: true,
  },
  {
    title: 'UX Portfolio Microsite',
    summary:
      'Four-page portfolio site for a junior UX designer, built to support their job applications.',
    highlights: [
      'Apple Store-inspired glassmorphism design system built on CSS variables',
      'Interview scheduling form with modular JavaScript validation',
      'Semantic, accessible and responsive HTML5 with Bootstrap 5',
    ],
    description:
      'A professional 4-page portfolio microsite for a client, who is a junior UX Designer, inspired by Apple Store aesthetics. Features a modern, glassmorphism design, responsive layout, and an interactive interview scheduling form. Built with HTML5, CSS3, JavaScript (ES6+), and Bootstrap 5. Includes advanced CSS techniques (variables, glassmorphism, gradient text, keyframe animations), semantic HTML5, accessibility, and modular JavaScript for form validation and micro-interactions. Demonstrates color theory, typography, and a component-based design system. Delivered for job application purposes to hiring managers and recruiters in the UX/design industry.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5', 'Bootstrap Icons', 'Google Fonts'],
    github: 'https://github.com/lylaaron98/codingo-ux-portfolio-microsite',
    live: '',
    featured: false,
    category: 'client',
    hideLiveDemoCard: true,
    images: [
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 215932.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 215944.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 215952.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 215959.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220009.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220017.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220042.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220048.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220052.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220055.webp',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220102.webp',
    ],
  },
]
