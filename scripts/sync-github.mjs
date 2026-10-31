import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

function initFirebase() {
  if (getApps().length > 0) return getFirestore();

  // 1. Local development fallback: serviceAccountKey.json
  const localKeyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(localKeyPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      initializeApp({ credential: cert(serviceAccount) });
      return getFirestore();
    } catch (e) {
      console.warn('⚠️ Could not parse local serviceAccountKey.json:', e.message);
    }
  }

  // 2. Production/CI: Environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Critical Error: Missing Firebase credentials.');
    console.error(`Status -> Project ID: ${Boolean(projectId)}, Client Email: ${Boolean(clientEmail)}, Private Key: ${Boolean(privateKey)}`);
    throw new Error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY environment variables.');
  }

  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return getFirestore();
}

async function syncRepos() {
  const db = initFirebase();
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'GopalKholade';

  console.log(`Polling public repositories for user: ${GITHUB_USERNAME}...`);
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
  };

  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.statusText}`);
  }

  const repos = await response.json();
  const portfolioRepos = repos.filter(repo => repo.topics && repo.topics.includes('portfolio'));
  console.log(`Found ${portfolioRepos.length} repos marked with 'portfolio' topic.`);

  for (const repo of portfolioRepos) {
    console.log(`Processing ${repo.name}...`);
    let readmeText = '';
    try {
      const readmeRes = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/README.md`);
      if (readmeRes.ok) {
        readmeText = await readmeRes.text();
      }
    } catch {
      console.warn(`README not found for ${repo.name}`);
    }

    const isAi = repo.topics.some(t => ['ai', 'ml', 'llm', 'rag', 'agent', 'pytorch'].includes(t.toLowerCase()));
    const category = isAi ? 'ai-ml' : 'data-analytics';

    const projectPayload = {
      slug: repo.name,
      title: repo.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      category,
      description: repo.description || 'Technical repository and case study.',
      repoUrl: repo.html_url,
      demoUrl: repo.homepage || '',
      featured: repo.stargazers_count > 0,
      order: 10,
      published: true,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics,
      techStack: repo.topics.filter(t => t !== 'portfolio'),
      readmeMarkdown: readmeText,
    };

    await db.collection('projects').doc(repo.name).set(projectPayload, { merge: true });
    console.log(`Upserted project: ${repo.name}`);
  }

  console.log('GitHub-to-Firebase sync complete.');
}

syncRepos().catch((err) => {
  console.error(err);
  process.exit(1);
});