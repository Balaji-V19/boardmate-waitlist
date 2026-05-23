import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

let cachedApp: App | undefined;
let cachedDb: Firestore | undefined;

function getApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }

  const rawKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!rawKeyPath) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS is not set. ' +
        'Copy .env.example to .env.local and point it at your service-account JSON.',
    );
  }
  if (!projectId) {
    throw new Error(
      'FIREBASE_PROJECT_ID is not set. See .env.example for an example value.',
    );
  }

  const keyPath = isAbsolute(rawKeyPath)
    ? rawKeyPath
    : resolve(process.cwd(), rawKeyPath);

  if (!existsSync(keyPath)) {
    throw new Error(
      `Service-account file not found at "${keyPath}". ` +
        `Drop the JSON downloaded from Firebase Console into the project root ` +
        `(the .gitignore already covers the usual filenames) and update ` +
        `GOOGLE_APPLICATION_CREDENTIALS in .env.local.`,
    );
  }

  const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
  cachedApp = initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });
  return cachedApp;
}

export function db(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getApp());
  }
  return cachedDb;
}
