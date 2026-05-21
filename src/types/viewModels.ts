import * as THREE from "three";
import type { BodyRecord } from "./body";
import type { OrbitalElementRecord } from "./orbit";
import type { SimulationMode } from "../ui/modeSwitcher";

export interface BodyInfoViewModel {
  body: BodyRecord;
  orbitalElement?: OrbitalElementRecord;
  distanceFromParentMeters?: number;
  distanceFromCenterMeters?: number;
  visualRadiusSceneUnits?: number;
  visualRadiusScale?: number;
}

export interface DebugPanelState {
  currentMode: SimulationMode;
  simulationDateText: string;
  julianDate: number;
  timeScaleSecondsPerRealSecond: number;
  readableTimeScale: string;
  selectedBodyId: string | null;
  followTargetId: string | null;
  bodyCount: number;
  orbitCount: number;
  visualScaleMode: string;
  cameraTarget: THREE.Vector3;
  rendererTriangles: number;
  rendererDrawCalls: number;
  nBodyStatus: string;
}
