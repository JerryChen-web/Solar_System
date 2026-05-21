import * as THREE from "three";
import { AU_METERS } from "../config/constants";
import type { OrbitalElementRecord } from "../types/orbit";
import { normalizeRadians, solveEllipticKeplerEquation } from "./keplerSolver";

function degToRad(degrees: number): number {
  return THREE.MathUtils.degToRad(degrees);
}

export function solveKeplerEquation(meanAnomalyRad: number, eccentricity: number): number {
  const result = solveEllipticKeplerEquation(meanAnomalyRad, eccentricity);
  if (!result.converged || !Number.isFinite(result.eccentricAnomalyRad)) {
    throw new Error("Kepler equation failed to converge to a finite value.");
  }
  return result.eccentricAnomalyRad;
}

export function computeKeplerPositionMeters(
  element: OrbitalElementRecord,
  secondsSinceEpoch: number,
  gravitationalParameterM3S2: number
): THREE.Vector3 {
  if (!Number.isFinite(secondsSinceEpoch) || !Number.isFinite(gravitationalParameterM3S2)) {
    throw new RangeError("Kepler position inputs must be finite.");
  }
  if (!Number.isFinite(element.a_au) || element.a_au <= 0) {
    throw new RangeError("Semi-major axis must be positive.");
  }
  if (!Number.isFinite(element.e) || element.e < 0 || element.e >= 1) {
    throw new RangeError("Eccentricity must be in the range [0, 1).");
  }

  const semiMajorAxisM = element.a_au * AU_METERS;
  const meanMotionRadS = Math.sqrt(gravitationalParameterM3S2 / Math.pow(semiMajorAxisM, 3));
  const meanAnomalyAtEpoch = degToRad(element.L_deg - element.long_peri_deg);
  const meanAnomaly = normalizeRadians(meanAnomalyAtEpoch + meanMotionRadS * secondsSinceEpoch);
  const eccentricAnomaly = solveKeplerEquation(meanAnomaly, element.e);

  const orbitalX = semiMajorAxisM * (Math.cos(eccentricAnomaly) - element.e);
  const orbitalY =
    semiMajorAxisM * Math.sqrt(1 - element.e * element.e) * Math.sin(eccentricAnomaly);

  const ascendingNode = degToRad(element.long_node_deg);
  const inclination = degToRad(element.i_deg);
  const argumentOfPeriapsis = degToRad(element.long_peri_deg - element.long_node_deg);

  const cosO = Math.cos(ascendingNode);
  const sinO = Math.sin(ascendingNode);
  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);
  const cosW = Math.cos(argumentOfPeriapsis);
  const sinW = Math.sin(argumentOfPeriapsis);

  const x =
    (cosO * cosW - sinO * sinW * cosI) * orbitalX +
    (-cosO * sinW - sinO * cosW * cosI) * orbitalY;
  const y =
    (sinO * cosW + cosO * sinW * cosI) * orbitalX +
    (-sinO * sinW + cosO * cosW * cosI) * orbitalY;
  const z = sinW * sinI * orbitalX + cosW * sinI * orbitalY;

  return new THREE.Vector3(x, z, y);
}
