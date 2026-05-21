import { describe, expect, it } from "vitest";
import { validateBodyOrbit } from "../../src/astronomy/orbitValidation";
import { loadSolarSystemData } from "../../src/data/dataLoader";

describe("orbit validation", () => {
  const data = loadSolarSystemData();
  const sun = data.bodyById.get("sun")!;

  it("validates finite radius and continuity for major planets", () => {
    const sampleSeconds = [0, 86_400 * 10, 86_400 * 20, 86_400 * 30];
    for (const planet of data.bodies.filter((body) => body.type === "planet")) {
      const element = data.orbitalElementByBodyId.get(planet.id);
      expect(element).toBeDefined();
      const result = validateBodyOrbit(planet, sun, element!, sampleSeconds);
      expect(result.valid, `${planet.id}: ${result.messages.join(", ")}`).toBe(true);
    }
  });
});

