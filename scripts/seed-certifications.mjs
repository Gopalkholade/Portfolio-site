import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
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
const certs = JSON.parse(fs.readFileSync('certifications_seed.json', 'utf-8'));

async function seed() {
  for (const certData of certs) {
    const { id, ...data } = certData;
    await db.collection('certifications').doc(id).set(data, { merge: true });
    console.log(`Upserted certification: ${data.title}`);
  }
}

seed().catch(console.error);