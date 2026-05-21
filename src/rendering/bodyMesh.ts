import * as THREE from "three";
import type { BodyRecord } from "../types/body";

export function createBodyMesh(body: BodyRecord, radiusSceneUnits: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusSceneUnits, 48, 32);
  const material = body.visual.emissive
    ? new THREE.MeshBasicMaterial({ color: body.visual.color })
    : new THREE.MeshStandardMaterial({
        color: body.visual.color,
        roughness: 0.84,
        metalness: 0
      });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = body.name_en;
  mesh.userData.bodyId = body.id;
  return mesh;
}

