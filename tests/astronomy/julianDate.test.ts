import { describe, expect, it } from "vitest";
import {
  dateToJulianDate,
  dateToSecondsSinceJ2000,
  J2000_JULIAN_DATE,
  parseIsoDateOnly,
  secondsSinceJ2000ToJulianDate
} from "../../src/astronomy/julianDate";

describe("Julian Date utilities", () => {
  it("converts J2000 epoch to the known Julian Date", () => {
    const j2000 = new Date("2000-01-01T12:00:00Z");
    expect(dateToJulianDate(j2000)).toBeCloseTo(J2000_JULIAN_DATE, 8);
  });

  it("parses valid YYYY-MM-DD input as UTC midnight", () => {
    const parsed = parseIsoDateOnly("2026-05-22");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.isoDate).toBe("2026-05-22");
      expect(parsed.date.toISOString()).toBe("2026-05-22T00:00:00.000Z");
    }
  });

  it("rejects invalid date input", () => {
    expect(parseIsoDateOnly("2026-02-30").ok).toBe(false);
    expect(parseIsoDateOnly("05/22/2026").ok).toBe(false);
  });

  it("keeps simulation date jump math consistent", () => {
    const parsed = parseIsoDateOnly("2000-01-02");
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const seconds = dateToSecondsSinceJ2000(parsed.date);
      expect(seconds).toBe(43_200);
      expect(secondsSinceJ2000ToJulianDate(seconds)).toBeCloseTo(2451545.5, 8);
    }
  });
});

