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

export const currently = {
  label: 'Currently',
  text: 'Open to Graduate and Junior Software Development opportunities',
}

export const hero = {
  eyebrow: 'Jiahang “Jet” Sun',
  title: 'Full-stack Software Engineer',
  location: 'Melbourne, Australia',
  introduction:
    'Building maintainable web applications with practical full-stack engineering, responsive interfaces and reliable data workflows.',
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

const combinedInternshipEvidence = {
  scopeNote:
    'The resume records these contributions across Campaign Centre and CRM together. They are not attributed to either module alone.',
  technologyLabel: 'Combined internship stack',
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
    context: 'Robotic Marketer internship',
    summary:
      'A campaign operations module supporting planning, analytics and cloud-based delivery within an AI-powered marketing platform.',
    ...combinedInternshipEvidence,
    caseStudy: {
      problem:
        'Support campaign planning, analytics and cloud-based delivery within an AI-powered marketing platform.',
      role:
        'Contributed to full-stack delivery across Campaign Centre and CRM as a Software Engineer Intern.',
      approach:
        'Across the combined internship scope, designed MongoDB document structures and reusable business logic, then developed analytics dashboards and scheduled Celery workflows.',
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
    context: 'Robotic Marketer internship',
    summary:
      'A connected CRM module supporting customer and sales workflows within an AI-powered marketing platform.',
    ...combinedInternshipEvidence,
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
        'Delivered reusable import and export workflows as part of the combined internship scope.',
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
  body:
    'I am a Melbourne-based full-stack software engineer with a Master of Information Technology from Monash University. During internships at Robotic Marketer and Hangzhou Youzan, I worked across web application development, data workflows, responsive interfaces, automated testing and cloud delivery. My recent experience includes Python, Django, MongoDB, PostgreSQL and JavaScript, with Vue.js and FastAPI used to build a digital-citizenship platform for content creators. I enjoy turning complex business workflows into maintainable services, clear data models and accessible user experiences. I am currently seeking Graduate and Junior Software Development opportunities where I can contribute across frontend and backend work, learn from experienced engineers and continue building practical, reliable software.',
}

export const skillGroups = [
  {
    name: 'Frontend',
    skills: [
      'Vue.js',
      'React',
      'JavaScript',
      'HTML5',
      'CSS3',
      'Bootstrap',
      'Responsive UI',
      'WCAG accessibility',
    ],
  },
  {
    name: 'Backend',
    skills: ['Python', 'Django', 'FastAPI', 'REST APIs', 'Celery', 'Service-layer design'],
  },
  {
    name: 'Database',
    skills: ['MongoDB', 'MongoEngine', 'PostgreSQL', 'SQL'],
  },
  {
    name: 'Tools',
    skills: [
      'Git',
      'GitHub Actions',
      'AWS EC2',
      'AWS IAM',
      'AWS CodeCommit',
      'SSH',
      'Vercel',
      'Railway',
      'Cloudflare',
    ],
  },
]

export const experience = [
  {
    organisation: 'Robotic Marketer',
    role: 'Software Engineer Intern',
    location: 'Melbourne, Australia',
    period: 'May to August 2026',
    summary:
      'Contributed full-stack features across the Campaign Centre and CRM modules of an AI-powered marketing platform.',
    highlights: [
      'Engineered full-stack features with Python, Django, MongoEngine and JavaScript across Campaign Centre and CRM.',
      'Designed MongoDB document structures and reusable business logic for lifecycle, financial and performance workflows.',
      'Built reusable data import and export infrastructure, analytics dashboards and scheduled Celery data workflows.',
      'Tested responsive interfaces and supported daily AWS EC2 deployments through SSH and AWS CodeCommit.',
    ],
  },
  {
    organisation: 'Hangzhou Youzan Technology Co., Ltd',
    role: 'Python Developer Intern',
    location: 'Hangzhou, China',
    period: 'June to August 2021',
    summary:
      'Worked on internal finance data automation and reporting workflows for funding and account operations.',
    highlights: [
      'Developed Python scripts to clean, reconcile and consolidate funding and account data across more than 100 account types for more than 30 affiliated companies.',
      'Migrated repetitive Excel-based checks into Python and Pandas workflows, reducing manual handling in funding-status analysis and variance review.',
      'Automated finance data summaries and draft report tables for auditing, brokerage investigation and cross-department account operations.',
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
    institution: 'The University of Nottingham Ningbo China',
    qualification: 'Bachelor of International Business Economics (Honours)',
    period: '2023',
  },
]

export const contact = {
  heading: "Let's talk about software development.",
  body:
    'Jet is open to Graduate and Junior Software Development opportunities. Get in touch by email or connect on LinkedIn.',
  location: 'Melbourne, Australia',
  methods: [
    { label: 'Email', value: 'jiahang.s@outlook.com', href: externalLinks.email },
    { label: 'LinkedIn', value: 'Connect on LinkedIn', href: externalLinks.linkedin },
    { label: 'GitHub', value: 'View GitHub', href: externalLinks.github },
  ],
}
