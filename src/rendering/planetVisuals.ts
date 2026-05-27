import * as THREE from "three";
import type { BodyRecord } from "../types/body";
import { getFocusSceneConfig } from "./focusSceneManager";

export interface AtmosphereVisual {
  color: string;
  opacity: number;
  scale: number;
}

function hashText(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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

function createRuntimeCanvasTexture(body: BodyRecord): THREE.CanvasTexture | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (!context) {
    return undefined;
  }

  const random = seededRandom(hashText(body.id));
  context.fillStyle = body.visual.color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (body.id === "earth") {
    context.fillStyle = "#1957b8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#2f7d45";
    for (let index = 0; index < 20; index += 1) {
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const width = 24 + random() * 72;
      const height = 10 + random() * 34;
      context.beginPath();
      context.ellipse(x, y, width, height, random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = "rgba(255, 255, 255, 0.68)";
    for (let index = 0; index < 18; index += 1) {
      context.beginPath();
      context.ellipse(random() * canvas.width, random() * canvas.height, 38 + random() * 60, 3 + random() * 8, random(), 0, Math.PI * 2);
      context.fill();
    }
  } else if (body.id === "jupiter" || body.id === "saturn") {
    const palette =
      body.id === "jupiter"
        ? ["#b98b63", "#f0d8ad", "#8f654d", "#d7b28a", "#f7e6c0"]
        : ["#c7a96d", "#ead8a4", "#9d855c", "#dfc58b"];
    for (let y = 0; y < canvas.height; y += 9 + Math.floor(random() * 12)) {
      context.fillStyle = palette[Math.floor(random() * palette.length)] ?? palette[0];
      context.fillRect(0, y, canvas.width, 8 + random() * 16);
    }
    if (body.id === "jupiter") {
      context.fillStyle = "rgba(178, 67, 42, 0.86)";
      context.beginPath();
      context.ellipse(canvas.width * 0.68, canvas.height * 0.57, 42, 18, -0.1, 0, Math.PI * 2);
      context.fill();
    }
  } else if (body.id === "venus") {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#fff0a4");
    gradient.addColorStop(0.5, "#d99a42");
    gradient.addColorStop(1, "#8b5b28");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255, 244, 189, 0.34)";
    context.lineWidth = 6;
    for (let index = 0; index < 16; index += 1) {
      context.beginPath();
      const y = random() * canvas.height;
      context.moveTo(0, y);
      context.bezierCurveTo(150, y - 30 + random() * 60, 320, y + 30 - random() * 60, canvas.width, y + random() * 40 - 20);
      context.stroke();
    }
  } else if (body.id === "mercury" || body.id === "moon") {
    context.fillStyle = body.id === "mercury" ? "#8c8982" : "#bfc2c7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < 80; index += 1) {
      const x = random() * canvas.width;
      const y = random() * canvas.height;
      const radius = 2 + random() * 12;
      context.strokeStyle = `rgba(38, 35, 32, ${0.12 + random() * 0.28})`;
      context.lineWidth = 1 + random() * 2;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.stroke();
    }
  } else if (body.id === "mars") {
    context.fillStyle = "#b94827";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < 42; index += 1) {
      context.fillStyle = `rgba(86, 45, 31, ${0.18 + random() * 0.28})`;
      context.beginPath();
      context.ellipse(random() * canvas.width, random() * canvas.height, 18 + random() * 54, 5 + random() * 16, random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
  } else if (body.id === "uranus" || body.id === "neptune") {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, body.id === "uranus" ? "#b8fbff" : "#7da0ff");
    gradient.addColorStop(0.55, body.visual.color);
    gradient.addColorStop(1, body.id === "uranus" ? "#4fb9cf" : "#16357f");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = body.id === "uranus" ? "rgba(255,255,255,0.18)" : "rgba(190,215,255,0.2)";
    context.lineWidth = 5;
    for (let index = 0; index < 10; index += 1) {
      const y = random() * canvas.height;
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(160, y + 8, 330, y - 8, canvas.width, y + 6);
      context.stroke();
    }
    if (body.id === "neptune") {
      context.fillStyle = "rgba(14, 27, 90, 0.45)";
      context.beginPath();
      context.ellipse(canvas.width * 0.62, canvas.height * 0.48, 34, 12, 0.18, 0, Math.PI * 2);
      context.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 4;
  return texture;
}

export function createBodyMaterial(body: BodyRecord): THREE.Material {
  if (body.type === "star" || body.visual.emissive) {
    return new THREE.MeshBasicMaterial({
      color: body.visual.color,
      toneMapped: false
    });
  }

  const map = createRuntimeCanvasTexture(body);
  return new THREE.MeshStandardMaterial({
    color: map ? "#ffffff" : body.visual.color,
    map,
    roughness: body.type === "moon" ? 0.92 : 0.74,
    metalness: 0,
    emissive: body.id === "venus" ? new THREE.Color("#2a1305") : new THREE.Color("#000000"),
    emissiveIntensity: body.id === "venus" ? 0.08 : 0
  });
}

export function getAtmosphereVisual(body: BodyRecord): AtmosphereVisual | null {
  const focusConfig = getFocusSceneConfig(body.id);
  if (focusConfig?.atmosphereColor) {
    return {
      color: focusConfig.atmosphereColor,
      opacity: focusConfig.atmosphereOpacity ?? 0.12,
      scale: focusConfig.atmosphereScale ?? 1.12
    };
  }

  if (body.visual.atmosphere) {
    return {
      color: "#7fb7ff",
      opacity: 0.18,
      scale: 1.12
    };
  }

  return null;
}
