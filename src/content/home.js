export const externalLinks = {
  email: 'mailto:jiahang.s@outlook.com',
  github: 'https://github.com/tiezhu-12138',
  linkedin: 'https://www.linkedin.com/in/jiahang-sun-66b350355',
  resume: '/Jiahang_SUN_Resume.pdf',
}

export const navigationItems = [
  { label: 'Home', href: '/#home' },
  { label: 'About', href: '/#about' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Contact', href: '/#contact' },
]

export const profileSnapshot = {
  label: 'Profile',
  text: '1 year of experience delivering end-to-end features for AI-powered PaaS products',
}

export const hero = {
  eyebrow: 'Jiahang “Jet” Sun',
  title: 'Full-stack Software Engineer',
  location: 'Melbourne, Australia',
  introduction:
    'Delivering responsive interfaces, reusable back-end services, data workflows and cloud releases for AI-powered products.',
  primaryAction: {
    label: 'View Projects',
    href: '/#projects',
  },
  secondaryAction: {
    label: 'Download Resume',
    href: externalLinks.resume,
    download: true,
  },
  socialLinks: [
    { label: 'GitHub', href: externalLinks.github },
    { label: 'LinkedIn', href: externalLinks.linkedin },
  ],
}

const combinedRoboticMarketerEvidence = {
  scopeNote:
    'These contributions span Campaign Centre and CRM and are not attributed to either module alone.',
  technologyLabel: 'Combined Robotic Marketer stack',
  technologies: [
    'Python',
    'Django',
    'MongoDB',
    'MongoEngine',
    'JavaScript',
    'Celery',
    'AWS EC2',
  ],
}

export const projects = [
  {
    id: 'campaign-centre',
    slug: 'campaign-centre',
    title: 'Campaign Centre',
    context: 'Robotic Marketer experience',
    summary:
      'A campaign operations module supporting planning, analytics and cloud-based delivery within an AI-powered marketing platform.',
    ...combinedRoboticMarketerEvidence,
    caseStudy: {
      problem:
        'Support campaign planning, analytics and cloud-based delivery within an AI-powered marketing platform.',
      role:
        'Contributed to full-stack delivery across Campaign Centre and CRM as a Software Engineer.',
      approach:
        'Across the combined Robotic Marketer scope, designed MongoDB document structures and reusable business logic, then developed analytics dashboards and scheduled Celery workflows.',
      challenges:
        'Worked with complex lifecycle, financial and performance workflows, including budget variance, ROI, ROAS, readiness and engagement scoring.',
      result:
        'Presented financial, operational and performance metrics through responsive, accessible interface components.',
    },
  },
  {
    id: 'crm-platform',
    slug: 'crm-platform',
    title: 'CRM Platform',
    context: 'Robotic Marketer experience',
    summary:
      'A connected CRM module supporting customer and sales workflows within an AI-powered marketing platform.',
    ...combinedRoboticMarketerEvidence,
    caseStudy: {
      problem:
        'Support customer and sales workflows while maintaining dependable validation and access isolation.',
      role:
        'Contributed to data modelling, reusable business logic, validation and responsive interfaces across the combined Campaign Centre and CRM scope.',
      approach:
        'Built reusable import and export infrastructure with column mapping, full-file validation, duplicate detection, access isolation, rollback handling and spreadsheet security.',
      challenges:
        'Supported three input formats and four output formats while preserving validation, access isolation and rollback handling.',
      result:
        'Delivered reusable import and export workflows as part of the combined Robotic Marketer scope.',
    },
  },
  {
    id: 'inflowence',
    slug: 'inflowence',
    title: 'inflowence.org',
    context: 'Full-stack course project',
    summary:
      'A digital-citizenship platform for content creators, developed by a self-managed agile team with industry and academic mentors.',
    technologyLabel: 'Technology stack',
    technologies: [
      'Vue.js',
      'Python',
      'FastAPI',
      'PostgreSQL',
      'Railway',
      'Vercel',
      'Cloudflare',
      'GitHub Actions',
    ],
    caseStudy: {
      problem: 'Build a digital-citizenship platform for content creators.',
      role:
        'Led full-stack development in a self-managed agile team, collaborating with industry and academic mentors.',
      approach:
        'Built accessible Vue.js interfaces and RESTful FastAPI services backed by PostgreSQL on Railway.',
      challenges:
        'Configured CORS, environment variables and CI/CD across Vercel, Cloudflare, Railway and GitHub Actions.',
      result:
        'Delivered working prototypes, documentation and presentations as part of the unit assessment.',
    },
  },
]

export const about = {
  heading: 'About Me',
  bodyBeforeQualification:
    'I am a Melbourne-based full-stack software engineer with one year of experience. I hold a ',
  qualificationHighlight: 'Master of Information Technology from Monash University.',
  bodyBetweenHighlights:
    ' My experience covers end-to-end features across responsive interfaces, reusable back-end services, data workflows and cloud releases. At Robotic Marketer, I developed full-stack capabilities for an AI-powered marketing platform. At Hangzhou Youzan, I built RESTful back-end services and finance data workflows. My toolkit includes TypeScript, JavaScript, React, Python, Django, FastAPI, MongoDB and PostgreSQL. I use AI agents across planning, implementation, testing and review, while grounding delivery in automated tests, validation and clear technical documentation. I enjoy turning complex business workflows into ',
  workingApproachHighlight:
    'maintainable services, clear data models and accessible user experiences.',
  bodyAfter:
    ' My focus is practical full-stack work across frontend, backend and data.',
}

export const skillGroups = [
  {
    name: 'Languages',
    skills: ['Python', 'JavaScript', 'Java', 'SQL', 'R'],
  },
  {
    name: 'Back end',
    skills: ['Django', 'FastAPI', 'Flask', 'REST APIs', 'Celery'],
  },
  {
    name: 'Front end',
    skills: [
      'TypeScript',
      'Vue.js',
      'React',
      'HTML5',
      'CSS3',
      'Tailwind',
      'Bootstrap',
      'Responsive UI',
      'Accessibility and WCAG',
    ],
  },
  {
    name: 'Data',
    skills: ['MongoDB', 'MongoEngine', 'PostgreSQL', 'Pandas', 'Microsoft Access'],
  },
  {
    name: 'Cloud and DevOps',
    skills: [
      'AWS EC2',
      'AWS IAM',
      'AWS CodeCommit',
      'Git',
      'GitHub Actions',
      'Cloudflare',
      'SSH',
    ],
  },
  {
    name: 'Practices',
    skills: [
      'Full-stack development',
      'Agent-assisted development',
      'Data modelling',
      'CI/CD',
      'Automated testing',
      'Agile delivery',
      'Technical documentation',
    ],
  },
]

export const experience = [
  {
    organisation: 'Robotic Marketer',
    role: 'Software Engineer',
    location: 'Melbourne, Australia',
    summary:
      'Developed full-stack capabilities for an AI-powered marketing platform, covering data, interfaces and cloud delivery.',
    highlights: [
      'Built and shipped end-to-end features with TypeScript and JavaScript, using AI agents across planning, implementation, testing and review.',
      'Developed responsive TypeScript and JavaScript interfaces backed by Django services, and maintained Python and Django unit tests.',
      'Designed reusable MongoDB models and service logic, with validation, duplicate detection and rollback controls protecting data integrity and recovery.',
      'Automated analytics and reporting with Celery, and delivered repeatable releases through Git, AWS CodeCommit, AWS EC2, SSH and IAM-controlled access.',
    ],
  },
  {
    organisation: 'Hangzhou Youzan Technology Co., Ltd',
    role: 'Python Developer',
    location: 'Hangzhou, China',
    summary:
      'Developed RESTful back-end services and automated finance data workflows for affiliated-company funding, account operations and reporting.',
    highlights: [
      'Built RESTful back-end services with FastAPI and PostgreSQL, providing reliable finance data storage and retrieval.',
      'Developed data pipelines with Python, Pandas and SQL, consolidating more than 100 account types across more than 30 affiliated companies.',
      'Implemented reconciliation, validation, automated analysis and Excel/VBA reporting workflows, reducing manual checks and supporting audit preparation.',
      'Translated finance requirements into reusable Python and SQL workflows and implemented repeatable CI/CD deployments with secure CORS and environment configuration.',
    ],
  },
]

export const education = [
  {
    institution: 'Monash University',
    qualification: 'Master of Information Technology',
    period: '2025',
  },
  {
    institution: 'The University of Nottingham',
    qualification: 'Bachelor of International Business Economics (Honours)',
    period: '2023',
  },
]

export const contact = {
  heading: "Let's talk about software development.",
  body:
    'Get in touch by email or LinkedIn, or review my work on GitHub.',
  location: 'Melbourne, Australia',
  methods: [
    { label: 'Email', value: 'jiahang.s@outlook.com', href: externalLinks.email },
    { label: 'LinkedIn', value: 'Connect on LinkedIn', href: externalLinks.linkedin },
    { label: 'GitHub', value: 'View GitHub', href: externalLinks.github },
  ],
}
