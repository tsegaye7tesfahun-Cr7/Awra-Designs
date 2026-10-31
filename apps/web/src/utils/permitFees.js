/**
 * Ethiopian Building Permit Fee Calculator
 * Based on:
 * - Addis Ababa Regulation No. 134/2022, Schedule 4 (Construction cost estimation rates)
 * - Ethiopian Building Regulation No. 243/2011, Article 24 (Plan review and approval fees)
 * All values in ETB. Edit here to update rates site-wide.
 */

// ── Building Use/Type ───────────────────────────────────────────────────────
export const BUILDING_USES = [
  { value: 'residential', label: 'Residential / Administration' },
  { value: 'hospital',    label: 'Hospital and Similar Buildings' },
]

// ── Structural Classification ───────────────────────────────────────────────
export const STRUCTURAL_CLASSIFICATIONS = [
  { value: 'without_rc', label: 'Without RC Footing' },
  { value: 'with_rc',     label: 'With RC Footing' },
]

// ── Construction Cost Estimation Rates (Addis Ababa Regulation No. 134/2022, Schedule 4) ──
// Rate per m² based on building use and classification
export const CONSTRUCTION_RATES = {
  residential: {
    without_rc: 10_000,  // G+0 without RC footing
    with_rc:     12_200,  // G+1 and above
  },
  hospital: {
    without_rc: 20_000,  // G+0 and above
    with_rc:     20_000,  // G+0 and above (same rate)
  },
}

// ── Floor Count ─────────────────────────────────────────────────────────────
export const FLOOR_COUNTS = [
  { value: 0, label: 'G+0 (Ground Floor Only)' },
  { value: 1, label: 'G+1' },
  { value: 2, label: 'G+2' },
  { value: 3, label: 'G+3' },
  { value: 4, label: 'G+4' },
  { value: 5, label: 'G+5' },
  { value: 6, label: 'G+6' },
  { value: 7, label: 'G+7' },
  { value: 8, label: 'G+8' },
  { value: 9, label: 'G+9' },
  { value: 10, label: 'G+10' },
  { value: 11, label: 'G+11' },
  { value: 12, label: 'G+12' },
  { value: 13, label: 'G+13' },
  { value: 14, label: 'G+14' },
  { value: 15, label: 'G+15' },
  { value: 16, label: 'G+16' },
  { value: 17, label: 'G+17' },
  { value: 18, label: 'G+18' },
  { value: 19, label: 'G+19' },
  { value: 20, label: 'G+20' },
]

// ── Basement Levels ─────────────────────────────────────────────────────────
export const BASEMENT_OPTIONS = [
  { value: 0, label: 'No Basement' },
  { value: 1, label: '1 Basement Level' },
  { value: 2, label: '2 Basement Levels' },
  { value: 3, label: '3 Basement Levels' },
]

// ── Planning Consent Fee ─────────────────────────────────────────────────────
export const PLANNING_CONSENT_FEE = 300  // ETB, when applicable

// ── Regulatory Information ────────────────────────────────────────────────
export const REGULATORY_INFO = {
  source: 'Addis Ababa Regulation No. 134/2022, Schedule 4 and Ethiopian Building Regulation No. 243/2011, Article 24',
  disclaimer: 'This estimate is based on the official Ethiopian and Addis Ababa building permit fee regulations. It is provided for guidance only and is not an official government payment receipt. Always verify with the Addis Ababa City Administration before making any payments.',
  lastUpdated: '2026-10-31',
}
