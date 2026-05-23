import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { compareFixtureToPositions } from "../../src/astronomy/fixtureComparison";
import { parseReferenceFixture } from "../../src/astronomy/referenceFixture";
import {
  createPrecisionReportExportHandlers,
  formatPrecisionReportPanelSummary,
  precisionReportExportLabels
} from "../../src/ui/precisionReportPanel";

function buildComparison() {
  const fixture = parseReferenceFixture({
    fixtureVersion: "0.6.0",
    sourceLabel: "Panel fixture",
    sourceType: "unit-test",
    accuracyNote: "Local unit-test only.",
    fixtureTimestamp: "2026-05-23T00:00:00Z",
    simulationDate: "2000-01-01T12:00:00Z",
    julianDate: 2451545,
    coordinateSystemNote: "Test frame.",
    unitNote: "Meters.",
    bodyReferences: [
      {
        bodyId: "earth",
        bodyName: "Earth",
        expectedX: 0,
        expectedY: 0,
        expectedZ: 0,
        unit: "m",
        toleranceMeters: 10
      }
    ]
  });

  return compareFixtureToPositions({
    fixture,
    positionsMeters: new Map([["earth", new THREE.Vector3(3, 4, 0)]])
  });
}

describe("precision report panel helpers", () => {
  it("provides export button labels", () => {
    expect(precisionReportExportLabels.json).toBe("Export JSON");
    expect(precisionReportExportLabels.csv).toBe("Export CSV");
  });

  it("formats the summary text", () => {
    const summary = formatPrecisionReportPanelSummary(buildComparison());
    expect(summary).toContain("Panel fixture");
    expect(summary).toContain("Compared 1");
    expect(summary).toContain("Pass 1");
    expect(formatPrecisionReportPanelSummary(null)).toBe("No precision report yet.");
  });

  it("calls export handlers without crashing", () => {
    const downloads: Array<{ filename: string; mimeType: string; contents: string }> = [];
    const handlers = createPrecisionReportExportHandlers(
      () => ({
        appVersion: "0.6.0",
        simulationDate: "2000-01-01T12:00:00Z",
        julianDate: 2451545,
        comparison: buildComparison()
      }),
      (filename, mimeType, contents) => {
        downloads.push({ filename, mimeType, contents });
      }
    );

    expect(handlers.exportJson()).toBe(true);
    expect(handlers.exportCsv()).toBe(true);
    expect(downloads).toHaveLength(2);
    expect(downloads[0].filename.endsWith(".json")).toBe(true);
    expect(downloads[1].filename.endsWith(".csv")).toBe(true);
  });

  it("handles missing report state without crashing", () => {
    const handlers = createPrecisionReportExportHandlers(() => ({
      appVersion: "0.6.0",
      simulationDate: "2000-01-01T12:00:00Z",
      julianDate: 2451545,
      comparison: null
    }));

    expect(handlers.exportJson()).toBe(false);
    expect(handlers.exportCsv()).toBe(false);
  });
});
