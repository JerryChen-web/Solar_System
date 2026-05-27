import * as THREE from "three";

export function createSunGlow(radiusSceneUnits: number): THREE.Group {
  const group = new THREE.Group();
  group.name = "Procedural Sun glow";

  const shells = [
    { scale: 1.35, color: "#ffd36c", opacity: 0.3 },
    { scale: 1.85, color: "#ff9e4a", opacity: 0.16 },
    { scale: 2.55, color: "#ff6a2f", opacity: 0.08 }
  ];

  for (const shell of shells) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radiusSceneUnits * shell.scale, 64, 32),
      new THREE.MeshBasicMaterial({
        color: shell.color,
        transparent: true,
        opacity: shell.opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      })
    );
    mesh.name = "Sun halo shell";
    group.add(mesh);
  }

  return group;
}
