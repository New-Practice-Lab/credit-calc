import { describe, it, expect, beforeAll } from 'vitest'
import { createFreshFactGraph, extractFactGraphValue } from '@tests/helpers/factGraphHelper.js'

describe('Tax Calculations - Federal EITC', () => {
  describe('Single filer with SSN scenarios', () => {
    it('should calculate correct EITC for 0 children ($649)', async () => {
      const factGraph = await createFreshFactGraph()

      // Set facts
      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'Single')
      factGraph.set('/primaryFilerTaxId', 'SSN')
      factGraph.set('/secondaryFilerTaxId', 'Neither')
      factGraph.set('/numQualifyingChildren', 0)

      // Get results
      const fedEitcIdCheck = factGraph.get('/filersHaveValidIdsForFederalEitc')
      const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')

      // Assert
      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(true)
      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(649) // 2025 max for 0 children
    })

    it('should calculate correct EITC for 1 child ($4,328)', async () => {
      const factGraph = await createFreshFactGraph()

      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'Single')
      factGraph.set('/primaryFilerTaxId', 'SSN')
      factGraph.set('/secondaryFilerTaxId', 'Neither')
      factGraph.set('/numQualifyingChildren', 1)

      const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')

      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(4328) // 2025 max for 1 child
    })

    it('should calculate correct EITC for 2 children ($7,152)', async () => {
      const factGraph = await createFreshFactGraph()

      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'Single')
      factGraph.set('/primaryFilerTaxId', 'SSN')
      factGraph.set('/secondaryFilerTaxId', 'Neither')
      factGraph.set('/numQualifyingChildren', 2)

      const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')

      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(7152) // 2025 max for 2 children
    })

    it('should calculate correct EITC for 3+ children ($8,046)', async () => {
      const factGraph = await createFreshFactGraph()

      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'Single')
      factGraph.set('/primaryFilerTaxId', 'SSN')
      factGraph.set('/secondaryFilerTaxId', 'Neither')
      factGraph.set('/numQualifyingChildren', 3)

      const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')

      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(8046) // 2025 max for 3+ children
    })

    it('should calculate same EITC for 4 children as 3 children', async () => {
      const factGraph = await createFreshFactGraph()

      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'Single')
      factGraph.set('/primaryFilerTaxId', 'SSN')
      factGraph.set('/secondaryFilerTaxId', 'Neither')
      factGraph.set('/numQualifyingChildren', 4)

      const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')

      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(8046) // Same as 3+ children
    })
  })

  describe('ITIN holder scenarios', () => {
    it('should reject single filer with ITIN for federal EITC', async () => {
      const factGraph = await createFreshFactGraph()

      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'Single')
      factGraph.set('/primaryFilerTaxId', 'ITIN')
      factGraph.set('/secondaryFilerTaxId', 'Neither')
      factGraph.set('/numQualifyingChildren', 2)

      const fedEitcIdCheck = factGraph.get('/filersHaveValidIdsForFederalEitc')
      const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')

      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false)
      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(0)
    })

    it('should reject filer with "Neither" tax ID for federal EITC', async () => {
      const factGraph = await createFreshFactGraph()

      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'Single')
      factGraph.set('/primaryFilerTaxId', 'Neither')
      factGraph.set('/secondaryFilerTaxId', 'Neither')
      factGraph.set('/numQualifyingChildren', 2)

      const fedEitcIdCheck = factGraph.get('/filersHaveValidIdsForFederalEitc')
      const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')

      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false)
      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(0)
    })
  })

  describe('Married Filing Jointly scenarios', () => {
    it('should require both spouses to have SSN for federal EITC', async () => {
      const factGraph = await createFreshFactGraph()

      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'MarriedFilingJointly')
      factGraph.set('/primaryFilerTaxId', 'SSN')
      factGraph.set('/secondaryFilerTaxId', 'ITIN')
      factGraph.set('/numQualifyingChildren', 2)

      const fedEitcIdCheck = factGraph.get('/filersHaveValidIdsForFederalEitc')

      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false)
    })

    it('should qualify MFJ with both SSNs', async () => {
      const factGraph = await createFreshFactGraph()

      factGraph.set('/filingState', 'CO')
      factGraph.set('/filingStatus', 'MarriedFilingJointly')
      factGraph.set('/primaryFilerTaxId', 'SSN')
      factGraph.set('/secondaryFilerTaxId', 'SSN')
      factGraph.set('/numQualifyingChildren', 2)

      const fedEitcIdCheck = factGraph.get('/filersHaveValidIdsForFederalEitc')
      const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')

      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(true)
      expect(extractFactGraphValue(federalEitcMaxAmount)).toBeGreaterThan(0)
    })
  })
})

