export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif text-lg font-medium tracking-tight ${className}`}>
      Weddings for <span className="italic text-champagne">One</span>
    </span>
  );
}

export function Monogram({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1" />
      <text
        x="32"
        y="34"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontSize="24"
        fill="currentColor"
      >
        W
      </text>
      <text
        x="32"
        y="46"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="6.5"
        letterSpacing="2"
        fill="currentColor"
      >
        ONE
      </text>
    </svg>
  );
}
