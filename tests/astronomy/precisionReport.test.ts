import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { compareFixtureToPositions, type FixtureComparisonSummary } from "../../src/astronomy/fixtureComparison";
import {
  buildPrecisionReport,
  exportPrecisionReportCsv,
  exportPrecisionReportJson
} from "../../src/astronomy/precisionReport";
import { parseReferenceFixture } from "../../src/astronomy/referenceFixture";

function buildComparison(): FixtureComparisonSummary {
  const fixture = parseReferenceFixture({
    fixtureVersion: "0.6.0",
    sourceLabel: "Precision report fixture",
    sourceType: "unit-test",
    accuracyNote: "Local unit-test only.",
    fixtureTimestamp: "2026-05-23T00:00:00Z",
    simulationDate: "2000-01-01T12:00:00Z",
    julianDate: 2451545,
    coordinateSystemNote: "Test frame.",
    unitNote: "Meters.",
    bodyReferences: [
      {
        bodyId: "sun",
        bodyName: "Sun",
        expectedX: 0,
        expectedY: 0,
        expectedZ: 0,
        unit: "m",
        toleranceMeters: 1000
      },
      {
        bodyId: "earth",
        bodyName: "Earth",
        expectedX: 10,
        expectedY: 0,
        expectedZ: 0,
        expectedDistanceFromSun: 10,
        unit: "m",
        toleranceMeters: 10
      }
    ]
  });

  return compareFixtureToPositions({
    fixture,
    positionsMeters: new Map([
      ["sun", new THREE.Vector3(0, 0, 0)],
      ["earth", new THREE.Vector3(13, 4, 0)]
    ])
  });
}

describe("precision report", () => {
  it("includes metadata, totals, and aggregate deltas", () => {
    const report = buildPrecisionReport({
      appVersion: "0.6.0",
      simulationDate: "2000-01-01T12:00:00Z",
      julianDate: 2451545,
      generatedAt: "2026-05-23T00:00:00.000Z",
      comparison: buildComparison()
    });

    expect(report.appVersion).toBe("0.6.0");
    expect(report.simulationDate).toBe("2000-01-01T12:00:00Z");
    expect(report.julianDate).toBe(2451545);
    expect(report.fixtureMetadata.sourceLabel).toBe("Precision report fixture");
    expect(report.totals.comparedCount).toBe(2);
    expect(report.totals.passedCount).toBe(2);
    expect(report.totals.warningCount).toBe(0);
    expect(report.totals.errorCount).toBe(0);
    expect(report.maxPositionDeltaMeters).toBe(5);
    expect(report.averagePositionDeltaMeters).toBe(2.5);
    expect(report.maxPercentageError).toBe(50);
    expect(report.note).toContain("local fixture-based");
  });

  it("exports valid readable JSON", () => {
    const report = buildPrecisionReport({
      appVersion: "0.6.0",
      simulationDate: "2000-01-01T12:00:00Z",
      julianDate: 2451545,
      comparison: buildComparison(),
      generatedAt: "2026-05-23T00:00:00.000Z"
    });

    const parsed = JSON.parse(exportPrecisionReportJson(report));
    expect(parsed.appVersion).toBe("0.6.0");
    expect(parsed.rows[1].bodyId).toBe("earth");
  });

  it("exports CSV with expected headers and rows", () => {
    const report = buildPrecisionReport({
      appVersion: "0.6.0",
      simulationDate: "2000-01-01T12:00:00Z",
      julianDate: 2451545,
      comparison: buildComparison(),
      generatedAt: "2026-05-23T00:00:00.000Z"
    });

    const csv = exportPrecisionReportCsv(report);
    expect(csv).toContain("bodyId,bodyName,status,dxMeters,dyMeters,dzMeters,positionDeltaMeters");
    expect(csv).toContain("earth,Earth,PASS,3,4,0,5");
  });

  it("represents invalid values safely", () => {
    const comparison = buildComparison();
    comparison.maxPositionDeltaMeters = Number.POSITIVE_INFINITY;
    comparison.averagePositionDeltaMeters = Number.NaN;
    comparison.maxPercentageError = Number.NEGATIVE_INFINITY;
    comparison.rows[0].dxMeters = Number.NaN;
    comparison.rows[0].positionDeltaMeters = Number.POSITIVE_INFINITY;

    const report = buildPrecisionReport({
      appVersion: "0.6.0",
      simulationDate: "",
      julianDate: Number.NaN,
      comparison,
      generatedAt: "2026-05-23T00:00:00.000Z"
    });

    expect(report.simulationDate).toBe("N/A");
    expect(report.julianDate).toBe("N/A");
    expect(report.maxPositionDeltaMeters).toBe("N/A");
    expect(report.averagePositionDeltaMeters).toBe("N/A");
    expect(report.maxPercentageError).toBe("N/A");
    expect(report.rows[0].dxMeters).toBe("N/A");
    expect(report.rows[0].positionDeltaMeters).toBe("N/A");
    expect(exportPrecisionReportCsv(report)).toContain("N/A");
  });
});
