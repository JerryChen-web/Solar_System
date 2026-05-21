import { describe, expect, it } from "vitest";
import { loadSolarSystemData } from "../../src/data/dataLoader";

describe("body data validation", () => {
  const data = loadSolarSystemData();

  it("contains required identity and physical fields for every body", () => {
    for (const body of data.bodies) {
      expect(body.id).toBeTruthy();
      expect(body.name_en).toBeTruthy();
      expect(body.name_zh).toBeTruthy();
      expect(body.mass_kg).toBeDefined();
      expect(body.mean_radius_m).toBeDefined();
      expect(body.mass_kg).toBeGreaterThan(0);
      expect(body.mean_radius_m).toBeGreaterThan(0);
    }
  });
});

