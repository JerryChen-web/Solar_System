import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { computeKeplerPositionMeters } from "../../src/astronomy/kepler";
import { computeMoonPositionMeters } from "../../src/astronomy/moonModel";
import {
  buildValidationSummary,
  clonePositions,
  validateMoonEarthDistance
} from "../../src/astronomy/validationSummary";
import { GRAVITATIONAL_CONSTANT } from "../../src/config/constants";
import { loadSolarSystemData } from "../../src/data/dataLoader";
import type { SolarSystemData } from "../../src/data/dataLoader";

function buildPositions(data: SolarSystemData, secondsSinceEpoch: number): Map<string, THREE.Vector3> {
  const positions = new Map<string, THREE.Vector3>();
  const sun = data.bodyById.get("sun")!;
  positions.set("sun", new THREE.Vector3());

  for (const body of data.bodies) {
    if (body.id === "sun" || body.id === "moon") {
      continue;
    }
    const element = data.orbitalElementByBodyId.get(body.id)!;
    positions.set(
      body.id,
      computeKeplerPositionMeters(
        element,
        secondsSinceEpoch,
        GRAVITATIONAL_CONSTANT * (sun.mass_kg + body.mass_kg)
      )
    );
  }

  const earth = data.bodyById.get("earth")!;
  const moon = data.bodyById.get("moon")!;
  const moonElement = data.orbitalElementByBodyId.get("moon")!;
  const moonPosition = computeMoonPositionMeters(
    moonElement,
    earth,
    moon,
    positions.get("earth")!,
    secondsSinceEpoch
  );
  positions.set("moon", moonPosition.heliocentricMeters);
  return positions;
}

describe("validation summary", () => {
  const data = loadSolarSystemData();

  it("builds passing validation rows for the Sun and major bodies", () => {
    const summary = buildValidationSummary({
      bodies: data.bodies,
      bodyById: data.bodyById,
      orbitalElementByBodyId: data.orbitalElementByBodyId,
      positionsMeters: buildPositions(data, 0),
      secondsSinceEpoch: 0
    });

    expect(summary.checkedCount).toBe(10);
    expect(summary.errorCount).toBe(0);
    expect(summary.rows.find((row) => row.bodyId === "sun")?.status).toBe("PASS");
    expect(summary.rows.every((row) => row.status === "PASS")).toBe(true);
  });

  it("marks a non-finite position as an error", () => {
    const positions = buildPositions(data, 0);
    positions.set("earth", new THREE.Vector3(Number.NaN, 0, 0));

    const summary = buildValidationSummary({
      bodies: data.bodies,
      bodyById: data.bodyById,
      orbitalElementByBodyId: data.orbitalElementByBodyId,
      positionsMeters: positions,
      secondsSinceEpoch: 0
    });

    const earth = summary.rows.find((row) => row.bodyId === "earth");
    expect(earth?.status).toBe("ERROR");
    expect(summary.errorCount).toBeGreaterThan(0);
  });

  it("treats Sun as a reference body near the origin", () => {
    const positions = buildPositions(data, 0);
    positions.set("sun", new THREE.Vector3(10_000_000, 0, 0));

    const summary = buildValidationSummary({
      bodies: data.bodies,
      bodyById: data.bodyById,
      orbitalElementByBodyId: data.orbitalElementByBodyId,
      positionsMeters: positions,
      secondsSinceEpoch: 0
    });

    const sun = summary.rows.find((row) => row.bodyId === "sun");
    expect(sun?.status).toBe("WARN");
    expect(sun?.messages.join(" ")).toContain("origin");
  });

  it("handles missing continuity history and date-jump reset safely", () => {
    const positions = buildPositions(data, 86_400 * 40);
    const summaryWithoutHistory = buildValidationSummary({
      bodies: data.bodies,
      bodyById: data.bodyById,
      orbitalElementByBodyId: data.orbitalElementByBodyId,
      positionsMeters: positions,
      secondsSinceEpoch: 86_400 * 40,
      continuityHistory: null
    });
    expect(summaryWithoutHistory.rows.every((row) => row.continuityStatus === "PASS")).toBe(true);

    const summaryWithHistory = buildValidationSummary({
      bodies: data.bodies,
      bodyById: data.bodyById,
      orbitalElementByBodyId: data.orbitalElementByBodyId,
      positionsMeters: buildPositions(data, 86_400 * 41),
      secondsSinceEpoch: 86_400 * 41,
      continuityHistory: {
        positionsMeters: clonePositions(positions),
        secondsSinceEpoch: 86_400 * 40
      }
    });
    expect(summaryWithHistory.rows.every((row) => row.continuityStatus !== "ERROR")).toBe(true);
  });

  it("validates Moon-Earth distance pass, warning, and error states", () => {
    expect(validateMoonEarthDistance(384_400_000).status).toBe("PASS");
    expect(validateMoonEarthDistance(500_000_000).status).toBe("WARN");
    expect(validateMoonEarthDistance(Number.POSITIVE_INFINITY).status).toBe("ERROR");
  });
});

