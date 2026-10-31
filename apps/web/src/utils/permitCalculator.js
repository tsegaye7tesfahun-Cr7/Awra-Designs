/**
 * Ethiopian Building Permit Fee Calculator — Official Formulas
 * Based on:
 * - Addis Ababa Regulation No. 134/2022, Schedule 4 (Construction cost estimation rates)
 * - Ethiopian Building Regulation No. 243/2011, Article 24 (Plan review and approval fees)
 */
import {
  CONSTRUCTION_RATES,
  PLANNING_CONSENT_FEE,
} from './permitFees'

/**
 * Calculate plan review fee based on project estimate
 * Ethiopian Building Regulation No. 243/2011, Article 24
 * @param {number} projectEstimate - Total project estimate in ETB
 * @returns {number} Plan review fee in ETB
 */
function calculatePlanReviewFee(projectEstimate) {
  if (projectEstimate <= 2_500_000) {
    return projectEstimate / 2000
  } else if (projectEstimate <= 5_000_000) {
    return 1250 + (projectEstimate - 2_500_000) / 2500
  } else if (projectEstimate <= 10_000_000) {
    return 2250 + (projectEstimate - 5_000_000) / 3000
  } else if (projectEstimate <= 20_000_000) {
    return 3920 + (projectEstimate - 10_000_000) / 3500
  } else if (projectEstimate <= 50_000_000) {
    return 6770 + (projectEstimate - 20_000_000) / 4000
  } else {
    return 14270 + (projectEstimate - 50_000_000) / 5000
  }
}

/**
 * @param {object} params
 * @param {'residential'|'hospital'} params.buildingUse
 * @param {'without_rc'|'with_rc'} params.structuralClassification
 * @param {number} params.floorArea - Total floor area in m²
 * @param {number} params.floorCount - Number of floors above ground
 * @param {number} params.basement - Number of basement levels (0-3)
 * @param {boolean} params.requirePlanningConsent - Whether planning consent is required
 * @returns {{
 *   totalFloorArea: number,
 *   constructionRate: number,
 *   projectEstimate: number,
 *   planReviewFee: number,
 *   planApprovalFee: number,
 *   planningConsentFee: number,
 *   totalPayable: number,
 *   breakdown: object[]
 * } | null}
 */
export function calculatePermitFee({ buildingUse, structuralClassification, floorArea, floorCount, basement, requirePlanningConsent }) {
  // Validate inputs
  if (!buildingUse || !structuralClassification || !floorArea || floorArea <= 0 || floorCount < 0 || basement < 0) {
    return null
  }

  // ── Total Floor Area ─────────────────────────────────────────────────────
  const totalFloorArea = floorArea

  // ── Applicable Construction Rate per m² ───────────────────────────────────
  const rates = CONSTRUCTION_RATES[buildingUse]
  if (!rates) return null

  let constructionRate
  if (buildingUse === 'residential') {
    // G+0 without RC footing: 10,000 ETB/m²
    // G+1 and above: 12,200 ETB/m²
    if (floorCount === 0 && structuralClassification === 'without_rc') {
      constructionRate = rates.without_rc
    } else {
      constructionRate = rates.with_rc
    }
  } else {
    // Hospital: G+0 and above: 20,000 ETB/m² (same rate regardless of classification)
    constructionRate = rates.without_rc
  }

  // ── Estimated Construction Cost ───────────────────────────────────────────
  const projectEstimate = totalFloorArea * constructionRate

  // ── Plan Review Fee (Progressive Formula) ─────────────────────────────────
  const planReviewFee = calculatePlanReviewFee(projectEstimate)

  // ── Plan Approval Fee ───────────────────────────────────────────────────────
  const planApprovalFee = planReviewFee * 0.10

  // ── Planning Consent Fee ───────────────────────────────────────────────────
  const planningConsentFee = requirePlanningConsent ? PLANNING_CONSENT_FEE : 0

  // ── Total Payable ─────────────────────────────────────────────────────────
  const totalPayable = planReviewFee + planApprovalFee + planningConsentFee

  // ── Build Breakdown for Display ─────────────────────────────────────────────
  const breakdown = []
  breakdown.push({ label: 'Total Floor Area', amount: totalFloorArea, description: `${totalFloorArea.toLocaleString('en-US')} m²` })
  breakdown.push({ label: 'Construction Rate', amount: constructionRate, description: `${constructionRate.toLocaleString('en-US')} ETB/m²` })
  breakdown.push({ label: 'Estimated Construction Cost', amount: projectEstimate, description: 'Based on approved rate' })
  breakdown.push({ label: 'Plan Review Fee', amount: planReviewFee, description: 'Per Article 24, Building Regulation No. 243/2011' })
  breakdown.push({ label: 'Plan Approval Fee', amount: planApprovalFee, description: '10% of plan review fee' })
  if (planningConsentFee > 0) {
    breakdown.push({ label: 'Planning Consent Fee', amount: planningConsentFee, description: 'When applicable' })
  }

  return {
    totalFloorArea,
    constructionRate,
    projectEstimate,
    planReviewFee,
    planApprovalFee,
    planningConsentFee,
    totalPayable,
    breakdown,
  }
}

/** Format a number as ETB currency string */
export function formatETB(amount) {
  return `ETB ${Math.round(amount).toLocaleString('en-US')}`
}

/** Generate a printable summary object */
export function generateCalculationSummary(params, result) {
  const { buildingUse, structuralClassification, floorArea, floorCount, basement, requirePlanningConsent } = params

  return {
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    referenceCode: `BLD-${String(floorArea).padStart(4,'0')}-${Math.floor(Math.random() * 9000) + 1000}`,
    buildingUse: buildingUse.charAt(0).toUpperCase() + buildingUse.slice(1),
    structuralClassification: structuralClassification === 'without_rc' ? 'Without RC Footing' : 'With RC Footing',
    totalFloorArea: result.totalFloorArea,
    floorCount,
    basement,
    constructionRate: result.constructionRate,
    projectEstimate: result.projectEstimate,
    breakdown: result.breakdown,
    totalPayable: result.totalPayable,
    source: 'Addis Ababa Regulation No. 134/2022, Schedule 4 and Ethiopian Building Regulation No. 243/2011, Article 24',
    disclaimer: 'This estimate is based on official Ethiopian and Addis Ababa building permit fee regulations. It is provided for guidance only and is not an official government payment receipt.',
  }
}
