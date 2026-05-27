import * as THREE from "three";
import type { VisualConfig } from "../types/config";

export function addLights(scene: THREE.Scene, visualConfig: VisualConfig): THREE.PointLight {
  const ambient = new THREE.AmbientLight("#d8e6ff", visualConfig.lighting.ambient_light_intensity * 0.75);
  scene.add(ambient);

  const sunLight = new THREE.PointLight("#fff0bd", visualConfig.lighting.sun_light_intensity * 1.55, 0, 1.35);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
  return sunLight;
}
