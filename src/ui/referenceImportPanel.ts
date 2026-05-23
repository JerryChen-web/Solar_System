import type { ReferenceImportReport } from "../astronomy/referenceImportReport";
import {
  formatActiveFixtureSourceIndicator,
  type ActiveReferenceFixtureSource,
  type ReferenceFixtureSourceSnapshot
} from "../astronomy/referenceFixtureSourceManager";

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

export function formatFixtureSourceStatus(source: ActiveReferenceFixtureSource | null): string {
  if (!source) {
    return "No active fixture source.";
  }

  return [
    source.statusMessage,
    `Rows ${source.convertedRows}`,
    `Warn ${source.warningCount}`,
    `Error ${source.errorCount}`
  ].join(" | ");
}

export interface ReferenceImportPanelOptions {
  onSelectDefault: () => void;
  onSelectSampleImport: () => void;
  onImportLocalFile: (file: File) => void;
  onResetDefault: () => void;
}

function isFixtureSourceSnapshot(value: ReferenceFixtureSourceSnapshot | ReferenceImportReport | null): value is ReferenceFixtureSourceSnapshot {
  return Boolean(value && typeof value === "object" && "active" in value && "latestImportReport" in value);
}

function setStatusClass(element: HTMLElement, status: string | undefined): void {
  element.classList.remove("is-pass", "is-warn", "is-error");
  if (status === "PASS") {
    element.classList.add("is-pass");
  } else if (status === "WARN") {
    element.classList.add("is-warn");
  } else if (status === "ERROR") {
    element.classList.add("is-error");
  }
}

export class ReferenceImportPanel {
  private readonly activeSourceText: HTMLElement;
  private readonly activeSourceStatus: HTMLElement;
  private readonly summaryText: HTMLElement;
  private readonly detailText: HTMLElement;
  private readonly localFileInput: HTMLInputElement;
  private readonly options: ReferenceImportPanelOptions | null;
  private lastActiveSource = "";
  private lastSummary = "";

  constructor(container: HTMLElement, options?: ReferenceImportPanelOptions) {
    this.options = options ?? null;

    const details = document.createElement("details");
    details.className = "panel reference-import-panel";
    details.open = false;

    const summary = document.createElement("summary");
    summary.textContent = "Reference Import";

    const content = document.createElement("div");
    content.className = "reference-import-content";

    this.activeSourceText = document.createElement("div");
    this.activeSourceText.className = "reference-source-active";
    this.activeSourceText.textContent = "Active fixture: unavailable";

    this.activeSourceStatus = document.createElement("div");
    this.activeSourceStatus.className = "reference-source-status";
    this.activeSourceStatus.textContent = formatFixtureSourceStatus(null);

    const actionRow = document.createElement("div");
    actionRow.className = "reference-source-actions";

    const defaultButton = document.createElement("button");
    defaultButton.type = "button";
    defaultButton.textContent = "Default";

    const sampleButton = document.createElement("button");
    sampleButton.type = "button";
    sampleButton.textContent = "Sample Import";

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Reset Default";

    actionRow.append(defaultButton, sampleButton, resetButton);

    const fileRow = document.createElement("label");
    fileRow.className = "reference-source-file";
    fileRow.textContent = "Local JSON";
    this.localFileInput = document.createElement("input");
    this.localFileInput.type = "file";
    this.localFileInput.accept = "application/json,.json";
    fileRow.appendChild(this.localFileInput);

    this.summaryText = document.createElement("div");
    this.summaryText.className = "reference-import-summary";
    this.summaryText.textContent = formatReferenceImportPanelSummary(null);

    this.detailText = document.createElement("div");
    this.detailText.className = "reference-import-status";
    this.detailText.textContent = "No live external API connection.";

    content.append(
      this.activeSourceText,
      this.activeSourceStatus,
      actionRow,
      fileRow,
      this.summaryText,
      this.detailText
    );
    details.append(summary, content);
    container.appendChild(details);

    defaultButton.addEventListener("click", () => {
      this.options?.onSelectDefault();
    });
    sampleButton.addEventListener("click", () => {
      this.options?.onSelectSampleImport();
    });
    resetButton.addEventListener("click", () => {
      this.options?.onResetDefault();
    });
    this.localFileInput.addEventListener("change", () => {
      const file = this.localFileInput.files?.[0];
      if (file) {
        this.options?.onImportLocalFile(file);
      }
      this.localFileInput.value = "";
    });
  }

  update(input: ReferenceFixtureSourceSnapshot | ReferenceImportReport | null): void {
    const snapshot = isFixtureSourceSnapshot(input) ? input : null;
    let report: ReferenceImportReport | null;
    if (snapshot) {
      report = snapshot.latestImportReport;
    } else {
      report = input as ReferenceImportReport | null;
    }

    if (snapshot) {
      const activeSource = formatActiveFixtureSourceIndicator(snapshot.active);
      if (activeSource !== this.lastActiveSource) {
        this.lastActiveSource = activeSource;
        this.activeSourceText.textContent = activeSource;
      }
      this.activeSourceStatus.textContent = formatFixtureSourceStatus(snapshot.active);
      setStatusClass(this.activeSourceStatus, snapshot.active.status);
    }

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
