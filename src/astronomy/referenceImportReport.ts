import type { ReferenceFixtureMetadata } from "./referenceFixture";
import type { ReferenceImportPipelineResult } from "./referenceImportPipeline";
import type { ValidationStatus } from "./validationSummary";

export const LOCAL_REFERENCE_IMPORT_NOTE =
  "V0.7 reference import is local-only preparation for future datasets; it is not live NASA/JPL Horizons or SPICE integration.";

export interface ReferenceImportReportRow {
  rowIndex: number;
  bodyId: string;
  bodyName: string;
  status: ValidationStatus;
  warnings: string[];
  errors: string[];
}

export interface ReferenceImportReport {
  datasetId: string;
  sourceName: string;
  sourceType: string;
  contractVersion: string;
  totalRows: number;
  acceptedRows: number;
  warningCount: number;
  errorCount: number;
  status: ValidationStatus;
  rowDiagnostics: ReferenceImportReportRow[];
  convertedFixtureMetadata?: ReferenceFixtureMetadata;
  convertedFixtureStatus: "AVAILABLE" | "UNAVAILABLE" | "ERROR";
  conversionMessages: string[];
  note: string;
}

function safeString(value: string | undefined, fallback = "N/A"): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function safeCount(value: number | undefined): number {
  return Number.isFinite(value) && value !== undefined ? value : 0;
}

export function buildReferenceImportReport(result: ReferenceImportPipelineResult): ReferenceImportReport {
  const metadata = result.validation.contract.metadata;
  const convertedFixtureStatus =
    result.convertedFixture === undefined
      ? "UNAVAILABLE"
      : result.convertedFixture.status === "ERROR"
        ? "ERROR"
        : "AVAILABLE";

  return {
    datasetId: safeString(metadata.datasetId),
    sourceName: safeString(metadata.sourceName),
    sourceType: safeString(metadata.sourceType),
    contractVersion: safeString(metadata.contractVersion),
    totalRows: safeCount(result.validation.totalRows),
    acceptedRows: safeCount(result.validation.acceptedRows),
    warningCount: safeCount(result.validation.warningCount),
    errorCount: safeCount(result.validation.errorCount),
    status: result.validation.status,
    rowDiagnostics: result.validation.rowDiagnostics.map((diagnostic) => ({
      rowIndex: diagnostic.rowIndex,
      bodyId: diagnostic.bodyId,
      bodyName: diagnostic.bodyName,
      status: diagnostic.status,
      warnings: diagnostic.warnings.map(String),
      errors: diagnostic.errors.map(String)
    })),
    convertedFixtureMetadata: result.convertedFixture?.metadata,
    convertedFixtureStatus,
    conversionMessages: result.conversionMessages.map(String),
    note: LOCAL_REFERENCE_IMPORT_NOTE
  };
}

export function exportReferenceImportReportJson(report: ReferenceImportReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
