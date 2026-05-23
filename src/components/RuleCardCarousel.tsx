'use client';

import { useState } from 'react';
import { GAMES, type GameGlyph, type GameTeaser } from '@/lib/games';
import Badge from './Badge';

// Show three iconic games — one per category — so the section reads cleanly
// at every breakpoint without horizontal scroll.
const FEATURED = GAMES.filter((g) =>
  ['catan', 'codenames', 'ticket-to-ride'].includes(g.id),
);

export default function RuleCardCarousel() {
  return (
    <section className="section rule-cards">
      <div className="container">
        <div className="section-head reveal">
          <Badge variant="section" number="03">SNEAK PEEK</Badge>
          <h2 className="t-screen">Rules, made friendly.</h2>
          <p className="t-body lede">
            Tap any card to see how BoardMate explains the goal of the game — short, plain, ready for the table.
          </p>
        </div>

        <div className="rule-card-grid" role="list">
          {FEATURED.map((g) => (
            <RuleCard key={g.id} game={g} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RuleCard({ game }: { game: GameTeaser }) {
  const [flipped, setFlipped] = useState(false);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((v) => !v);
    }
  };

  return (
    <div className="rule-card reveal" role="listitem">
      <button
        type="button"
        className={`rule-card-inner${flipped ? ' flipped' : ''}`}
        aria-label={`${game.name}: tap to ${flipped ? 'hide' : 'see'} the objective`}
        aria-pressed={flipped}
        onClick={() => setFlipped((v) => !v)}
        onKeyDown={onKey}
      >
        {/* Front */}
        <div className="rule-card-face rule-card-front">
          <span className={`rule-card-tag cat-${game.category.toLowerCase()}`}>
            {game.category}
          </span>
          <Glyph kind={game.glyph} />
          <h3 className="t-card">{game.name}</h3>
          <p className="t-helper">{game.oneLine}</p>
          <span className="rule-card-cta">
            <span>Tap to see the goal</span>
            <ArrowIcon />
          </span>
        </div>
        {/* Back */}
        <div className="rule-card-face rule-card-back">
          <span className="rule-card-back-eyebrow t-label">The goal</span>
          <p className="t-body rule-card-objective">{game.objective}</p>
          <span className="rule-card-cta">
            <span>Flip back</span>
            <ArrowIcon flip />
          </span>
        </div>
      </button>
    </div>
  );
}

function Glyph({ kind }: { kind: GameGlyph }) {
  const common = {
    width: 56,
    height: 56,
    viewBox: '0 0 64 64',
  } as const;

  if (kind === 'hex') {
    return (
      <svg {...common} aria-hidden="true">
        <polygon points="32,4 60,20 60,44 32,60 4,44 4,20" fill="#FFFEF0" stroke="#B8860B" strokeWidth={2.5} />
        <polygon points="32,16 50,26 50,42 32,52 14,42 14,26" fill="#B8860B" opacity="0.18" />
      </svg>
    );
  }
  if (kind === 'meeple') {
    return (
      <svg {...common} aria-hidden="true">
        <path
          d="M32 8 c-6 0-10 4-10 10 0 4 2 7 5 9 -7 2-13 8-13 18 v6 h36 v-6 c0-10-6-16-13-18 3-2 5-5 5-9 0-6-4-10-10-10z"
          fill="#0F172A"
        />
      </svg>
    );
  }
  if (kind === 'card') {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="14" y="6" width="36" height="52" rx="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth={2} />
        <rect x="20" y="6" width="36" height="52" rx="6" transform="rotate(8 38 32)" fill="#B8860B" opacity="0.92" />
        <rect x="26" y="6" width="36" height="52" rx="6" transform="rotate(16 44 32)" fill="#0F172A" opacity="0.9" />
      </svg>
    );
  }
  if (kind === 'die') {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="6" y="6" width="52" height="52" rx="12" fill="#0F172A" />
        <circle cx="20" cy="20" r="4" fill="#FFFEF0" />
        <circle cx="44" cy="20" r="4" fill="#FFFEF0" />
        <circle cx="32" cy="32" r="4" fill="#B8860B" />
        <circle cx="20" cy="44" r="4" fill="#FFFEF0" />
        <circle cx="44" cy="44" r="4" fill="#FFFEF0" />
      </svg>
    );
  }
  // token
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="32" cy="32" r="26" fill="#B8860B" />
      <circle cx="32" cy="32" r="18" fill="#FFFEF0" />
      <circle cx="32" cy="32" r="9" fill="#0F172A" />
    </svg>
  );
}

function ArrowIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      style={{ transform: flip ? 'rotate(180deg)' : undefined }}
      aria-hidden="true"
    >
      <path d="M3 8 H12 M8 4 L12 8 L8 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
