import { describe, it, expect } from "vitest";
import { formatIndianNumber, formatCurrency } from "./format";

describe("formatIndianNumber", () => {
  it("formats small numbers without commas", () => {
    expect(formatIndianNumber(999)).toBe("999");
  });
  it("formats thousands", () => {
    expect(formatIndianNumber(1000)).toBe("1,000");
  });
  it("formats lakhs", () => {
    expect(formatIndianNumber(100000)).toBe("1,00,000");
  });
  it("formats crores", () => {
    expect(formatIndianNumber(10000000)).toBe("1,00,00,000");
  });
  it("handles decimals", () => {
    expect(formatIndianNumber(1234.56)).toBe("1,234.56");
  });
  it("strips trailing .00", () => {
    expect(formatIndianNumber(1000.0)).toBe("1,000");
  });
  it("handles negative numbers", () => {
    expect(formatIndianNumber(-100000)).toBe("-1,00,000");
  });
  it("handles zero", () => {
    expect(formatIndianNumber(0)).toBe("0");
  });
});

describe("formatCurrency", () => {
  it("prepends rupee symbol", () => {
    expect(formatCurrency(1500)).toBe("₹1,500");
  });
});
