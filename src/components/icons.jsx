/* Tiny hand-tuned SVGs so the art reads the same on every phone. */

export const BirdGlyph = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 40 16" fill="none">
    <path d="M2 10c5-6 11-7 18 0 7-7 13-6 18 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/** A round little perched bird (Jess's favorite). */
export const Bird = ({ className = "", ...rest }) => (
  <svg className={className} viewBox="0 0 64 56" {...rest}>
    <path d="M10 40c8 2 14 1 18-3" stroke="#5a2152" strokeWidth="3" strokeLinecap="round" fill="none" />
    <ellipse cx="34" cy="30" rx="20" ry="17" fill="#f6a5bd" />
    <path d="M22 30c6 9 18 10 26 2-4 12-22 14-26-2z" fill="#ffe4ec" />
    <path d="M24 24c5-4 13-3 16 3-6 1-11 0-16-3z" fill="#e0708f" />
    <circle cx="44" cy="23" r="2.6" fill="#2b2340" />
    <circle cx="45" cy="22" r="0.8" fill="#fff" />
    <path d="M53 25l8 2-8 3z" fill="#f6c96b" />
    <circle cx="47" cy="29" r="2.4" fill="#e98a9a" opacity=".55" />
    <path d="M30 46l-2 7M38 46l1 7" stroke="#5a2152" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const Moon = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M15.5 3.2A9 9 0 1 0 20.8 15 7.2 7.2 0 0 1 15.5 3.2z" fill="currentColor" />
  </svg>
);

export const Star = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M12 2.5l2.4 6.3 6.6.5-5 4.3 1.6 6.6L12 16.6l-5.6 3.6 1.6-6.6-5-4.3 6.6-.5z" fill="currentColor" />
  </svg>
);

export const Heart = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M12 20.5s-8-4.9-8-11A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.5c0 6.1-8 11-8 11z" fill="currentColor" />
  </svg>
);

export const BirdIcon = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M3 13c2.5 4 7 5.5 11 4.5 3-.8 5-3 5.6-5.8L22 10l-2.6-.6A4 4 0 0 0 12 9.5L9.6 12 3 13z" fill="currentColor" />
  </svg>
);

export const Pin = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor" />
  </svg>
);
