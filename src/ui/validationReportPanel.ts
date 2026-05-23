import type { ReferenceProviderMetadata } from "../astronomy/referenceAdapter";
import {
  buildValidationReport,
  exportValidationReportCsv,
  exportValidationReportJson,
  type ValidationReport
} from "../astronomy/validationReport";
import type { ValidationSummary } from "../astronomy/validationSummary";

export const validationReportExportLabels = {
  json: "Export JSON",
  csv: "Export CSV"
} as const;

export interface ValidationReportState {
  appVersion: string;
  simulationDate: string;
  julianDate: number;
  summary: ValidationSummary | null;
  referenceProvider: ReferenceProviderMetadata;
}

export type ValidationReportStateProvider = () => ValidationReportState;
export type ValidationReportDownloader = (filename: string, mimeType: string, contents: string) => void;

export interface ValidationReportExportHandlers {
  exportJson: () => boolean;
  exportCsv: () => boolean;
}

export function formatValidationReportPanelSummary(summary: ValidationSummary | null): string {
  if (!summary) {
    return "No validation report yet.";
  }
  return `Checked ${summary.checkedCount} | Pass ${summary.passedCount} | Warn ${summary.warningCount} | Error ${summary.errorCount}`;
}

export function buildValidationReportFilename(report: ValidationReport, extension: "json" | "csv"): string {
  const datePart = report.simulationDate.replace(/[^0-9A-Za-z]/g, "").slice(0, 15) || "simulation";
  return `solar-system-validation-${datePart}.${extension}`;
}

export function downloadTextFile(filename: string, mimeType: string, contents: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function createValidationReportExportHandlers(
  getState: ValidationReportStateProvider,
  downloader: ValidationReportDownloader = downloadTextFile
): ValidationReportExportHandlers {
  function buildCurrentReport(): ValidationReport | null {
    const state = getState();
    if (!state.summary) {
      return null;
    }

    return buildValidationReport({
      appVersion: state.appVersion,
      simulationDate: state.simulationDate,
      julianDate: state.julianDate,
      summary: state.summary,
      referenceProvider: state.referenceProvider
    });
  }

  return {
    exportJson: () => {
      const report = buildCurrentReport();
      if (!report) {
        return false;
      }
      downloader(
        buildValidationReportFilename(report, "json"),
        "application/json;charset=utf-8",
        exportValidationReportJson(report)
      );
      return true;
    },
    exportCsv: () => {
      const report = buildCurrentReport();
      if (!report) {
        return false;
      }
      downloader(
        buildValidationReportFilename(report, "csv"),
        "text/csv;charset=utf-8",
        exportValidationReportCsv(report)
      );
      return true;
    }
  };
}

export class ValidationReportPanel {
  private readonly summaryText: HTMLElement;
  private readonly statusText: HTMLElement;
  private readonly handlers: ValidationReportExportHandlers;
  private lastSummary = "";

  constructor(container: HTMLElement, getState: ValidationReportStateProvider) {
    this.handlers = createValidationReportExportHandlers(getState);

    const details = document.createElement("details");
    details.className = "panel validation-report-panel";
    details.open = false;

    const summary = document.createElement("summary");
    summary.textContent = "Validation Report";

    const content = document.createElement("div");
    content.className = "validation-report-content";

    this.summaryText = document.createElement("div");
    this.summaryText.className = "validation-report-summary";
    this.summaryText.textContent = formatValidationReportPanelSummary(null);

    const buttonRow = document.createElement("div");
    buttonRow.className = "validation-report-actions";

    const jsonButton = document.createElement("button");
    jsonButton.type = "button";
    jsonButton.textContent = validationReportExportLabels.json;

    const csvButton = document.createElement("button");
    csvButton.type = "button";
    csvButton.textContent = validationReportExportLabels.csv;

    buttonRow.append(jsonButton, csvButton);

    this.statusText = document.createElement("div");
    this.statusText.className = "validation-report-status";

    content.append(this.summaryText, buttonRow, this.statusText);
    details.append(summary, content);
    container.appendChild(details);

    jsonButton.addEventListener("click", () => {
      this.statusText.textContent = this.handlers.exportJson() ? "JSON exported." : "No report available.";
    });
    csvButton.addEventListener("click", () => {
      this.statusText.textContent = this.handlers.exportCsv() ? "CSV exported." : "No report available.";
    });
  }

  update(summary: ValidationSummary | null): void {
    const nextSummary = formatValidationReportPanelSummary(summary);
    if (nextSummary === this.lastSummary) {
      return;
    }
    this.lastSummary = nextSummary;
    this.summaryText.textContent = nextSummary;
  }
}
