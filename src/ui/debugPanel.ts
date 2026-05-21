import type { DebugPanelState } from "../types/viewModels";
import { formatNumber, formatOptional, formatVector } from "./formatters";

export class DebugPanel {
  private readonly rows: HTMLElement;

  constructor(container: HTMLElement) {
    const details = document.createElement("details");
    details.className = "panel debug-panel";
    details.open = true;

    const summary = document.createElement("summary");
    summary.textContent = "Debug";
    this.rows = document.createElement("div");
    this.rows.className = "info-rows debug-rows";

    details.append(summary, this.rows);
    container.appendChild(details);
  }

  update(state: DebugPanelState): void {
    this.rows.innerHTML = "";
    const rows: Array<[string, string]> = [
      ["Current mode", state.currentMode],
      ["Simulation date", state.simulationDateText],
      ["Julian Date", formatNumber(state.julianDate, "JD", 5)],
      ["Time scale", formatNumber(state.timeScaleSecondsPerRealSecond, "s/s", 0)],
      ["Readable scale", state.readableTimeScale],
      ["Selected body", formatOptional(state.selectedBodyId)],
      ["Follow target", formatOptional(state.followTargetId)],
      ["Body count", String(state.bodyCount)],
      ["Orbit count", String(state.orbitCount)],
      ["Visual scale", state.visualScaleMode],
      ["Camera target", formatVector(state.cameraTarget)],
      ["Triangles", formatNumber(state.rendererTriangles, "", 0)],
      ["Draw calls", formatNumber(state.rendererDrawCalls, "", 0)],
      ["Checked bodies", String(state.validationCheckedCount)],
      ["Validation pass", String(state.validationPassedCount)],
      ["Validation warn", String(state.validationWarningCount)],
      ["Validation error", String(state.validationErrorCount)],
      ["N-body", state.nBodyStatus],
      ["Active mode", "Kepler"]
    ];

    for (const [label, value] of rows) {
      const row = document.createElement("div");
      row.className = "info-row";
      const labelElement = document.createElement("span");
      labelElement.textContent = label;
      const valueElement = document.createElement("strong");
      valueElement.textContent = value;
      row.append(labelElement, valueElement);
      this.rows.appendChild(row);
    }
  }
}
