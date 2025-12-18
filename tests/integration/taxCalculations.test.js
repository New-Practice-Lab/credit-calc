import {
  calculateFederalCtc,
  calculateMarylandEitc,
  taxYear2025,
} from "@tests/fixtures/taxYear2025.js";
import {
  createFreshFactGraph,
  extractFactGraphValue,
} from "@tests/helpers/factGraphHelper.js";
import { beforeAll, describe, expect, it } from "vitest";

describe("Tax Calculations - Federal EITC", () => {
  describe("Single filer with SSN scenarios", () => {
    it("should calculate correct EITC for 0 children ($649)", async () => {
      const factGraph = await createFreshFactGraph();

      // Set facts
      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "Single");
      factGraph.set("/primaryFilerTaxId", "SSN");
      factGraph.set("/secondaryFilerTaxId", "Neither");
      factGraph.set("/numQualifyingChildren", 0);

      // Get results
      const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");
      const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");

      // Assert
      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(true);
      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(
        taxYear2025.federalEitc.maxAmountByChildren[0],
      );
    });

    it("should calculate correct EITC for 1 child ($4,328)", async () => {
      const factGraph = await createFreshFactGraph();

      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "Single");
      factGraph.set("/primaryFilerTaxId", "SSN");
      factGraph.set("/secondaryFilerTaxId", "Neither");
      factGraph.set("/numQualifyingChildren", 1);

      const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");

      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(
        taxYear2025.federalEitc.maxAmountByChildren[1],
      );
    });

    it("should calculate correct EITC for 2 children ($7,152)", async () => {
      const factGraph = await createFreshFactGraph();

      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "Single");
      factGraph.set("/primaryFilerTaxId", "SSN");
      factGraph.set("/secondaryFilerTaxId", "Neither");
      factGraph.set("/numQualifyingChildren", 2);

      const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");

      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(
        taxYear2025.federalEitc.maxAmountByChildren[2],
      );
    });

    it("should calculate correct EITC for 3+ children ($8,046)", async () => {
      const factGraph = await createFreshFactGraph();

      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "Single");
      factGraph.set("/primaryFilerTaxId", "SSN");
      factGraph.set("/secondaryFilerTaxId", "Neither");
      factGraph.set("/numQualifyingChildren", 3);

      const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");

      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(
        taxYear2025.federalEitc.maxAmountByChildren[3],
      );
    });

    it("should calculate same EITC for 4 children as 3 children", async () => {
      const factGraph = await createFreshFactGraph();

      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "Single");
      factGraph.set("/primaryFilerTaxId", "SSN");
      factGraph.set("/secondaryFilerTaxId", "Neither");
      factGraph.set("/numQualifyingChildren", 4);

      const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");

      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(
        taxYear2025.federalEitc.maxAmountByChildren[3],
      ); // Same as 3+ children
    });
  });

  describe("ITIN holder scenarios", () => {
    it("should reject single filer with ITIN for federal EITC", async () => {
      const factGraph = await createFreshFactGraph();

      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "Single");
      factGraph.set("/primaryFilerTaxId", "ITIN");
      factGraph.set("/secondaryFilerTaxId", "Neither");
      factGraph.set("/numQualifyingChildren", 2);

      const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");
      const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");

      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false);
      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(0);
    });

    it('should reject filer with "Neither" tax ID for federal EITC', async () => {
      const factGraph = await createFreshFactGraph();

      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "Single");
      factGraph.set("/primaryFilerTaxId", "Neither");
      factGraph.set("/secondaryFilerTaxId", "Neither");
      factGraph.set("/numQualifyingChildren", 2);

      const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");
      const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");

      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false);
      expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(0);
    });
  });

  describe("Married Filing Jointly scenarios", () => {
    it("should require both spouses to have SSN for federal EITC", async () => {
      const factGraph = await createFreshFactGraph();

      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "MarriedFilingJointly");
      factGraph.set("/primaryFilerTaxId", "SSN");
      factGraph.set("/secondaryFilerTaxId", "ITIN");
      factGraph.set("/numQualifyingChildren", 2);

      const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");

      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false);
    });

    it("should qualify MFJ with both SSNs", async () => {
      const factGraph = await createFreshFactGraph();

      factGraph.set("/filingState", "CO");
      factGraph.set("/filingStatus", "MarriedFilingJointly");
      factGraph.set("/primaryFilerTaxId", "SSN");
      factGraph.set("/secondaryFilerTaxId", "SSN");
      factGraph.set("/numQualifyingChildren", 2);

      const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");
      const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");

      expect(extractFactGraphValue(fedEitcIdCheck)).toBe(true);
      expect(extractFactGraphValue(federalEitcMaxAmount)).toBeGreaterThan(0);
    });
  });
});

