import { describe, expect, it } from "vitest";
import { importReferenceData } from "../../src/astronomy/referenceImportPipeline";
import sampleImport from "../../data/reference/sample_import_v0_7.json";

function cloneSample(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(sampleImport)) as Record<string, unknown>;
}

describe("reference import pipeline", () => {
  it("converts valid sample data into the V0.6 fixture format", () => {
    const result = importReferenceData(sampleImport, { fixtureVersion: "0.7.0" });

    expect(result.validation.status).toBe("PASS");
    expect(result.convertedFixture?.status).toBe("PASS");
    expect(result.convertedFixture?.metadata.fixtureVersion).toBe("0.7.0");
    expect(result.convertedFixture?.rows).toHaveLength(10);
    expect(result.convertedFixture?.rows[0].unit).toBe("m");
  });

  it("preserves source metadata in the converted fixture", () => {
    const result = importReferenceData(sampleImport);

    expect(result.convertedFixture?.metadata.sourceLabel).toBe("Local J2000 demo import sample");
    expect(result.convertedFixture?.metadata.sourceType).toBe("local-demo");
    expect(result.convertedFixture?.metadata.accuracyNote).toContain("Not NASA/JPL");
    expect(result.convertedFixture?.metadata.coordinateSystemNote).toContain("heliocentric-app-j2000");
  });

  it("reports row-level warnings and errors", () => {
    const raw = cloneSample();
    raw.bodyRows = [
      {
        bodyId: "pluto",
        bodyName: "Pluto",
        x: 1,
        y: 2,
        z: 3,
        unit: "m",
        tolerance: 10,
        note: "Unknown body warning."
      },
      {
        bodyId: "earth",
        bodyName: "Earth",
        x: Number.NaN,
        y: 0,
        z: 0,
        unit: "m",
        tolerance: 10,
        note: "Invalid coordinate error."
      }
    ];

    const result = importReferenceData(raw);

    expect(result.validation.status).toBe("ERROR");
    expect(result.validation.rowDiagnostics[0].status).toBe("WARN");
    expect(result.validation.rowDiagnostics[1].status).toBe("ERROR");
    expect(result.convertedFixture?.rows).toHaveLength(1);
  });

  it("does not require optional velocity values", () => {
    const raw = cloneSample();
    raw.bodyRows = [
      {
        bodyId: "earth",
        bodyName: "Earth",
        x: 1,
        y: 2,
        z: 3,
        distanceFromSun: 4,
        unit: "km",
        tolerance: 5,
        note: "No velocity values."
      }
    ];

    const result = importReferenceData(raw);

    expect(result.validation.status).toBe("WARN");
    expect(result.convertedFixture?.rows[0].expectedPositionMeters).toEqual({
      x: 1_000,
      y: 2_000,
      z: 3_000
    });
    expect(result.convertedFixture?.rows[0].toleranceMeters).toBe(5_000);
  });

  it("reports unsupported units clearly", () => {
    const raw = cloneSample();
    raw.bodyRows = [
      {
        bodyId: "earth",
        bodyName: "Earth",
        x: 1,
        y: 2,
        z: 3,
        unit: "parsec",
        tolerance: 10,
        note: "Unsupported unit."
      }
    ];

    const result = importReferenceData(raw);

    expect(result.validation.status).toBe("ERROR");
    expect(result.validation.rowDiagnostics[0].errors.join(" ")).toContain("Unsupported reference unit");
    expect(result.convertedFixture?.rows).toHaveLength(0);
  });
});
