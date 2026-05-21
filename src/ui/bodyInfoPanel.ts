import type { BodyInfoViewModel } from "../types/viewModels";
import {
  formatAuFromMeters,
  formatDegrees,
  formatNumber,
  formatOptional,
  formatScientific
} from "./formatters";

export class BodyInfoPanel {
  private readonly title: HTMLElement;
  private readonly content: HTMLElement;

  constructor(container: HTMLElement) {
    const panel = document.createElement("section");
    panel.className = "panel body-info";

    this.title = document.createElement("h2");
    this.content = document.createElement("div");
    this.content.className = "info-sections";

    panel.append(this.title, this.content);
    container.appendChild(panel);
  }

  update(viewModel: BodyInfoViewModel): void {
    const { body, orbitalElement } = viewModel;
    this.title.textContent = `${body.name_zh} ${body.name_en}`;
    this.content.innerHTML = "";

    this.content.append(
      this.createSection("Basic", [
        ["中文名", body.name_zh],
        ["English", body.name_en],
        ["ID", body.id],
        ["Type", body.type],
        ["Parent", formatOptional(body.parent)]
      ]),
      this.createSection("Physical", [
        ["Mass", formatScientific(body.mass_kg, "kg")],
        ["Mean radius", formatNumber(body.mean_radius_m, "m", 1)],
        ["Mean radius", formatNumber(body.mean_radius_m / 1000, "km", 2)],
        ["Rotation period", formatNumber(body.rotation_period_s, "s", 1)],
        ["Distance from parent", body.type === "star" ? "center" : formatAuFromMeters(viewModel.distanceFromParentMeters)],
        ["Distance from center", body.type === "star" ? "center" : formatAuFromMeters(viewModel.distanceFromCenterMeters)]
      ]),
      this.createSection("Orbit", [
        ["Semi-major axis", orbitalElement ? formatNumber(orbitalElement.a_au, "AU", 6) : "N/A"],
        ["Eccentricity", orbitalElement ? formatNumber(orbitalElement.e, "", 6) : "N/A"],
        ["Inclination", orbitalElement ? formatDegrees(orbitalElement.i_deg) : "N/A"],
        ["Mean longitude", orbitalElement ? formatDegrees(orbitalElement.L_deg) : "N/A"],
        ["Long. perihelion", orbitalElement ? formatDegrees(orbitalElement.long_peri_deg) : "N/A"],
        ["Long. asc. node", orbitalElement ? formatDegrees(orbitalElement.long_node_deg) : "N/A"],
        ["Orbit parent", formatOptional(orbitalElement?.parent ?? body.parent)]
      ]),
      this.createSection("Visual", [
        ["Visual color", body.visual.color],
        ["Visual scale", formatNumber(viewModel.visualRadiusScale, "", 2)],
        ["Visual radius", formatNumber(viewModel.visualRadiusSceneUnits, "scene units", 3)]
      ])
    );
  }

  private createSection(titleText: string, rows: Array<[string, string]>): HTMLElement {
    const section = document.createElement("section");
    section.className = "info-section";

    const title = document.createElement("h3");
    title.textContent = titleText;
    section.appendChild(title);

    const rowList = document.createElement("div");
    rowList.className = "info-rows";

    for (const [label, value] of rows) {
      const row = document.createElement("div");
      row.className = "info-row";

      const labelElement = document.createElement("span");
      labelElement.textContent = label;
      const valueElement = document.createElement("strong");
      valueElement.textContent = value;
      row.append(labelElement, valueElement);
      rowList.appendChild(row);
    }

    section.appendChild(rowList);
    return section;
  }
}

