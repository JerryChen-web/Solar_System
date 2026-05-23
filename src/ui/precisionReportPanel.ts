import {
  buildPrecisionReport,
  exportPrecisionReportCsv,
  exportPrecisionReportJson,
  type PrecisionReport
} from "../astronomy/precisionReport";
import type { FixtureComparisonSummary } from "../astronomy/fixtureComparison";
import { downloadTextFile } from "./validationReportPanel";

export const precisionReportExportLabels = {
  json: "Export JSON",
  csv: "Export CSV"
} as const;

export interface PrecisionReportState {
  appVersion: string;
  simulationDate: string;
  julianDate: number;
  comparison: FixtureComparisonSummary | null;
}

export type PrecisionReportStateProvider = () => PrecisionReportState;
export type PrecisionReportDownloader = (filename: string, mimeType: string, contents: string) => void;

export interface PrecisionReportExportHandlers {
  exportJson: () => boolean;
  exportCsv: () => boolean;
}

function formatMetric(value: number | undefined): string {
  if (!Number.isFinite(value) || value === undefined) {
    return "N/A";
  }
  return `${value.toExponential(3)} m`;
}

export function formatPrecisionReportPanelSummary(comparison: FixtureComparisonSummary | null): string {
  if (!comparison) {
    return "No precision report yet.";
  }
  return [
    comparison.fixture.metadata.sourceLabel,
    `Compared ${comparison.comparedCount}`,
    `Pass ${comparison.passedCount}`,
    `Warn ${comparison.warningCount}`,
    `Error ${comparison.errorCount}`,
    `Max ${formatMetric(comparison.maxPositionDeltaMeters)}`,
    `Avg ${formatMetric(comparison.averagePositionDeltaMeters)}`
  ].join(" | ");
}

export function buildPrecisionReportFilename(report: PrecisionReport, extension: "json" | "csv"): string {
  const datePart = report.simulationDate.replace(/[^0-9A-Za-z]/g, "").slice(0, 15) || "simulation";
  return `solar-system-precision-${datePart}.${extension}`;
}

export function createPrecisionReportExportHandlers(
  getState: PrecisionReportStateProvider,
  downloader: PrecisionReportDownloader = downloadTextFile
): PrecisionReportExportHandlers {
  function buildCurrentReport(): PrecisionReport | null {
    const state = getState();
    if (!state.comparison) {
      return null;
    }

    return buildPrecisionReport({
      appVersion: state.appVersion,
      simulationDate: state.simulationDate,
      julianDate: state.julianDate,
      comparison: state.comparison
    });
  }

  return {
    exportJson: () => {
      const report = buildCurrentReport();
      if (!report) {
        return false;
      }
      downloader(
        buildPrecisionReportFilename(report, "json"),
        "application/json;charset=utf-8",
        exportPrecisionReportJson(report)
      );
      return true;
    },
    exportCsv: () => {
      const report = buildCurrentReport();
      if (!report) {
        return false;
      }
      downloader(
        buildPrecisionReportFilename(report, "csv"),
        "text/csv;charset=utf-8",
        exportPrecisionReportCsv(report)
      );
      return true;
    }
  };
}

export class PrecisionReportPanel {
  private readonly summaryText: HTMLElement;
  private readonly statusText: HTMLElement;
  private readonly handlers: PrecisionReportExportHandlers;
  private lastSummary = "";

  constructor(container: HTMLElement, getState: PrecisionReportStateProvider) {
    this.handlers = createPrecisionReportExportHandlers(getState);

    const details = document.createElement("details");
    details.className = "panel precision-report-panel";
    details.open = false;

    const summary = document.createElement("summary");
    summary.textContent = "Precision Report";

    const content = document.createElement("div");
    content.className = "precision-report-content";

    this.summaryText = document.createElement("div");
    this.summaryText.className = "precision-report-summary";
    this.summaryText.textContent = formatPrecisionReportPanelSummary(null);

    const buttonRow = document.createElement("div");
    buttonRow.className = "precision-report-actions";

    const jsonButton = document.createElement("button");
    jsonButton.type = "button";
    jsonButton.textContent = precisionReportExportLabels.json;

    const csvButton = document.createElement("button");
    csvButton.type = "button";
    csvButton.textContent = precisionReportExportLabels.csv;

    buttonRow.append(jsonButton, csvButton);

    this.statusText = document.createElement("div");
    this.statusText.className = "precision-report-status";

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

  update(comparison: FixtureComparisonSummary | null): void {
    const nextSummary = formatPrecisionReportPanelSummary(comparison);
    if (nextSummary === this.lastSummary) {
      return;
    }
    this.lastSummary = nextSummary;
    this.summaryText.textContent = nextSummary;
  }
}
