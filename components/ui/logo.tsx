import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Green sword (left to right diagonal) */}
        <g>
          {/* Blade */}
          <path
            d="M6 26 L24 8 L25 9 L7 27 Z"
            fill="#10b981"
            stroke="#059669"
            strokeWidth="0.5"
          />
          {/* Guard */}
          <rect
            x="22"
            y="6"
            width="4"
            height="1.5"
            fill="#10b981"
            transform="rotate(45 24 6.75)"
          />
          {/* Handle */}
          <path
            d="M25.5 9.5 L27 11"
            stroke="#059669"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Pommel */}
          <circle
            cx="27.5"
            cy="11.5"
            r="1"
            fill="#10b981"
          />
        </g>

        {/* Orange sword (right to left diagonal) */}
        <g>
          {/* Blade */}
          <path
            d="M26 26 L8 8 L7 9 L25 27 Z"
            fill="#f97316"
            stroke="#ea580c"
            strokeWidth="0.5"
          />
          {/* Guard */}
          <rect
            x="6"
            y="6"
            width="4"
            height="1.5"
            fill="#f97316"
            transform="rotate(-45 8 6.75)"
          />
          {/* Handle */}
          <path
            d="M6.5 9.5 L5 11"
            stroke="#ea580c"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Pommel */}
          <circle
            cx="4.5"
            cy="11.5"
            r="1"
            fill="#f97316"
          />
        </g>

        {/* Center intersection highlight */}
        <circle
          cx="16"
          cy="16"
          r="2"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="0.5"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}