import type { Experience } from '../types/experience'

export const experiences: Experience[] = [
  {
    company: 'Government Agency, Singapore',
    role: 'Full Stack Software Engineer',
    startDate: 'May 2026',
    endDate: 'Present',
    description: [
      'Build citizen-facing and internal products in React, TypeScript and Python, on AWS infrastructure I provision with CDK.',
      'Developing a nationwide survey platform, using AWS Bedrock to turn raw question sets into structured surveys.',
      'Building an AI agent on Bedrock that writes test cases from application flows.',
      'Own production reliability: CloudWatch alarms, incident response and staged rollouts.',
    ],
    tech: ['React', 'TypeScript', 'Python', 'AWS CDK', 'Lambda', 'DynamoDB', 'ECS', 'AWS Bedrock', 'OpenSearch', 'GitLab CI', 'CloudWatch'],
  },
  {
    company: 'Freelance (project-based), Remote',
    role: 'Software Engineer — Full Stack & Applied AI',
    startDate: 'Jan 2026',
    endDate: 'Present',
    description: [
      'Turn open briefs from a Japanese enterprise client into working demos in two to three days.',
      'Built a blueprint restoration platform (OpenCV, OCR, Claude Vision) that removes manual redrawing.',
      'Prototyped AR/VR apps in Unity and deployed services to AWS and Firebase.',
    ],
    tech: ['Python', 'FastAPI', 'OpenCV', 'Tesseract', 'Claude Vision', 'Unity', 'AWS', 'Firebase', 'Next.js'],
  },
  {
    company: 'Corporate Bank, Singapore',
    role: 'Full Stack Software Developer',
    startDate: 'Jul 2025',
    endDate: 'Dec 2025',
    description: [
      'Led the move of treasury systems from VB.Net and Oracle to React, TypeScript, Node.js and SQL Server.',
      'Built FX workflow screens, multi-stage approvals and REST APIs for high-volume FX data.',
      'Took the migration through production cutover with minimal downtime.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'Express', 'Ant Design', 'SQL Server', 'Oracle', 'VB.Net', 'Azure DevOps'],
  },
  {
    company: 'Capgemini, Singapore',
    role: 'Software Developer (Senior Software Analyst)',
    startDate: 'Jan 2025',
    endDate: 'Jul 2025',
    description: [
      'Built a real-time land bidding platform for a government agency, with live bids over WebSockets.',
      'Cut load times by over 30% with code splitting and render tuning.',
      'Designed the state architecture and integrated secure payments.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'WebSocket', 'Context API', 'SonarQube', 'Python', 'Streamlit'],
  },
  {
    company: 'Univers (Envision Group), Singapore',
    role: 'Frontend Software Engineer Intern',
    startDate: 'May 2024',
    endDate: 'Dec 2024',
    description: [
      'Built carbon and energy dashboards in React for R&D engineers.',
      'Added admin screens so teams could tune monitoring themselves.',
    ],
    tech: ['React', 'JavaScript ES6', 'Ant Design', 'Agile'],
  },
  {
    company: 'Daiso Singapore',
    role: 'Software Developer',
    startDate: 'Nov 2023',
    endDate: 'Feb 2024',
    description: [
      'Replaced spreadsheet-based logistics and sales workflows with a React, Node.js and SQL Server dashboard.',
      'Added role-based access so each business unit saw only its own data.',
    ],
    tech: ['React', 'Node.js', 'Microsoft SQL Server', 'REST APIs', 'RBAC'],
  },
  {
    company: 'International Data Corporation (IDC), Singapore',
    role: 'Custom Solutions Intern',
    startDate: 'Mar 2023',
    endDate: 'Apr 2023',
    description: [
      'Automated cleaning of large research datasets with Python and Excel VBA.',
      'Built dashboards for client market-insight reports.',
    ],
    tech: ['Python', 'Excel VBA', 'Data Analytics'],
  },
]
