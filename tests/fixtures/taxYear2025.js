/**
 * Tax credit values and thresholds for Tax Year 2025
 *
 * This fixture contains the expected maximum credit amounts used in tests.
 * Update this file annually when IRS releases new tax year figures.
 */

export const taxYear2025 = {
  year: 2025,

  /**
   * Federal EITC (Earned Income Tax Credit) maximum amounts
   * Source: IRS Publication 596
   */
  federalEitc: {
    maxAmountByChildren: {
      0: 649,      // No qualifying children
      1: 4328,     // One qualifying child
      2: 7152,     // Two qualifying children
      3: 8046,     // Three or more qualifying children
    }
  },

  /**
   * Federal CTC (Child Tax Credit) refundable portion
   * Source: IRS Publication 972
   */
  federalCtc: {
    maxRefundablePerChild: 1700,  // Maximum refundable CTC per qualifying child
  },

  /**
   * Maryland EITC (State-level Earned Income Tax Credit)
   * Maryland allows ITIN holders to claim a percentage of federal EITC
   */
  marylandEitc: {
    percentageOfFederal: 0.50,  // MD EITC is 50% of federal EITC
  }
}

/**
 * Helper function to calculate Federal CTC for multiple children
 */
export function calculateFederalCtc(numChildren) {
  return taxYear2025.federalCtc.maxRefundablePerChild * numChildren
}

/**
 * Helper function to calculate Maryland EITC based on federal amount
 */
export function calculateMarylandEitc(federalEitcAmount) {
  return federalEitcAmount * taxYear2025.marylandEitc.percentageOfFederal
}
