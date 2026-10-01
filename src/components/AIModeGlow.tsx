interface AIModeGlowProps {
  /** Boosts scale/opacity to signal focus or active processing */
  active?: boolean;
  className?: string;
  /** Multiplies the blob float durations — 1 = default, 2 = twice as slow. */
  speed?: number;
}

/**
 * Fluid, morphing gradient glow used behind AI Mode surfaces (search bar, full-screen panel).
 * Three blurred blobs float on independent loops for an organic, cloud-like feel — tuned as a
 * soft pastel aura for a light UI (screen/color-dodge blend modes wash out against a near-white page).
 * Only `transform`/`opacity` are animated — the blur radius stays constant — to keep this cheap to render.
 */
export default function AIModeGlow({ active = false, className = '', speed = 1 }: AIModeGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
      style={{
        opacity: active ? 1 : 0.85,
        transition: 'opacity 400ms ease',
      }}
    >
      <div
        className="absolute inset-[-40%] will-change-transform"
        style={{ filter: 'blur(var(--glow-blur-radius))' }}
      >
        <div
          className="absolute left-1/4 top-1/4 w-2/3 h-2/3 rounded-full will-change-transform"
          style={{
            background: 'var(--brand-gradient-1)',
            opacity: 0.45,
            animation: `ai-blob-float-1 ${9 * speed}s ease-in-out infinite`,
            transform: active ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 500ms ease',
          }}
        />
        <div
          className="absolute right-1/4 top-1/3 w-2/3 h-2/3 rounded-full will-change-transform"
          style={{
            background: 'var(--brand-gradient-2)',
            opacity: 0.35,
            animation: `ai-blob-float-2 ${11 * speed}s ease-in-out infinite`,
            transform: active ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 500ms ease',
          }}
        />
        <div
          className="absolute left-1/3 bottom-1/4 w-1/2 h-1/2 rounded-full will-change-transform"
          style={{
            background: 'var(--brand-gradient-3)',
            opacity: 0.4,
            animation: `ai-blob-float-3 ${8 * speed}s ease-in-out infinite`,
            transform: active ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 500ms ease',
          }}
        />
      </div>
    </div>
  );
}
