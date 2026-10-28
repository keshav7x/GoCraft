type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M18.2 7.4A7.2 7.2 0 1 0 19.2 12h-5.1"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18.6" cy="5.6" r="1.5" fill="currentColor" />
      </svg>
    </span>
  );
}
