interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

export default function Logo({ className = '', variant = 'icon' }: LogoProps) {
  if (variant === 'full') {
    return (
      <img
        src="/logo.svg"
        alt="Numerika Consultores"
        className={className}
      />
    );
  }

  // Icon only version
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circles */}
      <circle cx="90" cy="55" r="20" fill="#AA73F3"/>
      <circle cx="90" cy="100" r="12" fill="#AA73F3"/>
      <circle cx="90" cy="135" r="15" fill="#AA73F3" opacity="0.6"/>

      {/* Arc shape */}
      <path d="M 40 40 Q 20 90 40 140" stroke="#2B2D42" strokeWidth="18" fill="none" strokeLinecap="round"/>
      <path d="M 140 40 Q 160 90 140 140" stroke="#AA73F3" strokeWidth="15" fill="none" strokeLinecap="round" opacity="0.5"/>

      {/* Person icon */}
      <rect x="78" y="85" width="24" height="50" rx="4" fill="#2B2D42"/>
      <circle cx="90" cy="68" r="14" fill="#2B2D42"/>
    </svg>
  );
}
