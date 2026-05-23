import type { ReactNode } from 'react';

type BadgeVariant = 'stamp' | 'section' | 'tag';

type Props = {
  variant: BadgeVariant;
  children: ReactNode;
  number?: string;     // only used by `section`
  className?: string;
};

/**
 * Replacement for the old `.eyebrow` class. Three visual variants:
 *  - stamp:   gold-outlined chip, slightly rotated. Hero only.
 *  - section: gold accent rule + optional number, e.g. — 02 / WHAT YOU'LL GET —
 *  - tag:     small ivory pill with a leading dot.
 *
 * All three are sized to their content and use `align-self: flex-start` by
 * default; parents that center children (section-head, join-card) still win.
 */
export default function Badge({ variant, children, number, className }: Props) {
  if (variant === 'stamp') {
    return (
      <span className={`badge badge-stamp${className ? ' ' + className : ''}`}>
        <span className="badge-stamp-pip" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <rect x="1.5" y="1.5" width="13" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth={1.6} />
            <circle cx="5" cy="5" r="1.2" fill="currentColor" />
            <circle cx="11" cy="5" r="1.2" fill="currentColor" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" />
            <circle cx="5" cy="11" r="1.2" fill="currentColor" />
            <circle cx="11" cy="11" r="1.2" fill="currentColor" />
          </svg>
        </span>
        <span className="badge-stamp-text">{children}</span>
      </span>
    );
  }

  if (variant === 'section') {
    return (
      <span className={`badge badge-section${className ? ' ' + className : ''}`}>
        <span className="badge-section-rule" aria-hidden="true" />
        {number ? <span className="badge-section-num">{number}</span> : null}
        <span className="badge-section-text">{children}</span>
        <span className="badge-section-rule" aria-hidden="true" />
      </span>
    );
  }

  // tag
  return (
    <span className={`badge badge-tag${className ? ' ' + className : ''}`}>
      <span className="badge-tag-dot" aria-hidden="true" />
      <span className="badge-tag-text">{children}</span>
    </span>
  );
}
