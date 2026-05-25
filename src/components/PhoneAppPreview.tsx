'use client';

import { useEffect, useRef, useState } from 'react';
import { CATAN_TURN_FLOW, type TurnPhase, type TurnPhaseIcon } from '@/lib/games';
import Badge from './Badge';
import MascotVideo from './MascotVideo';

const PHASE_MS = 3600;

/**
 * Faithful HTML/CSS recreation of the BoardMate Turn Flow screen
 * (lib/features/guides/presentation/pages/turn_flow_page.dart). Cycles through
 * Catan's 3 turn phases automatically when on-screen so it reads like a
 * screen recording of the app.
 */
export default function PhoneAppPreview() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setRunning(e.isIntersecting)),
      { threshold: 0.35 },
    );
    io.observe(containerRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % CATAN_TURN_FLOW.length);
    }, PHASE_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const phase = CATAN_TURN_FLOW[active];
  const upNext =
    active === CATAN_TURN_FLOW.length - 1 ? null : CATAN_TURN_FLOW[active + 1];

  return (
    <section className="section setup-demo">
      <div className="container setup-grid">
        <div className="setup-copy reveal">
          <Badge variant="section" number="04">A TURN IN CATAN</Badge>
          <h2 className="t-screen">Every turn, broken down.</h2>
          <p className="t-body">
            Inside BoardMate, every turn is a short flow you can follow at the table. Here&apos;s a peek of what a Catan turn looks like in the app:
          </p>

          <ol className="setup-steps">
            {CATAN_TURN_FLOW.map((p, i) => (
              <li
                key={p.order}
                className={`setup-step accent-${p.colorKey}${i === active ? ' active' : ''}${i < active ? ' done' : ''}`}
              >
                <button
                  type="button"
                  className="setup-step-btn"
                  onClick={() => setActive(i)}
                  aria-current={i === active ? 'step' : undefined}
                >
                  <span className="setup-step-num">
                    <PhaseIcon kind={p.iconKey} />
                  </span>
                  <span className="setup-step-label">
                    <strong>Phase {p.order} · {p.name}</strong>
                    <span className="t-helper">{p.description}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="phone-wrap reveal" ref={containerRef} aria-label="App preview">
          <div className="phone">
            <div className="phone-notch" aria-hidden="true" />
            <div className={`phone-screen accent-${phase.colorKey}`}>
              <header className="phone-bar">
                <span className="phone-back-btn" aria-hidden="true">‹</span>
                <span className="phone-bar-title">Turn Flow</span>
                <span className="phone-back-spacer" aria-hidden="true" />
              </header>

              <div className="phone-tf-body">
                <span className="phone-tf-label">A TURN IN CATAN</span>
                <h4 className="phone-tf-headline">
                  Every turn flows in <span className="accent">3 steps.</span>
                </h4>

                <div className="phone-bubble" key={phase.order}>
                  <div className="phone-bubble-mascot">
                    <MascotVideo
                      webm="/assets/videos/thinking.webm"
                      mp4="/assets/videos/thinking.mp4"
                      ariaLabel="Mascot thinking"
                      playWhenVisible
                    />
                  </div>
                  <div className="phone-bubble-text">
                    <strong>Phase {phase.order} — {phase.name}.</strong>{' '}
                    {phase.description}
                  </div>
                </div>

                <div className="phone-stepper" role="list">
                  {CATAN_TURN_FLOW.map((p, i) => (
                    <div
                      key={p.order}
                      className={`phone-stepper-chip accent-${p.colorKey}${i === active ? ' active' : ''}${i < active ? ' done' : ''}`}
                      role="listitem"
                    >
                      <div className="phone-stepper-icon">
                        <PhaseIcon kind={p.iconKey} small />
                        {i < active ? (
                          <span className="phone-stepper-check" aria-hidden="true">
                            <svg viewBox="0 0 8 8" width="8" height="8">
                              <path d="M1.5 4 L3.5 6 L7 1.8" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : null}
                      </div>
                      <span className="phone-stepper-name">{p.name}</span>
                    </div>
                  ))}
                </div>

                <div className={`phone-showcase accent-${phase.colorKey}`} key={`s-${phase.order}`}>
                  <div className="phone-showcase-blob" aria-hidden="true" />
                  <span className="phone-showcase-label">
                    PHASE {phase.order} OF {CATAN_TURN_FLOW.length}
                  </span>
                  <div className="phone-showcase-icon">
                    <PhaseIcon kind={phase.iconKey} large />
                  </div>
                  <h5 className="phone-showcase-name">{phase.name}</h5>
                  <div className={`phone-upnext${upNext ? '' : ' end'}`}>
                    {upNext ? (
                      <>
                        <PhaseIcon kind={upNext.iconKey} small />
                        <span>Up next · {upNext.name}</span>
                        <ArrowIcon />
                      </>
                    ) : (
                      <>
                        <FlagIcon />
                        <span>End of turn</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <footer className="phone-nav-row">
                <span className={`phone-nav-btn ghost${active === 0 ? ' disabled' : ''}`}>‹ Previous</span>
                <span className="phone-nav-btn solid">
                  {active === CATAN_TURN_FLOW.length - 1 ? 'Done ✓' : 'Next phase ›'}
                </span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhaseIcon({
  kind,
  small,
  large,
}: {
  kind: TurnPhaseIcon;
  small?: boolean;
  large?: boolean;
}) {
  const size = large ? 30 : small ? 14 : 18;
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (kind === 'dice') {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8" cy="8" r="1.2" fill="currentColor" />
        <circle cx="16" cy="8" r="1.2" fill="currentColor" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
        <circle cx="8" cy="16" r="1.2" fill="currentColor" />
        <circle cx="16" cy="16" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  if (kind === 'swap') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M7 10 L3 10 L7 6" />
        <path d="M3 10 H21" />
        <path d="M17 14 L21 14 L17 18" />
        <path d="M21 14 H3" />
      </svg>
    );
  }
  // hammer / build
  return (
    <svg {...common} aria-hidden="true">
      <path d="M14.7 6.3 a1 1 0 0 1 1.4 0 l1.6 1.6 a1 1 0 0 1 0 1.4 l-1.6 1.6 -3 -3 z" />
      <path d="M13.3 7.7 L4 17 l3 3 9.3 -9.3" />
      <path d="M16 2 L22 8" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
      <path d="M3 8 H12 M8 4 L12 8 L8 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path d="M4 14 V2 H12 L10 5 L12 8 H4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Re-export for convenience: TurnPhase type used in WaitlistPage if needed.
export type { TurnPhase };
