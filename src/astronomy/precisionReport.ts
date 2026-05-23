import type { FixtureComparisonSummary } from "./fixtureComparison";
import type { ReferenceFixtureMetadata } from "./referenceFixture";
import type { ValidationStatus } from "./validationSummary";

export const LOCAL_FIXTURE_PRECISION_NOTE =
  "This report uses local fixture-based comparison only; it is not live NASA/JPL Horizons or SPICE precision validation.";

export interface PrecisionReportInput {
  appVersion: string;
  simulationDate: string;
  julianDate: number;
  comparison: FixtureComparisonSummary;
  generatedAt?: string;
}

export interface PrecisionReportRow {
  bodyId: string;
  bodyName: string;
  status: ValidationStatus;
  dxMeters: number | "N/A";
  dyMeters: number | "N/A";
  dzMeters: number | "N/A";
  positionDeltaMeters: number | "N/A";
  radialDistanceDeltaMeters: number | "N/A";
  percentageError: number | "N/A";
  moonEarthDistanceDeltaMeters: number | "N/A";
  toleranceMeters: number | "N/A";
  messages: string[];
}

export interface PrecisionReport {
  appVersion: string;
  simulationDate: string;
  julianDate: number | "N/A";
  generatedAt: string;
  fixtureMetadata: ReferenceFixtureMetadata;
  totals: {
    comparedCount: number;
    passedCount: number;
    warningCount: number;
    errorCount: number;
  };
  maxPositionDeltaMeters: number | "N/A";
  averagePositionDeltaMeters: number | "N/A";
  maxPercentageError: number | "N/A";
  note: string;
  rows: PrecisionReportRow[];
}

const CSV_HEADERS = [
  "bodyId",
  "bodyName",
  "status",
  "dxMeters",
  "dyMeters",
  "dzMeters",
  "positionDeltaMeters",
  "radialDistanceDeltaMeters",
  "percentageError",
  "moonEarthDistanceDeltaMeters",
  "toleranceMeters",
  "messages"
];

function safeNumber(value: number | undefined): number | "N/A" {
  return Number.isFinite(value) && value !== undefined ? value : "N/A";
}

function safeCount(value: number | undefined): number {
  return Number.isFinite(value) && value !== undefined ? value : 0;
}

function safeStatus(value: ValidationStatus | undefined): ValidationStatus {
  return value === "PASS" || value === "WARN" || value === "ERROR" ? value : "ERROR";
}

function safeMessages(messages: string[] | undefined): string[] {
  return Array.isArray(messages) ? messages.map((message) => String(message)) : [];
}

function csvValue(value: unknown): string {
  const text = Array.isArray(value) ? value.join("; ") : String(value ?? "N/A");
  if (/[",\r\n]/.test(text)) {
    return `"${text.split("\"").join("\"\"")}"`;
  }
  return text;
}

export function buildPrecisionReport(input: PrecisionReportInput): PrecisionReport {
  return {
    appVersion: input.appVersion,
    simulationDate: input.simulationDate || "N/A",
    julianDate: safeNumber(input.julianDate),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    fixtureMetadata: input.comparison.fixture.metadata,
    totals: {
      comparedCount: safeCount(input.comparison.comparedCount),
      passedCount: safeCount(input.comparison.passedCount),
      warningCount: safeCount(input.comparison.warningCount),
      errorCount: safeCount(input.comparison.errorCount)
    },
    maxPositionDeltaMeters: safeNumber(input.comparison.maxPositionDeltaMeters),
    averagePositionDeltaMeters: safeNumber(input.comparison.averagePositionDeltaMeters),
    maxPercentageError: safeNumber(input.comparison.maxPercentageError),
    note: LOCAL_FIXTURE_PRECISION_NOTE,
    rows: input.comparison.rows.map((row) => ({
      bodyId: row.bodyId,
      bodyName: row.bodyName,
      status: safeStatus(row.status),
      dxMeters: safeNumber(row.dxMeters),
      dyMeters: safeNumber(row.dyMeters),
      dzMeters: safeNumber(row.dzMeters),
      positionDeltaMeters: safeNumber(row.positionDeltaMeters),
      radialDistanceDeltaMeters: safeNumber(row.radialDistanceDeltaMeters),
      percentageError: safeNumber(row.percentageError),
      moonEarthDistanceDeltaMeters: safeNumber(row.moonEarthDistanceDeltaMeters),
      toleranceMeters: safeNumber(row.toleranceMeters),
      messages: safeMessages(row.messages)
    }))
  };
}

export function exportPrecisionReportJson(report: PrecisionReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function exportPrecisionReportCsv(report: PrecisionReport): string {
  const rows = report.rows.map((row) => [
    row.bodyId,
    row.bodyName,
    row.status,
    row.dxMeters,
    row.dyMeters,
    row.dzMeters,
    row.positionDeltaMeters,
    row.radialDistanceDeltaMeters,
    row.percentageError,
    row.moonEarthDistanceDeltaMeters,
    row.toleranceMeters,
    row.messages
  ]);

  return `${[CSV_HEADERS, ...rows].map((row) => row.map(csvValue).join(",")).join("\n")}\n`;
}
