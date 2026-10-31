import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { BUILDING_USES, STRUCTURAL_CLASSIFICATIONS, FLOOR_COUNTS, BASEMENT_OPTIONS, REGULATORY_INFO } from '../utils/permitFees'
import { calculatePermitFee, formatETB, generateCalculationSummary } from '../utils/permitCalculator'
import { FloorPlanFragment, DrawingRef } from './ArchDetails'
import t from '../utils/translations'

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
export default function PermitCalculator({ inline = false, lang = 'en', onClose }) {
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: !inline })
  const tx = t[lang].permit

  // Form state
  const [buildingUse,           setBuildingUse]           = useState('residential')
  const [structuralClassification, setStructuralClassification] = useState('without_rc')
  const [floorArea,              setFloorArea]              = useState('')
  const [floorCount,             setFloorCount]             = useState('0')
  const [basement,               setBasement]               = useState('0')
  const [requirePlanningConsent, setRequirePlanningConsent] = useState(false)
  const [errors,                 setErrors]                 = useState({})
  const [result,                 setResult]                 = useState(null)
  const [calculated,             setCalculated]             = useState(false)

  // Live calculation whenever inputs change
  useEffect(() => {
    if (!calculated) return
    const area = parseFloat(floorArea)
    const floors = parseInt(floorCount, 10)
    const basements = parseInt(basement, 10)
    const res = calculatePermitFee({ 
      buildingUse, 
      structuralClassification, 
      floorArea: area, 
      floorCount: floors, 
      basement: basements, 
      requirePlanningConsent 
    })
    setResult(res)
  }, [buildingUse, structuralClassification, floorArea, floorCount, basement, requirePlanningConsent, calculated])

  const validate = useCallback(() => {
    const e = {}
    const area = parseFloat(floorArea)
    if (!floorArea || isNaN(area) || area <= 0) {
      e.floorArea = lang === 'am' ? 'የሚስማማ ቦፍስ ቁጥር ያስግብ' : 'Enter a valid floor area (m²)'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [floorArea, lang])

  const handleCalculate = () => {
    if (!validate()) return
    const area = parseFloat(floorArea)
    const floors = parseInt(floorCount, 10)
    const basements = parseInt(basement, 10)
    const res = calculatePermitFee({ 
      buildingUse, 
      structuralClassification, 
      floorArea: area, 
      floorCount: floors, 
      basement: basements, 
      requirePlanningConsent 
    })
    setResult(res)
    setCalculated(true)
  }

  const handleReset = () => {
    setBuildingUse('residential')
    setStructuralClassification('without_rc')
    setFloorArea('')
    setFloorCount('0')
    setBasement('0')
    setRequirePlanningConsent(false)
    setErrors({})
    setResult(null)
    setCalculated(false)
  }

  const handlePrint = () => {
    if (!result) return
    const summary = generateCalculationSummary(
      { buildingUse, structuralClassification, floorArea: parseFloat(floorArea), floorCount: parseInt(floorCount, 10), basement: parseInt(basement, 10), requirePlanningConsent },
      result
    )
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Building Permit Fee Estimate - ${summary.referenceCode}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #000; }
            .total { font-size: 24px; font-weight: bold; color: #000; margin-top: 20px; }
            .disclaimer { font-size: 11px; color: #666; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Building Permit Fee Estimate</h1>
            <p><span class="label">Reference Code:</span> <span class="value">${summary.referenceCode}</span></p>
            <p><span class="label">Date:</span> <span class="value">${summary.date}</span></p>
          </div>
          <div class="section">
            <p><span class="label">Building Use:</span> <span class="value">${summary.buildingUse}</span></p>
            <p><span class="label">Structural Classification:</span> <span class="value">${summary.structuralClassification}</span></p>
            <p><span class="label">Total Floor Area:</span> <span class="value">${summary.totalFloorArea.toLocaleString('en-US')} m²</span></p>
            <p><span class="label">Floor Count:</span> <span class="value">${summary.floorCount}</span></p>
            <p><span class="label">Basement Levels:</span> <span class="value">${summary.basement}</span></p>
            <p><span class="label">Construction Rate:</span> <span class="value">${summary.constructionRate.toLocaleString('en-US')} ETB/m²</span></p>
            <p><span class="label">Estimated Construction Cost:</span> <span class="value">ETB ${summary.projectEstimate.toLocaleString('en-US')}</span></p>
          </div>
          <div class="section">
            <h2>Fee Breakdown</h2>
            ${summary.breakdown.map(item => `
              <div class="row">
                <span>${item.label}</span>
                <span>${item.amount.toLocaleString('en-US')}</span>
              </div>
            `).join('')}
            <div class="total">Total Payable: ETB ${summary.totalPayable.toLocaleString('en-US')}</div>
          </div>
          <div class="disclaimer">
            <p><strong>Source:</strong> ${summary.source}</p>
            <p>${summary.disclaimer}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleConsultation = () => {
    // Build prefill message
    const lines = result ? [
      `Building Use: ${BUILDING_USES.find(b => b.value === buildingUse)?.label}`,
      `Structural Classification: ${STRUCTURAL_CLASSIFICATIONS.find(s => s.value === structuralClassification)?.label}`,
      `Total Floor Area: ${floorArea} m²`,
      `Floor Count: ${floorCount}`,
      `Basement Levels: ${basement}`,
      ``,
      `Estimated Construction Cost: ${formatETB(result.projectEstimate)}`,
      `Plan Review Fee: ${formatETB(result.planReviewFee)}`,
      `Plan Approval Fee: ${formatETB(result.planApprovalFee)}`,
      requirePlanningConsent ? `Planning Consent Fee: ${formatETB(result.planningConsentFee)}` : '',
      ``,
      `Total Payable: ${formatETB(result.totalPayable)}`,
    ].filter(Boolean).join('\n') : ''

    // Fire the prefill event
    const prefillData = {
      message: lines,
      subject: 'Building Permit Consultation',
      permitData: { buildingUse, structuralClassification, floorArea, floorCount, basement, requirePlanningConsent, result },
    }
    sessionStorage.setItem('_permit_prefill', JSON.stringify(prefillData))
    window.dispatchEvent(new CustomEvent('prefill-contact', { detail: prefillData }))

    // Close modal
    onClose?.()

    // Scroll to contact
    const el = document.getElementById('contact')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
            {tx.heading}<br />{tx.subheading}
          </h2>
          <p className="text-neutral-500 text-sm mt-4 max-w-md leading-relaxed">
            Calculate your building permit fees based on official Ethiopian and Addis Ababa regulations.
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
            {/* Building Use */}
            <Dropdown
              id="buildingUse"
              label="Building Use/Type"
              value={buildingUse}
              onChange={setBuildingUse}
              options={BUILDING_USES.map(t => ({ value: t.value, label: t.label }))}
            />

            {/* Structural Classification */}
            <Dropdown
              id="structuralClassification"
              label="Structural Classification"
              value={structuralClassification}
              onChange={setStructuralClassification}
              options={STRUCTURAL_CLASSIFICATIONS.map(s => ({ value: s.value, label: s.label }))}
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
                placeholder="e.g. 200"
                className={`w-full bg-white/5 border text-white text-sm px-4 py-3 focus:outline-none focus:border-white/30 transition-colors placeholder-neutral-600 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  ${errors.floorArea ? 'border-red-500/60' : 'border-white/10'}`}
              />
              {errors.floorArea && <p className="mt-1 text-[10px] text-red-400">{errors.floorArea}</p>}
            </div>

            {/* Floor Count */}
            <Dropdown
              id="floorCount"
              label="Number of Floors Above Ground"
              value={floorCount}
              onChange={setFloorCount}
              options={FLOOR_COUNTS.map(f => ({ value: String(f.value), label: f.label }))}
            />

            {/* Basement */}
            <Dropdown
              id="basement"
              label={tx.basement}
              value={basement}
              onChange={setBasement}
              options={BASEMENT_OPTIONS.map(b => ({ value: String(b.value), label: b.label }))}
            />

            {/* Planning Consent */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requirePlanningConsent"
                checked={requirePlanningConsent}
                onChange={e => setRequirePlanningConsent(e.target.checked)}
                className="w-4 h-4 bg-white/10 border border-white/20 rounded-sm"
              />
              <label htmlFor="requirePlanningConsent" className="text-sm text-neutral-400">
                Require Planning Consent (+300 ETB)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleCalculate}
                className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#0a0a0a] text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-neutral-200"
              >
                {tx.calculate}
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </button>

              {result && (
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2.5 px-6 py-3 border border-neutral-700 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:border-neutral-500 hover:bg-neutral-900/60"
                >
                  {tx.print}
                </button>
              )}

              {result && (
                <button
                  onClick={handleConsultation}
                  className="inline-flex items-center gap-2.5 px-6 py-3 border border-neutral-700 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:border-neutral-500 hover:bg-neutral-900/60"
                >
                  {tx.requestConsultation}
                </button>
              )}

              {calculated && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-3 text-neutral-600 text-xs font-medium uppercase tracking-widest hover:text-white transition-colors"
                >
                  {tx.reset}
                </button>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-neutral-700 text-[10px] leading-relaxed max-w-md pt-2">
              {tx.disclaimer}
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

                  <p className="label-text mb-6">{tx.breakdown}</p>

                  {result.breakdown.map((item, idx) => (
                    <FeeRow key={idx} label={item.label} amount={item.amount} />
                  ))}

                  {/* Total */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="label-text mb-2">Total Payable</p>
                    <div className="font-display text-4xl md:text-5xl font-medium text-white tabular-nums">
                      ETB <AnimatedNumber value={result.totalPayable} />
                    </div>
                  </div>

                  {/* Reference info */}
                  <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="label-text text-neutral-600">Reference Code</span>
                      <span className="label-text text-neutral-400 font-mono">
                        BLD-{String(result.totalFloorArea).padStart(4,'0')}-{Math.floor(Math.random() * 9000) + 1000}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="label-text text-neutral-600">Construction Rate</span>
                      <span className="label-text text-neutral-400">
                        {result.constructionRate.toLocaleString('en-US')} ETB/m²
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-neutral-600 text-[11px] leading-relaxed border-t border-white/5 pt-4">
                    {tx.needCompleteDesign}
                  </p>

                  {/* Regulatory transparency */}
                  <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-neutral-700 text-[10px] leading-relaxed">
                      <span className="text-neutral-500">{tx.source}:</span> {REGULATORY_INFO.source}
                    </p>
                    <p className="text-neutral-700 text-[10px] leading-relaxed">
                      {tx.amendmentNotice}
                    </p>
                  </div>
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
                  <p className="text-neutral-600 text-xs uppercase tracking-widest">{tx.enterDetails}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
