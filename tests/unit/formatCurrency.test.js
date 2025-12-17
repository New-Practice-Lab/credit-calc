import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/js/credit-calc-utils.js";

describe("formatCurrency", () => {
  it("should format positive integers as USD currency", () => {
    expect(formatCurrency(1000)).toBe("$1,000");
    expect(formatCurrency(7830)).toBe("$7,830");
    expect(formatCurrency(4328)).toBe("$4,328");
  });

  it("should format zero as $0", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("should format large numbers with comma separators", () => {
    expect(formatCurrency(1234567)).toBe("$1,234,567");
    expect(formatCurrency(1000000)).toBe("$1,000,000");
  });

  it("should round decimals to nearest dollar", () => {
    expect(formatCurrency(1234.5)).toBe("$1,235");
    expect(formatCurrency(1234.49)).toBe("$1,234");
    expect(formatCurrency(1234.99)).toBe("$1,235");
  });

  it("should handle negative numbers", () => {
    expect(formatCurrency(-1000)).toBe("-$1,000");
    expect(formatCurrency(-500)).toBe("-$500");
  });

  it("should format single digits", () => {
    expect(formatCurrency(1)).toBe("$1");
    expect(formatCurrency(5)).toBe("$5");
    expect(formatCurrency(9)).toBe("$9");
  });

  it("should format two-digit numbers", () => {
    expect(formatCurrency(10)).toBe("$10");
    expect(formatCurrency(99)).toBe("$99");
  });

  it("should format three-digit numbers without comma", () => {
    expect(formatCurrency(100)).toBe("$100");
    expect(formatCurrency(999)).toBe("$999");
  });

  it("should format amounts typical for tax credits", () => {
    // 2025 EITC amounts
    expect(formatCurrency(649)).toBe("$649"); // 0 children
    expect(formatCurrency(4328)).toBe("$4,328"); // 1 child
    expect(formatCurrency(7152)).toBe("$7,152"); // 2 children
    expect(formatCurrency(8046)).toBe("$8,046"); // 3+ children

    // CTC amount
    expect(formatCurrency(1700)).toBe("$1,700");
  });
});
