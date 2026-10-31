/**
 * Addis Ababa Building Permit Fee Schedule — 2017 E.C.
 * All values in ETB. Edit here to update fees site-wide.
 */

// ── Building Types ─────────────────────────────────────────────────────────
export const BUILDING_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial',  label: 'Commercial'  },  // future
  { value: 'mixed',       label: 'Mixed Use'   },  // future
]

// ── Design Review Fee tiers (upper bound → fee) ───────────────────────────
// Each entry: { maxArea: number | Infinity, fee: number }
export const DESIGN_REVIEW_TIERS = {
  residential: [
    { maxArea: 100,      fee: 30_000 },
    { maxArea: 250,      fee: 35_000 },
    { maxArea: 600,      fee: 45_000 },
    { maxArea: 1_500,    fee: 50_000 },
    { maxArea: Infinity, fee: 60_000 },
  ],
  commercial: [
    { maxArea: 100,      fee: 40_000 },
    { maxArea: 250,      fee: 50_000 },
    { maxArea: 600,      fee: 65_000 },
    { maxArea: 1_500,    fee: 80_000 },
    { maxArea: Infinity, fee: 100_000 },
  ],
  mixed: [
    { maxArea: 100,      fee: 40_000 },
    { maxArea: 250,      fee: 50_000 },
    { maxArea: 600,      fee: 65_000 },
    { maxArea: 1_500,    fee: 80_000 },
    { maxArea: Infinity, fee: 100_000 },
  ],
}

// ── Permit Service Fee ────────────────────────────────────────────────────
export const PERMIT_SERVICES = [
  { value: 'new',      label: 'New Building Permit',         fee: 5_000 },
  { value: 'renewal',  label: 'Permit Renewal / Modification', fee: 2_000 },
]

// ── Basement Fee ──────────────────────────────────────────────────────────
export const BASEMENT_OPTIONS = [
  { value: 'none',  label: 'None',             fee: 0      },
  { value: 'one',   label: 'One Basement',     fee: 5_000  },
  { value: 'two',   label: 'Two Basements',    fee: 10_000 },
  { value: 'three', label: 'Three Basements',  fee: 15_000 },
]
