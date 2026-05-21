import type { ValidationSummary, ValidationStatus } from "../astronomy/validationSummary";
import { formatAuFromMeters } from "./formatters";

function statusClass(status: ValidationStatus): string {
  return `status-badge status-${status.toLowerCase()}`;
}

export class ValidationDashboard {
  private readonly content: HTMLElement;
  private lastPayload = "";
  private lastRenderMs = 0;
  private readonly minRenderIntervalMs = 250;

  constructor(container: HTMLElement) {
    const details = document.createElement("details");
    details.className = "panel validation-dashboard";
    details.open = true;

    const summary = document.createElement("summary");
    summary.textContent = "Validation Dashboard";
    this.content = document.createElement("div");
    this.content.className = "validation-dashboard-content";

    details.append(summary, this.content);
    container.appendChild(details);
  }

  update(summary: ValidationSummary): void {
    const payload = JSON.stringify({
      rows: summary.rows.map((row) => ({
        id: row.bodyId,
        status: row.status,
        warnings: row.warningCount,
        errors: row.errorCount,
        messages: row.messages
      })),
      moon: {
        status: summary.moonDistance.status,
        distance: summary.moonDistance.distanceMeters,
        warnings: summary.moonDistance.warningCount,
        errors: summary.moonDistance.errorCount
      },
      checked: summary.checkedCount,
      passed: summary.passedCount,
      warningCount: summary.warningCount,
      errorCount: summary.errorCount
    });

    const now = performance.now();
    if (payload === this.lastPayload || (this.lastPayload && now - this.lastRenderMs < this.minRenderIntervalMs)) {
      return;
    }

    this.lastPayload = payload;
    this.lastRenderMs = now;
    this.render(summary);
  }

  private render(summary: ValidationSummary): void {
    this.content.innerHTML = "";

    const totals = document.createElement("div");
    totals.className = "validation-totals";
    totals.innerHTML = `
      <span>Checked <strong>${summary.checkedCount}</strong></span>
      <span>Passed <strong>${summary.passedCount}</strong></span>
      <span>Warnings <strong>${summary.warningCount}</strong></span>
      <span>Errors <strong>${summary.errorCount}</strong></span>
    `;

    const moon = document.createElement("section");
    moon.className = "moon-distance-check";
    moon.innerHTML = `
      <h3>Moon-Earth Distance Check</h3>
      <div class="validation-row">
        <span>Moon-Earth</span>
        <strong>${formatAuFromMeters(summary.moonDistance.distanceMeters)}</strong>
        <em class="${statusClass(summary.moonDistance.status)}">${summary.moonDistance.status}</em>
      </div>
    `;

    const list = document.createElement("div");
    list.className = "validation-list";

    for (const row of summary.rows) {
      const item = document.createElement("div");
      item.className = "validation-row";
      const message = row.messages.length > 0 ? row.messages.join(" ") : "All local checks pass.";
      item.title = message;
      item.innerHTML = `
        <span>${row.bodyName}</span>
        <strong>${row.warningCount} warn / ${row.errorCount} err</strong>
        <em class="${statusClass(row.status)}">${row.status}</em>
      `;
      list.appendChild(item);
    }

    this.content.append(totals, moon, list);
  }
}

