import type { BodyRecord } from "../types/body";
import { metersToAu } from "../physics/units";

export class BodyInfoPanel {
  private readonly title: HTMLElement;
  private readonly rows: HTMLElement;

  constructor(container: HTMLElement) {
    const panel = document.createElement("section");
    panel.className = "panel body-info";

    this.title = document.createElement("h2");
    this.rows = document.createElement("div");
    this.rows.className = "info-rows";

    panel.append(this.title, this.rows);
    container.appendChild(panel);
  }

  update(body: BodyRecord, distanceMeters: number): void {
    this.title.textContent = `${body.name_zh} ${body.name_en}`;
    this.rows.innerHTML = "";

    const rows = [
      ["Type", body.type],
      ["Parent", body.parent ?? "none"],
      ["Mass", `${body.mass_kg.toExponential(4)} kg`],
      ["Mean radius", `${(body.mean_radius_m / 1000).toLocaleString()} km`],
      ["Distance", body.type === "star" ? "center" : `${metersToAu(distanceMeters).toFixed(4)} AU`]
    ];

    for (const [label, value] of rows) {
      const row = document.createElement("div");
      row.className = "info-row";
      row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      this.rows.appendChild(row);
    }
  }
}

