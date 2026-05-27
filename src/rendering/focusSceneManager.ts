import { FOCUS_BODY_IDS, type FocusBodyId } from "./sceneModes";

export interface FocusSceneConfig {
  bodyId: FocusBodyId;
  title: string;
  subtitle: string;
  accentColor: string;
  atmosphereColor?: string;
  atmosphereOpacity?: number;
  atmosphereScale?: number;
  cameraOffset: readonly [number, number, number];
  minCameraDistance: number;
}

export const focusSceneConfigs: Record<FocusBodyId, FocusSceneConfig> = {
  mercury: {
    bodyId: "mercury",
    title: "Mercury Ecosystem",
    subtitle: "Cratered rock, hard sunlight, and almost no atmospheric veil.",
    accentColor: "#b8b2a6",
    cameraOffset: [2.2, 0.9, 2.8],
    minCameraDistance: 2.8
  },
  venus: {
    bodyId: "venus",
    title: "Venus Atmosphere",
    subtitle: "A dense amber cloud deck suggests the hot pressure world below.",
    accentColor: "#ffc46f",
    atmosphereColor: "#ffb45c",
    atmosphereOpacity: 0.34,
    atmosphereScale: 1.28,
    cameraOffset: [2.8, 1.1, 3.2],
    minCameraDistance: 3.1
  },
  earth: {
    bodyId: "earth",
    title: "Earth Ecosystem",
    subtitle: "Blue oceans, land, cloud bands, atmospheric rim, and Moon context.",
    accentColor: "#76b8ff",
    atmosphereColor: "#78bdff",
    atmosphereOpacity: 0.22,
    atmosphereScale: 1.2,
    cameraOffset: [2.8, 1.25, 3.4],
    minCameraDistance: 3.2
  },
  mars: {
    bodyId: "mars",
    title: "Mars Dust World",
    subtitle: "Rust-colored terrain cues and a faint thin-atmosphere glow.",
    accentColor: "#e36b3d",
    atmosphereColor: "#ff9a6f",
    atmosphereOpacity: 0.12,
    atmosphereScale: 1.16,
    cameraOffset: [2.6, 1.0, 3.1],
    minCameraDistance: 3
  },
  jupiter: {
    bodyId: "jupiter",
    title: "Jupiter Cloud System",
    subtitle: "Layered gas-giant bands and a storm marker emphasize its scale.",
    accentColor: "#f0d6a3",
    atmosphereColor: "#f6d7aa",
    atmosphereOpacity: 0.1,
    atmosphereScale: 1.08,
    cameraOffset: [5.2, 2.0, 4.5],
    minCameraDistance: 4.6
  },
  saturn: {
    bodyId: "saturn",
    title: "Saturn Ring System",
    subtitle: "A side-angle composition keeps the layered rings dominant.",
    accentColor: "#ead39a",
    atmosphereColor: "#f0d7a8",
    atmosphereOpacity: 0.08,
    atmosphereScale: 1.06,
    cameraOffset: [7.2, 2.5, 4.2],
    minCameraDistance: 5.4
  },
  uranus: {
    bodyId: "uranus",
    title: "Uranus Ice Giant",
    subtitle: "A quiet cyan planet with a tilted subtle ring cue.",
    accentColor: "#8ee9f2",
    atmosphereColor: "#a0f3ff",
    atmosphereOpacity: 0.1,
    atmosphereScale: 1.1,
    cameraOffset: [4.2, 1.8, 4.0],
    minCameraDistance: 4
  },
  neptune: {
    bodyId: "neptune",
    title: "Neptune Outer World",
    subtitle: "Deep blue clouds and a distant-system tone frame the ice giant.",
    accentColor: "#5f8dff",
    atmosphereColor: "#5d8cff",
    atmosphereOpacity: 0.11,
    atmosphereScale: 1.1,
    cameraOffset: [4.4, 1.8, 4.2],
    minCameraDistance: 4.1
  }
};

export function getFocusSceneConfig(bodyId: string): FocusSceneConfig | undefined {
  return FOCUS_BODY_IDS.includes(bodyId as FocusBodyId)
    ? focusSceneConfigs[bodyId as FocusBodyId]
    : undefined;
}
