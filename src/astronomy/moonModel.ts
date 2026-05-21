import * as THREE from "three";
import { GRAVITATIONAL_CONSTANT } from "../config/constants";
import type { BodyRecord } from "../types/body";
import type { OrbitalElementRecord } from "../types/orbit";
import { computeKeplerPositionMeters } from "./kepler";

export interface MoonModelResult {
  relativeToEarthMeters: THREE.Vector3;
  heliocentricMeters: THREE.Vector3;
}

function lunarElementAtDate(element: OrbitalElementRecord, secondsSinceEpoch: number): OrbitalElementRecord {
  const daysSinceJ2000 = secondsSinceEpoch / 86_400;

  // V0.3 approximate lunar secular rates. These are intentionally lightweight and
  // local-data based; future phases can replace this model with ephemeris tables.
  return {
    ...element,
    L_deg: element.L_deg + 13.176396 * daysSinceJ2000,
    long_peri_deg: element.long_peri_deg + 0.111404 * daysSinceJ2000,
    long_node_deg: element.long_node_deg - 0.052954 * daysSinceJ2000
  };
}

export function computeMoonPositionMeters(
  moonElement: OrbitalElementRecord,
  earthBody: BodyRecord,
  moonBody: BodyRecord,
  earthHeliocentricMeters: THREE.Vector3,
  secondsSinceEpoch: number
): MoonModelResult {
  const datedElement = lunarElementAtDate(moonElement, secondsSinceEpoch);
  const earthMoonMu = GRAVITATIONAL_CONSTANT * (earthBody.mass_kg + moonBody.mass_kg);
  const relativeToEarthMeters = computeKeplerPositionMeters(
    datedElement,
    0,
    earthMoonMu
  );

  return {
    relativeToEarthMeters,
    heliocentricMeters: earthHeliocentricMeters.clone().add(relativeToEarthMeters)
  };
}
