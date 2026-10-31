/**
 * Building Permit Fee Calculator — pure calculation logic.
 * No UI concerns. Import fee tables from permitFees.js.
 */
import {
  DESIGN_REVIEW_TIERS,
  PERMIT_SERVICES,
  BASEMENT_OPTIONS,
} from './permitFees'

/**
 * @param {object} params
 * @param {'residential'|'commercial'|'mixed'} params.buildingType
 * @param {number}  params.floorArea   — positive number in m²
 * @param {'new'|'renewal'} params.permitService
 * @param {'none'|'one'|'two'|'three'} params.basement
 * @returns {{ designReview: number, permitService: number, basement: number, total: number } | null}
 */
export function calculatePermitFee({ buildingType, floorArea, permitService, basement }) {
  if (!buildingType || !floorArea || floorArea <= 0 || !permitService || !basement) return null

  const tiers = DESIGN_REVIEW_TIERS[buildingType]
  if (!tiers) return null

  const tier = tiers.find(t => floorArea <= t.maxArea)
  const designReview = tier ? tier.fee : tiers[tiers.length - 1].fee

  const serviceEntry = PERMIT_SERVICES.find(s => s.value === permitService)
  const permitServiceFee = serviceEntry ? serviceEntry.fee : 0

  const basementEntry = BASEMENT_OPTIONS.find(b => b.value === basement)
  const basementFee = basementEntry ? basementEntry.fee : 0

  return {
    designReview,
    permitService: permitServiceFee,
    basement: basementFee,
    total: designReview + permitServiceFee + basementFee,
  }
}

/** Format a number as ETB currency string */
export function formatETB(amount) {
  return `ETB ${amount.toLocaleString('en-US')}`
}
