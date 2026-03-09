import type { Experience } from '../types/experience'

export const experiences: Experience[] = [
  {
    company: 'Mizuho Bank, Singapore',
    role: 'Full Stack Software Developer',
    startDate: 'Jul 2025',
    endDate: 'Dec 2025',
    description: [
      'Developed a large-scale enterprise web application as part of the bank\'s data and system modernisation initiative, migrating critical treasury and trade workflows from legacy VB.Net and Oracle to a modern ReactJS + Node.js stack.',
      'Architected and implemented core frontend modules using ReactJS, leveraging Ant Design, TailwindCSS, and reusable hooks for dynamic form handling, table rendering, and workflow modals across multiple departments.',
      'Built backend REST APIs in Node.js (Express) to process, validate, and persist high-volume trade and FX transaction data, ensuring consistency across multi-stage approval workflows.',
      'Designed SQL procedures and validation logic to enforce business rules, currency code checks, and numerical precision limits for sensitive financial data.',
      'Collaborated with cross-functional teams — business analysts, QA testers, and infrastructure engineers — to ensure smooth system migration and secure data flow between internal systems.',
    ],
    tech: ['ReactJS', 'Node.js', 'Express', 'Ant Design', 'TailwindCSS', 'Oracle', 'SQL', 'VB.Net'],
  },
  {
    company: 'Capgemini, Singapore',
    role: 'Software Developer (Senior Software Analyst)',
    startDate: 'Jan 2025',
    endDate: 'Jul 2025',
    description: [
      'Spearheaded frontend development of a Land Bidding Web Application for Jurong Town Corporation (JTC), delivering a fully responsive and scalable platform using ReactJS, TypeScript, and Ant Design.',
      'Engineered secure payment integration and real-time bidding functionality through WebSocket and Node.js backend services, enabling live bid updates and transactional accuracy.',
      'Implemented reusable state management with React Context API and optimized UI performance through lazy loading and dynamic routing, improving page responsiveness by over 30%.',
      'Designed and deployed an AI Chatbot prototype using Streamlit and GroqAI APIs, enhancing internal support and automating FAQs for client demonstration purposes.',
    ],
    tech: ['ReactJS', 'TypeScript', 'Ant Design', 'Node.js', 'WebSocket', 'Streamlit', 'GroqAI'],
  },
  {
    company: 'Univers (Envision Group), Singapore',
    role: 'Frontend Software Engineer Intern',
    startDate: 'May 2024',
    endDate: 'Dec 2024',
    description: [
      'Contributed to the development and refinement of enterprise-grade web applications for R&D teams using ReactJS, Ant Design, and JavaScript ES6.',
      'Refactored and modularized complex UI components, improving performance and code maintainability while ensuring cross-browser compatibility.',
      'Designed dashboards and analytics views for sustainability projects, improving data visualization and accessibility for internal stakeholders.',
      'Collaborated within an Agile development environment, actively participating in sprint reviews, code merges, and UI/UX alignment sessions.',
    ],
    tech: ['ReactJS', 'JavaScript ES6', 'Ant Design', 'Agile'],
  },
  {
    company: 'Daiso Singapore',
    role: 'Software Developer',
    startDate: 'Nov 2023',
    endDate: 'Feb 2024',
    description: [
      'Developed and deployed a company-wide Internal Utilities Dashboard using ReactJS, Node.js, and MSSQL, enabling digitization of manual workflows across logistics, sales, and inventory operations.',
      'Built RESTful APIs for data synchronization, integrated form validation, and dynamic report generation modules to enhance operational visibility.',
      'Customized dashboards per department, embedding analytics widgets and user access controls to align with business requirements.',
    ],
    tech: ['ReactJS', 'Node.js', 'MSSQL', 'REST APIs'],
  },
  {
    company: 'International Data Corporation (IDC), Singapore',
    role: 'Custom Solutions Intern',
    startDate: 'Mar 2023',
    endDate: 'Apr 2023',
    description: [
      'Assisted the Custom Solutions team in managing and transforming large client datasets using Excel VBA and Python, automating repetitive data cleansing and aggregation tasks.',
      'Created interactive charts, dashboards, and presentation materials for client deliverables.',
      'Conducted industry and competitor trend research supporting customized business intelligence reports.',
    ],
    tech: ['Python', 'Excel VBA', 'Data Analytics'],
  },
]
