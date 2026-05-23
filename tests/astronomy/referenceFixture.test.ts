import { describe, expect, it } from "vitest";
import { parseReferenceFixture } from "../../src/astronomy/referenceFixture";

function buildRawFixture(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    fixtureVersion: "0.6.0",
    sourceLabel: "Unit test fixture",
    sourceType: "local-demo-generated",
    accuracyNote: "Local demo only.",
    fixtureTimestamp: "2026-05-23T00:00:00Z",
    simulationDate: "2000-01-01T12:00:00Z",
    julianDate: 2451545,
    coordinateSystemNote: "Heliocentric test frame.",
    unitNote: "Meters.",
    bodyReferences: [
      {
        bodyId: "earth",
        bodyName: "Earth",
        expectedX: 1,
        expectedY: 2,
        expectedZ: 3,
        expectedDistanceFromSun: 3.7416573867739413,
        unit: "m",
        toleranceMeters: 10,
        note: "test"
      }
    ],
    ...overrides
  };
}

describe("reference fixture parsing", () => {
  it("parses a valid fixture", () => {
    const fixture = parseReferenceFixture(buildRawFixture(), { knownBodyIds: ["earth"] });

    expect(fixture.status).toBe("PASS");
    expect(fixture.metadata.fixtureVersion).toBe("0.6.0");
    expect(fixture.rows).toHaveLength(1);
    expect(fixture.rows[0].bodyId).toBe("earth");
    expect(fixture.rows[0].expectedPositionMeters).toEqual({ x: 1, y: 2, z: 3 });
  });

  it("handles missing metadata safely", () => {
    const fixture = parseReferenceFixture({
      bodyReferences: []
    });

    expect(fixture.status).toBe("WARN");
    expect(fixture.metadata.sourceLabel).toBe("Unknown fixture");
    expect(fixture.messages.length).toBeGreaterThan(0);
  });

  it("marks malformed body rows as errors", () => {
    const fixture = parseReferenceFixture(buildRawFixture({
      bodyReferences: [
        {
          bodyId: "earth",
          bodyName: "Earth",
          expectedX: Number.NaN,
          expectedY: 0,
          expectedZ: 0,
          unit: "m",
          toleranceMeters: 10
        }
      ]
    }));

    expect(fixture.status).toBe("ERROR");
    expect(fixture.rows[0].status).toBe("ERROR");
    expect(fixture.rows[0].messages.join(" ")).toContain("expected x/y/z");
  });

  it("does not crash on unknown body ids", () => {
    const fixture = parseReferenceFixture(buildRawFixture({
      bodyReferences: [
        {
          bodyId: "ceres",
          bodyName: "Ceres",
          expectedX: 1,
          expectedY: 2,
          expectedZ: 3,
          unit: "m",
          toleranceMeters: 10
        }
      ]
    }), { knownBodyIds: ["earth"] });

    expect(fixture.status).toBe("WARN");
    expect(fixture.rows[0].bodyId).toBe("ceres");
    expect(fixture.rows[0].messages.join(" ")).toContain("not in the local body catalog");
  });

  it("detects unit mismatches", () => {
    const fixture = parseReferenceFixture(buildRawFixture({
      bodyReferences: [
        {
          bodyId: "earth",
          bodyName: "Earth",
          expectedX: 1,
          expectedY: 2,
          expectedZ: 3,
          unit: "km",
          toleranceMeters: 10
        }
      ]
    }));

    expect(fixture.status).toBe("ERROR");
    expect(fixture.rows[0].unit).toBe("unsupported");
    expect(fixture.rows[0].messages.join(" ")).toContain("Unsupported fixture unit");
  });
});
