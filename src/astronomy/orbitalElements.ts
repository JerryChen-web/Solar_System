import orbitalElementsJson from "../../data/processed/orbital_elements_j2000.seed.json";
import type { OrbitalElementRecord, OrbitalElementsCatalog } from "../types/orbit";

export const orbitalElementsCatalog = orbitalElementsJson as OrbitalElementsCatalog;

export function orbitalElementsByBodyId(): Map<string, OrbitalElementRecord> {
  return new Map(orbitalElementsCatalog.elements.map((element) => [element.body_id, element]));
}

