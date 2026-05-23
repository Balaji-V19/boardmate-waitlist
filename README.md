# BoardMate Waitlist

A mobile-first marketing site for the BoardMate app, with email signups stored in the same `boardmate-app` Firebase project the app uses. Built with Next.js 14 (App Router) and the Firebase **Admin SDK** server-side — so the page bypasses Firestore security rules and there is nothing to change in the app's rules to ship this.

## Stack

- Next.js 14 (App Router, TypeScript, React 18)
- Firebase Admin SDK (server-side writes via service-account credentials)
- Inter via `next/font/google`
- `canvas-confetti` for the success animation
- Mascot videos (.mp4 + .webm) re-encoded from the Flutter app

## Project layout

```
boardmate-waitlist/
├── public/
│   └── assets/
│       ├── logo.png
│       └── videos/   welcome / teaching / thinking / celebrating .mp4 + .webm
├── src/
│   ├── app/
│   │   ├── api/waitlist/route.ts     POST signup, GET counter
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  server component, reads initial count
│   ├── components/
│   │   └── WaitlistPage.tsx          'use client' — all interactivity
│   └── lib/
│       ├── firebase-admin.ts         lazy-init Admin SDK
│       └── waitlist.ts               signup logic + counter
├── scripts/convert-videos.sh
├── firebase-service-account.json     ⚠ GITIGNORED — never commit
├── .env.local                        ⚠ GITIGNORED — never commit
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## Required local files (not in git)

- `.env.local` — points the app at the service-account JSON and the Firebase project id. Copy from `.env.example`:
  ```bash
  cp .env.example .env.local
  ```
- `firebase-service-account.json` — service-account JSON downloaded from the Firebase console (Project Settings → Service Accounts → Generate new private key). Drop it at the project root, or any path you like, and update `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local` accordingly.

The `.gitignore` covers every common filename pattern these files ship with — but **double-check before pushing** anyway.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build / production

```bash
npm run build
npm run start
```

## Deploy

Because the app uses the Admin SDK, the deploy target must support Node.js server functions. The Firebase **service-account JSON must NOT be bundled into the deploy** — instead, paste its contents into your host's secret/env store and use the right env var.

### Vercel (recommended)

1. `npx vercel` (first time) to link the project.
2. Set environment variables in the Vercel dashboard or via CLI:
   - `FIREBASE_PROJECT_ID=boardmate-app`
   - `NEXT_PUBLIC_SITE_URL=https://your-domain.example`
   - For the service account: the cleanest approach is to base64-encode the JSON, stash it in `GOOGLE_APPLICATION_CREDENTIALS_JSON`, and tweak `src/lib/firebase-admin.ts` to read from that env var when present. Or use Vercel's "secret file" feature.
3. `vercel --prod`.

### Anything else (Render, Fly, Cloud Run, etc.)

Same idea: set `FIREBASE_PROJECT_ID`, mount or inline the service-account JSON, and run `npm run build && npm run start`.

## How the data flows

```
Browser  →  /api/waitlist (POST)  →  Admin SDK  →  Firestore
                                                    ├─ waitlist/{auto-id}
                                                    └─ meta/waitlist (count)
```

- Email validated client-side and again server-side.
- Server checks for an existing doc with the same email (case-insensitive).
- New signups create a `waitlist/{id}` doc with `email`, `createdAt`, `source`, `userAgent`, `referrer`, and `position`.
- The counter at `meta/waitlist.count` is incremented atomically inside a transaction.
- The browser receives `{ ok, position, alreadyJoined }` and renders the success modal.

No Firestore security rule changes are required because all writes happen with the privileged service account.

## Re-converting mascot videos

The site expects four mascot pairs (`welcome`, `teaching`, `thinking`, `celebrating`) under `public/assets/videos/` as `.mp4` and `.webm`. To regenerate them from the Flutter app's `.mov` sources:

```bash
./scripts/convert-videos.sh
```

Requires `ffmpeg` on PATH (`brew install ffmpeg`).

## What's intentionally fun

- Live counter that ticks up from zero when the strip enters view.
- 7 floating game pieces (dice, meeple, hex tile, card, token) drifting behind the hero.
- Subtle 3D mascot tilt that tracks the cursor on desktop.
- Confetti burst from the button on successful signup.
- Celebrating-mascot success modal with share buttons (X, WhatsApp, copy link) and the user's queue position.
- Pulsing green status dot next to the live count.
- Everything respects `prefers-reduced-motion`.
