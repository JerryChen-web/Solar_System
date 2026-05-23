import { describe, expect, it } from "vitest";
import { AU_METERS } from "../../src/config/constants";
import { toAu, toMeters } from "../../src/astronomy/referenceUnitNormalizer";

describe("reference unit normalizer", () => {
  it("keeps AU values as AU", () => {
    const result = toAu(1, "AU");

    expect(result.ok).toBe(true);
    expect(result.ok ? result.value : undefined).toBe(1);
    expect(result.ok ? result.unit : undefined).toBe("au");
  });

  it("converts km and m to AU", () => {
    const km = toAu(149_597_870.7, "km");
    const meters = toAu(AU_METERS, "m");

    expect(km.ok ? km.value : undefined).toBeCloseTo(1);
    expect(meters.ok ? meters.value : undefined).toBeCloseTo(1);
  });

  it("converts AU, km, and m to meters", () => {
    expect(toMeters(1, "AU")).toMatchObject({ ok: true, value: AU_METERS, unit: "m" });
    expect(toMeters(2, "km")).toMatchObject({ ok: true, value: 2_000, unit: "m" });
    expect(toMeters(3, "m")).toMatchObject({ ok: true, value: 3, unit: "m" });
  });

  it("handles unsupported units safely", () => {
    const result = toMeters(1, "lightyear");

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.message).toContain("Unsupported");
  });

  it("handles invalid numeric values safely", () => {
    expect(toMeters(Number.NaN, "m").ok).toBe(false);
    expect(toAu(Number.POSITIVE_INFINITY, "km").ok).toBe(false);
  });
});
