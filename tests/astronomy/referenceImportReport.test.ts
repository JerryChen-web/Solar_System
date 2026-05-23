import { describe, expect, it } from "vitest";
import { buildReferenceImportReport, exportReferenceImportReportJson } from "../../src/astronomy/referenceImportReport";
import { importReferenceData } from "../../src/astronomy/referenceImportPipeline";
import sampleImport from "../../data/reference/sample_import_v0_7.json";

function cloneSample(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(sampleImport)) as Record<string, unknown>;
}

describe("reference import report", () => {
  it("includes dataset, source, and contract metadata", () => {
    const report = buildReferenceImportReport(importReferenceData(sampleImport));

    expect(report.datasetId).toBe("local-j2000-demo-import-v0-7");
    expect(report.sourceName).toBe("Local J2000 demo import sample");
    expect(report.sourceType).toBe("local-demo");
    expect(report.contractVersion).toBe("0.7.0");
    expect(report.note).toContain("local-only");
  });

  it("includes total, accepted, warning, and error counts", () => {
    const report = buildReferenceImportReport(importReferenceData(sampleImport));

    expect(report.totalRows).toBe(10);
    expect(report.acceptedRows).toBe(10);
    expect(report.warningCount).toBe(0);
    expect(report.errorCount).toBe(0);
  });

  it("represents invalid rows safely", () => {
    const raw = cloneSample();
    raw.bodyRows = [
      {
        bodyId: "earth",
        bodyName: "Earth",
        x: Number.POSITIVE_INFINITY,
        y: 0,
        z: 0,
        unit: "m",
        tolerance: 10,
        note: "Invalid row."
      }
    ];

    const report = buildReferenceImportReport(importReferenceData(raw));

    expect(report.status).toBe("ERROR");
    expect(report.errorCount).toBeGreaterThan(0);
    expect(report.rowDiagnostics[0].errors.join(" ")).toContain("x must be a finite number");
  });

  it("includes converted fixture metadata when conversion succeeds", () => {
    const report = buildReferenceImportReport(importReferenceData(sampleImport));

    expect(report.convertedFixtureStatus).toBe("AVAILABLE");
    expect(report.convertedFixtureMetadata?.sourceLabel).toBe("Local J2000 demo import sample");
  });

  it("exports stable JSON", () => {
    const report = buildReferenceImportReport(importReferenceData(sampleImport));
    const parsed = JSON.parse(exportReferenceImportReportJson(report)) as { datasetId: string };

    expect(parsed.datasetId).toBe("local-j2000-demo-import-v0-7");
  });
});
