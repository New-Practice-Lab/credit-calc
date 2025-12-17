import { describe, expect, it } from "vitest";
import { extractValue } from "@/js/credit-calc-utils.js";

describe("extractValue", () => {
  it("should extract value from result.v property", () => {
    const result = { v: 12345 };
    expect(extractValue(result)).toBe(12345);
  });

  it("should extract value from result.get property", () => {
    const result = { get: "test value" };
    expect(extractValue(result)).toBe("test value");
  });

  it("should extract value from result.value property", () => {
    const result = { value: true };
    expect(extractValue(result)).toBe(true);
  });

  it("should return primitive values directly", () => {
    expect(extractValue(42)).toBe(42);
    expect(extractValue("test")).toBe("test");
    expect(extractValue(true)).toBe(true);
    expect(extractValue(false)).toBe(false);
  });

  it('should return "Incomplete" for null', () => {
    expect(extractValue(null)).toBe("Incomplete");
  });

  it('should return "Incomplete" for undefined', () => {
    expect(extractValue(undefined)).toBe("Incomplete");
  });

  it("should handle nested objects with .v property", () => {
    const result = { v: { nested: "value" } };
    expect(extractValue(result)).toEqual({ nested: "value" });
  });

  it("should prioritize .v over .get property", () => {
    const result = { v: "from v", get: "from get" };
    expect(extractValue(result)).toBe("from v");
  });

  it("should prioritize .get over .value property", () => {
    const result = { get: "from get", value: "from value" };
    expect(extractValue(result)).toBe("from get");
  });

  it("should handle zero as a valid value", () => {
    expect(extractValue(0)).toBe(0);
    expect(extractValue({ v: 0 })).toBe(0);
  });

  it("should handle empty string as a valid value", () => {
    expect(extractValue("")).toBe("");
    expect(extractValue({ v: "" })).toBe("");
  });

  it("should handle objects without special properties", () => {
    const result = { foo: "bar", baz: 123 };
    expect(extractValue(result)).toEqual({ foo: "bar", baz: 123 });
  });
});
