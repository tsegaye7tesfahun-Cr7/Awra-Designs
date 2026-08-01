import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { BUILDING_TYPES, PERMIT_SERVICES, BASEMENT_OPTIONS } from '../utils/permitFees'
import { calculatePermitFee, formatETB } from '../utils/permitCalculator'
import { FloorPlanFragment, DrawingRef } from './ArchDetails'

const labelClass = 'block text-[10px] uppercase tracking-[0.18em] text-neutral-500 font-medium mb-1.5'

// ── Custom dropdown — fully contained, no native select ───────────────────
function Dropdown({ id, label, value, onChange, options, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => o.value === value)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    document.addEventListener('touchstart', fn)
    return () => { document.removeEventListener('mousedown', fn); document.removeEventListener('touchstart', fn) }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <label htmlFor={id} className={labelClass}>{label}</label>

      {/* Trigger */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between bg-[#0a0a0a] border text-sm px-4 py-3 text-left transition-colors
          ${open ? 'border-white/30' : error ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'}
          ${selected?.disabled ? 'text-neutral-600' : 'text-white'}`}
      >
        <span className="truncate">{selected?.label || 'Select…'}</span>
        <svg
          className={`w-3 h-3 text-neutral-500 flex-shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 6" fill="none"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Options list — renders inline below, never overflows */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 right-0 top-full z-50 border border-white/10 border-t-0 bg-[#111] overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => { if (!opt.disabled) { onChange(opt.value); setOpen(false) } }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/5 last:border-b-0
                  ${opt.disabled
                    ? 'text-neutral-600 cursor-not-allowed'
                    : opt.value === value
                      ? 'text-white bg-white/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

// ── Animated counter ──────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)
  useEffect(() => {
    if (prev.current === value) return
    const start = prev.current, end = value, diff = end - start, dur = 400
    const startTime = performance.now()
    const tick = (now) => {
      const p = Math.min((now - startTime) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(start + diff * e))
      if (p < 1) requestAnimationFrame(tick); else prev.current = end
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{display.toLocaleString('en-US')}</>
}

// ── Fee row ───────────────────────────────────────────────────────────────
function FeeRow({ label, amount }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <span className="text-sm text-neutral-400">{label}</span>
      <span className="text-sm text-white font-medium tabular-nums">ETB <AnimatedNumber value={amount} /></span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PermitCalculator({ inline = false, onConsultationRequest }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })

  // Form state
  const [buildingType,   setBuildingType]   = useState('residential')
  const [floorArea,      setFloorArea]      = useState('')
  const [permitService,  setPermitService]  = useState('new')
  const [basement,       setBasement]       = useState('none')
  const [errors,         setErrors]         = useState({})
  const [result,         setResult]         = useState(null)
  const [calculated,     setCalculated]     = useState(false)

  // Live calculation whenever inputs change
  useEffect(() => {
    if (!calculated) return
    const area = parseFloat(floorArea)
    const res  = calculatePermitFee({ buildingType, floorArea: area, permitService, basement })
    setResult(res)
  }, [buildingType, floorArea, permitService, basement, calculated])

  const validate = useCallback(() => {
    const e = {}
    const area = parseFloat(floorArea)
    if (!floorArea || isNaN(area) || area <= 0) {
      e.floorArea = 'Enter a valid floor area (m²)'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [floorArea])

  const handleCalculate = () => {
    if (!validate()) return
    const area = parseFloat(floorArea)
    const res  = calculatePermitFee({ buildingType, floorArea: area, permitService, basement })
    setResult(res)
    setCalculated(true)
  }

  const handleReset = () => {
    setBuildingType('residential')
    setFloorArea('')
    setPermitService('new')
    setBasement('none')
    setErrors({})
    setResult(null)
    setCalculated(false)
  }

  const handleConsultation = () => {
    // Build prefill message
    const lines = result ? [
      `Building Type: ${BUILDING_TYPES.find(b => b.value === buildingType)?.label}`,
      `Floor Area: ${floorArea} m²`,
      `Permit Service: ${PERMIT_SERVICES.find(s => s.value === permitService)?.label}`,
      `Basement: ${BASEMENT_OPTIONS.find(b => b.value === basement)?.label}`,
      ``,
      `Estimated Fees:`,
      `  Design Review Fee: ${formatETB(result.designReview)}`,
      `  Permit Service Fee: ${formatETB(result.permitService)}`,
      `  Basement Fee: ${formatETB(result.basement)}`,
      `  Total Estimated Cost: ${formatETB(result.total)}`,
    ].join('\n') : ''

    // Fire the prefill event FIRST (before closing the drawer)
    // Also persist to sessionStorage so lazy-loaded Contact picks it up even if not mounted yet
    const prefillData = {
      message: lines,
      subject: 'Building Permit Consultation',
      permitData: { buildingType, floorArea, permitService, basement, result },
    }
    sessionStorage.setItem('_permit_prefill', JSON.stringify(prefillData))
    window.dispatchEvent(new CustomEvent('prefill-contact', { detail: prefillData }))

    // Close the drawer
    onConsultationRequest?.()

    // Wait for drawer close animation (~450ms), then scroll to contact
    setTimeout(() => {
      const el = document.getElementById('contact')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 450)
  }

  return (
    <section
      id="permit-calculator"
      ref={ref}
      className={`relative bg-[#0a0a0a] overflow-hidden ${inline ? '' : ''}`}
    >
      {/* Floor plan fragment — decorative */}
      {!inline && <FloorPlanFragment opacity={0.02} className="w-96 h-72 top-0 right-0 hidden xl:block" />}
      {!inline && <DrawingRef text="A-103"   className="top-4 right-6 hidden lg:block" opacity={0.07} />}
      {!inline && <DrawingRef text="CALC-01" className="bottom-4 left-6 hidden lg:block" opacity={0.06} />}
      {!inline && <hr className="border-0 border-t border-neutral-900" />}

      <div className={inline ? 'px-5 py-6 md:px-8 md:py-8' : 'container-custom section-padding'}>

        {/* Section header */}
        <motion.div
          className="mb-10 md:mb-14"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="label-text mb-3">Tools</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white leading-tight">
            Building Permit<br />Fee Calculator
          </h2>
          <p className="text-neutral-500 text-sm mt-4 max-w-md leading-relaxed">
            Estimate your Addis Ababa building permit review fee in seconds.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-start">

          {/* ── Inputs ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            {/* Building Type */}
            <Dropdown
              id="buildingType"
              label="Building Type"
              value={buildingType}
              onChange={setBuildingType}
              options={BUILDING_TYPES.map(t => ({
                value: t.value,
                label: t.value !== 'residential' ? `${t.label} (coming soon)` : t.label,
                disabled: t.value !== 'residential',
              }))}
            />

            {/* Floor Area */}
            <div>
              <label htmlFor="floorArea" className={labelClass}>Total Floor Area (m²)</label>
              <input
                id="floorArea"
                type="number"
                min="1"
                step="1"
                value={floorArea}
                onChange={e => setFloorArea(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCalculate()}
                placeholder="e.g. 250"
                className={`w-full bg-white/5 border text-white text-sm px-4 py-3 focus:outline-none focus:border-white/30 transition-colors placeholder-neutral-600 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  ${errors.floorArea ? 'border-red-500/60' : 'border-white/10'}`}
              />
              {errors.floorArea && <p className="mt-1 text-[10px] text-red-400">{errors.floorArea}</p>}
            </div>

            {/* Permit Service */}
            <Dropdown
              id="permitService"
              label="Permit Service"
              value={permitService}
              onChange={setPermitService}
              options={PERMIT_SERVICES.map(s => ({ value: s.value, label: s.label }))}
            />

            {/* Basement */}
            <Dropdown
              id="basement"
              label="Basement"
              value={basement}
              onChange={setBasement}
              options={BASEMENT_OPTIONS.map(b => ({ value: b.value, label: b.label }))}
            />

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleCalculate}
                className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#0a0a0a] text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-neutral-200"
              >
                Calculate Fee
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </button>

              {result && (
                <button
                  onClick={handleConsultation}
                  className="inline-flex items-center gap-2.5 px-6 py-3 border border-neutral-700 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:border-neutral-500 hover:bg-neutral-900/60"
                >
                  Request Consultation
                </button>
              )}

              {calculated && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-3 text-neutral-600 text-xs font-medium uppercase tracking-widest hover:text-white transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-neutral-700 text-[10px] leading-relaxed max-w-md pt-2">
              This estimate is based on the Addis Ababa Building Permit Fee Schedule (2017 E.C.) and is provided for guidance only. Final fees may vary depending on project requirements and government regulations.
            </p>
          </motion.div>

          {/* ── Results panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8"
                >
                  {/* CAD corner markers on result card */}
                  <span className="absolute top-3 left-3 pointer-events-none opacity-[0.12]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="10,0 0,0 0,10" stroke="#fff" strokeWidth="0.8"/></svg>
                  </span>
                  <span className="absolute top-3 right-3 pointer-events-none opacity-[0.12]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="0,0 10,0 10,10" stroke="#fff" strokeWidth="0.8"/></svg>
                  </span>
                  <span className="absolute bottom-3 left-3 pointer-events-none opacity-[0.12]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="0,0 0,10 10,10" stroke="#fff" strokeWidth="0.8"/></svg>
                  </span>
                  <span className="absolute bottom-3 right-3 pointer-events-none opacity-[0.12]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="10,0 10,10 0,10" stroke="#fff" strokeWidth="0.8"/></svg>
                  </span>

                  <p className="label-text mb-6">Estimated Fee Breakdown</p>

                  <FeeRow label="Design Review Fee"  amount={result.designReview} />
                  <FeeRow label="Permit Service Fee" amount={result.permitService} />
                  <FeeRow label="Basement Fee"       amount={result.basement} />

                  {/* Total */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="label-text mb-2">Total Estimated Cost</p>
                    <div className="font-display text-4xl md:text-5xl font-medium text-white tabular-nums">
                      ETB <AnimatedNumber value={result.total} />
                    </div>
                  </div>

                  {/* Note */}
                  <p className="mt-6 text-neutral-600 text-[11px] leading-relaxed border-t border-white/5 pt-4">
                    Need a complete design and permit package? AWRA Designs can handle the entire process from concept to approval.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border border-white/5 bg-white/[0.02] p-8 flex flex-col items-center justify-center min-h-[280px] text-center"
                >
                  {/* Blueprint corner decorations */}
                  <svg className="w-24 h-24 text-neutral-800 mb-6" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="0.7">
                    <rect x="8" y="8" width="80" height="80" strokeDasharray="3,4"/>
                    <line x1="8" y1="48" x2="88" y2="48" strokeDasharray="2,4" opacity="0.5"/>
                    <line x1="48" y1="8" x2="48" y2="88" strokeDasharray="2,4" opacity="0.5"/>
                    <circle cx="48" cy="48" r="12" strokeDasharray="2,3" opacity="0.4"/>
                    <polyline points="24,8 8,8 8,24" />
                    <polyline points="72,8 88,8 88,24" />
                    <polyline points="8,72 8,88 24,88" />
                    <polyline points="88,72 88,88 72,88" />
                  </svg>
                  <p className="text-neutral-600 text-xs uppercase tracking-widest">Enter details to calculate</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
