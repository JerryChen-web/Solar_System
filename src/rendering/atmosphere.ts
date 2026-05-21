import * as THREE from "three";

export function createAtmosphere(radiusSceneUnits: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusSceneUnits * 1.12, 48, 24);
  const material = new THREE.MeshBasicMaterial({
    color: "#7fb7ff",
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  });
  const atmosphere = new THREE.Mesh(geometry, material);
  atmosphere.name = "Atmosphere placeholder";
  return atmosphere;
}

