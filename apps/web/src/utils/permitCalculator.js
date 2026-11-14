/**
 * Building Permit Fee Calculator
 * Formula:
 *   basementCost = kare × basementRate
 *   groundCost   = kare × groundRate × (gPlus + 1)   ← total floor count = G+ value + 1 ground floor
 *   total        = basementCost + groundCost
 */
import { BASEMENT_OPTIONS, getGroundRate, getGroundLabel } from './permitFees'

/**
 * @param {object} params
 * @param {number} params.kare     - Floor area in m²
 * @param {string} params.basement - Basement option value
 * @param {number} params.gPlus    - The G+ number typed by the user (0 = G+0, 3 = G+3, etc.)
 * @returns {{ basementCost, groundCost, groundRate, totalFloors, total, breakdown } | null}
 */
export function calculatePermitFee({ kare, basement, gPlus }) {
  if (!kare || kare <= 0)          return null
  if (gPlus === '' || gPlus < 0)   return null

  const basementOption = BASEMENT_OPTIONS.find(b => b.value === basement)
  if (!basementOption) return null

  const groundRate  = getGroundRate(gPlus)
  const totalFloors = gPlus + 1          // G+3 = 4 floors total

  const basementCost = kare * basementOption.rate
  const groundCost   = kare * groundRate * totalFloors
  const total        = basementCost + groundCost

  const breakdown = []

  if (basementCost > 0) {
    breakdown.push({
      label:  `Basement Fee  (${kare.toLocaleString('en-US')} m² × ${basementOption.rate.toLocaleString('en-US')} ETB)`,
      amount: basementCost,
    })
  }

  breakdown.push({
    label:  `Ground Fee  (${kare.toLocaleString('en-US')} m² × ${groundRate.toLocaleString('en-US')} ETB × ${totalFloors} floor${totalFloors > 1 ? 's' : ''})`,
    amount: groundCost,
  })

  return { basementCost, groundCost, groundRate, totalFloors, total, breakdown }
}

/** Format a number as ETB currency string */
export function formatETB(amount) {
  return `ETB ${Math.round(amount).toLocaleString('en-US')}`
}

/** Generate a printable summary object */
export function generateCalculationSummary(params, result) {
  const { kare, basement, gPlus } = params
  const basementOption = BASEMENT_OPTIONS.find(b => b.value === basement)

  return {
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    referenceCode: `BLD-${String(kare).padStart(4, '0')}-${Math.floor(Math.random() * 9000) + 1000}`,
    kare,
    gPlus,
    totalFloors:  result.totalFloors,
    groundRate:   result.groundRate,
    basement:     basementOption?.label || basement,
    buildingType: getGroundLabel(gPlus),
    breakdown:    result.breakdown,
    total:        result.total,
    source:      'Addis Ababa Building Permit Fee Schedule',
    disclaimer:  'This estimate is provided for guidance only and is not an official government payment receipt.',
  }
}
