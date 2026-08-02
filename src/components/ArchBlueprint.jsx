import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

/**
 * Monochrome architectural floor-plan illustration.
 * Pure SVG — no images, no external assets, zero network requests.
 * Fades in on load, has slow parallax on mouse move.
 * Positioned on the right half, cropped artistically.
 */
export default function ArchBlueprint() {
  const containerRef = useRef(null)

  // Raw mouse position (0–1 across viewport)
  const rawX = useMotionValue(0.5)
  const rawY = useMotionValue(0.5)

  // Smooth spring — very slow, elegant
  const springConfig = { stiffness: 18, damping: 30, mass: 1.2 }
  const smoothX = useSpring(rawX, springConfig)
  const smoothY = useSpring(rawY, springConfig)

  // Translate range: ±12px — subtle enough to feel like depth, not distraction
  const translateX = useTransform(smoothX, [0, 1], [12, -12])
  const translateY = useTransform(smoothY, [0, 1], [10, -10])

  useEffect(() => {
    const onMove = (e) => {
      rawX.set(e.clientX / window.innerWidth)
      rawY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [rawX, rawY])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Fade-in wrapper */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, ease: 'easeOut', delay: 0.3 }}
      >
        {/* Parallax wrapper */}
        <motion.div
          className="absolute inset-0"
          style={{ x: translateX, y: translateY }}
        >
          {/* Left-side gradient fade — keeps text legible */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #0a0a0a 0%, #0a0a0a 30%, rgba(10,10,10,0.7) 50%, transparent 70%)',
            }}
          />

          {/* Vignette edges */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
            }}
          />

          {/* The SVG floor plan — offset to right */}
          <div className="absolute top-0 right-0 h-full flex items-center"
            style={{ width: '72%', transform: 'translateX(8%)' }}>
            <FloorPlanSVG />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

