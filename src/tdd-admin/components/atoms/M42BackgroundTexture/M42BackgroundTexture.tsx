import React from 'react'

export interface M42BackgroundTextureProps {
  className?: string
}

export const M42BackgroundTexture: React.FC<M42BackgroundTextureProps> = ({ className = '' }) => {
  return (
    <div
      className={[
        'absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-br from-[#f6f9fc] via-[#ebf3f9] to-[#dff0f4]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Bottom-Right Faint Abstract Geometric Line Shapes (Triangular / Angled M42 Forms) */}
      <svg
        className="absolute -bottom-10 -right-10 w-[480px] h-[480px] opacity-[0.08] text-[#0d212c]"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 50 350 L 350 50 L 350 350 Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 120 380 L 380 120 L 380 380 Z"
          stroke="#36c0c9"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M 200 400 L 400 200 L 400 400 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <line x1="50" y1="350" x2="380" y2="120" stroke="#36c0c9" strokeWidth="1" />
        <line x1="120" y1="380" x2="400" y2="200" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Bottom-Left Halftone / Dotted Gradient Pattern with Radial Fade */}
      <div className="absolute -bottom-8 -left-8 w-64 h-64 opacity-[0.12] pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
          <defs>
            <radialGradient id="dotFade" cx="0%" cy="100%" r="100%">
              <stop offset="0%" stopColor="#0d212c" stopOpacity="1" />
              <stop offset="60%" stopColor="#0d212c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0d212c" stopOpacity="0" />
            </radialGradient>
            <mask id="halftoneMask">
              <rect width="200" height="200" fill="url(#dotFade)" />
            </mask>
          </defs>
          <g mask="url(#halftoneMask)">
            {Array.from({ length: 10 }).map((_, row) =>
              Array.from({ length: 10 }).map((_, col) => (
                <circle
                  key={`dot-${row}-${col}`}
                  cx={col * 18 + 12}
                  cy={row * 18 + 12}
                  r="2.5"
                  fill="#0d212c"
                />
              ))
            )}
          </g>
        </svg>
      </div>

      {/* Subtle Tonal Top-Left Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ffffff]/60 rounded-full blur-3xl pointer-events-none" />
    </div>
  )
}
