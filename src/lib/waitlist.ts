import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';

const WAITLIST = 'waitlist';
const META_DOC = ['meta', 'waitlist'] as const;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length < 320;
}

export async function readCount(): Promise<number> {
  const snap = await db().doc(`${META_DOC[0]}/${META_DOC[1]}`).get();
  if (!snap.exists) return 0;
  const v = snap.data()?.count;
  return typeof v === 'number' ? v : 0;
}

export type SignupResult =
  | { status: 'created'; position: number }
  | { status: 'already_joined'; position: number };

export async function signup(
  email: string,
  meta: { userAgent?: string; referrer?: string | null },
): Promise<SignupResult> {
  const firestore = db();
  const waitlistRef = firestore.collection(WAITLIST);
  const metaRef = firestore.doc(`${META_DOC[0]}/${META_DOC[1]}`);

  const dup = await waitlistRef.where('email', '==', email).limit(1).get();
  if (!dup.empty) {
    const count = await readCount();
    return { status: 'already_joined', position: count };
  }

  const position = await firestore.runTransaction(async (tx) => {
    const metaSnap = await tx.get(metaRef);
    const current = (metaSnap.exists ? metaSnap.data()?.count : 0) ?? 0;
    const next = current + 1;

    const newDoc = waitlistRef.doc();
    tx.set(newDoc, {
      email,
      createdAt: FieldValue.serverTimestamp(),
      source: 'waitlist-web',
      userAgent: meta.userAgent?.slice(0, 240) ?? null,
      referrer: meta.referrer?.slice(0, 240) ?? null,
      position: next,
    });

    if (metaSnap.exists) {
      tx.update(metaRef, { count: next, updatedAt: FieldValue.serverTimestamp() });
    } else {
      tx.set(metaRef, { count: next, updatedAt: FieldValue.serverTimestamp() });
    }
    return next;
  });

  return { status: 'created', position };
}
