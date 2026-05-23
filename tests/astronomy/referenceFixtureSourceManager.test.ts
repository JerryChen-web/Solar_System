import { describe, expect, it } from "vitest";
import { parseReferenceFixture } from "../../src/astronomy/referenceFixture";
import { ReferenceFixtureSourceManager } from "../../src/astronomy/referenceFixtureSourceManager";
import sampleFixture from "../../data/reference/sample_fixture_v0_6.json";
import sampleImport from "../../data/reference/sample_import_v0_7.json";

const knownBodyIds = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "moon",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune"
];

const knownBodyNames = [
  "Sun",
  "Mercury",
  "Venus",
  "Earth",
  "Moon",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune"
];

function cloneSampleImport(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(sampleImport)) as Record<string, unknown>;
}

function buildManager(): ReferenceFixtureSourceManager {
  return new ReferenceFixtureSourceManager({
    defaultFixture: parseReferenceFixture(sampleFixture, { knownBodyIds }),
    sampleImportRaw: sampleImport,
    importOptions: {
      knownBodyIds,
      knownBodyNames,
      fixtureVersion: "0.8.0"
    }
  });
}

describe("reference fixture source manager", () => {
  it("starts on the bundled default fixture while retaining the sample import report", () => {
    const snapshot = buildManager().snapshot();

    expect(snapshot.active.kind).toBe("default");
    expect(snapshot.active.label).toBe("Local J2000 demo fixture");
    expect(snapshot.active.statusMessage).toContain("Default bundled V0.6");
    expect(snapshot.latestImportReport?.datasetId).toBe("local-j2000-demo-import-v0-7");
  });

  it("switches to the converted bundled sample import fixture", () => {
    const snapshot = buildManager().selectSampleImport();

    expect(snapshot.active.kind).toBe("sample-import");
    expect(snapshot.active.fixture.metadata.fixtureVersion).toBe("0.8.0");
    expect(snapshot.active.fixture.metadata.sourceLabel).toBe("Local J2000 demo import sample");
    expect(snapshot.active.convertedRows).toBe(10);
    expect(snapshot.active.statusMessage).toContain("Converted V0.7 sample import fixture active");
  });

  it("activates safe local imports with warnings", () => {
    const raw = cloneSampleImport();
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
        note: "Safe warning row."
      }
    ];

    const snapshot = buildManager().selectLocalImport(raw, "warning.json");

    expect(snapshot.active.kind).toBe("local-import");
    expect(snapshot.active.status).toBe("WARN");
    expect(snapshot.active.warningCount).toBeGreaterThan(0);
    expect(snapshot.active.fixture.rows[0].expectedPositionMeters).toEqual({
      x: 1_000,
      y: 2_000,
      z: 3_000
    });
  });

  it("excludes error rows from a still-usable local import fixture", () => {
    const raw = cloneSampleImport();
    raw.bodyRows = [
      {
        bodyId: "mars",
        bodyName: "Mars",
        x: 1,
        y: 2,
        z: 3,
        unit: "m",
        tolerance: 10,
        note: "Valid row."
      },
      {
        bodyId: "earth",
        bodyName: "Earth",
        x: Number.NaN,
        y: 0,
        z: 0,
        unit: "m",
        tolerance: 10,
        note: "Invalid row."
      }
    ];

    const snapshot = buildManager().selectLocalImport(raw, "partial.json");

    expect(snapshot.active.kind).toBe("local-import");
    expect(snapshot.active.status).toBe("WARN");
    expect(snapshot.active.errorCount).toBeGreaterThan(0);
    expect(snapshot.active.statusMessage).toContain("Import errors excluded");
    expect(snapshot.active.fixture.rows.map((row) => row.bodyId)).toEqual(["mars"]);
  });

  it("falls back to default when an import has no usable converted rows", () => {
    const raw = cloneSampleImport();
    raw.bodyRows = [
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
    ];

    const snapshot = buildManager().selectLocalImport(raw, "invalid.json");

    expect(snapshot.active.kind).toBe("fallback-default");
    expect(snapshot.active.label).toBe("Local J2000 demo fixture");
    expect(snapshot.active.statusMessage).toContain("Fallback to default fixture active");
    expect(snapshot.active.fixture.metadata.sourceLabel).toBe("Local J2000 demo fixture");
  });

  it("resets from an imported fixture back to the default source", () => {
    const manager = buildManager();
    manager.selectSampleImport();
    const snapshot = manager.resetToDefault();

    expect(snapshot.active.kind).toBe("default");
    expect(snapshot.active.statusMessage).toContain("Reset to default");
  });
});
