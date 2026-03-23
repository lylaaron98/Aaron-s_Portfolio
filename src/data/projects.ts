import type { Project } from '../types/project'

export const projects: Project[] = [
  {
    title: 'AI Chatbot Assistant',
    description:
      'Intelligent support interface using Streamlit and GroqAI APIs for real-time conversational responses. Features dynamic context handling, custom parameter tuning for FAQ automation, session memory, and adjustable tone settings. Deployed as an internal prototype at Capgemini.',
    tech: ['Python', 'Streamlit', 'GroqAI', 'AI/ML'],
    github: 'https://github.com/lylaaron98/AI_Chatbot',
    live: 'https://github.com/lylaaron98/AI_Chatbot',
    featured: true,
    category: 'personal',
  },
  {
    title: 'Otodecks',
    description:
      'A fully interactive DJ deck simulator built with C++ and the JUCE framework, featuring real-time audio playback, mixing, and waveform visualization. Includes modular audio components, custom event-driven UI with responsive knobs, sliders, and cue buttons, with latency optimization for seamless track blending.',
    tech: ['C++', 'JUCE', 'Audio Processing', 'Real-time DSP'],
    github: 'https://github.com/lylaaron98/Otodecks',
    live: 'https://github.com/lylaaron98/Otodecks',
    featured: true,
    category: 'personal',
  },
  {
    title: 'MySmartHome',
    description:
      'A responsive Smart Home Web Dashboard enabling remote control and monitoring of household appliances over a network. Built with Node.js, Express.js, and SQL for device data storage, with a templated UI using EJS, CSS3, and vanilla JavaScript for dynamic appliance controls.',
    tech: ['Node.js', 'Express.js', 'SQL', 'EJS', 'JavaScript', 'REST APIs'],
    github: 'https://github.com/lylaaron98/SmartHomeApp',
    live: 'https://github.com/lylaaron98/SmartHomeApp',
    featured: true,
    category: 'personal',
  },
  {
    title: 'UX Portfolio Microsite',
    description:
      'A professional 4-page portfolio microsite for a client, who is a junior UX Designer, inspired by Apple Store aesthetics. Features a modern, glassmorphism design, responsive layout, and an interactive interview scheduling form. Built with HTML5, CSS3, JavaScript (ES6+), and Bootstrap 5. Includes advanced CSS techniques (variables, glassmorphism, gradient text, keyframe animations), semantic HTML5, accessibility, and modular JavaScript for form validation and micro-interactions. Demonstrates color theory, typography, and a component-based design system. Delivered for job application purposes to hiring managers and recruiters in the UX/design industry.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap 5', 'Bootstrap Icons', 'Google Fonts'],
    github: 'https://github.com/lylaaron98/codingo-ux-portfolio-microsite',
    live: '',
    featured: true,
    category: 'client',
    hideLiveDemoCard: true,
    images: [
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 215932.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 215944.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 215952.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 215959.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220009.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220017.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220042.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220048.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220052.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220055.png',
      '/assets/upm_portfolio_site/Screenshot 2026-03-12 220102.png',
    ],
  },
]
