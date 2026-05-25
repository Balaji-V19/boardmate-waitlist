'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import Badge from './Badge';
import MascotVideo from './MascotVideo';
import RuleCardCarousel from './RuleCardCarousel';
import PhoneAppPreview from './PhoneAppPreview';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://boardmate-app.web.app';

type SubmitState = 'idle' | 'loading' | 'ok' | 'error';

type Msg = { text: string; kind: 'ok' | 'error' | 'info' | null };

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function WaitlistPage({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState<number>(initialCount);
  const [success, setSuccess] = useState<{
    open: boolean;
    position: number | null;
    alreadyJoined: boolean;
  }>({ open: false, position: null, alreadyJoined: false });
  const [copied, setCopied] = useState(false);

  const navRef = useRef<HTMLElement | null>(null);
  const counterBigRef = useRef<HTMLSpanElement | null>(null);

  /* ---------- Sticky nav shadow + Reveal observer + Tilt ---------- */
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const onScroll = () => {
      if (navRef.current) {
        navRef.current.classList.toggle('scrolled', window.scrollY > 8);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const reveals = Array.from(document.querySelectorAll('.reveal'));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            revealObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    reveals.forEach((el) => revealObserver.observe(el));

    // Animate the big counter when it scrolls in
    let stopBigAnim = () => {};
    if (counterBigRef.current) {
      const target = counterBigRef.current;
      const fromVal = 0;
      const toVal = initialCount;
      const bigObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              if (prefersReducedMotion) {
                target.textContent = toVal.toLocaleString();
              } else {
                const start = performance.now();
                let raf = 0;
                const tick = (now: number) => {
                  const p = Math.min(1, (now - start) / 1600);
                  const v = Math.round(fromVal + (toVal - fromVal) * easeOutCubic(p));
                  target.textContent = v.toLocaleString();
                  if (p < 1) raf = requestAnimationFrame(tick);
                };
                raf = requestAnimationFrame(tick);
                stopBigAnim = () => cancelAnimationFrame(raf);
              }
              bigObserver.disconnect();
            }
          });
        },
        { threshold: 0.4 },
      );
      bigObserver.observe(counterBigRef.current);
    }

    // Mascot tilt (pointer devices only)
    const cleanups: (() => void)[] = [];
    if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((wrap) => {
        const inner = wrap.querySelector<HTMLElement>('.mascot-ring, .join-mascot, video');
        if (!inner) return;
        let raf = 0;
        const move = (e: MouseEvent) => {
          const r = wrap.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            inner.style.transform = `rotateX(${(-y * 8).toFixed(
              2,
            )}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
          });
        };
        const leave = () => {
          inner.style.transform = 'rotateX(0) rotateY(0)';
        };
        wrap.addEventListener('mousemove', move);
        wrap.addEventListener('mouseleave', leave);
        cleanups.push(() => {
          wrap.removeEventListener('mousemove', move);
          wrap.removeEventListener('mouseleave', leave);
        });
      });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      revealObserver.disconnect();
      stopBigAnim();
      cleanups.forEach((fn) => fn());
    };
  }, [initialCount]);

  /* ---------- Pulse the inline counters when count updates ---------- */
  const counterRefs = useRef<HTMLElement[]>([]);
  const registerCounter = useCallback((el: HTMLElement | null) => {
    if (el && !counterRefs.current.includes(el)) counterRefs.current.push(el);
  }, []);
  useEffect(() => {
    counterRefs.current.forEach((el) => {
      el.textContent = count.toLocaleString();
      if (count !== initialCount) {
        el.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(1.18)' },
            { transform: 'scale(1)' },
          ],
          { duration: 420, easing: 'ease-out' },
        );
      }
    });
    if (counterBigRef.current && count !== initialCount) {
      counterBigRef.current.textContent = count.toLocaleString();
    }
  }, [count, initialCount]);

  /* ---------- Confetti ---------- */
  const fireConfetti = useCallback((originEl: HTMLElement | null) => {
    if (typeof confetti !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#B8860B', '#0F172A', '#FFFEF0', '#D4A825', '#15803D'];
    let origin = { x: 0.5, y: 0.4 };
    if (originEl) {
      const r = originEl.getBoundingClientRect();
      origin = {
        x: (r.left + r.width / 2) / window.innerWidth,
        y: (r.top + r.height / 2) / window.innerHeight,
      };
    }
    confetti({
      particleCount: 60,
      spread: 70,
      startVelocity: 38,
      origin,
      colors,
      scalar: 0.9,
    });
    setTimeout(
      () =>
        confetti({
          particleCount: 40,
          spread: 100,
          startVelocity: 28,
          origin,
          colors,
          scalar: 1.1,
        }),
      220,
    );
    setTimeout(
      () =>
        confetti({
          particleCount: 20,
          spread: 140,
          startVelocity: 18,
          origin,
          colors,
          scalar: 0.7,
        }),
      520,
    );
  }, []);

  /* ---------- Success overlay scroll lock ---------- */
  useEffect(() => {
    document.body.style.overflow = success.open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [success.open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && success.open) {
        setSuccess((s) => ({ ...s, open: false }));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [success.open]);

  const closeSuccess = () => setSuccess((s) => ({ ...s, open: false }));

  /* ---------- Share ---------- */
  const shareText = `I signed up for BoardMate's beta. It helps you learn board games at the table. ${SITE_URL}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.warn('clipboard failed', err);
    }
  };

  return (
    <>
      {/* Floating decorative game pieces */}
      <div className="float-layer" aria-hidden="true">
        <FloatDie className="float-piece p1" />
        <FloatDiamond className="float-piece p2" />
        <FloatMeeple className="float-piece p3" />
        <FloatCard className="float-piece p4" />
        <FloatHex className="float-piece p5" />
        <FloatBlackDie className="float-piece p6" />
        <FloatToken className="float-piece p7" />
      </div>

      {/* Nav */}
      <header className="nav" id="nav" ref={navRef}>
        <a className="nav-brand" href="#top">
          <img src="/assets/logo.png" alt="BoardMate logo" width={36} height={36} />
          <span className="brand-word">BoardMate</span>
        </a>
        <a className="nav-cta" href="#join">Join waitlist</a>
      </header>

      <main id="top">

        {/* HERO */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy reveal">
              <Badge variant="stamp">Early beta · waitlist open</Badge>
              <h1 className="t-display">
                Learn board games
                <br />
                <span className="accent">by playing through them.</span>
              </h1>
              <p className="t-body lede">
                BoardMate walks you through setup, rules, and each turn while you&apos;re at the table. Tap through the game instead of flipping through a rulebook.
              </p>

              <SignupForm
                buttonLabel="Join waitlist"
                onSuccess={({ position, alreadyJoined }) => {
                  setCount(position);
                  setSuccess({ open: true, position, alreadyJoined });
                }}
                fireConfetti={fireConfetti}
              />

              <p className="counter-line t-helper">
                <span className="dot" />
                <strong ref={registerCounter}>{count.toLocaleString()}</strong> on the waitlist so far
              </p>
            </div>

            <div className="hero-mascot reveal" data-tilt>
              <div className="mascot-ring">
                <MascotVideo
                  className="mascot-video"
                  webm="/assets/videos/welcome.webm"
                  mp4="/assets/videos/welcome.mp4"
                  ariaLabel="BoardMate mascot waving hello"
                />
              </div>
              <div className="ring-glow" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section features">
          <div className="container">
            <div className="section-head reveal">
              <Badge variant="section" number="01">In the app</Badge>
              <h2 className="t-screen">Built for game night, not bedtime reading.</h2>
            </div>

            <div className="feature-grid">
              <article className="card reveal">
                <div className="card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </div>
                <h3 className="t-card">Pick a game</h3>
                <p className="t-body">Filter by players, play time, or how heavy the rules are. Find something that fits your group.</p>
              </article>

              <article className="card reveal">
                <div className="card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 17.5h7M17.5 14v7" />
                  </svg>
                </div>
                <h3 className="t-card">Set up without the manual</h3>
                <p className="t-body">Step-by-step setup on your phone. Board on the table, not a PDF on the couch.</p>
              </article>

              <article className="card reveal">
                <div className="card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h3 className="t-card">Rules when you need them</h3>
                <p className="t-body">Quick lookups for scoring, edge cases, and that one rule everyone always forgets.</p>
              </article>
            </div>
          </div>
        </section>

        {/* MASCOT SHOWCASE */}
        <section className="section showcase">
          <div className="container">
            <div className="showcase-row reverse reveal">
              <div className="showcase-video">
                <MascotVideo
                  webm="/assets/videos/teaching.webm"
                  mp4="/assets/videos/teaching.mp4"
                  ariaLabel="Mascot teaching"
                  playWhenVisible
                />
              </div>
              <div className="showcase-copy">
                <Badge variant="tag">Learn by doing</Badge>
                <h3 className="t-screen">Play your first turn, not page forty.</h3>
                <p className="t-body">Walk through each phase on your phone. Handy when someone&apos;s teaching the game and you want to follow along.</p>
              </div>
            </div>

            <div className="showcase-row reveal">
              <div className="showcase-video">
                <MascotVideo
                  webm="/assets/videos/thinking.webm"
                  mp4="/assets/videos/thinking.mp4"
                  ariaLabel="Mascot thinking"
                  playWhenVisible
                />
              </div>
              <div className="showcase-copy">
                <Badge variant="tag">Offline</Badge>
                <h3 className="t-screen">Saved for the basement.</h3>
                <p className="t-body">Download a game and its guides. Useful when the wifi dies mid-game.</p>
              </div>
            </div>
          </div>
        </section>

        {/* RULE CARDS */}
        <RuleCardCarousel />

        {/* PHONE APP PREVIEW */}
        <PhoneAppPreview />

        {/* COUNTER STRIP */}
        <section className="counter-strip">
          <div className="container counter-inner reveal">
            <div className="counter-big">
              <span ref={counterBigRef}>0</span>
              <span className="counter-plus">+</span>
            </div>
            <p className="t-section">signed up for early access.</p>
            <a className="btn-ghost" href="#join">Get on the list →</a>
          </div>
        </section>

        {/* FAQ */}
        <section className="section faq">
          <div className="container narrow">
            <div className="section-head reveal">
              <Badge variant="section" number="05">FAQ</Badge>
              <h2 className="t-screen">Questions</h2>
            </div>

            <FaqItem q="When can I try it?">
              We&apos;re getting a small beta ready now. Waitlist signups get invited before we open it up wider.
            </FaqItem>
            <FaqItem q="Is it free?">
              Yes, completely free. No paid features, no paywall. BoardMate is free for everyone.
            </FaqItem>
            <FaqItem q="Which games are in the beta?">
              We&apos;re starting with popular family, strategy, party, and card games. Tell us what you want on the waitlist and we&apos;ll prioritize it.
            </FaqItem>
            <FaqItem q="What do you do with my email?">
              We use it to send your beta invite and maybe a short update now and then. We don&apos;t sell it or hand it to marketers.
            </FaqItem>
          </div>
        </section>

        {/* FOOTER SIGNUP */}
        <section className="section join" id="join">
          <div className="container narrow">
            <div className="join-card reveal">
              <div className="join-mascot" data-tilt>
                <MascotVideo
                  webm="/assets/videos/welcome.webm"
                  mp4="/assets/videos/welcome.mp4"
                  ariaLabel="Mascot welcoming you"
                  playWhenVisible
                />
              </div>
              <h2 className="t-screen">Get early access</h2>
              <p className="t-body">We&apos;re opening a small beta soon. Drop your email and we&apos;ll send an invite when your spot&apos;s ready.</p>

              <SignupForm
                buttonLabel="Save my spot"
                onSuccess={({ position, alreadyJoined }) => {
                  setCount(position);
                  setSuccess({ open: true, position, alreadyJoined });
                }}
                fireConfetti={fireConfetti}
              />

              <p className="counter-line t-helper">
                <span className="dot" />
                <strong ref={registerCounter}>{count.toLocaleString()}</strong> on the waitlist so far
              </p>
            </div>
          </div>
        </section>

        {/* SUCCESS OVERLAY */}
        <div
          className={`success-overlay${success.open ? ' open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-hidden={!success.open}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSuccess();
          }}
        >
          <div className="success-card">
            <button
              className="success-close"
              type="button"
              aria-label="Close"
              onClick={closeSuccess}
            >
              &times;
            </button>
            <div className="success-mascot">
              <MascotVideo
                webm="/assets/videos/celebrating.webm"
                mp4="/assets/videos/celebrating.mp4"
                ariaLabel="Mascot celebrating"
                active={success.open}
              />
            </div>
            <Badge variant="tag">You&apos;re on the list</Badge>
            <h2 className="t-screen">
              Spot <span className="accent">#{success.position?.toLocaleString() ?? '…'}</span>
            </h2>
            <p className="t-body">
              {success.alreadyJoined
                ? "Looks like you signed up already. We'll email you when the beta opens."
                : "We'll email you when your beta invite is ready."}
            </p>

            <div className="share-row">
              <a className="share-btn share-x" href={xHref} target="_blank" rel="noopener" aria-label="Share on X">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.244 2H21l-6.52 7.45L22 22h-6.83l-4.78-6.247L4.8 22H2l7-8L2 2h6.91l4.32 5.71L18.244 2zm-2.39 18h1.86L8.21 4h-1.95l9.6 16z" />
                </svg>
                <span>Post</span>
              </a>
              <a className="share-btn share-wa" href={waHref} target="_blank" rel="noopener" aria-label="Share on WhatsApp">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20.5 3.5A11 11 0 0 0 3.4 16.8L2 22l5.3-1.4a11 11 0 0 0 16.2-9.5 11 11 0 0 0-3-7.6zM12 20.2c-1.7 0-3.3-.5-4.8-1.4l-.3-.2-3.1.8.8-3-.2-.3a9 9 0 1 1 7.6 4.1zm5-6.7c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.2l-.8 1c-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4a8 8 0 0 1-1.6-2c-.2-.3 0-.5.1-.7l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.9 1.1 3.1c.2.2 2 3.1 5 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.6-.7 1.9-1.4.2-.7.2-1.3.1-1.4 0-.1-.2-.2-.5-.3z" />
                </svg>
                <span>Share</span>
              </a>
              <button
                className={`share-btn share-copy${copied ? ' copied' : ''}`}
                type="button"
                aria-label="Copy link"
                onClick={onCopy}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>{copied ? 'Copied!' : 'Copy link'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <img src="/assets/logo.png" alt="" width={28} height={28} />
            <span>BoardMate</span>
          </div>
          <p className="t-helper">For people who&apos;d rather play than read rulebooks.</p>
        </div>
      </footer>
    </>
  );
}

/* ---------- Subcomponents ---------- */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function SignupForm({
  buttonLabel,
  onSuccess,
  fireConfetti,
}: {
  buttonLabel: string;
  onSuccess: (r: { position: number; alreadyJoined: boolean }) => void;
  fireConfetti: (el: HTMLElement | null) => void;
}) {
  const [state, setState] = useState<SubmitState>('idle');
  const [msg, setMsg] = useState<Msg>({ text: '', kind: null });
  const [email, setEmail] = useState('');
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setMsg({ text: 'Please enter a valid email.', kind: 'error' });
      return;
    }
    setState('loading');
    setMsg({ text: 'Adding you to the list…', kind: 'info' });

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      });
      const data: {
        ok?: boolean;
        position?: number;
        alreadyJoined?: boolean;
        error?: string;
      } = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setState('error');
        setMsg({
          text: data.error || 'Something went wrong. Please try again.',
          kind: 'error',
        });
        return;
      }

      setState('ok');
      setMsg({
        text: data.alreadyJoined
          ? 'You were already on the list.'
          : "You're on the list. Watch your inbox for the beta invite.",
        kind: 'ok',
      });
      setEmail('');
      onSuccess({
        position: data.position ?? 0,
        alreadyJoined: Boolean(data.alreadyJoined),
      });
      fireConfetti(buttonRef.current);
    } catch (err) {
      console.error(err);
      setState('error');
      setMsg({
        text: 'Network error. Please try again.',
        kind: 'error',
      });
    }
  };

  return (
    <form className="signup" onSubmit={onSubmit} noValidate>
      <label className="visually-hidden" htmlFor={`email-${buttonLabel}`}>
        Email address
      </label>
      <div className="signup-row">
        <input
          id={`email-${buttonLabel}`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          ref={buttonRef}
          type="submit"
          className={`btn-primary${state === 'loading' ? ' loading' : ''}`}
          disabled={state === 'loading'}
        >
          <span className="btn-label">{buttonLabel}</span>
          <span className="btn-spinner" aria-hidden="true" />
        </button>
      </div>
      <p
        className={`form-msg${msg.kind === 'ok' ? ' ok' : ''}${
          msg.kind === 'error' ? ' error' : ''
        }`}
      >
        {msg.text}
      </p>
    </form>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="faq-item reveal">
      <summary>
        <span>{q}</span>
        <span className="chev" aria-hidden="true">+</span>
      </summary>
      <p className="t-body">{children}</p>
    </details>
  );
}

/* ---------- Decorative floating pieces ---------- */

type SvgProps = { className?: string };

function FloatDie({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      <rect x="6" y="6" width="52" height="52" rx="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth={2} />
      <circle cx="20" cy="20" r="4" fill="#0F172A" />
      <circle cx="44" cy="20" r="4" fill="#0F172A" />
      <circle cx="32" cy="32" r="4" fill="#0F172A" />
      <circle cx="20" cy="44" r="4" fill="#0F172A" />
      <circle cx="44" cy="44" r="4" fill="#0F172A" />
    </svg>
  );
}
function FloatDiamond({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      <path d="M32 6 L58 32 L32 58 L6 32 Z" fill="#B8860B" opacity="0.85" />
    </svg>
  );
}
function FloatMeeple({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      <path
        d="M32 8 c-6 0-10 4-10 10 0 4 2 7 5 9 -7 2-13 8-13 18 v6 h36 v-6 c0-10-6-16-13-18 3-2 5-5 5-9 0-6-4-10-10-10z"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth={2}
      />
    </svg>
  );
}
function FloatCard({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      <rect x="10" y="6" width="44" height="52" rx="6" fill="#FFFFFF" stroke="#B8860B" strokeWidth={2} />
      <text x="18" y="24" fontFamily="serif" fontWeight={700} fontSize="18" fill="#B8860B">A</text>
      <path d="M32 30 l8 12 l-8 4 l-8 -4 z" fill="#B8860B" />
    </svg>
  );
}
function FloatHex({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      <polygon points="32,4 60,20 60,44 32,60 4,44 4,20" fill="#FFFEF0" stroke="#0F172A" strokeWidth={2} />
    </svg>
  );
}
function FloatBlackDie({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      <rect x="6" y="6" width="52" height="52" rx="12" fill="#0F172A" />
      <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
    </svg>
  );
}
function FloatToken({ className }: SvgProps) {
  return (
    <svg className={className} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="24" fill="#B8860B" />
      <circle cx="32" cy="32" r="14" fill="#FFFEF0" />
    </svg>
  );
}
