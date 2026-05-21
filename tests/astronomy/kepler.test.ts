import { describe, expect, it } from "vitest";
import { computeKeplerPositionMeters, solveKeplerEquation } from "../../src/astronomy/kepler";
import { GRAVITATIONAL_CONSTANT } from "../../src/config/constants";
import { loadSolarSystemData } from "../../src/data/dataLoader";
import type { OrbitalElementRecord } from "../../src/types/orbit";

const solarMu = GRAVITATIONAL_CONSTANT * 1.9885e30;

function expectFiniteVector(vector: { x: number; y: number; z: number }): void {
  expect(Number.isFinite(vector.x)).toBe(true);
  expect(Number.isFinite(vector.y)).toBe(true);
  expect(Number.isFinite(vector.z)).toBe(true);
}

describe("Kepler solver", () => {
  it("does not produce NaN for representative mean anomaly and eccentricity", () => {
    const eccentricAnomaly = solveKeplerEquation(1.25, 0.4);
    expect(Number.isNaN(eccentricAnomaly)).toBe(false);
    expect(Number.isFinite(eccentricAnomaly)).toBe(true);
  });

  it("returns the mean anomaly for a circular orbit", () => {
    const meanAnomaly = 2.4;
    const eccentricAnomaly = solveKeplerEquation(meanAnomaly, 0);
    expect(eccentricAnomaly).toBeCloseTo(meanAnomaly, 10);
  });

  it("computes a finite position for a circular orbit", () => {
    const element: OrbitalElementRecord = {
      body_id: "test",
      a_au: 1,
      e: 0,
      i_deg: 0,
      L_deg: 0,
      long_peri_deg: 0,
      long_node_deg: 0
    };

    const position = computeKeplerPositionMeters(element, 0, solarMu);
    expectFiniteVector(position);
    expect(position.length()).toBeGreaterThan(1.49e11);
    expect(position.length()).toBeLessThan(1.5e11);
  });

  it("computes finite Mercury-like high-eccentricity positions", () => {
    const data = loadSolarSystemData();
    const mercury = data.orbitalElementByBodyId.get("mercury");
    expect(mercury).toBeDefined();

    const position = computeKeplerPositionMeters(mercury!, 86_400 * 40, solarMu);
    expectFiniteVector(position);
    expect(position.length()).toBeGreaterThan(0);
  });
});

