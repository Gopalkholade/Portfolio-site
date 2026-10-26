import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import type { Project } from '../types';
import dotenv from 'dotenv';

dotenv.config();

let db: Firestore | null = null;

function getFirebaseApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Missing Firebase Admin environment variables. Running in offline/mock mode.');
    return null;
  }

  try {
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } catch (err) {
    console.warn('⚠️ Firebase Admin failed to initialize:', err);
    return null;
  }
}

const app = getFirebaseApp();
if (app) {
  db = getFirestore(app);
}

export async function getProjects(category?: string): Promise<Project[]> {
  if (!db) {
    console.warn('⚠️ Firestore unavailable. Returning empty projects list.');
    return [];
  }

  try {
    let query = db.collection('projects').where('published', '==', true);
    if (category) {
      query = query.where('category', '==', category);
    }
    const querySnap = await query.orderBy('order', 'asc').get();
    return querySnap.docs.map(doc => doc.data() as Project);
  } catch (err) {
    console.warn('⚠️ Failed to fetch projects from Firestore. Returning empty list.', err);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!db) return null;
  try {
    const docSnap = await db.collection('projects').doc(slug).get();
    if (!docSnap.exists) return null;
    return docSnap.data() as Project;
  } catch {
    return null;
  }
}