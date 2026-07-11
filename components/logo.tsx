// Bezoekje mark: a calendar with a heart. Adapted from the brand SVG for
// inline use — background dropped, stroke follows currentColor, viewBox
// tightened to the glyph and stroke bumped so it stays legible at ~32px.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="358 320 538 570"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="34"
    >
      <path
        d="M 626.5 666 C 596.5 636 593 630.5 560 630.5 C 518.9 630.5 485.5 661.6 485.5 700 C 485.5 759 530.6 789.8 584 848 A 12 12 0 0 1 575.2 868 L 446 868 A 66.5 66.5 0 0 1 379.5 801.5 L 379.5 457 A 66.5 66.5 0 0 1 446 390.5 L 808 390.5 A 66.5 66.5 0 0 1 874.5 457 L 874.5 801.5 A 66.5 66.5 0 0 1 808 868 L 677.8 868 A 12 12 0 0 1 669 848 C 722.4 789.8 767.5 759 767.5 700 C 767.5 661.6 734.1 630.5 693 630.5 C 660 630.5 656.5 636 626.5 666 Z"
        strokeLinejoin="round"
      />
      <line x1="379.5" y1="514" x2="874.5" y2="514" />
      <line x1="491.5" y1="341.5" x2="491.5" y2="432.5" strokeLinecap="round" />
      <line x1="761.5" y1="341.5" x2="761.5" y2="432.5" strokeLinecap="round" />
    </svg>
  );
}
