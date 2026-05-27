import * as THREE from "three";
import { sceneDistanceForSolarDistanceAu } from "../config/visualScale";
import type { VisualConfig } from "../types/config";

export interface BeltDistributionOptions {
  count: number;
  innerRadius: number;
  outerRadius: number;
  verticalSpread: number;
  seed: number;
  colorPalette?: readonly string[];
  sizeRange?: readonly [number, number];
}

export interface BeltParticle {
  position: THREE.Vector3;
  radius: number;
  angleRadians: number;
  size: number;
  color: string;
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateBeltDistribution(options: BeltDistributionOptions): BeltParticle[] {
  const count = Math.max(0, Math.floor(options.count));
  const innerRadius = Math.min(options.innerRadius, options.outerRadius);
  const outerRadius = Math.max(options.innerRadius, options.outerRadius);
  const verticalSpread = Math.max(options.verticalSpread, 0);
  const random = seededRandom(options.seed);
  const palette = options.colorPalette ?? ["#9b8f7a", "#c5bba7", "#7f7464"];
  const [minSize, maxSize] = options.sizeRange ?? [0.035, 0.09];
  const particles: BeltParticle[] = [];

  for (let index = 0; index < count; index += 1) {
    const angleRadians = random() * Math.PI * 2;
    const radialT = Math.sqrt(random());
    const radius = THREE.MathUtils.lerp(innerRadius, outerRadius, radialT);
    const radialRipple = 1 + (random() - 0.5) * 0.06;
    const x = Math.cos(angleRadians) * radius * radialRipple;
    const z = Math.sin(angleRadians) * radius * (1 + (random() - 0.5) * 0.04);
    const y = (random() - 0.5) * verticalSpread * (0.35 + random() * 0.65);
    const size = THREE.MathUtils.lerp(minSize, maxSize, random());
    const color = palette[Math.floor(random() * palette.length)] ?? palette[0];

    particles.push({
      position: new THREE.Vector3(x, y, z),
      radius,
      angleRadians,
      size,
      color
    });
  }

  return particles;
}

function createBeltPoints(name: string, particles: BeltParticle[], pointSize: number): THREE.Points {
  const positions = new Float32Array(particles.length * 3);
  const colors = new Float32Array(particles.length * 3);
  const color = new THREE.Color();

  particles.forEach((particle, index) => {
    positions[index * 3] = particle.position.x;
    positions[index * 3 + 1] = particle.position.y;
    positions[index * 3 + 2] = particle.position.z;
    color.set(particle.color);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: pointSize,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.78,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  points.name = name;
  return points;
}

export function createAsteroidBelt(visualConfig: VisualConfig): THREE.Points {
  const particles = generateBeltDistribution({
    count: 760,
    innerRadius: sceneDistanceForSolarDistanceAu(2.08, visualConfig),
    outerRadius: sceneDistanceForSolarDistanceAu(3.35, visualConfig),
    verticalSpread: 2.6,
    seed: 104729,
    colorPalette: ["#756a58", "#a89b85", "#d0c2a7", "#8c8070"],
    sizeRange: [0.025, 0.075]
  });
  return createBeltPoints("Asteroid belt", particles, 0.08);
}

export function createKuiperBelt(visualConfig: VisualConfig): THREE.Points {
  const particles = generateBeltDistribution({
    count: 920,
    innerRadius: sceneDistanceForSolarDistanceAu(34, visualConfig),
    outerRadius: sceneDistanceForSolarDistanceAu(48, visualConfig),
    verticalSpread: 6.5,
    seed: 524287,
    colorPalette: ["#6685a8", "#8fa9c6", "#b8cde0", "#5e718a"],
    sizeRange: [0.025, 0.065]
  });
  return createBeltPoints("Kuiper belt", particles, 0.07);
}