function FloorPlanSVG() {
  return (
    <svg
      viewBox="0 0 900 700"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{
        opacity: 0.22,
        filter: 'drop-shadow(0 0 1.5px rgba(255,255,255,0.35))',
      }}
    >
      <defs>
        {/* Very subtle drafting grid — 5% opacity */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.08"/>
        </pattern>
        {/* Noise texture filter */}
        <filter id="noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
          <feBlend in="SourceGraphic" in2="grayNoise" mode="soft-light" result="blended"/>
          <feComposite in="blended" in2="SourceGraphic" operator="in"/>
        </filter>
      </defs>

      {/* Drafting grid background */}
      <rect width="900" height="700" fill="url(#grid)" />

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* OUTER WALLS — thick, 2.5px — the main building envelope        */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <g stroke="#ffffff" fill="none" strokeLinecap="square" strokeLinejoin="miter">

        {/* Main outer wall */}
        <rect x="80" y="60" width="740" height="580" stroke="#ffffff" strokeWidth="2.5" fill="none"/>

        {/* Inner wall offset (creates wall thickness) */}
        <rect x="92" y="72" width="716" height="556" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" fill="none"/>

        {/* ── INTERIOR PARTITION WALLS ── */}

        {/* Vertical divider — living / bedroom wing */}
        <line x1="400" y1="60" x2="400" y2="390" stroke="#ffffff" strokeWidth="2" />
        <line x1="412" y1="60" x2="412" y2="390" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.35"/>

        {/* Horizontal divider — upper / lower zone */}
        <line x1="80" y1="390" x2="580" y2="390" stroke="#ffffff" strokeWidth="2" />
        <line x1="80" y1="402" x2="580" y2="402" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.35"/>

        {/* Right wing horizontal split */}
        <line x1="580" y1="60" x2="580" y2="640" stroke="#ffffff" strokeWidth="2" />
        <line x1="592" y1="60" x2="592" y2="640" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.35"/>

        {/* Bathroom / utility partition — lower left */}
        <line x1="260" y1="390" x2="260" y2="640" stroke="#ffffff" strokeWidth="2" />
        <line x1="272" y1="390" x2="272" y2="640" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.35"/>

        {/* Inner bedroom partition */}
        <line x1="400" y1="230" x2="580" y2="230" stroke="#ffffff" strokeWidth="2" />
        <line x1="400" y1="242" x2="580" y2="242" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.35"/>

        {/* Kitchen / dining divider */}
        <line x1="580" y1="320" x2="820" y2="320" stroke="#ffffff" strokeWidth="2" />
        <line x1="580" y1="332" x2="820" y2="332" stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.35"/>

        {/* ── DOORS ── arc style, 0.8px */}

        {/* Main entrance door — bottom wall */}
        <path d="M 170 640 L 170 600 A 40 40 0 0 1 210 640 Z"
          stroke="#ffffff" strokeWidth="0.8" fill="none" strokeOpacity="0.9"/>
        <line x1="170" y1="640" x2="170" y2="600" stroke="#ffffff" strokeWidth="1.5" />

        {/* Living room door */}
        <path d="M 400 330 L 360 330 A 40 40 0 0 0 400 290 Z"
          stroke="#ffffff" strokeWidth="0.8" fill="none" strokeOpacity="0.9"/>
        <line x1="400" y1="330" x2="400" y2="290" stroke="#ffffff" strokeWidth="1.5" />

        {/* Master bedroom door */}
        <path d="M 412 140 L 452 140 A 40 40 0 0 0 412 100 Z"
          stroke="#ffffff" strokeWidth="0.8" fill="none" strokeOpacity="0.9"/>
        <line x1="412" y1="140" x2="412" y2="100" stroke="#ffffff" strokeWidth="1.5" />

        {/* Bathroom door */}
        <path d="M 260 480 L 300 480 A 40 40 0 0 0 260 440 Z"
          stroke="#ffffff" strokeWidth="0.8" fill="none" strokeOpacity="0.9"/>
        <line x1="260" y1="480" x2="260" y2="440" stroke="#ffffff" strokeWidth="1.5" />

        {/* Kitchen door */}
        <path d="M 580 260 L 620 260 A 40 40 0 0 0 580 220 Z"
          stroke="#ffffff" strokeWidth="0.8" fill="none" strokeOpacity="0.9"/>
        <line x1="580" y1="260" x2="580" y2="220" stroke="#ffffff" strokeWidth="1.5" />

        {/* ── WINDOWS ── triple-line style */}

        {/* Top wall windows */}
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.85">
          <line x1="140" y1="60" x2="240" y2="60"/>
          <line x1="140" y1="66" x2="240" y2="66"/>
          <line x1="140" y1="72" x2="240" y2="72"/>
          <line x1="140" y1="54" x2="140" y2="78"/>
          <line x1="240" y1="54" x2="240" y2="78"/>
        </g>
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.85">
          <line x1="450" y1="60" x2="560" y2="60"/>
          <line x1="450" y1="66" x2="560" y2="66"/>
          <line x1="450" y1="72" x2="560" y2="72"/>
          <line x1="450" y1="54" x2="450" y2="78"/>
          <line x1="560" y1="54" x2="560" y2="78"/>
        </g>
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.85">
          <line x1="640" y1="60" x2="760" y2="60"/>
          <line x1="640" y1="66" x2="760" y2="66"/>
          <line x1="640" y1="72" x2="760" y2="72"/>
          <line x1="640" y1="54" x2="640" y2="78"/>
          <line x1="760" y1="54" x2="760" y2="78"/>
        </g>

        {/* Right wall windows */}
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.85">
          <line x1="820" y1="150" x2="820" y2="260"/>
          <line x1="814" y1="150" x2="814" y2="260"/>
          <line x1="808" y1="150" x2="808" y2="260"/>
          <line x1="802" y1="150" x2="826" y2="150"/>
          <line x1="802" y1="260" x2="826" y2="260"/>
        </g>
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.85">
          <line x1="820" y1="420" x2="820" y2="530"/>
          <line x1="814" y1="420" x2="814" y2="530"/>
          <line x1="808" y1="420" x2="808" y2="530"/>
          <line x1="802" y1="420" x2="826" y2="420"/>
          <line x1="802" y1="530" x2="826" y2="530"/>
        </g>

        {/* Bottom wall windows */}
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.85">
          <line x1="340" y1="640" x2="500" y2="640"/>
          <line x1="340" y1="634" x2="500" y2="634"/>
          <line x1="340" y1="628" x2="500" y2="628"/>
          <line x1="334" y1="622" x2="334" y2="646"/>
          <line x1="506" y1="622" x2="506" y2="646"/>
        </g>
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.85">
          <line x1="620" y1="640" x2="760" y2="640"/>
          <line x1="620" y1="634" x2="760" y2="634"/>
          <line x1="620" y1="628" x2="760" y2="628"/>
          <line x1="614" y1="622" x2="614" y2="646"/>
          <line x1="766" y1="622" x2="766" y2="646"/>
        </g>

        {/* ── BATHROOM FIXTURES ── */}

        {/* Toilet */}
        <ellipse cx="170" cy="540" rx="24" ry="30" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" fill="none"/>
        <rect x="154" y="502" width="32" height="18" rx="3" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" fill="none"/>

        {/* Sink */}
        <rect x="90" y="400" width="32" height="28" rx="4" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" fill="none"/>
        <circle cx="106" cy="414" r="5" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.5" fill="none"/>

        {/* Bathtub */}
        <rect x="90" y="500" width="60" height="110" rx="8" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" fill="none"/>
        <rect x="96" y="506" width="48" height="98" rx="6" stroke="#ffffff" strokeWidth="0.4" strokeOpacity="0.35" fill="none"/>

        {/* ── KITCHEN FIXTURES ── */}

        {/* Counter L-shape */}
        <polyline points="592,332 592,430 700,430" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.75" fill="none"/>
        <polyline points="600,340 600,422 692,422" stroke="#ffffff" strokeWidth="0.4" strokeOpacity="0.3" fill="none"/>

        {/* Cooktop circles */}
        <circle cx="625" cy="360" r="11" stroke="#ffffff" strokeWidth="0.7" strokeOpacity="0.65" fill="none"/>
        <circle cx="625" cy="360" r="6" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" fill="none"/>
        <circle cx="660" cy="360" r="11" stroke="#ffffff" strokeWidth="0.7" strokeOpacity="0.65" fill="none"/>
        <circle cx="660" cy="360" r="6" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" fill="none"/>

        {/* Sink rectangle */}
        <rect x="615" y="395" width="50" height="24" rx="3" stroke="#ffffff" strokeWidth="0.7" strokeOpacity="0.65" fill="none"/>

        {/* ── STAIRCASE ── */}
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.55">
          <rect x="420" y="400" width="130" height="90" fill="none" strokeWidth="1"/>
          {[0,1,2,3,4,5,6,7,8,9].map(i => (
            <line key={i} x1="420" y1={410 + i * 8} x2="550" y2={410 + i * 8}/>
          ))}
          {/* Arrow indicating direction */}
          <line x1="484" y1="400" x2="484" y2="490" strokeWidth="1" strokeOpacity="0.8"/>
          <path d="M 476 478 L 484 490 L 492 478" fill="none" strokeWidth="1" strokeOpacity="0.8"/>
        </g>

        {/* ── DIMENSION LINES — minimal, just 2–3 key ones ── */}
        <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 3">
          {/* Overall width at top */}
          <line x1="80" y1="30" x2="820" y2="30"/>
          <line x1="80" y1="24" x2="80" y2="36"/>
          <line x1="820" y1="24" x2="820" y2="36"/>
          {/* Overall height on left */}
          <line x1="46" y1="60" x2="46" y2="640"/>
          <line x1="40" y1="60" x2="52" y2="60"/>
          <line x1="40" y1="640" x2="52" y2="640"/>
        </g>

        {/* ── SECTION MARKERS ── */}
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" fill="none">
          <circle cx="80" cy="390" r="10"/>
          <text x="76" y="394" fill="#ffffff" fontSize="9" fontFamily="monospace" fillOpacity="0.5" stroke="none">A</text>
        </g>
        <g stroke="#ffffff" strokeWidth="0.6" strokeOpacity="0.5" fill="none">
          <circle cx="400" cy="390" r="10"/>
          <text x="396" y="394" fill="#ffffff" fontSize="9" fontFamily="monospace" fillOpacity="0.5" stroke="none">B</text>
        </g>

        {/* ── NORTH ARROW ── */}
        <g transform="translate(840, 90)" stroke="#ffffff" strokeOpacity="0.45" fill="none">
          <circle cx="0" cy="0" r="18" strokeWidth="0.6"/>
          <path d="M 0 -14 L 5 4 L 0 0 L -5 4 Z" strokeWidth="0.8" fill="#ffffff" fillOpacity="0.3"/>
          <text x="-3" y="-18" fill="#ffffff" fontSize="8" fontFamily="monospace" fillOpacity="0.45" stroke="none">N</text>
        </g>

        {/* ── TITLE BLOCK — bottom right corner ── */}
        <g stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.6">
          <rect x="630" y="658" width="190" height="34" fill="none"/>
          <line x1="630" y1="672" x2="820" y2="672"/>
          <text x="636" y="669" fill="#ffffff" fontSize="7" fontFamily="monospace" fillOpacity="0.3" stroke="none" letterSpacing="2">AWRA DESIGNS</text>
          <text x="636" y="683" fill="#ffffff" fontSize="6" fontFamily="monospace" fillOpacity="0.2" stroke="none">FLOOR PLAN  A-001  1:100</text>
        </g>

      </g>
    </svg>
  )
}
