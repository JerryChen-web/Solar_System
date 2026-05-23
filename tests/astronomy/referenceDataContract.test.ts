import { describe, expect, it } from "vitest";
import { validateReferenceDataContract } from "../../src/astronomy/referenceDataContract";
import sampleImport from "../../data/reference/sample_import_v0_7.json";

function cloneSample(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(sampleImport)) as Record<string, unknown>;
}

describe("reference data contract validation", () => {
  it("accepts the valid sample import data", () => {
    const result = validateReferenceDataContract(sampleImport);

    expect(result.status).toBe("PASS");
    expect(result.errorCount).toBe(0);
    expect(result.totalRows).toBe(10);
    expect(result.acceptedRows).toBe(10);
    expect(result.contract.metadata.datasetId).toBe("local-j2000-demo-import-v0-7");
  });

  it("reports missing required metadata", () => {
    const raw = cloneSample();
    delete raw.datasetId;

    const result = validateReferenceDataContract(raw);

    expect(result.status).toBe("ERROR");
    expect(result.metadataErrors.join(" ")).toContain("datasetId");
  });

  it("reports unsupported coordinate systems", () => {
    const raw = cloneSample();
    raw.coordinateSystem = "geocentric-demo";

    const result = validateReferenceDataContract(raw);

    expect(result.status).toBe("ERROR");
    expect(result.messages.join(" ")).toContain("Unsupported coordinate system");
  });

  it("warns safely for unknown bodies", () => {
    const raw = cloneSample();
    raw.bodyRows = [
      ...((raw.bodyRows as unknown[]) ?? []),
      {
        bodyId: "pluto",
        bodyName: "Pluto",
        x: 1,
        y: 2,
        z: 3,
        unit: "m",
        tolerance: 10,
        note: "Unknown local body for warning coverage."
      }
    ];

    const result = validateReferenceDataContract(raw);
    const unknown = result.rowDiagnostics.find((row) => row.bodyId === "pluto");

    expect(result.status).toBe("WARN");
    expect(unknown?.status).toBe("WARN");
    expect(unknown?.warnings.join(" ")).toContain("Unknown reference body");
  });

  it("errors on NaN, Infinity, null, and non-number coordinates", () => {
    const invalidValues: unknown[] = [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      null,
      "1"
    ];

    for (const value of invalidValues) {
      const raw = cloneSample();
      raw.bodyRows = [
        {
          bodyId: "earth",
          bodyName: "Earth",
          x: value,
          y: 0,
          z: 0,
          unit: "m",
          tolerance: 10,
          note: "Invalid coordinate test row."
        }
      ];

      const result = validateReferenceDataContract(raw);
      expect(result.status).toBe("ERROR");
      expect(result.rowDiagnostics[0].errors.join(" ")).toContain("x must be a finite number");
    }
  });
});
