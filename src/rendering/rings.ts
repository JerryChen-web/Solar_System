import * as THREE from "three";

export function createSaturnRing(radiusSceneUnits: number): THREE.Mesh {
  const geometry = new THREE.RingGeometry(radiusSceneUnits * 1.35, radiusSceneUnits * 2.15, 96);
  const material = new THREE.MeshBasicMaterial({
    color: "#d9c58f",
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2;
  ring.name = "Saturn ring placeholder";
  return ring;
}

