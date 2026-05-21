import { describe, expect, it } from "vitest";
import { computeKeplerPositionMeters } from "../../src/astronomy/kepler";
import { computeMoonPositionMeters } from "../../src/astronomy/moonModel";
import { GRAVITATIONAL_CONSTANT } from "../../src/config/constants";
import { loadSolarSystemData } from "../../src/data/dataLoader";

describe("Moon model", () => {
  const data = loadSolarSystemData();
  const sun = data.bodyById.get("sun")!;
  const earth = data.bodyById.get("earth")!;
  const moon = data.bodyById.get("moon")!;
  const earthElement = data.orbitalElementByBodyId.get("earth")!;
  const moonElement = data.orbitalElementByBodyId.get("moon")!;

  it("computes Moon position as Earth-relative then heliocentric", () => {
    const secondsSinceEpoch = 86_400 * 42;
    const earthPosition = computeKeplerPositionMeters(
      earthElement,
      secondsSinceEpoch,
      GRAVITATIONAL_CONSTANT * (sun.mass_kg + earth.mass_kg)
    );
    const moonPosition = computeMoonPositionMeters(
      moonElement,
      earth,
      moon,
      earthPosition,
      secondsSinceEpoch
    );

    expect(moonPosition.heliocentricMeters.clone().sub(earthPosition).distanceTo(moonPosition.relativeToEarthMeters)).toBeLessThan(1);
    expect(moonPosition.relativeToEarthMeters.length()).toBeGreaterThan(3.5e8);
    expect(moonPosition.relativeToEarthMeters.length()).toBeLessThan(4.1e8);
    expect(Number.isFinite(moonPosition.heliocentricMeters.x)).toBe(true);
    expect(Number.isFinite(moonPosition.heliocentricMeters.y)).toBe(true);
    expect(Number.isFinite(moonPosition.heliocentricMeters.z)).toBe(true);
  });
});