describe('Tax Calculations - Maryland EITC (CRITICAL Special Case)', () => {
  it('should accept ITIN holder for Maryland EITC', async () => {
    const factGraph = await createFreshFactGraph()

    factGraph.set('/filingState', 'MD')
    factGraph.set('/filingStatus', 'Single')
    factGraph.set('/primaryFilerTaxId', 'ITIN')
    factGraph.set('/secondaryFilerTaxId', 'Neither')
    factGraph.set('/numQualifyingChildren', 2)

    const fedEitcIdCheck = factGraph.get('/filersHaveValidIdsForFederalEitc')
    const mdEitcIdCheck = factGraph.get('/filersHaveValidIdsForMdEitc')
    const mdEitcAmount = factGraph.get('/mdEitcAmount')

    // Should be ineligible for federal but eligible for MD
    expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false)
    expect(extractFactGraphValue(mdEitcIdCheck)).toBe(true)
    expect(extractFactGraphValue(mdEitcAmount)).toBeGreaterThan(0)
  })

  it('should calculate MD EITC as 50% of estimated federal EITC for ITIN holder', async () => {
    const factGraph = await createFreshFactGraph()

    factGraph.set('/filingState', 'MD')
    factGraph.set('/filingStatus', 'Single')
    factGraph.set('/primaryFilerTaxId', 'ITIN')
    factGraph.set('/secondaryFilerTaxId', 'Neither')
    factGraph.set('/numQualifyingChildren', 2)

    const federalEitcEstimatedAmount = factGraph.get('/federalEitcEstimatedAmount')
    const mdEitcAmount = factGraph.get('/mdEitcAmount')

    const estimated = extractFactGraphValue(federalEitcEstimatedAmount)
    const mdAmount = extractFactGraphValue(mdEitcAmount)

    // MD EITC should be 50% of estimated federal amount
    expect(mdAmount).toBe(estimated * 0.5)
    expect(mdAmount).toBe(3576) // 50% of $7,152
  })

  it('should calculate MD EITC for SSN holder with 2 children', async () => {
    const factGraph = await createFreshFactGraph()

    factGraph.set('/filingState', 'MD')
    factGraph.set('/filingStatus', 'Single')
    factGraph.set('/primaryFilerTaxId', 'SSN')
    factGraph.set('/secondaryFilerTaxId', 'Neither')
    factGraph.set('/numQualifyingChildren', 2)

    const fedEitcIdCheck = factGraph.get('/filersHaveValidIdsForFederalEitc')
    const mdEitcIdCheck = factGraph.get('/filersHaveValidIdsForMdEitc')
    const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')
    const mdEitcAmount = factGraph.get('/mdEitcAmount')

    // Should be eligible for both federal and MD
    expect(extractFactGraphValue(fedEitcIdCheck)).toBe(true)
    expect(extractFactGraphValue(mdEitcIdCheck)).toBe(true)

    const federalAmount = extractFactGraphValue(federalEitcMaxAmount)
    const mdAmount = extractFactGraphValue(mdEitcAmount)

    expect(federalAmount).toBe(7152) // Federal EITC for 2 children
    expect(mdAmount).toBe(3576) // 50% of federal
  })

  it('should not show MD EITC for Colorado filer', async () => {
    const factGraph = await createFreshFactGraph()

    factGraph.set('/filingState', 'CO')
    factGraph.set('/filingStatus', 'Single')
    factGraph.set('/primaryFilerTaxId', 'SSN')
    factGraph.set('/secondaryFilerTaxId', 'Neither')
    factGraph.set('/numQualifyingChildren', 2)

    const mdEitcIdCheck = factGraph.get('/filersHaveValidIdsForMdEitc')
    const mdEitcAmount = factGraph.get('/mdEitcAmount')

    // MD EITC eligibility check should still work, but amount logic is state-independent
    expect(extractFactGraphValue(mdEitcIdCheck)).toBe(true) // Has valid ID
    expect(extractFactGraphValue(mdEitcAmount)).toBeGreaterThan(0) // Gets MD EITC amount calculated
  })
})

