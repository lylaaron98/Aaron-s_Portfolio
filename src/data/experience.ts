import type { Experience } from '../types/experience'

export const experiences: Experience[] = [
  {
    company: 'Freelance, Remote (Singapore)',
    role: 'Software Engineer — Full Stack & Applied AI',
    startDate: 'Jan 2026',
    endDate: 'Present',
    description: [
      'Deliver proof-of-concept applications for a Japanese enterprise client, turning open-ended requirements into working demos in two to three days across computer vision, AR/VR, workforce scheduling and delivery tracking.',
      'Built an architectural drawing platform in Python and FastAPI that restores faded scanned blueprints through an OpenCV, Tesseract OCR and Claude Vision pipeline, removing the manual redrawing step.',
      'Built AR/VR prototypes in Unity, researched XR toolchains and open-source AI models that shaped client technology choices, and deployed services to AWS and Firebase.',
    ],
    tech: ['Python', 'FastAPI', 'OpenCV', 'Tesseract', 'Claude Vision', 'Unity', 'AWS', 'Firebase', 'Next.js'],
  },
  {
    company: 'Corporate Bank, Singapore',
    role: 'Full Stack Software Developer',
    startDate: 'Jul 2025',
    endDate: 'Dec 2025',
    description: [
      'Led modernisation of mission-critical treasury systems, migrating legacy VB.Net and Oracle applications to React, TypeScript, Node.js and SQL Server.',
      'Built FX workflow screens, multi-stage approvals and Node.js REST APIs for high-volume FX data, with validation for currency precision and workflow state.',
      'Created reusable hooks and components for the migration, and ran Azure DevOps pipelines through a production cutover with minimal downtime.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'Express', 'Ant Design', 'SQL Server', 'Oracle', 'VB.Net', 'Azure DevOps'],
  },
  {
    company: 'Capgemini, Singapore',
    role: 'Software Developer (Senior Software Analyst)',
    startDate: 'Jan 2025',
    endDate: 'Jul 2025',
    description: [
      'Built a real-time land bidding platform for a government agency in React, TypeScript and Node.js, with WebSockets pushing live bids to concurrent participants.',
      'Improved performance by over 30% with route-based code splitting, lazy loading and render optimisation on data-heavy bidding screens.',
      'Designed the Context API state architecture and integrated secure payments, clearing SonarQube quality gates before each release.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'WebSocket', 'Context API', 'SonarQube', 'Python', 'Streamlit'],
  },
  {
    company: 'Univers (Envision Group), Singapore',
    role: 'Frontend Software Engineer Intern',
    startDate: 'May 2024',
    endDate: 'Dec 2024',
    description: [
      'Built carbon emission and energy analytics dashboards in React and Ant Design, giving R&D engineers a live view of consumption and emissions.',
      'Refactored complex UI into reusable components and built admin screens so teams could tune monitoring without engineering help.',
    ],
    tech: ['React', 'JavaScript ES6', 'Ant Design', 'Agile'],
  },
  {
    company: 'Daiso Singapore',
    role: 'Software Developer',
    startDate: 'Nov 2023',
    endDate: 'Feb 2024',
    description: [
      'Built a full-stack internal dashboard with React, Node.js, and Microsoft SQL Server, digitizing logistics and sales workflows that previously ran on spreadsheets.',
      'Developed REST APIs for data synchronization, validation, and reporting, and designed role-based dashboards with access control so each business unit saw only its own analytics.',
    ],
    tech: ['React', 'Node.js', 'Microsoft SQL Server', 'REST APIs', 'RBAC'],
  },
  {
    company: 'International Data Corporation (IDC), Singapore',
    role: 'Custom Solutions Intern',
    startDate: 'Mar 2023',
    endDate: 'Apr 2023',
    description: [
      'Automated cleansing and aggregation of large research datasets with Python and Excel VBA.',
      'Built the interactive dashboards behind client-facing market insight deliverables.',
    ],
    tech: ['Python', 'Excel VBA', 'Data Analytics'],
  },
]
