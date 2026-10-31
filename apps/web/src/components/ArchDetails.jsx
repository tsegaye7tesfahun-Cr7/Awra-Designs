/**
 * Architectural finishing touches — decorative only.
 * All elements are:
 * - pointer-events-none (never interfere with UI)
 * - aria-hidden (invisible to screen readers)
 * - Very low opacity (2–10%)
 * - Pure SVG or CSS
 */

// ── CAD corner marker ─────────────────────────────────────────────────────────
// Renders 4 thin L-shaped corner brackets around a container element.
// Usage: place as absolute child inside a relative container.
export function CadCorners({ size = 12, gap = 0, opacity = 0.18, color = '#ffffff' }) {
  const s = size
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ opacity }}
    >
      {/* Top-left */}
      <polyline points={`${gap},${gap + s} ${gap},${gap} ${gap + s},${gap}`}
        fill="none" stroke={color} strokeWidth="0.8" />
      {/* Top-right */}
      <polyline points={`calc(100% - ${gap + s}px),${gap} calc(100% - ${gap}px),${gap} calc(100% - ${gap}px),${gap + s}`}
        fill="none" stroke={color} strokeWidth="0.8" />
      {/* Bottom-left */}
      <polyline points={`${gap},calc(100% - ${gap + s}px) ${gap},calc(100% - ${gap}px) ${gap + s},calc(100% - ${gap}px)`}
        fill="none" stroke={color} strokeWidth="0.8" />
      {/* Bottom-right */}
      <polyline points={`calc(100% - ${gap + s}px),calc(100% - ${gap}px) calc(100% - ${gap}px),calc(100% - ${gap}px) calc(100% - ${gap}px),calc(100% - ${gap + s}px)`}
        fill="none" stroke={color} strokeWidth="0.8" />
    </svg>
  )
}

// ── Blueprint grid ────────────────────────────────────────────────────────────
// Large-spacing blueprint grid — used in Hero and Footer.
export function BlueprintGrid({ opacity = 0.035, gridSize = 64 }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ opacity }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="bp-grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
          {/* Major grid lines */}
          <path
            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
            fill="none"
            stroke="#4e9eff"
            strokeWidth="0.5"
          />
          {/* Minor cross at midpoint */}
          <line x1={gridSize / 2} y1="0" x2={gridSize / 2} y2={gridSize}
            stroke="#4e9eff" strokeWidth="0.2" strokeDasharray="1,4" />
          <line x1="0" y1={gridSize / 2} x2={gridSize} y2={gridSize / 2}
            stroke="#4e9eff" strokeWidth="0.2" strokeDasharray="1,4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" />
    </svg>
  )
}

// ── Floor plan fragment ───────────────────────────────────────────────────────
// Abstract partial floor plan / elevation lines.
export function FloorPlanFragment({ opacity = 0.025, className = '' }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={`absolute pointer-events-none ${className}`}
      aria-hidden="true"
      style={{ opacity }}
      fill="none"
      stroke="#ffffff"
      strokeWidth="0.7"
    >
      {/* Outer room boundary */}
      <rect x="20" y="20" width="180" height="130" />
      {/* Inner wall partition */}
      <line x1="20" y1="90" x2="120" y2="90" />
      <line x1="120" y1="20" x2="120" y2="150" />
      {/* Door swing arc — top left room */}
      <path d="M 60 20 A 40 40 0 0 1 20 60" strokeDasharray="2,3" />
      {/* Window symbols */}
      <line x1="140" y1="20" x2="180" y2="20" strokeWidth="2" />
      <line x1="140" y1="16" x2="180" y2="16" strokeWidth="0.5" />
      <line x1="140" y1="24" x2="180" y2="24" strokeWidth="0.5" />
      {/* Staircase fragment */}
      <line x1="230" y1="20" x2="360" y2="20" />
      <line x1="230" y1="30" x2="360" y2="30" />
      <line x1="230" y1="40" x2="360" y2="40" />
      <line x1="230" y1="50" x2="360" y2="50" />
      <line x1="230" y1="60" x2="360" y2="60" />
      <line x1="230" y1="20" x2="230" y2="60" />
      <line x1="360" y1="20" x2="360" y2="60" />
      {/* Elevation fragment — bottom area */}
      <polyline points="20,220 20,200 80,200 80,180 160,180 160,200 240,200 240,220 20,220" />
      <line x1="80" y1="200" x2="80" y2="220" strokeDasharray="2,2" />
      <line x1="160" y1="180" x2="160" y2="220" strokeDasharray="2,2" />
      {/* Window in elevation */}
      <rect x="100" y="185" width="40" height="25" />
      <line x1="120" y1="185" x2="120" y2="210" strokeWidth="0.4" />
      <line x1="100" y1="197" x2="140" y2="197" strokeWidth="0.4" />
      {/* Dimension tick lines */}
      <line x1="20" y1="240" x2="240" y2="240" strokeWidth="0.5" />
      <line x1="20" y1="236" x2="20" y2="244" strokeWidth="0.5" />
      <line x1="240" y1="236" x2="240" y2="244" strokeWidth="0.5" />
      <line x1="130" y1="236" x2="130" y2="244" strokeWidth="0.5" />
    </svg>
  )
}

