import * as THREE from "three";
import { GRAVITATIONAL_CONSTANT, AU_METERS } from "../config/constants";
import { scaleOrbitVectorMeters } from "../config/visualScale";
import { computeKeplerPositionMeters } from "../astronomy/kepler";
import type { BodyRecord } from "../types/body";
import type { VisualConfig } from "../types/config";
import type { OrbitalElementRecord } from "../types/orbit";

export function createOrbitPath(
  element: OrbitalElementRecord,
  body: BodyRecord,
  parentBody: BodyRecord,
  visualConfig: VisualConfig
): THREE.LineLoop {
  const segments = visualConfig.orbits.line_segments;
  const mu = GRAVITATIONAL_CONSTANT * (parentBody.mass_kg + body.mass_kg);
  const semiMajorAxisM = element.a_au * AU_METERS;
  const periodSeconds = Math.PI * 2 * Math.sqrt(Math.pow(semiMajorAxisM, 3) / mu);
  const points: THREE.Vector3[] = [];

  for (let index = 0; index < segments; index += 1) {
    const seconds = (index / segments) * periodSeconds;
    const positionMeters = computeKeplerPositionMeters(element, seconds, mu);
    points.push(scaleOrbitVectorMeters(positionMeters, body, visualConfig));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: body.type === "moon" ? "#9aa4b5" : "#63718a",
    transparent: true,
    opacity: body.type === "moon" ? 0.42 : visualConfig.orbits.line_opacity * 0.74,
    depthWrite: false
  });
  const orbitPath = new THREE.LineLoop(geometry, material);
  orbitPath.name = `${body.name_en} orbit path`;
  return orbitPath;
}
