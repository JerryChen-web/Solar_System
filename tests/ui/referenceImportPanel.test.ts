import { describe, expect, it } from "vitest";
import { buildReferenceImportReport } from "../../src/astronomy/referenceImportReport";
import { importReferenceData } from "../../src/astronomy/referenceImportPipeline";
import { parseReferenceFixture } from "../../src/astronomy/referenceFixture";
import {
  formatActiveFixtureSourceIndicator,
  type ActiveReferenceFixtureSource
} from "../../src/astronomy/referenceFixtureSourceManager";
import {
  formatFixtureSourceStatus,
  formatReferenceImportPanelSummary
} from "../../src/ui/referenceImportPanel";
import sampleImport from "../../data/reference/sample_import_v0_7.json";
import sampleFixture from "../../data/reference/sample_fixture_v0_6.json";

function buildSource(partial: Partial<ActiveReferenceFixtureSource> = {}): ActiveReferenceFixtureSource {
  return {
    kind: "default",
    label: "Local J2000 demo fixture",
    fixture: parseReferenceFixture(sampleFixture),
    status: "PASS",
    statusMessage: "Default bundled V0.6 reference fixture active.",
    warningCount: 0,
    errorCount: 0,
    convertedRows: 10,
    ...partial
  };
}

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

  it("formats the active fixture source indicator", () => {
    expect(formatActiveFixtureSourceIndicator(buildSource())).toBe(
      "Active fixture: Local J2000 demo fixture"
    );
  });

  it("formats source switching status messages", () => {
    const status = formatFixtureSourceStatus(
      buildSource({
        kind: "fallback-default",
        status: "ERROR",
        statusMessage: "Local import could not be activated. Fallback to default fixture active.",
        warningCount: 1,
        errorCount: 2
      })
    );

    expect(status).toContain("Fallback to default fixture active");
    expect(status).toContain("Rows 10");
    expect(status).toContain("Warn 1");
    expect(status).toContain("Error 2");
    expect(formatFixtureSourceStatus(null)).toBe("No active fixture source.");
  });
});
