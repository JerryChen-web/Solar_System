import * as THREE from "three";

export function createAtmosphere(
  radiusSceneUnits: number,
  color = "#7fb7ff",
  opacity = 0.18,
  scale = 1.12
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusSceneUnits * scale, 64, 32);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const atmosphere = new THREE.Mesh(geometry, material);
  atmosphere.name = "Procedural atmosphere shell";
  return atmosphere;
}
