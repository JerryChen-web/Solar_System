import type { ReferenceProviderMetadata } from "./referenceAdapter";
import type { ValidationStatus, ValidationSummary } from "./validationSummary";

export const LOCAL_APPROXIMATE_VALIDATION_NOTE =
  "This report uses local approximate sanity checking only; it is not NASA/JPL Horizons or SPICE precision validation.";

export interface ValidationReportInput {
  appVersion: string;
  simulationDate: string;
  julianDate: number;
  summary: ValidationSummary;
  referenceProvider: ReferenceProviderMetadata;
  generatedAt?: string;
}

export interface ValidationReportRow {
  bodyId: string;
  bodyName: string;
  status: ValidationStatus;
  finitePosition: ValidationStatus;
  rangeStatus: ValidationStatus;
  continuityStatus: ValidationStatus;
  distanceFromSunMeters: number | "N/A";
  warningCount: number;
  errorCount: number;
  messages: string[];
}

export interface ValidationReportPositionRow {
  bodyId: string;
  bodyName: string;
  xMeters: number | "N/A";
  yMeters: number | "N/A";
  zMeters: number | "N/A";
  distanceFromSunMeters: number | "N/A";
  status: ValidationStatus;
}

export interface ValidationReportMoonDistance {
  status: ValidationStatus;
  distanceMeters: number | "N/A";
  warningCount: number;
  errorCount: number;
  messages: string[];
}

export interface ValidationReport {
  appVersion: string;
  simulationDate: string;
  julianDate: number | "N/A";
  generatedAt: string;
  totals: {
    checkedCount: number;
    passedCount: number;
    warningCount: number;
    errorCount: number;
  };
  referenceProvider: ReferenceProviderMetadata;
  note: string;
  validationRows: ValidationReportRow[];
  positionRows: ValidationReportPositionRow[];
  moonEarthDistance: ValidationReportMoonDistance;
}

const CSV_HEADERS = [
  "bodyId",
  "bodyName",
  "status",
  "finitePosition",
  "rangeStatus",
  "continuityStatus",
  "distanceFromSunMeters",
  "warningCount",
  "errorCount",
  "messages"
];

function safeNumber(value: number | undefined): number | "N/A" {
  return Number.isFinite(value) && value !== undefined ? value : "N/A";
}

function safeStatus(value: ValidationStatus | undefined): ValidationStatus {
  return value === "PASS" || value === "WARN" || value === "ERROR" ? value : "ERROR";
}

function safeCount(value: number | undefined): number {
  return Number.isFinite(value) && value !== undefined ? value : 0;
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

export function buildValidationReport(input: ValidationReportInput): ValidationReport {
  return {
    appVersion: input.appVersion,
    simulationDate: input.simulationDate || "N/A",
    julianDate: safeNumber(input.julianDate),
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    totals: {
      checkedCount: safeCount(input.summary.checkedCount),
      passedCount: safeCount(input.summary.passedCount),
      warningCount: safeCount(input.summary.warningCount),
      errorCount: safeCount(input.summary.errorCount)
    },
    referenceProvider: input.referenceProvider,
    note: LOCAL_APPROXIMATE_VALIDATION_NOTE,
    validationRows: input.summary.rows.map((row) => ({
      bodyId: row.bodyId,
      bodyName: row.bodyName,
      status: safeStatus(row.status),
      finitePosition: safeStatus(row.finitePosition),
      rangeStatus: safeStatus(row.rangeStatus),
      continuityStatus: safeStatus(row.continuityStatus),
      distanceFromSunMeters: safeNumber(row.distanceFromSunMeters),
      warningCount: safeCount(row.warningCount),
      errorCount: safeCount(row.errorCount),
      messages: safeMessages(row.messages)
    })),
    positionRows: input.summary.positionRows.map((row) => ({
      bodyId: row.bodyId,
      bodyName: row.bodyName,
      xMeters: safeNumber(row.positionMeters?.x),
      yMeters: safeNumber(row.positionMeters?.y),
      zMeters: safeNumber(row.positionMeters?.z),
      distanceFromSunMeters: safeNumber(row.distanceFromSunMeters),
      status: safeStatus(row.status)
    })),
    moonEarthDistance: {
      status: safeStatus(input.summary.moonDistance.status),
      distanceMeters: safeNumber(input.summary.moonDistance.distanceMeters),
      warningCount: safeCount(input.summary.moonDistance.warningCount),
      errorCount: safeCount(input.summary.moonDistance.errorCount),
      messages: safeMessages(input.summary.moonDistance.messages)
    }
  };
}

export function exportValidationReportJson(report: ValidationReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function exportValidationReportCsv(report: ValidationReport): string {
  const rows = report.validationRows.map((row) => [
    row.bodyId,
    row.bodyName,
    row.status,
    row.finitePosition,
    row.rangeStatus,
    row.continuityStatus,
    row.distanceFromSunMeters,
    row.warningCount,
    row.errorCount,
    row.messages
  ]);

  rows.push([
    "moon-earth",
    "Moon-Earth Distance",
    report.moonEarthDistance.status,
    "N/A",
    report.moonEarthDistance.status,
    "N/A",
    report.moonEarthDistance.distanceMeters,
    report.moonEarthDistance.warningCount,
    report.moonEarthDistance.errorCount,
    report.moonEarthDistance.messages
  ]);

  return `${[CSV_HEADERS, ...rows].map((row) => row.map(csvValue).join(",")).join("\n")}\n`;
}
