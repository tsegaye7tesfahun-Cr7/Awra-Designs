/**
 * Building Permit Fee Calculator — pure calculation logic.
 * No UI concerns. Import fee tables from permitFees.js.
 */
import {
  PERMIT_FEE_TIERS,
  BASEMENT_OPTIONS,
} from './permitFees'

/**
 * @param {object} params
 * @param {'residential'|'commercial'|'mixed'} params.buildingType
 * @param {number}  params.floorCount  — positive integer (number of floors)
 * @param {'none'|'one'|'two'|'three'} params.basement
 * @returns {{ basePermitFee: number, basement: number, total: number, breakdown: object[] } | null}
 */
export function calculatePermitFee({ buildingType, floorCount, basement }) {
  if (!buildingType || !floorCount || floorCount <= 0 || !basement) return null

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

  // ── Basement Fee ─────────────────────────────────────────────────────────
  const basementEntry = BASEMENT_OPTIONS.find(b => b.value === basement)
  const basementFee = basementEntry ? basementEntry.fee : 0

  // ── Calculate Total ─────────────────────────────────────────────────────
  const total = basePermitFee + basementFee

  // ── Build Breakdown for Display ─────────────────────────────────────────
  const breakdown = []
  breakdown.push({ label: 'Base Permit Fee', amount: basePermitFee, description: `Building with ${floorCount} floor(s)` })
  if (basementFee > 0) {
    breakdown.push({ label: 'Basement Fee', amount: basementFee, description: `${basementLevel} basement level(s)` })
  }

  return {
    basePermitFee,
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
  const { buildingType, floorCount, basement } = params

  return {
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    referenceCode: `${buildingType.slice(0,3).toUpperCase()}-${String(floorCount).padStart(2,'0')}-${Math.floor(Math.random() * 9000) + 1000}`,
    buildingType: buildingType.charAt(0).toUpperCase() + buildingType.slice(1),
    floorCount,
    basementLevel: basement === 'none' ? 0 : { one: 1, two: 2, three: 3 }[basement],
    breakdown: result.breakdown,
    total: result.total,
    source: 'Addis Ababa Building Permit Fee Schedule (2017 E.C.)',
    disclaimer: 'This is an estimate only. Not an official government payment receipt.',
  }
}
