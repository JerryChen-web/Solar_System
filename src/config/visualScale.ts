import * as THREE from "three";
import { AU_METERS } from "./constants";
import type { BodyRecord } from "../types/body";
import type { VisualConfig } from "../types/config";

export function scaleOrbitVectorMeters(
  vectorMeters: THREE.Vector3,
  body: BodyRecord,
  visualConfig: VisualConfig
): THREE.Vector3 {
  const auVector = vectorMeters.clone().multiplyScalar(1 / AU_METERS);
  const distanceAu = auVector.length();
  const scale =
    body.type === "moon"
      ? visualConfig.scaling.distance.moon_distance_scale
      : distanceAu <= 2
        ? visualConfig.scaling.distance.inner_planet_scale
        : visualConfig.scaling.distance.outer_planet_scale;

  return auVector.multiplyScalar(scale);
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

