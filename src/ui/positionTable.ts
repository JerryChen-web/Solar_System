import { AU_METERS } from "../config/constants";
import type { PositionTableRow, ValidationStatus } from "../astronomy/validationSummary";
import { formatAuFromMeters } from "./formatters";

export function formatPositionComponentAu(valueMeters: number | undefined): string {
  if (!Number.isFinite(valueMeters) || valueMeters === undefined) {
    return "N/A";
  }
  return (valueMeters / AU_METERS).toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0
  });
}

export function formatDistanceForPositionTable(valueMeters: number | undefined): string {
  return formatAuFromMeters(valueMeters);
}

export function statusClassName(status: ValidationStatus): string {
  return `status-badge status-${status.toLowerCase()}`;
}

export class PositionTable {
  private readonly tableBody: HTMLElement;
  private lastPayload = "";
  private lastRenderMs = 0;
  private readonly minRenderIntervalMs = 250;

  constructor(container: HTMLElement) {
    const details = document.createElement("details");
    details.className = "panel position-table-panel";
    details.open = false;

    const summary = document.createElement("summary");
    summary.textContent = "Position Table";
    const scroller = document.createElement("div");
    scroller.className = "position-table-scroll";
    const table = document.createElement("table");
    table.className = "position-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Body</th>
          <th>X AU</th>
          <th>Y AU</th>
          <th>Z AU</th>
          <th>Sun AU</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    this.tableBody = table.querySelector("tbody") as HTMLElement;
    scroller.appendChild(table);
    details.append(summary, scroller);
    container.appendChild(details);
  }

  update(rows: PositionTableRow[]): void {
    const payload = JSON.stringify(
      rows.map((row) => ({
        id: row.bodyId,
        x: row.positionMeters ? formatPositionComponentAu(row.positionMeters.x) : "N/A",
        y: row.positionMeters ? formatPositionComponentAu(row.positionMeters.y) : "N/A",
        z: row.positionMeters ? formatPositionComponentAu(row.positionMeters.z) : "N/A",
        distance: formatDistanceForPositionTable(row.distanceFromSunMeters),
        status: row.status
      }))
    );

    const now = performance.now();
    if (payload === this.lastPayload || (this.lastPayload && now - this.lastRenderMs < this.minRenderIntervalMs)) {
      return;
    }

    this.lastPayload = payload;
    this.lastRenderMs = now;
    this.render(rows);
  }

  private render(rows: PositionTableRow[]): void {
    this.tableBody.innerHTML = "";
    for (const row of rows) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.bodyName}</td>
        <td>${formatPositionComponentAu(row.positionMeters?.x)}</td>
        <td>${formatPositionComponentAu(row.positionMeters?.y)}</td>
        <td>${formatPositionComponentAu(row.positionMeters?.z)}</td>
        <td>${formatDistanceForPositionTable(row.distanceFromSunMeters)}</td>
        <td><span class="${statusClassName(row.status)}">${row.status}</span></td>
      `;
      this.tableBody.appendChild(tr);
    }
  }
}

