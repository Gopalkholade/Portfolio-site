import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey?.startsWith('"') && privateKey?.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
}
privateKey = privateKey?.replace(/\\n/g, '\n');

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
});

const db = getFirestore();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

async function syncRepos() {
  console.log(`Polling public repositories for user: ${GITHUB_USERNAME}...`);
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
  };

  const response = await fetch(`[https://api.github.com/users/$](https://api.github.com/users/$){GITHUB_USERNAME}/repos?per_page=100`, { headers });
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
      const readmeRes = await fetch(`[https://raw.githubusercontent.com/$](https://raw.githubusercontent.com/$){repo.full_name}/${repo.default_branch}/README.md`);
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

syncRepos().catch(console.error);