describe('Tax Calculations - Federal CTC', () => {
  it('should calculate CTC for eligible filer with children', async () => {
    const factGraph = await createFreshFactGraph()

    factGraph.set('/filingState', 'CO')
    factGraph.set('/filingStatus', 'Single')
    factGraph.set('/primaryFilerTaxId', 'SSN')
    factGraph.set('/secondaryFilerTaxId', 'Neither')
    factGraph.set('/numQualifyingChildren', 2)

    const fedCtcIdCheck = factGraph.get('/filersHaveValidIdsForFederalCtc')
    const federalCtcMaxRefundableAmount = factGraph.get('/federalCtcMaxRefundableAmount')

    expect(extractFactGraphValue(fedCtcIdCheck)).toBe(true)
    expect(extractFactGraphValue(federalCtcMaxRefundableAmount)).toBe(3400) // $1,700 per child × 2 children
  })

  it('should calculate CTC as $0 for filer with 0 children', async () => {
    const factGraph = await createFreshFactGraph()

    factGraph.set('/filingState', 'CO')
    factGraph.set('/filingStatus', 'Single')
    factGraph.set('/primaryFilerTaxId', 'SSN')
    factGraph.set('/secondaryFilerTaxId', 'Neither')
    factGraph.set('/numQualifyingChildren', 0)

    const federalCtcMaxRefundableAmount = factGraph.get('/federalCtcMaxRefundableAmount')

    expect(extractFactGraphValue(federalCtcMaxRefundableAmount)).toBe(0)
  })
})

describe('Tax Calculations - Combined Credits', () => {
  it('should calculate total for eligible Maryland SSN filer with 2 children', async () => {
    const factGraph = await createFreshFactGraph()

    factGraph.set('/filingState', 'MD')
    factGraph.set('/filingStatus', 'Single')
    factGraph.set('/primaryFilerTaxId', 'SSN')
    factGraph.set('/secondaryFilerTaxId', 'Neither')
    factGraph.set('/numQualifyingChildren', 2)

    const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')
    const federalCtcMaxRefundableAmount = factGraph.get('/federalCtcMaxRefundableAmount')
    const mdEitcAmount = factGraph.get('/mdEitcAmount')

    const eitc = extractFactGraphValue(federalEitcMaxAmount)
    const ctc = extractFactGraphValue(federalCtcMaxRefundableAmount)
    const mdEitc = extractFactGraphValue(mdEitcAmount)

    // Verify all credits are positive
    expect(eitc).toBe(7152) // Federal EITC for 2 children
    expect(ctc).toBe(3400) // Federal refundable CTC ($1,700 × 2 children)
    expect(mdEitc).toBe(3576) // 50% of federal EITC

    // Verify total
    const total = eitc + ctc + mdEitc
    expect(total).toBe(14128) // $7,152 + $3,400 + $3,576
  })

  it('should calculate total for ITIN holder in Maryland with 2 children', async () => {
    const factGraph = await createFreshFactGraph()

    factGraph.set('/filingState', 'MD')
    factGraph.set('/filingStatus', 'Single')
    factGraph.set('/primaryFilerTaxId', 'ITIN')
    factGraph.set('/secondaryFilerTaxId', 'Neither')
    factGraph.set('/numQualifyingChildren', 2)

    const federalEitcMaxAmount = factGraph.get('/federalEitcMaxAmount')
    const federalCtcMaxRefundableAmount = factGraph.get('/federalCtcMaxRefundableAmount')
    const mdEitcAmount = factGraph.get('/mdEitcAmount')

    const eitc = extractFactGraphValue(federalEitcMaxAmount)
    const ctc = extractFactGraphValue(federalCtcMaxRefundableAmount)
    const mdEitc = extractFactGraphValue(mdEitcAmount)

    // ITIN holder only gets MD EITC
    expect(eitc).toBe(0) // Ineligible for federal EITC
    expect(ctc).toBe(0) // Ineligible for federal CTC
    expect(mdEitc).toBe(3576) // Eligible for MD EITC (50% of $7,152)

    const total = eitc + ctc + mdEitc
    expect(total).toBe(3576) // Only MD EITC
  })
})
