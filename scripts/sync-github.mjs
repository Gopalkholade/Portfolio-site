import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';

function initFirebase() {
  if (getApps().length > 0) return getFirestore();

  const keyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (!fs.existsSync(keyPath)) {
    throw new Error(`File not found: ${keyPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  if (!serviceAccount.project_id || !serviceAccount.private_key) {
    throw new Error('serviceAccountKey.json is missing required credentials.');
  }

  initializeApp({
    credential: cert(serviceAccount)
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