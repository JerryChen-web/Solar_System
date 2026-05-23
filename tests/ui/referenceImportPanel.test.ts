import { describe, expect, it } from "vitest";
import { buildReferenceImportReport } from "../../src/astronomy/referenceImportReport";
import { importReferenceData } from "../../src/astronomy/referenceImportPipeline";
import { formatReferenceImportPanelSummary } from "../../src/ui/referenceImportPanel";
import sampleImport from "../../data/reference/sample_import_v0_7.json";

describe("reference import panel helpers", () => {
  it("renders dataset, source, and counts in summary text", () => {
    const report = buildReferenceImportReport(importReferenceData(sampleImport));
    const summary = formatReferenceImportPanelSummary(report);

    expect(summary).toContain("Dataset local-j2000-demo-import-v0-7");
    expect(summary).toContain("Source Local J2000 demo import sample");
    expect(summary).toContain("Rows 10");
    expect(summary).toContain("Accepted 10");
  });

  it("displays warning and error counts", () => {
    const raw = {
      ...sampleImport,
      bodyRows: [
        {
          bodyId: "pluto",
          bodyName: "Pluto",
          x: 1,
          y: 2,
          z: 3,
          unit: "m",
          tolerance: 10,
          note: "Unknown body."
        },
        {
          bodyId: "earth",
          bodyName: "Earth",
          x: "bad",
          y: 0,
          z: 0,
          unit: "m",
          tolerance: 10,
          note: "Invalid coordinate."
        }
      ]
    };
    const summary = formatReferenceImportPanelSummary(buildReferenceImportReport(importReferenceData(raw)));

    expect(summary).toContain("Warn 1");
    expect(summary).toContain("Error 1");
  });

  it("handles empty or failed reports without crashing", () => {
    expect(formatReferenceImportPanelSummary(null)).toContain("No reference import report yet");
    const summary = formatReferenceImportPanelSummary(buildReferenceImportReport(importReferenceData(null)));

    expect(summary).toContain("Dataset N/A");
    expect(summary).toContain("Fixture UNAVAILABLE");
  });
});
