import { describe, expect, it } from "vitest";
import { computeKeplerPositionMeters } from "../../src/astronomy/kepler";
import { AU_METERS, GRAVITATIONAL_CONSTANT } from "../../src/config/constants";
import { loadSolarSystemData } from "../../src/data/dataLoader";

describe("orbital element conversion", () => {
  const data = loadSolarSystemData();
  const sun = data.bodyById.get("sun")!;

  it("converts major planet orbital elements into finite 3D positions", () => {
    const planets = data.bodies.filter((body) => body.type === "planet");
    for (const planet of planets) {
      const element = data.orbitalElementByBodyId.get(planet.id);
      expect(element).toBeDefined();
      const position = computeKeplerPositionMeters(
        element!,
        86_400 * 120,
        GRAVITATIONAL_CONSTANT * (sun.mass_kg + planet.mass_kg)
      );
      expect(Number.isFinite(position.x)).toBe(true);
      expect(Number.isFinite(position.y)).toBe(true);
      expect(Number.isFinite(position.z)).toBe(true);
      expect(position.length()).toBeGreaterThan(element!.a_au * AU_METERS * (1 - element!.e) * 0.98);
      expect(position.length()).toBeLessThan(element!.a_au * AU_METERS * (1 + element!.e) * 1.02);
    }
  });
});