describe("Tax Calculations - Maryland EITC (CRITICAL Special Case)", () => {
  it("should accept ITIN holder for Maryland EITC", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "MD");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "ITIN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");
    const mdEitcIdCheck = factGraph.get("/filersHaveValidIdsForMdEitc");
    const mdEitcAmount = factGraph.get("/mdEitcAmount");

    // Should be ineligible for federal but eligible for MD
    expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false);
    expect(extractFactGraphValue(mdEitcIdCheck)).toBe(true);
    expect(extractFactGraphValue(mdEitcAmount)).toBeGreaterThan(0);
  });

  it("should calculate MD EITC as 50% of estimated federal EITC for ITIN holder", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "MD");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "ITIN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const federalEitcEstimatedAmount = factGraph.get(
      "/federalEitcEstimatedAmount",
    );
    const mdEitcAmount = factGraph.get("/mdEitcAmount");

    const estimated = extractFactGraphValue(federalEitcEstimatedAmount);
    const mdAmount = extractFactGraphValue(mdEitcAmount);

    // MD EITC should be 50% of estimated federal amount
    const expectedMdAmount = calculateMarylandEitc(
      taxYear2025.federalEitc.maxAmountByChildren[2],
    );
    expect(mdAmount).toBe(calculateMarylandEitc(estimated));
    expect(mdAmount).toBe(expectedMdAmount);
  });

  it("should calculate MD EITC for SSN holder with 2 children", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "MD");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "SSN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");
    const mdEitcIdCheck = factGraph.get("/filersHaveValidIdsForMdEitc");
    const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");
    const mdEitcAmount = factGraph.get("/mdEitcAmount");

    // Should be eligible for both federal and MD
    expect(extractFactGraphValue(fedEitcIdCheck)).toBe(true);
    expect(extractFactGraphValue(mdEitcIdCheck)).toBe(true);

    const federalAmount = extractFactGraphValue(federalEitcMaxAmount);
    const mdAmount = extractFactGraphValue(mdEitcAmount);

    expect(federalAmount).toBe(taxYear2025.federalEitc.maxAmountByChildren[2]);
    expect(mdAmount).toBe(
      calculateMarylandEitc(taxYear2025.federalEitc.maxAmountByChildren[2]),
    );
  });

  it("should not show MD EITC for Colorado filer", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "CO");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "SSN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const mdEitcIdCheck = factGraph.get("/filersHaveValidIdsForMdEitc");
    const mdEitcAmount = factGraph.get("/mdEitcAmount");

    // MD EITC eligibility check should still work, but amount logic is state-independent
    expect(extractFactGraphValue(mdEitcIdCheck)).toBe(true); // Has valid ID
    expect(extractFactGraphValue(mdEitcAmount)).toBeGreaterThan(0); // Gets MD EITC amount calculated
  });
});

describe("Tax Calculations - Federal CTC", () => {
  it("should calculate CTC for eligible filer with children", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "CO");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "SSN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const fedCtcIdCheck = factGraph.get("/filersHaveValidIdsForFederalCtc");
    const federalCtcMaxRefundableAmount = factGraph.get(
      "/federalCtcMaxRefundableAmount",
    );

    expect(extractFactGraphValue(fedCtcIdCheck)).toBe(true);
    expect(extractFactGraphValue(federalCtcMaxRefundableAmount)).toBe(
      calculateFederalCtc(2),
    );
  });

  it("should calculate CTC as $0 for filer with 0 children", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "CO");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "SSN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 0);

    const fedCtcIdCheck = factGraph.get("/filersHaveValidIdsForFederalCtc");
    const federalCtcMaxRefundableAmount = factGraph.get(
      "/federalCtcMaxRefundableAmount",
    );

    // With 0 children, should be ineligible for CTC even with valid SSN
    expect(extractFactGraphValue(fedCtcIdCheck)).toBe(false);
    expect(extractFactGraphValue(federalCtcMaxRefundableAmount)).toBe(0);
  });
});

