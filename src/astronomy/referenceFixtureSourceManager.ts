import {
  buildReferenceImportReport,
  type ReferenceImportReport
} from "./referenceImportReport";
import {
  importReferenceData,
  type ImportReferenceDataOptions,
  type ReferenceImportPipelineResult
} from "./referenceImportPipeline";
import type { ReferenceFixture } from "./referenceFixture";
import type { ValidationStatus } from "./validationSummary";

export type FixtureSourceKind = "default" | "sample-import" | "local-import" | "fallback-default";

export interface ActiveReferenceFixtureSource {
  kind: FixtureSourceKind;
  label: string;
  fixture: ReferenceFixture;
  status: ValidationStatus;
  statusMessage: string;
  warningCount: number;
  errorCount: number;
  convertedRows: number;
  fallbackReason?: string;
}

export interface ReferenceFixtureSourceSnapshot {
  active: ActiveReferenceFixtureSource;
  latestImportReport: ReferenceImportReport | null;
}

export interface ReferenceFixtureSourceManagerOptions {
  defaultFixture: ReferenceFixture;
  sampleImportRaw: unknown;
  importOptions?: ImportReferenceDataOptions;
}

function isUsableConvertedFixture(result: ReferenceImportPipelineResult): result is ReferenceImportPipelineResult & {
  convertedFixture: ReferenceFixture;
} {
  return Boolean(
    result.validation.canConvert &&
      result.convertedFixture &&
      result.convertedFixture.status !== "ERROR" &&
      result.convertedFixture.rows.length > 0
  );
}

function importedStatus(report: ReferenceImportReport): ValidationStatus {
  if (report.warningCount > 0 || report.errorCount > 0) {
    return "WARN";
  }
  return "PASS";
}

function importedStatusMessage(sourceLabel: string, report: ReferenceImportReport): string {
  const messages = [`${sourceLabel} active.`];
  if (report.warningCount > 0) {
    messages.push(`Import warnings: ${report.warningCount}.`);
  }
  if (report.errorCount > 0) {
    messages.push(`Import errors excluded from active fixture: ${report.errorCount}.`);
  }
  return messages.join(" ");
}

function fallbackReasonForReport(report: ReferenceImportReport): string {
  if (report.convertedFixtureStatus === "ERROR") {
    return "Converted fixture contains fatal errors.";
  }
  if (report.convertedFixtureStatus === "UNAVAILABLE") {
    return "Converted fixture is unavailable.";
  }
  if (report.acceptedRows <= 0) {
    return "Converted fixture has no accepted rows.";
  }
  return "Converted fixture could not be activated safely.";
}

export function formatActiveFixtureSourceIndicator(source: ActiveReferenceFixtureSource): string {
  return `Active fixture: ${source.label}`;
}

export class ReferenceFixtureSourceManager {
  private readonly defaultFixture: ReferenceFixture;
  private readonly importOptions: ImportReferenceDataOptions;
  private readonly sampleImportResult: ReferenceImportPipelineResult;
  private readonly sampleImportReport: ReferenceImportReport;
  private activeSource: ActiveReferenceFixtureSource;
  private latestImportReport: ReferenceImportReport | null;

  constructor(options: ReferenceFixtureSourceManagerOptions) {
    this.defaultFixture = options.defaultFixture;
    this.importOptions = {
      ...options.importOptions,
      knownBodyIds: options.importOptions?.knownBodyIds ? [...options.importOptions.knownBodyIds] : undefined,
      knownBodyNames: options.importOptions?.knownBodyNames ? [...options.importOptions.knownBodyNames] : undefined
    };
    this.sampleImportResult = importReferenceData(options.sampleImportRaw, this.importOptions);
    this.sampleImportReport = buildReferenceImportReport(this.sampleImportResult);
    this.latestImportReport = this.sampleImportReport;
    this.activeSource = this.buildDefaultSource("Default bundled V0.6 reference fixture active.");
  }

  snapshot(): ReferenceFixtureSourceSnapshot {
    return {
      active: this.activeSource,
      latestImportReport: this.latestImportReport
    };
  }

  selectDefault(): ReferenceFixtureSourceSnapshot {
    this.activeSource = this.buildDefaultSource("Default bundled V0.6 reference fixture active.");
    return this.snapshot();
  }

  resetToDefault(): ReferenceFixtureSourceSnapshot {
    this.activeSource = this.buildDefaultSource("Reset to default bundled V0.6 reference fixture.");
    return this.snapshot();
  }

  selectSampleImport(): ReferenceFixtureSourceSnapshot {
    this.latestImportReport = this.sampleImportReport;
    this.activeSource = this.buildImportedSource(
      "sample-import",
      "Converted V0.7 sample import fixture",
      this.sampleImportResult,
      this.sampleImportReport
    );
    return this.snapshot();
  }

  selectLocalImport(raw: unknown, fileName = "local import"): ReferenceFixtureSourceSnapshot {
    const result = importReferenceData(raw, this.importOptions);
    const report = buildReferenceImportReport(result);
    this.latestImportReport = report;
    this.activeSource = this.buildImportedSource(
      "local-import",
      `Local import: ${fileName}`,
      result,
      report
    );
    return this.snapshot();
  }

  selectFailedLocalImport(fileName: string, reason: string): ReferenceFixtureSourceSnapshot {
    this.latestImportReport = null;
    this.activeSource = this.buildFallbackSource(
      `Local import: ${fileName}`,
      null,
      `Import error: ${reason}`
    );
    return this.snapshot();
  }

  private buildDefaultSource(statusMessage: string): ActiveReferenceFixtureSource {
    return {
      kind: "default",
      label: this.defaultFixture.metadata.sourceLabel,
      fixture: this.defaultFixture,
      status: "PASS",
      statusMessage,
      warningCount: 0,
      errorCount: 0,
      convertedRows: this.defaultFixture.rows.length
    };
  }

  private buildImportedSource(
    kind: "sample-import" | "local-import",
    label: string,
    result: ReferenceImportPipelineResult,
    report: ReferenceImportReport
  ): ActiveReferenceFixtureSource {
    if (!isUsableConvertedFixture(result)) {
      return this.buildFallbackSource(label, report, fallbackReasonForReport(report));
    }

    return {
      kind,
      label: result.convertedFixture.metadata.sourceLabel || label,
      fixture: result.convertedFixture,
      status: importedStatus(report),
      statusMessage: importedStatusMessage(label, report),
      warningCount: report.warningCount,
      errorCount: report.errorCount,
      convertedRows: result.convertedFixture.rows.length
    };
  }

  private buildFallbackSource(
    attemptedLabel: string,
    report: ReferenceImportReport | null,
    reason: string
  ): ActiveReferenceFixtureSource {
    const warningCount = report?.warningCount ?? 0;
    const errorCount = report?.errorCount ?? 1;
    return {
      kind: "fallback-default",
      label: this.defaultFixture.metadata.sourceLabel,
      fixture: this.defaultFixture,
      status: "ERROR",
      statusMessage: `${attemptedLabel} could not be activated. Fallback to default fixture active. ${reason}`,
      warningCount,
      errorCount,
      convertedRows: this.defaultFixture.rows.length,
      fallbackReason: reason
    };
  }
}
