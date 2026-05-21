import { describe, expect, it } from "vitest";
import { loadSolarSystemData } from "../../src/data/dataLoader";

describe("orbital elements data", () => {
  const data = loadSolarSystemData();

  it("provides orbital elements for every planet and the Moon", () => {
    const orbitingBodies = data.bodies.filter((body) => body.type === "planet" || body.id === "moon");
    for (const body of orbitingBodies) {
      expect(data.orbitalElementByBodyId.has(body.id)).toBe(true);
    }
  });

  it("keeps Moon parent as Earth", () => {
    const moon = data.bodyById.get("moon");
    const moonElements = data.orbitalElementByBodyId.get("moon");
    expect(moon?.parent).toBe("earth");
    expect(moonElements?.parent).toBe("earth");
  });

  it("keeps planets parented to the Sun", () => {
    const planets = data.bodies.filter((body) => body.type === "planet");
    for (const planet of planets) {
      expect(planet.parent).toBe("sun");
    }
  });
});

