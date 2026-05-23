import { describe, expect, it } from "vitest";
import { localReferenceProvider } from "../../src/astronomy/localReferenceProvider";
import { loadSolarSystemData } from "../../src/data/dataLoader";

describe("reference adapter", () => {
  const data = loadSolarSystemData();
  const context = {
    bodies: data.bodies,
    bodyById: data.bodyById,
    orbitalElementByBodyId: data.orbitalElementByBodyId
  };

  it("returns local approximate references for major planets", () => {
    for (const bodyId of ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"]) {
      const reference = localReferenceProvider.getBodyReference(bodyId, context);
      expect(reference.available).toBe(true);
      if (reference.available) {
        expect(reference.kind).toBe("heliocentric-distance");
        expect(reference.referenceBodyId).toBe("sun");
        expect(reference.range.minMeters).toBeGreaterThan(0);
        expect(reference.range.maxMeters).toBeGreaterThan(reference.range.minMeters);
      }
    }
  });

  it("handles the Sun as a special reference body", () => {
    const reference = localReferenceProvider.getBodyReference("sun", context);
    expect(reference.available).toBe(true);
    if (reference.available) {
      expect(reference.kind).toBe("sun-origin");
      expect(reference.referenceBodyId).toBeNull();
      expect(reference.range.minMeters).toBe(0);
      expect(reference.range.maxMeters).toBe(1_000);
    }
  });

  it("provides a Moon-Earth distance reference", () => {
    const reference = localReferenceProvider.getMoonEarthDistanceReference(context);
    expect(reference.available).toBe(true);
    if (reference.available) {
      expect(reference.kind).toBe("moon-earth-distance");
      expect(reference.bodyId).toBe("moon");
      expect(reference.referenceBodyId).toBe("earth");
      expect(reference.range.minMeters).toBeLessThan(384_400_000);
      expect(reference.range.maxMeters).toBeGreaterThan(384_400_000);
    }
  });

  it("handles unknown bodies safely", () => {
    const reference = localReferenceProvider.getBodyReference("pluto", context);
    expect(reference.available).toBe(false);
    expect(reference.kind).toBe("unavailable");
    expect(reference.note).toContain("Unknown body");
  });
});
