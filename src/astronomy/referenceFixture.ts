import type { ValidationStatus } from "./validationSummary";

export type ReferenceFixtureUnit = "m" | "unsupported";

export interface FixtureVectorMeters {
  x: number;
  y: number;
  z: number;
}

export interface ReferenceFixtureMetadata {
  fixtureVersion: string;
  sourceLabel: string;
  sourceType: string;
  accuracyNote: string;
  fixtureTimestamp: string;
  simulationDate: string;
  julianDate: number | undefined;
  coordinateSystemNote: string;
  unitNote: string;
}

export interface ReferenceFixtureRow {
  bodyId: string;
  bodyName: string;
  expectedPositionMeters?: FixtureVectorMeters;
  expectedDistanceFromSunMeters?: number;
  expectedMoonEarthDistanceMeters?: number;
  unit: ReferenceFixtureUnit;
  rawUnit: string;
  toleranceMeters: number;
  note: string;
  status: ValidationStatus;
  messages: string[];
}

export interface ReferenceFixture {
  metadata: ReferenceFixtureMetadata;
  rows: ReferenceFixtureRow[];
  status: ValidationStatus;
  messages: string[];
}

export interface ParseReferenceFixtureOptions {
  knownBodyIds?: Iterable<string>;
}

const DEFAULT_METADATA: ReferenceFixtureMetadata = {
  fixtureVersion: "unknown",
  sourceLabel: "Unknown fixture",
  sourceType: "unknown",
  accuracyNote: "N/A",
  fixtureTimestamp: "N/A",
  simulationDate: "N/A",
  julianDate: undefined,
  coordinateSystemNote: "N/A",
  unitNote: "N/A"
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeUnit(value: unknown): { unit: ReferenceFixtureUnit; rawUnit: string } {
  const rawUnit = safeString(value, "N/A");
  const normalized = rawUnit.trim().toLowerCase();
  return {
    unit: normalized === "m" || normalized === "meter" || normalized === "meters" ? "m" : "unsupported",
    rawUnit
  };
}

function combineStatus(statuses: ValidationStatus[]): ValidationStatus {
  if (statuses.includes("ERROR")) {
    return "ERROR";
  }
  if (statuses.includes("WARN")) {
    return "WARN";
  }
  return "PASS";
}

function parseMetadata(raw: Record<string, unknown>, messages: string[]): ReferenceFixtureMetadata {
  const metadata = {
    fixtureVersion: safeString(raw.fixtureVersion, DEFAULT_METADATA.fixtureVersion),
    sourceLabel: safeString(raw.sourceLabel, DEFAULT_METADATA.sourceLabel),
    sourceType: safeString(raw.sourceType, DEFAULT_METADATA.sourceType),
    accuracyNote: safeString(raw.accuracyNote, DEFAULT_METADATA.accuracyNote),
    fixtureTimestamp: safeString(raw.fixtureTimestamp, DEFAULT_METADATA.fixtureTimestamp),
    simulationDate: safeString(raw.simulationDate, DEFAULT_METADATA.simulationDate),
    julianDate: finiteNumber(raw.julianDate),
    coordinateSystemNote: safeString(raw.coordinateSystemNote, DEFAULT_METADATA.coordinateSystemNote),
    unitNote: safeString(raw.unitNote, DEFAULT_METADATA.unitNote)
  };

  for (const [key, value] of Object.entries(metadata)) {
    if (value === "unknown" || value === "Unknown fixture" || value === "N/A" || value === undefined) {
      messages.push(`Fixture metadata field ${key} is missing or invalid.`);
    }
  }

  return metadata;
}

function parseFixtureRow(rawRow: unknown, index: number, knownBodyIds: Set<string> | null): ReferenceFixtureRow {
  const messages: string[] = [];
  if (!isRecord(rawRow)) {
    return {
      bodyId: `malformed-${index + 1}`,
      bodyName: "Malformed row",
      unit: "unsupported",
      rawUnit: "N/A",
      toleranceMeters: 0,
      note: "N/A",
      status: "ERROR",
      messages: ["Fixture row is not an object."]
    };
  }

  const bodyId = safeString(rawRow.bodyId, `unknown-${index + 1}`);
  const bodyName = safeString(rawRow.bodyName, bodyId);
  const unit = normalizeUnit(rawRow.unit);
  const toleranceMeters = finiteNumber(rawRow.toleranceMeters) ?? 0;
  const x = finiteNumber(rawRow.expectedX);
  const y = finiteNumber(rawRow.expectedY);
  const z = finiteNumber(rawRow.expectedZ);
  const expectedPositionMeters =
    x === undefined || y === undefined || z === undefined ? undefined : { x, y, z };
  const expectedDistanceFromSunMeters = finiteNumber(rawRow.expectedDistanceFromSun);
  const expectedMoonEarthDistanceMeters = finiteNumber(rawRow.expectedMoonEarthDistance);

  if (unit.unit === "unsupported") {
    messages.push(`Unsupported fixture unit: ${unit.rawUnit}.`);
  }
  if (toleranceMeters <= 0) {
    messages.push("Fixture row tolerance must be a positive finite meter value.");
  }
  if (!expectedPositionMeters) {
    messages.push("Fixture row expected x/y/z values must be finite numbers.");
  }
  if (knownBodyIds && !knownBodyIds.has(bodyId)) {
    messages.push("Fixture row body id is not in the local body catalog.");
  }

  const status = messages.some((message) => message.includes("Unsupported") || message.includes("must be"))
    ? "ERROR"
    : messages.length > 0
      ? "WARN"
      : "PASS";

  return {
    bodyId,
    bodyName,
    expectedPositionMeters,
    expectedDistanceFromSunMeters,
    expectedMoonEarthDistanceMeters,
    unit: unit.unit,
    rawUnit: unit.rawUnit,
    toleranceMeters,
    note: safeString(rawRow.note, "N/A"),
    status,
    messages
  };
}

export function parseReferenceFixture(raw: unknown, options: ParseReferenceFixtureOptions = {}): ReferenceFixture {
  const messages: string[] = [];
  if (!isRecord(raw)) {
    return {
      metadata: DEFAULT_METADATA,
      rows: [],
      status: "ERROR",
      messages: ["Reference fixture root must be an object."]
    };
  }

  const knownBodyIds = options.knownBodyIds ? new Set(options.knownBodyIds) : null;
  const metadata = parseMetadata(raw, messages);
  const rawRows = Array.isArray(raw.bodyReferences) ? raw.bodyReferences : [];
  if (!Array.isArray(raw.bodyReferences)) {
    messages.push("Fixture bodyReferences must be an array.");
  }

  const rows = rawRows.map((row, index) => parseFixtureRow(row, index, knownBodyIds));
  const status = combineStatus([
    messages.length > 0 ? "WARN" : "PASS",
    ...rows.map((row) => row.status)
  ]);

  return {
    metadata,
    rows,
    status,
    messages
  };
}
