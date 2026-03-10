export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="pw-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6C3FE8" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* Rounded square background */}
      <rect width="32" height="32" rx="7" fill="url(#pw-grad)" />

      {/* Three stacked card rows = the "wall" */}
      {/* Top row: two blocks */}
      <rect x="5" y="5" width="10" height="6" rx="1.5" fill="white" opacity="0.95" />
      <rect x="17" y="5" width="10" height="6" rx="1.5" fill="white" opacity="0.55" />

      {/* Middle row: one wide block with a star */}
      <rect x="5" y="13" width="22" height="6" rx="1.5" fill="white" opacity="0.85" />
      {/* 5-point star on the middle card */}
      <path
        d="M9.5 14.4l.74 1.5 1.66.24-1.2 1.17.28 1.65L9.5 18l-1.48.96.28-1.65-1.2-1.17 1.66-.24z"
        fill="#6C3FE8"
        opacity="0.9"
      />

      {/* Bottom row: two blocks */}
      <rect x="5" y="21" width="13" height="6" rx="1.5" fill="white" opacity="0.55" />
      <rect x="20" y="21" width="7" height="6" rx="1.5" fill="white" opacity="0.35" />
    </svg>
  );
}
