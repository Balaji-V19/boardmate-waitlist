import { NextResponse } from 'next/server';
import {
  isValidEmail,
  normalizeEmail,
  readCount,
  signup,
} from '@/lib/waitlist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await readCount();
    return NextResponse.json({ count });
  } catch (err) {
    console.error('[waitlist GET]', err);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}

export async function POST(req: Request) {
  let payload: { email?: unknown } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const rawEmail = typeof payload.email === 'string' ? payload.email : '';
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email.' },
      { status: 400 },
    );
  }

  const userAgent = req.headers.get('user-agent') ?? undefined;
  const referrer = req.headers.get('referer');

  try {
    const result = await signup(email, { userAgent, referrer });
    return NextResponse.json({
      ok: true,
      alreadyJoined: result.status === 'already_joined',
      position: result.position,
    });
  } catch (err) {
    console.error('[waitlist POST]', err);
    return NextResponse.json(
      { error: "We couldn't save that just now. Please try again." },
      { status: 500 },
    );
  }
}
