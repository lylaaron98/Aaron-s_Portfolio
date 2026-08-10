import type { Experience } from '../types/experience'

export const experiences: Experience[] = [
  {
    company: 'Freelance, Remote (Singapore)',
    role: 'Software Engineer — Full Stack & Applied AI',
    startDate: 'Jan 2026',
    endDate: 'Present',
    description: [
      'Deliver proof-of-concept applications for WONQ, a Japanese enterprise client, turning open-ended requirements into working demos in two to three days across computer vision, AR/VR, workforce scheduling, and delivery tracking.',
      'Built an architectural drawing enhancement platform in Python and FastAPI that restores faded scanned blueprints through an OpenCV, Tesseract OCR, and Claude Vision pipeline, removing the manual redrawing step for legacy plans.',
      'Developed AR/VR prototypes in Unity for enterprise visualization, and ran the supporting research into XR toolchains and open-source AI model selection that shaped client technology decisions.',
      'Deployed services to AWS and Firebase with Hugging Face model hosting, designed ERD diagrams and normalized schemas from client business rules, and prototyped in Figma to settle scope early.',
    ],
    tech: ['Python', 'FastAPI', 'OpenCV', 'Tesseract', 'Claude Vision', 'Unity', 'AWS', 'Firebase', 'Next.js'],
  },
  {
    company: 'Mizuho Bank, Singapore',
    role: 'Full Stack Software Developer',
    startDate: 'Jul 2025',
    endDate: 'Dec 2025',
    description: [
      'Led modernization of mission-critical treasury systems, migrating legacy VB.Net and Oracle applications to a React, TypeScript, Node.js, and SQL Server architecture.',
      'Built modular frontend systems with React, TypeScript, and Ant Design supporting FX workflows, multi-stage approval pipelines, and data-intensive enterprise screens.',
      'Designed REST APIs in Node.js and Express for high-volume FX transaction data, with validation covering currency precision, referential integrity, and multi-step workflow state.',
      'Established reusable frontend patterns through custom hooks and component abstraction, cutting duplicated logic and holding UI behavior consistent as new modules were migrated.',
      'Managed Azure DevOps pipelines covering application deployment and database release management, cutting over to production with minimal downtime.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'Express', 'Ant Design', 'SQL Server', 'Oracle', 'VB.Net', 'Azure DevOps'],
  },
  {
    company: 'Capgemini, Singapore',
    role: 'Software Developer (Senior Software Analyst)',
    startDate: 'Jan 2025',
    endDate: 'Jul 2025',
    description: [
      'Built a real-time land bidding platform for JTC (Jurong Town Corporation) using React, TypeScript, and Node.js, with WebSocket infrastructure pushing live bid updates to concurrent participants.',
      'Improved application performance by over 30% through route-based code splitting, lazy loading, and render optimization on data-heavy bidding screens.',
      'Designed the client state management architecture with React Context API, replacing prop drilling with a predictable data flow across bidding, listing, and account views.',
      'Integrated secure payment workflows and backend services to keep bid and transaction state consistent under concurrent load, and cleared SonarQube reliability and maintainability gates ahead of each release.',
      'Prototyped an AI chatbot in Python and Streamlit against LLM APIs to automate internal support queries.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'WebSocket', 'Context API', 'SonarQube', 'Python', 'Streamlit'],
  },
  {
    company: 'Univers (Envision Group), Singapore',
    role: 'Frontend Software Engineer Intern',
    startDate: 'May 2024',
    endDate: 'Dec 2024',
    description: [
      'Built carbon emission monitoring and energy analytics dashboards for the R&D engineering department using React and Ant Design, giving engineers a live view of consumption and emissions data.',
      'Refactored complex UI into reusable, modular components and built admin configuration interfaces so teams could adjust monitoring parameters without engineering involvement, improving render performance and lowering the cost of new dashboard views.',
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
