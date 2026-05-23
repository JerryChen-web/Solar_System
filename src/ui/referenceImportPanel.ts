import type { ReferenceImportReport } from "../astronomy/referenceImportReport";

export function formatReferenceImportPanelSummary(report: ReferenceImportReport | null): string {
  if (!report) {
    return "No reference import report yet. Local only / no live external connection.";
  }

  return [
    `Dataset ${report.datasetId}`,
    `Source ${report.sourceName}`,
    `Rows ${report.totalRows}`,
    `Accepted ${report.acceptedRows}`,
    `Warn ${report.warningCount}`,
    `Error ${report.errorCount}`,
    `Fixture ${report.convertedFixtureStatus}`,
    "Local only / no live external connection"
  ].join(" | ");
}

export class ReferenceImportPanel {
  private readonly summaryText: HTMLElement;
  private readonly detailText: HTMLElement;
  private lastSummary = "";

  constructor(container: HTMLElement) {
    const details = document.createElement("details");
    details.className = "panel reference-import-panel";
    details.open = false;

    const summary = document.createElement("summary");
    summary.textContent = "Reference Import";

    const content = document.createElement("div");
    content.className = "reference-import-content";

    this.summaryText = document.createElement("div");
    this.summaryText.className = "reference-import-summary";
    this.summaryText.textContent = formatReferenceImportPanelSummary(null);

    this.detailText = document.createElement("div");
    this.detailText.className = "reference-import-status";
    this.detailText.textContent = "No live external API connection.";

    content.append(this.summaryText, this.detailText);
    details.append(summary, content);
    container.appendChild(details);
  }

  update(report: ReferenceImportReport | null): void {
    const nextSummary = formatReferenceImportPanelSummary(report);
    if (nextSummary !== this.lastSummary) {
      this.lastSummary = nextSummary;
      this.summaryText.textContent = nextSummary;
    }

    this.detailText.textContent = report
      ? `${report.note} Converted fixture: ${report.convertedFixtureStatus}.`
      : "No live external API connection.";
  }
}