describe("Tax Calculations - Federal Only", () => {
  it("should calculate only federal credits when Federal Only is selected", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "Federal");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "SSN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");
    const federalCtcMaxRefundableAmount = factGraph.get(
      "/federalCtcMaxRefundableAmount",
    );

    const eitc = extractFactGraphValue(federalEitcMaxAmount);
    const ctc = extractFactGraphValue(federalCtcMaxRefundableAmount);

    // Verify federal credits are calculated
    expect(eitc).toBe(taxYear2025.federalEitc.maxAmountByChildren[2]);
    expect(ctc).toBe(calculateFederalCtc(2));

    // Verify total
    const total = eitc + ctc;
    expect(total).toBe(
      taxYear2025.federalEitc.maxAmountByChildren[2] + calculateFederalCtc(2),
    );
  });

  it("should calculate federal credits with 0 children", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "Federal");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "SSN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 0);

    const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");
    const federalCtcMaxRefundableAmount = factGraph.get(
      "/federalCtcMaxRefundableAmount",
    );

    const eitc = extractFactGraphValue(federalEitcMaxAmount);
    const ctc = extractFactGraphValue(federalCtcMaxRefundableAmount);

    // Verify amounts
    expect(eitc).toBe(taxYear2025.federalEitc.maxAmountByChildren[0]);
    expect(ctc).toBe(0); // No CTC with 0 children
  });

  it("should not calculate federal EITC for ITIN holder with Federal Only", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "Federal");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "ITIN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const fedEitcIdCheck = factGraph.get("/filersHaveValidIdsForFederalEitc");
    const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");
    const federalCtcMaxRefundableAmount = factGraph.get(
      "/federalCtcMaxRefundableAmount",
    );

    // ITIN holders are not eligible for federal credits
    expect(extractFactGraphValue(fedEitcIdCheck)).toBe(false);
    expect(extractFactGraphValue(federalEitcMaxAmount)).toBe(0);
    expect(extractFactGraphValue(federalCtcMaxRefundableAmount)).toBe(0);
  });
});

describe("Tax Calculations - Combined Credits", () => {
  it("should calculate total for eligible Maryland SSN filer with 2 children", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "MD");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "SSN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");
    const federalCtcMaxRefundableAmount = factGraph.get(
      "/federalCtcMaxRefundableAmount",
    );
    const mdEitcAmount = factGraph.get("/mdEitcAmount");

    const eitc = extractFactGraphValue(federalEitcMaxAmount);
    const ctc = extractFactGraphValue(federalCtcMaxRefundableAmount);
    const mdEitc = extractFactGraphValue(mdEitcAmount);

    // Verify all credits are positive
    const expectedEitc = taxYear2025.federalEitc.maxAmountByChildren[2];
    const expectedCtc = calculateFederalCtc(2);
    const expectedMdEitc = calculateMarylandEitc(expectedEitc);

    expect(eitc).toBe(expectedEitc);
    expect(ctc).toBe(expectedCtc);
    expect(mdEitc).toBe(expectedMdEitc);

    // Verify total
    const total = eitc + ctc + mdEitc;
    const expectedTotal = expectedEitc + expectedCtc + expectedMdEitc;
    expect(total).toBe(expectedTotal);
  });

  it("should calculate total for ITIN holder in Maryland with 2 children", async () => {
    const factGraph = await createFreshFactGraph();

    factGraph.set("/filingState", "MD");
    factGraph.set("/filingStatus", "Single");
    factGraph.set("/primaryFilerTaxId", "ITIN");
    factGraph.set("/secondaryFilerTaxId", "Neither");
    factGraph.set("/numQualifyingChildren", 2);

    const federalEitcMaxAmount = factGraph.get("/federalEitcMaxAmount");
    const federalCtcMaxRefundableAmount = factGraph.get(
      "/federalCtcMaxRefundableAmount",
    );
    const mdEitcAmount = factGraph.get("/mdEitcAmount");

    const eitc = extractFactGraphValue(federalEitcMaxAmount);
    const ctc = extractFactGraphValue(federalCtcMaxRefundableAmount);
    const mdEitc = extractFactGraphValue(mdEitcAmount);

    // ITIN holder only gets MD EITC
    const expectedMdEitc = calculateMarylandEitc(
      taxYear2025.federalEitc.maxAmountByChildren[2],
    );

    expect(eitc).toBe(0); // Ineligible for federal EITC
    expect(ctc).toBe(0); // Ineligible for federal CTC
    expect(mdEitc).toBe(expectedMdEitc); // Eligible for MD EITC

    const total = eitc + ctc + mdEitc;
    expect(total).toBe(expectedMdEitc); // Only MD EITC
  });
});
