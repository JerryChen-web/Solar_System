import { describe, expect, it } from "vitest";
import {
  formatDistanceForPositionTable,
  formatPositionComponentAu,
  statusClassName
} from "../../src/ui/positionTable";
import { AU_METERS } from "../../src/config/constants";

describe("position table helpers", () => {
  it("formats position components in AU", () => {
    expect(formatPositionComponentAu(AU_METERS)).toBe("1");
    expect(formatPositionComponentAu(-AU_METERS / 2)).toBe("-0.5");
  });

  it("formats distance values and handles missing data", () => {
    expect(formatDistanceForPositionTable(AU_METERS)).toContain("1");
    expect(formatDistanceForPositionTable(undefined)).toBe("N/A");
    expect(formatPositionComponentAu(Number.NaN)).toBe("N/A");
  });

  it("generates stable status class names", () => {
    expect(statusClassName("PASS")).toBe("status-badge status-pass");
    expect(statusClassName("WARN")).toBe("status-badge status-warn");
    expect(statusClassName("ERROR")).toBe("status-badge status-error");
  });
});

