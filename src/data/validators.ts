import type { BodiesCatalog } from "../types/body";
import type { OrbitalElementsCatalog } from "../types/orbit";

export function validateBodiesCatalog(catalog: BodiesCatalog): BodiesCatalog {
  if (catalog.unit_system !== "SI" || catalog.bodies.length === 0) {
    throw new Error("Invalid bodies catalog.");
  }
  return catalog;
}

export function validateOrbitalElementsCatalog(catalog: OrbitalElementsCatalog): OrbitalElementsCatalog {
  if (catalog.unit_system !== "AU_DEG" || catalog.elements.length === 0) {
    throw new Error("Invalid orbital elements catalog.");
  }
  return catalog;
}

