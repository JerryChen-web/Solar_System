import { describe, expect, it } from "vitest";
import { loadSolarSystemData } from "../../src/data/dataLoader";

describe("visual config", () => {
  const data = loadSolarSystemData();

  it("contains visual scale, camera, and orbit config", () => {
    expect(data.visualConfig.scaling).toBeDefined();
    expect(data.visualConfig.scaling.distance).toBeDefined();
    expect(data.visualConfig.scaling.radius).toBeDefined();
    expect(data.visualConfig.camera).toBeDefined();
    expect(data.visualConfig.orbits).toBeDefined();
  });
});

