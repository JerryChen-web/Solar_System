import * as THREE from "three";
import type { VisualConfig } from "../types/config";

export function addLights(scene: THREE.Scene, visualConfig: VisualConfig): THREE.PointLight {
  const ambient = new THREE.AmbientLight("#ffffff", visualConfig.lighting.ambient_light_intensity);
  scene.add(ambient);

  const sunLight = new THREE.PointLight("#fff2c7", visualConfig.lighting.sun_light_intensity, 0, 1.5);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);
  return sunLight;
}

