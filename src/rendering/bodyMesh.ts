import * as THREE from "three";
import type { BodyRecord } from "../types/body";
import { createBodyMaterial } from "./planetVisuals";

export function createBodyMesh(body: BodyRecord, radiusSceneUnits: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusSceneUnits, 64, 40);
  const material = createBodyMaterial(body);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = body.name_en;
  mesh.userData.bodyId = body.id;
  return mesh;
}
