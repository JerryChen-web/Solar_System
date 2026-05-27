import * as THREE from "three";

interface RingBand {
  inner: number;
  outer: number;
  color: string;
  opacity: number;
}

function createRingBand(radiusSceneUnits: number, band: RingBand): THREE.Mesh {
  const geometry = new THREE.RingGeometry(
    radiusSceneUnits * band.inner,
    radiusSceneUnits * band.outer,
    160,
    3
  );
  const material = new THREE.MeshBasicMaterial({
    color: band.color,
    transparent: true,
    opacity: band.opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

export function createPlanetRingSystem(bodyId: string, radiusSceneUnits: number): THREE.Group | null {
  const bands: RingBand[] =
    bodyId === "saturn"
      ? [
          { inner: 1.32, outer: 1.55, color: "#8f7c58", opacity: 0.28 },
          { inner: 1.58, outer: 1.98, color: "#ead8aa", opacity: 0.52 },
          { inner: 2.04, outer: 2.42, color: "#c6af78", opacity: 0.36 },
          { inner: 2.48, outer: 2.72, color: "#f3e2b6", opacity: 0.2 }
        ]
      : bodyId === "uranus"
        ? [
            { inner: 1.48, outer: 1.55, color: "#a9f2ff", opacity: 0.16 },
            { inner: 1.72, outer: 1.78, color: "#d9fbff", opacity: 0.2 }
          ]
        : [];

  if (bands.length === 0) {
    return null;
  }

  const group = new THREE.Group();
  group.name = bodyId === "saturn" ? "Saturn layered ring system" : "Uranus subtle ring system";

  for (const band of bands) {
    group.add(createRingBand(radiusSceneUnits, band));
  }

  if (bodyId === "uranus") {
    group.rotation.z = THREE.MathUtils.degToRad(82);
  }

  return group;
}
