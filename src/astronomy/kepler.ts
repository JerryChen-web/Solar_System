import * as THREE from "three";
import { AU_METERS } from "../config/constants";
import type { OrbitalElementRecord } from "../types/orbit";

const TWO_PI = Math.PI * 2;

function degToRad(degrees: number): number {
  return THREE.MathUtils.degToRad(degrees);
}

function normalizeRadians(angle: number): number {
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

export function solveKeplerEquation(meanAnomalyRad: number, eccentricity: number): number {
  const normalizedMeanAnomaly = normalizeRadians(meanAnomalyRad);
  let eccentricAnomaly = eccentricity < 0.8 ? normalizedMeanAnomaly : Math.PI;

  for (let iteration = 0; iteration < 12; iteration += 1) {
    const f = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - normalizedMeanAnomaly;
    const fPrime = 1 - eccentricity * Math.cos(eccentricAnomaly);
    eccentricAnomaly -= f / fPrime;
  }

  return eccentricAnomaly;
}

export function computeKeplerPositionMeters(
  element: OrbitalElementRecord,
  secondsSinceEpoch: number,
  gravitationalParameterM3S2: number
): THREE.Vector3 {
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

