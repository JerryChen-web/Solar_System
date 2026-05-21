import bodiesJson from "../../data/processed/bodies.seed.json";
import orbitalElementsJson from "../../data/processed/orbital_elements_j2000.seed.json";
import visualConfigJson from "../../data/processed/visual_config.json";
import simulationConfigJson from "../../data/processed/simulation_config.json";
import type { BodiesCatalog, BodyRecord } from "../types/body";
import type { SimulationConfig, VisualConfig } from "../types/config";
import type { OrbitalElementRecord, OrbitalElementsCatalog } from "../types/orbit";
import { validateBodiesCatalog, validateOrbitalElementsCatalog } from "./validators";

export interface SolarSystemData {
  bodies: BodyRecord[];
  bodyById: Map<string, BodyRecord>;
  orbitalElements: OrbitalElementRecord[];
  orbitalElementByBodyId: Map<string, OrbitalElementRecord>;
  visualConfig: VisualConfig;
  simulationConfig: SimulationConfig;
}

export function loadSolarSystemData(): SolarSystemData {
  const bodiesCatalog = validateBodiesCatalog(bodiesJson as BodiesCatalog);
  const orbitCatalog = validateOrbitalElementsCatalog(orbitalElementsJson as OrbitalElementsCatalog);

  return {
    bodies: bodiesCatalog.bodies,
    bodyById: new Map(bodiesCatalog.bodies.map((body) => [body.id, body])),
    orbitalElements: orbitCatalog.elements,
    orbitalElementByBodyId: new Map(orbitCatalog.elements.map((element) => [element.body_id, element])),
    visualConfig: visualConfigJson as VisualConfig,
    simulationConfig: simulationConfigJson as SimulationConfig
  };
}

