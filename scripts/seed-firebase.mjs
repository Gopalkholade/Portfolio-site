import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getDatabase() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT_JSON to a Firebase service account JSON value.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.', { cause: error });
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;
  if (!projectId) throw new Error('Set FIREBASE_PROJECT_ID or include project_id in the service account.');

  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount), projectId });
  }
  return getFirestore(getApps()[0]);
}

const profile = {
  name: 'Jordan Lee',
  role: 'Software Engineer',
  location: 'San Francisco, CA',
  summary:
    'I build reliable, thoughtful software that turns complex problems into clear, useful products. My work spans frontend experiences, backend systems, and the infrastructure that brings them together.',
  email: 'hello@example.com',
  github: 'https://github.com',
  linkedin: 'https://www.linkedin.com',
  website: 'https://example.com',
  availability: 'Open to select opportunities',
  stats: [
    { label: 'Years building', value: '08+' },
    { label: 'Products shipped', value: '24' },
    { label: 'Teams partnered', value: '12' },
  ],
};

const experiences = [
  {
    company: 'Northstar Labs',
    role: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    period: '2022 — Present',
    summary: 'Leading product engineering for a platform used by teams around the world.',
    highlights: [
      'Architected a modular services platform that cut feature delivery time by 35%.',
      'Built accessible, data-rich interfaces used by more than 40,000 customers.',
      'Partnered with design and product to shape the roadmap from discovery to launch.',
    ],
    order: 1,
  },
  {
    company: 'Fieldwork Digital',
    role: 'Software Engineer',
    location: 'Remote',
    period: '2019 — 2022',
    summary: 'Delivered customer-facing applications and dependable cloud services.',
    highlights: [
      'Developed a real-time collaboration workspace with a React and TypeScript stack.',
      'Improved API response times by 48% through query and caching improvements.',
      'Established a component library and testing practices adopted across four teams.',
    ],
    order: 2,
  },
];

const projects = [
  {
    slug: 'signal',
    name: 'Signal',
    description: 'A focused dashboard for understanding product feedback at a glance.',
    details:
      '## Overview\n\nSignal brings customer conversations, product metrics, and team notes into one calm workspace. It is designed to help small product teams notice patterns sooner and make better decisions with less overhead.\n\n## What I built\n\n- A fast, responsive interface with keyboard-friendly navigation.\n- A typed API layer and background data synchronization.\n- A reusable visualization system for trends and cohorts.\n\n## Outcome\n\nThe prototype helped teams turn scattered feedback into an actionable weekly review.',
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    githubUrl: 'https://github.com',
    liveUrl: 'https://example.com',
    featured: true,
    source: 'manual',
    stars: 0,
    order: 1,
  },
  {
    slug: 'tinycache',
    name: 'Tinycache',
    description: 'A lightweight, observable cache layer for small TypeScript services.',
    details:
      '## Overview\n\nTinycache is a compact cache utility built for services that need predictable behavior without a large infrastructure footprint.\n\n## Highlights\n\n- Typed interfaces for common cache operations.\n- Time-to-live controls and lightweight metrics.\n- A small adapter surface for local and remote stores.',
    technologies: ['TypeScript', 'Redis', 'Vitest'],
    githubUrl: 'https://github.com',
    liveUrl: '',
    featured: true,
    source: 'manual',
    stars: 0,
    order: 2,
  },
  {
    slug: 'fieldnotes',
    name: 'Fieldnotes',
    description: 'An offline-first notes app for collecting ideas in the field.',
    details:
      '## Overview\n\nFieldnotes is an experiment in durable, offline-first writing. It keeps the interface deliberately simple so the focus stays on capturing and revisiting ideas.',
    technologies: ['Astro', 'SQLite', 'CSS'],
    githubUrl: 'https://github.com',
    liveUrl: '',
    featured: false,
    source: 'manual',
    stars: 0,
    order: 3,
  },
];

const skills = [
  { name: 'Languages', skills: ['TypeScript', 'JavaScript', 'Python', 'SQL'], order: 1 },
  { name: 'Frontend', skills: ['React', 'Astro', 'HTML & CSS', 'Accessibility'], order: 2 },
  { name: 'Backend & data', skills: ['Node.js', 'PostgreSQL', 'REST APIs', 'Redis'], order: 3 },
  { name: 'Platform', skills: ['AWS', 'Firebase', 'Docker', 'CI / CD'], order: 4 },
];

const db = getDatabase();
const batch = db.batch();
batch.set(db.collection('settings').doc('profile'), profile);
experiences.forEach((experience, index) => {
  batch.set(db.collection('experiences').doc(`experience-${index + 1}`), experience);
});
projects.forEach((project) => {
  batch.set(db.collection('projects').doc(project.slug), project);
});
skills.forEach((group, index) => {
  batch.set(db.collection('skills').doc(`skill-group-${index + 1}`), group);
});

await batch.commit();
console.info('Seeded the portfolio profile, experience, projects, and skills in Firestore.');

