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
  },
  {
    title: 'Otodecks',
    description:
      'A fully interactive DJ deck simulator built with C++ and the JUCE framework, featuring real-time audio playback, mixing, and waveform visualization. Includes modular audio components, custom event-driven UI with responsive knobs, sliders, and cue buttons, with latency optimization for seamless track blending.',
    tech: ['C++', 'JUCE', 'Audio Processing', 'Real-time DSP'],
    github: 'https://github.com/lylaaron98/Otodecks',
    live: 'https://github.com/lylaaron98/Otodecks',
    featured: true,
  },
  {
    title: 'MySmartHome',
    description:
      'A responsive Smart Home Web Dashboard enabling remote control and monitoring of household appliances over a network. Built with Node.js, Express.js, and SQL for device data storage, with a templated UI using EJS, CSS3, and vanilla JavaScript for dynamic appliance controls.',
    tech: ['Node.js', 'Express.js', 'SQL', 'EJS', 'JavaScript', 'REST APIs'],
    github: 'https://github.com/lylaaron98/SmartHomeApp',
    live: 'https://github.com/lylaaron98/SmartHomeApp',
    featured: true,
  },
  {
    title: 'G4Met',
    description:
      'A full-stack gamer matchmaking web app connecting gamers based on skill level, preferred genres, and region. Features secure user authentication with bcrypt, relational SQL schema for user profiles and matchmaking algorithms, and clean RESTful API design.',
    tech: ['Express.js', 'PUG', 'SQL', 'bcrypt', 'Node.js'],
    github: 'https://github.com/lylaaron98/G4Met',
    live: 'https://github.com/lylaaron98/G4Met',
    featured: false,
  },
]
