import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { compareFixtureToPositions } from "../../src/astronomy/fixtureComparison";
import { parseReferenceFixture } from "../../src/astronomy/referenceFixture";

function buildFixture(bodyReferences: unknown[]) {
  return parseReferenceFixture({
    fixtureVersion: "0.6.0",
    sourceLabel: "Comparison test fixture",
    sourceType: "unit-test",
    accuracyNote: "Local test only.",
    fixtureTimestamp: "2026-05-23T00:00:00Z",
    simulationDate: "2000-01-01T12:00:00Z",
    julianDate: 2451545,
    coordinateSystemNote: "Test frame.",
    unitNote: "Meters.",
    bodyReferences
  });
}

describe("fixture comparison", () => {
  it("marks exact matches as PASS", () => {
    const fixture = buildFixture([
      {
        bodyId: "earth",
        bodyName: "Earth",
        expectedX: 1,
        expectedY: 2,
        expectedZ: 3,
        unit: "m",
        toleranceMeters: 1
      }
    ]);
    const comparison = compareFixtureToPositions({
      fixture,
      positionsMeters: new Map([["earth", new THREE.Vector3(1, 2, 3)]])
    });

    expect(comparison.rows[0].status).toBe("PASS");
    expect(comparison.rows[0].positionDeltaMeters).toBe(0);
  });

  it("keeps small deltas within tolerance as PASS", () => {
    const fixture = buildFixture([
      {
        bodyId: "earth",
        bodyName: "Earth",
        expectedX: 0,
        expectedY: 0,
        expectedZ: 0,
        unit: "m",
        toleranceMeters: 10
      }
    ]);
    const comparison = compareFixtureToPositions({
      fixture,
      positionsMeters: new Map([["earth", new THREE.Vector3(3, 4, 0)]])
    });

    expect(comparison.rows[0].status).toBe("PASS");
    expect(comparison.rows[0].positionDeltaMeters).toBe(5);
  });

  it("marks deltas outside tolerance as WARN", () => {
    const fixture = buildFixture([
      {
        bodyId: "earth",
        bodyName: "Earth",
        expectedX: 0,
        expectedY: 0,
        expectedZ: 0,
        unit: "m",
        toleranceMeters: 1
      }
    ]);
    const comparison = compareFixtureToPositions({
      fixture,
      positionsMeters: new Map([["earth", new THREE.Vector3(3, 4, 0)]])
    });

    expect(comparison.rows[0].status).toBe("WARN");
    expect(comparison.rows[0].messages.join(" ")).toContain("exceeds");
  });

  it("marks missing simulated bodies as ERROR", () => {
    const fixture = buildFixture([
      {
        bodyId: "earth",
        bodyName: "Earth",
        expectedX: 0,
        expectedY: 0,
        expectedZ: 0,
        unit: "m",
        toleranceMeters: 1
      }
    ]);
    const comparison = compareFixtureToPositions({
      fixture,
      positionsMeters: new Map()
    });

    expect(comparison.rows[0].status).toBe("ERROR");
    expect(comparison.rows[0].messages.join(" ")).toContain("missing or not finite");
  });

  it("marks NaN and Infinity simulated values as ERROR", () => {
    const fixture = buildFixture([
      {
        bodyId: "earth",
        bodyName: "Earth",
        expectedX: 0,
        expectedY: 0,
        expectedZ: 0,
        unit: "m",
        toleranceMeters: 1
      }
    ]);
    const comparison = compareFixtureToPositions({
      fixture,
      positionsMeters: new Map([["earth", new THREE.Vector3(Number.NaN, Number.POSITIVE_INFINITY, 0)]])
    });

    expect(comparison.rows[0].status).toBe("ERROR");
  });

  it("handles the Sun as the special reference body", () => {
    const fixture = buildFixture([
      {
        bodyId: "sun",
        bodyName: "Sun",
        expectedX: 0,
        expectedY: 0,
        expectedZ: 0,
        expectedDistanceFromSun: 0,
        unit: "m",
        toleranceMeters: 1000
      }
    ]);
    const comparison = compareFixtureToPositions({
      fixture,
      positionsMeters: new Map([["sun", new THREE.Vector3(0, 0, 0)]])
    });

    expect(comparison.rows[0].status).toBe("PASS");
    expect(comparison.rows[0].messages.join(" ")).toContain("Sun is compared");
  });

  it("compares Moon-Earth distance when available", () => {
    const fixture = buildFixture([
      {
        bodyId: "moon",
        bodyName: "Moon",
        expectedX: 10,
        expectedY: 0,
        expectedZ: 0,
        expectedMoonEarthDistance: 10,
        unit: "m",
        toleranceMeters: 1
      }
    ]);
    const comparison = compareFixtureToPositions({
      fixture,
      positionsMeters: new Map([
        ["earth", new THREE.Vector3(0, 0, 0)],
        ["moon", new THREE.Vector3(10, 0, 0)]
      ])
    });

    expect(comparison.rows[0].status).toBe("PASS");
    expect(comparison.rows[0].moonEarthDistanceDeltaMeters).toBe(0);
  });
});
