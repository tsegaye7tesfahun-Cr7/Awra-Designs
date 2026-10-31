/**
 * Building Permit Fee Calculator — pure calculation logic.
 * No UI concerns. Import fee tables from permitFees.js.
 */
import {
  PERMIT_FEE_TIERS,
  SERVICE_CATEGORY_2,
  SERVICE_CATEGORY_3,
  BASEMENT_OPTIONS,
} from './permitFees'

/**
 * @param {object} params
 * @param {'residential'|'commercial'|'mixed'} params.buildingType
 * @param {number}  params.floorCount  — positive integer (number of floors)
 * @param {'none'|'one'|'two'|'three'} params.basement
 * @param {'none'|'option_a'|'option_b'} params.serviceCategory2
 * @param {'none'|'category_3'} params.serviceCategory3
 * @returns {{ basePermitFee: number, serviceCategory2: number, serviceCategory3: number, basement: number, total: number, breakdown: object[] } | null}
 */
export function calculatePermitFee({ buildingType, floorCount, basement, serviceCategory2, serviceCategory3 }) {
  if (!buildingType || !floorCount || floorCount <= 0 || !basement || !serviceCategory2 || !serviceCategory3) return null

  // Validate floor count is an integer
  if (!Number.isInteger(floorCount) || floorCount < 1) return null

  // Validate basement selection (0-3)
  const basementMap = { none: 0, one: 1, two: 2, three: 3 }
  const basementLevel = basementMap[basement]
  if (basementLevel === undefined) return null

  // ── Base Permit Fee by Floor Count ───────────────────────────────────────
  const tiers = PERMIT_FEE_TIERS[buildingType]
  if (!tiers) return null

  const tier = tiers.find(t => floorCount <= t.maxFloors)
  const basePermitFee = tier ? tier.fee : tiers[tiers.length - 1].fee

  // ── Service Category 2 Fee ────────────────────────────────────────────────
  const cat2Entry = SERVICE_CATEGORY_2.find(s => s.value === serviceCategory2)
  const cat2Fee = cat2Entry ? cat2Entry.fee : 0

  // ── Service Category 3 Fee ────────────────────────────────────────────────
  const cat3Entry = SERVICE_CATEGORY_3.find(s => s.value === serviceCategory3)
  const cat3Fee = cat3Entry ? cat3Entry.fee : 0

  // ── Basement Fee ─────────────────────────────────────────────────────────
  const basementEntry = BASEMENT_OPTIONS.find(b => b.value === basement)
  const basementFee = basementEntry ? basementEntry.fee : 0

  // ── Calculate Total ─────────────────────────────────────────────────────
  const total = basePermitFee + cat2Fee + cat3Fee + basementFee

  // ── Build Breakdown for Display ─────────────────────────────────────────
  const breakdown = []
  breakdown.push({ label: 'Base Permit Fee', amount: basePermitFee, description: `Building with ${floorCount} floor(s)` })
  if (cat2Fee > 0) {
    breakdown.push({ label: 'Service Category 2', amount: cat2Fee, description: cat2Entry?.label || 'Additional service' })
  }
  if (cat3Fee > 0) {
    breakdown.push({ label: 'Service Category 3', amount: cat3Fee, description: cat3Entry?.label || 'Additional service' })
  }
  if (basementFee > 0) {
    breakdown.push({ label: 'Basement Fee', amount: basementFee, description: `${basementLevel} basement level(s)` })
  }

  return {
    basePermitFee,
    serviceCategory2: cat2Fee,
    serviceCategory3: cat3Fee,
    basement: basementFee,
    total,
    breakdown,
  }
}

/** Format a number as ETB currency string */
export function formatETB(amount) {
  return `ETB ${amount.toLocaleString('en-US')}`
}

/** Generate a printable summary object */
export function generateCalculationSummary(params, result) {
  const { buildingType, floorCount, basement, serviceCategory2, serviceCategory3 } = params

  return {
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    referenceCode: `${buildingType.slice(0,3).toUpperCase()}-${String(floorCount).padStart(2,'0')}-${Math.floor(Math.random() * 9000) + 1000}`,
    buildingType: buildingType.charAt(0).toUpperCase() + buildingType.slice(1),
    floorCount,
    basementLevel: basement === 'none' ? 0 : { one: 1, two: 2, three: 3 }[basement],
    serviceCategory2: serviceCategory2 === 'none' ? 'None' : SERVICE_CATEGORY_2.find(s => s.value === serviceCategory2)?.label,
    serviceCategory3: serviceCategory3 === 'none' ? 'None' : SERVICE_CATEGORY_3.find(s => s.value === serviceCategory3)?.label,
    breakdown: result.breakdown,
    total: result.total,
    source: 'Addis Ababa Building Permit Fee Schedule (2017 E.C.)',
    disclaimer: 'This is an estimate only. Not an official government payment receipt.',
  }
}
