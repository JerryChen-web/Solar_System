import { describe, expect, it } from "vitest";
import { localReferenceProvider } from "../../src/astronomy/localReferenceProvider";
import type { ValidationSummary } from "../../src/astronomy/validationSummary";
import {
  createValidationReportExportHandlers,
  formatValidationReportPanelSummary,
  validationReportExportLabels
} from "../../src/ui/validationReportPanel";

function buildSummary(): ValidationSummary {
  return {
    rows: [
      {
        bodyId: "earth",
        bodyName: "Earth",
        status: "PASS",
        finitePosition: "PASS",
        distanceFromSunMeters: 149_597_870_700,
        rangeStatus: "PASS",
        continuityStatus: "PASS",
        warningCount: 0,
        errorCount: 0,
        messages: []
      }
    ],
    positionRows: [
      {
        bodyId: "earth",
        bodyName: "Earth",
        distanceFromSunMeters: 149_597_870_700,
        status: "PASS"
      }
    ],
    moonDistance: {
      status: "PASS",
      distanceMeters: 384_400_000,
      warningCount: 0,
      errorCount: 0,
      messages: []
    },
    checkedCount: 1,
    passedCount: 1,
    warningCount: 0,
    errorCount: 0
  };
}

describe("validation report panel helpers", () => {
  it("provides export button labels", () => {
    expect(validationReportExportLabels.json).toBe("Export JSON");
    expect(validationReportExportLabels.csv).toBe("Export CSV");
  });

  it("formats the basic report summary", () => {
    expect(formatValidationReportPanelSummary(buildSummary())).toBe("Checked 1 | Pass 1 | Warn 0 | Error 0");
    expect(formatValidationReportPanelSummary(null)).toBe("No validation report yet.");
  });

  it("calls export handlers without crashing", () => {
    const downloads: Array<{ filename: string; mimeType: string; contents: string }> = [];
    const handlers = createValidationReportExportHandlers(
      () => ({
        appVersion: "0.5.0",
        simulationDate: "2000-01-01T12:00:00Z",
        julianDate: 2451545,
        summary: buildSummary(),
        referenceProvider: localReferenceProvider.metadata
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
    const handlers = createValidationReportExportHandlers(() => ({
      appVersion: "0.5.0",
      simulationDate: "2000-01-01T12:00:00Z",
      julianDate: 2451545,
      summary: null,
      referenceProvider: localReferenceProvider.metadata
    }));

    expect(handlers.exportJson()).toBe(false);
    expect(handlers.exportCsv()).toBe(false);
  });
});