// ── Dimension line ────────────────────────────────────────────────────────────
// A single horizontal dimension line with arrows and a centered value label.
// Animates in when inView is true.
export function DimensionLine({ value, label, width = 120, opacity = 0.35, inView = true }) {
  return (
    <div
      className="flex items-center gap-3 pointer-events-none select-none"
      aria-hidden="true"
      style={{ opacity: inView ? opacity : 0, transition: 'opacity 0.8s ease' }}
    >
      {/* Left arrow + line */}
      <svg width={width / 2} height="16" viewBox={`0 0 ${width / 2} 16`} fill="none">
        <line x1={width / 2} y1="8" x2="6" y2="8" stroke="#ffffff" strokeWidth="0.6" />
        <polyline points={`6,5 0,8 6,11`} fill="none" stroke="#ffffff" strokeWidth="0.6" />
        {/* Tick at start */}
        <line x1={width / 2} y1="4" x2={width / 2} y2="12" stroke="#ffffff" strokeWidth="0.6" />
      </svg>

      {/* Value */}
      <div className="text-center">
        <div className="font-display text-3xl sm:text-4xl font-medium text-white leading-none">{value}</div>
        {label && <div className="label-text mt-1">{label}</div>}
      </div>

      {/* Right arrow + line */}
      <svg width={width / 2} height="16" viewBox={`0 0 ${width / 2} 16`} fill="none">
        <line x1="0" y1="8" x2={width / 2 - 6} y2="8" stroke="#ffffff" strokeWidth="0.6" />
        <polyline points={`${width / 2 - 6},5 ${width / 2},8 ${width / 2 - 6},11`} fill="none" stroke="#ffffff" strokeWidth="0.6" />
        {/* Tick at end */}
        <line x1="0" y1="4" x2="0" y2="12" stroke="#ffffff" strokeWidth="0.6" />
      </svg>
    </div>
  )
}

// ── Drawing reference annotation ──────────────────────────────────────────────
// Tiny technical annotation label — A-101, GRID B2, 1:100, etc.
export function DrawingRef({ text, className = '', opacity = 0.07 }) {
  return (
    <span
      className={`absolute font-mono text-[9px] uppercase tracking-[0.2em] text-white pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ opacity, letterSpacing: '0.18em' }}
    >
      {text}
    </span>
  )
}

// ── Section heading with CAD corner markers ───────────────────────────────────
// Wraps any heading text with thin L-bracket corners.
export function ArchHeading({ children, className = '', markerOpacity = 0.12 }) {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Top-left corner */}
      <span className="absolute -top-2 -left-3 pointer-events-none" aria-hidden="true" style={{ opacity: markerOpacity }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <polyline points="10,0 0,0 0,10" stroke="#ffffff" strokeWidth="0.8" />
        </svg>
      </span>
      {/* Top-right corner */}
      <span className="absolute -top-2 -right-3 pointer-events-none" aria-hidden="true" style={{ opacity: markerOpacity }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <polyline points="0,0 10,0 10,10" stroke="#ffffff" strokeWidth="0.8" />
        </svg>
      </span>
      {children}
      {/* Bottom-left corner */}
      <span className="absolute -bottom-2 -left-3 pointer-events-none" aria-hidden="true" style={{ opacity: markerOpacity }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <polyline points="0,0 0,10 10,10" stroke="#ffffff" strokeWidth="0.8" />
        </svg>
      </span>
      {/* Bottom-right corner */}
      <span className="absolute -bottom-2 -right-3 pointer-events-none" aria-hidden="true" style={{ opacity: markerOpacity }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <polyline points="10,0 10,10 0,10" stroke="#ffffff" strokeWidth="0.8" />
        </svg>
      </span>
    </div>
  )
}

// ── Sheet reference ───────────────────────────────────────────────────────
// Architectural drawing sheet code — e.g. "A-001 // HOME"
// Renders fixed in the bottom-right corner of a relative section.
export function SheetRef({ code, title }) {
  return (
    <span
      className="absolute bottom-4 right-4 md:bottom-6 md:right-6 pointer-events-none select-none"
      aria-hidden="true"
      style={{ opacity: 0.07 }}
    >
      <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-[0.22em] text-white">
        {code}
        <span className="mx-1.5 opacity-50">//</span>
        {title}
      </span>
    </span>
  )
}
