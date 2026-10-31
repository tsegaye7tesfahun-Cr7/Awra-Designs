/**
 * Addis Ababa Building Permit Fee Schedule — 2017 E.C.
 * All values in ETB. Edit here to update fees site-wide.
 * Source: Addis Ababa Building Permit Fee Schedule (2017 E.C.)
 * Note: Some service descriptions are partially obscured in the source document.
 *       Labels marked with (?) require administrative verification.
 */

// ── Building Permit Fee by Floor Count (2017 E.C. Schedule) ──────────────
// Each entry: { maxFloors: number | Infinity, fee: number }
export const PERMIT_FEE_TIERS = [
  { maxFloors: 1,      fee: 30_000 },
  { maxFloors: 5,      fee: 35_000 },
  { maxFloors: 10,     fee: 45_000 },
  { maxFloors: 15,     fee: 50_000 },
  { maxFloors: Infinity, fee: 60_000 },
]

// ── Additional Service Category 2 ─────────────────────────────────────────
// These are optional services - only one can be selected at a time
export const SERVICE_CATEGORY_2 = [
  { value: 'none',           label: 'None',                                 fee: 0 },
  { value: 'option_a',       label: 'Option A (?) - Administrative Review', fee: 5_000 },
  { value: 'option_b',       label: 'Option B (?) - Technical Review',      fee: 2_000 },
]

// ── Additional Service Category 3 ─────────────────────────────────────────
// This service can be combined with Category 2
export const SERVICE_CATEGORY_3 = [
  { value: 'none',           label: 'None',                     fee: 0 },
  { value: 'category_3',     label: 'Category 3 Service (?)',   fee: 5_000 },
]

// ── Basement Fee ──────────────────────────────────────────────────────────
export const BASEMENT_OPTIONS = [
  { value: 'none',  label: 'None',             fee: 0      },
  { value: 'one',   label: 'One Basement',     fee: 5_000  },
  { value: 'two',   label: 'Two Basements',    fee: 10_000 },
  { value: 'three', label: 'Three Basements',  fee: 15_000 },
]

// ── Regulatory Information ────────────────────────────────────────────────
export const REGULATORY_INFO = {
  source: 'Addis Ababa Building Permit Fee Schedule',
  referenceYear: '2017 E.C.',
  disclaimer: 'This estimate is based on the Addis Ababa Building Permit Fee Schedule (2017 E.C.) and is provided for guidance only. It is not an official government payment receipt. Subsequent amendments must be verified before treating these rates as current.',
  amendmentNotice: 'Fees and regulations are subject to change. Always verify with the Addis Ababa City Administration before making any payments.',
  effectiveDate: '2017 E.C.',
  lastUpdated: '2026-10-31',
}
