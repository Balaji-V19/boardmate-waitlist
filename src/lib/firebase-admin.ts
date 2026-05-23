import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';

let cachedApp: App | undefined;
let cachedDb: Firestore | undefined;

/**
 * Credential resolution order:
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON — full JSON pasted into an env var.
 *      Use this on hosted environments (Vercel, Render, Cloud Run, etc.)
 *      where you cannot drop a file on disk.
 *   2. GOOGLE_APPLICATION_CREDENTIALS — path to a JSON file on disk.
 *      Use this locally; the gitignored `firebase-service-account.json` at
 *      the project root is the default.
 */
function loadServiceAccount(): Record<string, unknown> {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson && rawJson.trim().length > 0) {
    try {
      return JSON.parse(rawJson);
    } catch (err) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON is set but the value is not valid JSON. ' +
          'Paste the entire service-account JSON verbatim (no extra escaping).',
      );
    }
  }

  const rawKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!rawKeyPath) {
    throw new Error(
      'No Firebase credentials configured. Set either ' +
        'FIREBASE_SERVICE_ACCOUNT_JSON (recommended on hosted platforms) or ' +
        'GOOGLE_APPLICATION_CREDENTIALS (path to a JSON file on disk).',
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
  return JSON.parse(readFileSync(keyPath, 'utf-8'));
}

function getApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps()[0];
  if (existing) {
    cachedApp = existing;
    return existing;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error(
      'FIREBASE_PROJECT_ID is not set. See .env.example for an example value.',
    );
  }

  const serviceAccount = loadServiceAccount();
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
