import * as THREE from "three";
import { AU_METERS } from "./constants";
import type { BodyRecord } from "../types/body";
import type { VisualConfig } from "../types/config";

export function sceneDistanceForSolarDistanceAu(distanceAu: number, visualConfig: VisualConfig): number {
  if (distanceAu <= 2) {
    return distanceAu * visualConfig.scaling.distance.inner_planet_scale;
  }

  const innerSystemRadius = 2 * visualConfig.scaling.distance.inner_planet_scale;
  const compressedOuterDistance =
    Math.log1p(distanceAu - 2) * visualConfig.scaling.distance.outer_planet_scale * 7;
  return innerSystemRadius + compressedOuterDistance;
}

export function scaleOrbitVectorMeters(
  vectorMeters: THREE.Vector3,
  body: BodyRecord,
  visualConfig: VisualConfig
): THREE.Vector3 {
  const auVector = vectorMeters.clone().multiplyScalar(1 / AU_METERS);
  const distanceAu = auVector.length();
  if (distanceAu === 0) {
    return new THREE.Vector3();
  }

  if (body.type === "moon") {
    return auVector.multiplyScalar(visualConfig.scaling.distance.moon_distance_scale);
  }

  return auVector.normalize().multiplyScalar(sceneDistanceForSolarDistanceAu(distanceAu, visualConfig));
}

export function visualRadiusForBody(body: BodyRecord, visualConfig: VisualConfig): number {
  if (body.type === "star") {
    return 3.2;
  }

  const rawRadius = (body.mean_radius_m / AU_METERS) * body.visual.radius_scale * 25;
  return THREE.MathUtils.clamp(
    rawRadius,
    visualConfig.scaling.radius.min_visible_radius,
    visualConfig.scaling.radius.max_visible_radius
  );
}
