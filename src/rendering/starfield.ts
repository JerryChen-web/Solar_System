import * as THREE from "three";

interface StarfieldOptions {
  seed: number;
  count: number;
  innerRadius: number;
  outerRadius: number;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x9e3779b9;
    let value = state;
    value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
    value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
  };
}

function createStarLayer(name: string, options: StarfieldOptions, size: number, opacity: number): THREE.Points {
  const random = seededRandom(options.seed);
  const positions = new Float32Array(options.count * 3);
  const colors = new Float32Array(options.count * 3);
  const color = new THREE.Color();

  for (let index = 0; index < options.count; index += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.lerp(-1, 1, random()));
    const radius = THREE.MathUtils.lerp(options.innerRadius, options.outerRadius, random());
    const sinPhi = Math.sin(phi);
    const x = radius * sinPhi * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * sinPhi * Math.sin(theta);
    const warmth = random();

    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;

    color.set(warmth > 0.82 ? "#ffe4bf" : warmth < 0.18 ? "#b9d7ff" : "#f2f7ff");
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    vertexColors: true,
    depthWrite: false
  });

  const stars = new THREE.Points(geometry, material);
  stars.name = name;
  return stars;
}

export function createStarfield(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Deep starfield";
  group.add(
    createStarLayer("Distant star layer", { seed: 1776, count: 1200, innerRadius: 900, outerRadius: 1500 }, 2.2, 0.72),
    createStarLayer("Near star layer", { seed: 4099, count: 420, innerRadius: 520, outerRadius: 920 }, 1.45, 0.55)
  );
  return group;
}
