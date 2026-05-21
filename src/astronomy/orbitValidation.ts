import * as THREE from "three";
import { AU_METERS, GRAVITATIONAL_CONSTANT } from "../config/constants";
import type { BodyRecord } from "../types/body";
import type { OrbitalElementRecord } from "../types/orbit";
import { computeKeplerPositionMeters } from "./kepler";

export interface OrbitValidationResult {
  bodyId: string;
  valid: boolean;
  messages: string[];
}

export function isFiniteVector(vector: THREE.Vector3): boolean {
  return Number.isFinite(vector.x) && Number.isFinite(vector.y) && Number.isFinite(vector.z);
}

export function validateOrbitRadius(element: OrbitalElementRecord, positionMeters: THREE.Vector3): string[] {
  const messages: string[] = [];
  const radius = positionMeters.length();
  const perihelion = element.a_au * AU_METERS * (1 - element.e);
  const aphelion = element.a_au * AU_METERS * (1 + element.e);
  const tolerance = Math.max(element.a_au * AU_METERS * 0.02, 10_000);

  if (radius < perihelion - tolerance) {
    messages.push("Position radius is below expected periapsis range.");
  }
  if (radius > aphelion + tolerance) {
    messages.push("Position radius is above expected apoapsis range.");
  }
  return messages;
}

export function validateOrbitContinuity(
  positionsMeters: THREE.Vector3[],
  maxStepDistanceMeters: number
): string[] {
  const messages: string[] = [];
  for (let index = 1; index < positionsMeters.length; index += 1) {
    const stepDistance = positionsMeters[index].distanceTo(positionsMeters[index - 1]);
    if (!Number.isFinite(stepDistance)) {
      messages.push("Orbit continuity produced a non-finite step.");
    } else if (stepDistance > maxStepDistanceMeters) {
      messages.push("Orbit continuity step exceeded expected threshold.");
    }
  }
  return messages;
}

export function validateBodyOrbit(
  body: BodyRecord,
  parentBody: BodyRecord,
  element: OrbitalElementRecord,
  sampleSecondsSinceEpoch: number[]
): OrbitValidationResult {
  const messages: string[] = [];
  const mu = GRAVITATIONAL_CONSTANT * (parentBody.mass_kg + body.mass_kg);
  const positions = sampleSecondsSinceEpoch.map((seconds) =>
    computeKeplerPositionMeters(element, seconds, mu)
  );

  for (const position of positions) {
    if (!isFiniteVector(position)) {
      messages.push("Orbit position contains NaN or Infinity.");
    }
    messages.push(...validateOrbitRadius(element, position));
  }

  const maxStep = element.a_au * AU_METERS * 0.9;
  messages.push(...validateOrbitContinuity(positions, maxStep));

  return {
    bodyId: body.id,
    valid: messages.length === 0,
    messages
  };
}

