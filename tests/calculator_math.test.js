import { describe, expect, it } from "vitest";
import { calculateSavingsGrowth } from "../src/calculator_math.js";

describe("calculateSavingsGrowth", () => {
  it("calculates interest-only growth", () => {
    const result = calculateSavingsGrowth({
      initial: 1000,
      monthly: 0,
      annualRate: 12,
      years: 1,
    });
    const expectedFinal = 1000 * 1.01 ** 12;
    expect(result.finalBalance).toBeCloseTo(expectedFinal, 6);
    expect(result.totalContrib).toBe(1000);
    expect(result.totalInterest).toBeCloseTo(expectedFinal - 1000, 6);
  });

  it("returns yearly breakdown", () => {
    const result = calculateSavingsGrowth({
      initial: 0,
      monthly: 100,
      annualRate: 0,
      years: 2,
    });
    expect(result.yearly).toHaveLength(2);
    expect(result.finalBalance).toBe(2400);
    expect(result.totalContrib).toBe(2400);
    expect(result.totalInterest).toBe(0);
  });
});
