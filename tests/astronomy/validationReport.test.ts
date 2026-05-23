import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { localReferenceProvider } from "../../src/astronomy/localReferenceProvider";
import {
  buildValidationReport,
  exportValidationReportCsv,
  exportValidationReportJson
} from "../../src/astronomy/validationReport";
import type { ValidationSummary } from "../../src/astronomy/validationSummary";

function buildSummary(): ValidationSummary {
  return {
    rows: [
      {
        bodyId: "sun",
        bodyName: "Sun",
        status: "PASS",
        finitePosition: "PASS",
        distanceFromSunMeters: 0,
        rangeStatus: "PASS",
        continuityStatus: "PASS",
        warningCount: 0,
        errorCount: 0,
        messages: []
      },
      {
        bodyId: "earth",
        bodyName: "Earth",
        status: "WARN",
        finitePosition: "PASS",
        distanceFromSunMeters: 149_597_870_700,
        rangeStatus: "WARN",
        continuityStatus: "PASS",
        warningCount: 1,
        errorCount: 0,
        messages: ["Distance is outside the approximate local reference range."]
      }
    ],
    positionRows: [
      {
        bodyId: "sun",
        bodyName: "Sun",
        positionMeters: new THREE.Vector3(0, 0, 0),
        distanceFromSunMeters: 0,
        status: "PASS"
      },
      {
        bodyId: "earth",
        bodyName: "Earth",
        positionMeters: new THREE.Vector3(149_597_870_700, 0, 0),
        distanceFromSunMeters: 149_597_870_700,
        status: "WARN"
      }
    ],
    moonDistance: {
      status: "PASS",
      distanceMeters: 384_400_000,
      warningCount: 0,
      errorCount: 0,
      messages: []
    },
    checkedCount: 2,
    passedCount: 1,
    warningCount: 1,
    errorCount: 0
  };
}

describe("validation report", () => {
  it("includes report metadata, totals, rows, and Moon-Earth distance", () => {
    const report = buildValidationReport({
      appVersion: "0.5.0",
      simulationDate: "2000-01-01T12:00:00Z",
      julianDate: 2451545,
      generatedAt: "2026-05-23T00:00:00.000Z",
      summary: buildSummary(),
      referenceProvider: localReferenceProvider.metadata
    });

    expect(report.appVersion).toBe("0.5.0");
    expect(report.simulationDate).toBe("2000-01-01T12:00:00Z");
    expect(report.julianDate).toBe(2451545);
    expect(report.generatedAt).toBe("2026-05-23T00:00:00.000Z");
    expect(report.totals.checkedCount).toBe(2);
    expect(report.totals.passedCount).toBe(1);
    expect(report.totals.warningCount).toBe(1);
    expect(report.totals.errorCount).toBe(0);
    expect(report.validationRows).toHaveLength(2);
    expect(report.positionRows).toHaveLength(2);
    expect(report.moonEarthDistance.distanceMeters).toBe(384_400_000);
    expect(report.note).toContain("local approximate");
  });

  it("exports valid readable JSON", () => {
    const report = buildValidationReport({
      appVersion: "0.5.0",
      simulationDate: "2000-01-01T12:00:00Z",
      julianDate: 2451545,
      generatedAt: "2026-05-23T00:00:00.000Z",
      summary: buildSummary(),
      referenceProvider: localReferenceProvider.metadata
    });

    const parsed = JSON.parse(exportValidationReportJson(report));
    expect(parsed.appVersion).toBe("0.5.0");
    expect(parsed.validationRows[1].bodyId).toBe("earth");
  });

  it("exports CSV with expected headers and rows", () => {
    const report = buildValidationReport({
      appVersion: "0.5.0",
      simulationDate: "2000-01-01T12:00:00Z",
      julianDate: 2451545,
      generatedAt: "2026-05-23T00:00:00.000Z",
      summary: buildSummary(),
      referenceProvider: localReferenceProvider.metadata
    });

    const csv = exportValidationReportCsv(report);
    expect(csv).toContain("bodyId,bodyName,status,finitePosition,rangeStatus,continuityStatus");
    expect(csv).toContain("earth,Earth,WARN,PASS,WARN,PASS");
    expect(csv).toContain("moon-earth,Moon-Earth Distance,PASS");
  });

  it("handles NaN, Infinity, and missing values safely", () => {
    const summary = buildSummary();
    summary.rows[0].distanceFromSunMeters = Number.NaN;
    summary.rows[1].distanceFromSunMeters = Number.POSITIVE_INFINITY;
    summary.positionRows[1].positionMeters = new THREE.Vector3(Number.NaN, Number.POSITIVE_INFINITY, 1);
    summary.moonDistance.distanceMeters = Number.NEGATIVE_INFINITY;

    const report = buildValidationReport({
      appVersion: "0.5.0",
      simulationDate: "",
      julianDate: Number.NaN,
      generatedAt: "2026-05-23T00:00:00.000Z",
      summary,
      referenceProvider: localReferenceProvider.metadata
    });

    expect(report.simulationDate).toBe("N/A");
    expect(report.julianDate).toBe("N/A");
    expect(report.validationRows[0].distanceFromSunMeters).toBe("N/A");
    expect(report.validationRows[1].distanceFromSunMeters).toBe("N/A");
    expect(report.positionRows[1].xMeters).toBe("N/A");
    expect(report.positionRows[1].yMeters).toBe("N/A");
    expect(report.moonEarthDistance.distanceMeters).toBe("N/A");
    expect(exportValidationReportCsv(report)).toContain("N/A");
  });
});
