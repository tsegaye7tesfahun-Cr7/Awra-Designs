/**
 * Building Permit Fee Calculator
 * Formula:
 *   basementCost = kare × basementRate
 *   groundCost   = kare × groundRate(gPlus) × (gPlus + 1)
 *   total        = basementCost + groundCost
 *
 * Ground rate is determined automatically from the G+ number entered:
 *   G+0          → 30,000
 *   G+1  – G+4   → 35,000
 *   G+5  – G+9   → 45,000
 *   G+10 – G+14  → 50,000
 *   G+15 and above → 60,000
 */

// ── Basement Options ─────────────────────────────────────────────────────────
// basementCost = kare × rate
export const BASEMENT_OPTIONS = [
  { value: 'none',   label: 'No Basement',          rate: 0     },
  { value: 'b1',     label: '1 Basement',            rate: 5000  },
  { value: 'b2',     label: '2 Basements',           rate: 10000 },
  { value: 'b3plus', label: '3 Basements and Above', rate: 15000 },
]

/**
 * Returns the per-m² ground rate for a given G+ number.
 * @param {number} gPlus  — the number after "G+", e.g. 0 for G+0, 3 for G+3
 * @returns {number} rate in ETB/m²
 */
export function getGroundRate(gPlus) {
  if (gPlus === 0)              return 30000
  if (gPlus >= 1  && gPlus <= 4)  return 35000
  if (gPlus >= 5  && gPlus <= 9)  return 45000
  if (gPlus >= 10 && gPlus <= 14) return 50000
  return 60000  // G+15 and above
}

/**
 * Returns a human-readable label for the rate tier.
 * @param {number} gPlus
 * @returns {string}
 */
export function getGroundLabel(gPlus) {
  if (gPlus === 0)              return 'Villa (G+0)'
  if (gPlus >= 1  && gPlus <= 4)  return 'G+1 – G+4'
  if (gPlus >= 5  && gPlus <= 9)  return 'G+5 – G+9'
  if (gPlus >= 10 && gPlus <= 14) return 'G+10 – G+14'
  return 'Above G+14'
}

// ── Regulatory Information ────────────────────────────────────────────────────
export const REGULATORY_INFO = {
  source: 'Addis Ababa Building Permit Fee Schedule',
  disclaimer: 'This estimate is provided for guidance only and is not an official government payment receipt. Always verify with the Addis Ababa City Administration before making any payments.',
  lastUpdated: '2026-11-14',
}
