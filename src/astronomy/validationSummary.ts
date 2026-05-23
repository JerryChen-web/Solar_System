import * as THREE from "three";
import { AU_METERS, GRAVITATIONAL_CONSTANT } from "../config/constants";
import type { BodyRecord } from "../types/body";
import type { OrbitalElementRecord } from "../types/orbit";
import {
  localReferenceProvider,
  MOON_EARTH_REFERENCE_RANGE,
  SUN_ORIGIN_TOLERANCE_METERS
} from "./localReferenceProvider";
import type {
  ReferenceLookupContext,
  ReferenceLookupResult,
  ReferenceProvider,
  ValidationReferenceRange
} from "./referenceAdapter";

export type ValidationStatus = "PASS" | "WARN" | "ERROR";

export type DistanceReferenceRange = ValidationReferenceRange;

export interface ContinuityHistory {
  positionsMeters: Map<string, THREE.Vector3>;
  secondsSinceEpoch: number;
}

export interface BodyValidationRow {
  bodyId: string;
  bodyName: string;
  status: ValidationStatus;
  finitePosition: ValidationStatus;
  distanceFromSunMeters?: number;
  rangeStatus: ValidationStatus;
  continuityStatus: ValidationStatus;
  warningCount: number;
  errorCount: number;
  messages: string[];
}

export interface PositionTableRow {
  bodyId: string;
  bodyName: string;
  positionMeters?: THREE.Vector3;
  distanceFromSunMeters?: number;
  status: ValidationStatus;
}

export interface MoonDistanceCheck {
  status: ValidationStatus;
  distanceMeters?: number;
  warningCount: number;
  errorCount: number;
  messages: string[];
}

export interface ValidationSummary {
  rows: BodyValidationRow[];
  positionRows: PositionTableRow[];
  moonDistance: MoonDistanceCheck;
  checkedCount: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
}

export interface BuildValidationSummaryInput {
  bodies: BodyRecord[];
  bodyById: Map<string, BodyRecord>;
  orbitalElementByBodyId: Map<string, OrbitalElementRecord>;
  positionsMeters: Map<string, THREE.Vector3>;
  secondsSinceEpoch: number;
  continuityHistory?: ContinuityHistory | null;
  referenceProvider?: ReferenceProvider;
}

export const VALIDATION_REFERENCE_RANGES: Record<string, DistanceReferenceRange> = {
  sun: {
    minMeters: 0,
    maxMeters: SUN_ORIGIN_TOLERANCE_METERS,
    warnToleranceMeters: 0
  },
  moon: MOON_EARTH_REFERENCE_RANGE
};

function combineStatus(statuses: ValidationStatus[]): ValidationStatus {
  if (statuses.includes("ERROR")) {
    return "ERROR";
  }
  if (statuses.includes("WARN")) {
    return "WARN";
  }
  return "PASS";
}

export function isFinitePosition(position: THREE.Vector3 | undefined): boolean {
  return Boolean(
    position &&
      Number.isFinite(position.x) &&
      Number.isFinite(position.y) &&
      Number.isFinite(position.z)
  );
}

export function clonePositions(positionsMeters: Map<string, THREE.Vector3>): Map<string, THREE.Vector3> {
  return new Map([...positionsMeters.entries()].map(([id, position]) => [id, position.clone()]));
}

function validateRange(distanceMeters: number | undefined, range: DistanceReferenceRange): ValidationStatus {
  if (!Number.isFinite(distanceMeters)) {
    return "ERROR";
  }

  const value = distanceMeters as number;
  if (value < range.minMeters - range.warnToleranceMeters || value > range.maxMeters + range.warnToleranceMeters) {
    return "WARN";
  }
  return "PASS";
}

function validateContinuity(
  body: BodyRecord,
  element: OrbitalElementRecord | undefined,
  currentPosition: THREE.Vector3 | undefined,
  history: ContinuityHistory | null | undefined,
  secondsSinceEpoch: number
): ValidationStatus {
  if (!isFinitePosition(currentPosition)) {
    return "ERROR";
  }
  if (!history) {
    return "PASS";
  }

  const previousPosition = history.positionsMeters.get(body.id);
  if (!isFinitePosition(previousPosition)) {
    return "PASS";
  }

  const elapsedSeconds = Math.abs(secondsSinceEpoch - history.secondsSinceEpoch);
  if (elapsedSeconds === 0) {
    return "PASS";
  }

  const stepDistanceMeters = currentPosition!.distanceTo(previousPosition!);
  if (!Number.isFinite(stepDistanceMeters)) {
    return "ERROR";
  }

  const baseDistance = element ? element.a_au * AU_METERS : Math.max(currentPosition!.length(), AU_METERS);
  const parentMassEstimate = body.parent === "earth" ? 5.97217e24 : 1.9885e30;
  const periodEstimate = element
    ? Math.PI * 2 * Math.sqrt(Math.pow(element.a_au * AU_METERS, 3) / (GRAVITATIONAL_CONSTANT * (parentMassEstimate + body.mass_kg)))
    : 86_400;
  const orbitFraction = Math.min(elapsedSeconds / Math.max(periodEstimate, 1), 1);
  const allowedStep = Math.max(baseDistance * (orbitFraction * 8 + 0.05), 5e7);

  return stepDistanceMeters > allowedStep ? "WARN" : "PASS";
}

function buildSunValidation(
  position: THREE.Vector3 | undefined,
  reference: ReferenceLookupResult
): BodyValidationRow {
  const messages: string[] = [];
  const finitePosition = isFinitePosition(position) ? "PASS" : "ERROR";
  const distanceFromSunMeters = isFinitePosition(position) ? position!.length() : undefined;
  const rangeStatus = reference.available ? validateRange(distanceFromSunMeters, reference.range) : "WARN";

  if (finitePosition === "ERROR") {
    messages.push("Sun position is not finite.");
  }
  if (!reference.available) {
    messages.push(reference.note);
  }
  if (rangeStatus !== "PASS") {
    messages.push("Sun reference position is not near the origin.");
  }

  const status = combineStatus([finitePosition, rangeStatus]);
  return {
    bodyId: "sun",
    bodyName: "Sun",
    status,
    finitePosition,
    distanceFromSunMeters,
    rangeStatus,
    continuityStatus: "PASS",
    warningCount: status === "WARN" ? 1 : 0,
    errorCount: status === "ERROR" ? 1 : 0,
    messages
  };
}

export function validateMoonEarthDistance(
  distanceMeters: number | undefined,
  referenceRange: DistanceReferenceRange = MOON_EARTH_REFERENCE_RANGE
): MoonDistanceCheck {
  const messages: string[] = [];
  if (!Number.isFinite(distanceMeters)) {
    return {
      status: "ERROR",
      distanceMeters,
      warningCount: 0,
      errorCount: 1,
      messages: ["Moon-Earth distance is not finite."]
    };
  }

  const status = validateRange(distanceMeters, referenceRange);
  if (status === "WARN") {
    messages.push("Moon-Earth distance is outside the approximate local reference range.");
  }

  return {
    status,
    distanceMeters,
    warningCount: status === "WARN" ? 1 : 0,
    errorCount: status === "ERROR" ? 1 : 0,
    messages
  };
}

export function buildValidationSummary(input: BuildValidationSummaryInput): ValidationSummary {
  const rows: BodyValidationRow[] = [];
  const referenceProvider = input.referenceProvider ?? localReferenceProvider;
  const referenceContext: ReferenceLookupContext = {
    bodies: input.bodies,
    bodyById: input.bodyById,
    orbitalElementByBodyId: input.orbitalElementByBodyId
  };

  for (const body of input.bodies) {
    const position = input.positionsMeters.get(body.id);
    const reference = referenceProvider.getBodyReference(body.id, referenceContext);
    if (body.id === "sun") {
      rows.push(buildSunValidation(position, reference));
      continue;
    }

    const messages: string[] = [];
    const finitePosition = isFinitePosition(position) ? "PASS" : "ERROR";
    const element = input.orbitalElementByBodyId.get(body.id);
    const sunPosition = input.positionsMeters.get("sun") ?? new THREE.Vector3();
    const earthPosition = input.positionsMeters.get("earth");
    const distanceFromSunMeters = isFinitePosition(position)
      ? position!.distanceTo(sunPosition)
      : undefined;
    const rangeDistance =
      body.id === "moon" && isFinitePosition(position) && isFinitePosition(earthPosition)
        ? position!.distanceTo(earthPosition!)
        : distanceFromSunMeters;
    const rangeStatus = reference.available ? validateRange(rangeDistance, reference.range) : "WARN";
    const continuityStatus = validateContinuity(
      body,
      element,
      position,
      input.continuityHistory,
      input.secondsSinceEpoch
    );

    if (finitePosition === "ERROR") {
      messages.push("Position contains NaN or Infinity.");
    }
    if (!reference.available) {
      messages.push(reference.note);
    }
    if (rangeStatus === "WARN") {
      messages.push("Distance is outside the approximate local reference range.");
    }
    if (continuityStatus === "WARN") {
      messages.push("Position continuity changed faster than expected.");
    }

    const status = combineStatus([finitePosition, rangeStatus, continuityStatus]);
    rows.push({
      bodyId: body.id,
      bodyName: body.name_en,
      status,
      finitePosition,
      distanceFromSunMeters,
      rangeStatus,
      continuityStatus,
      warningCount: [rangeStatus, continuityStatus].filter((item) => item === "WARN").length,
      errorCount: [finitePosition, rangeStatus, continuityStatus].filter((item) => item === "ERROR").length,
      messages
    });
  }

  const earthPosition = input.positionsMeters.get("earth");
  const moonPosition = input.positionsMeters.get("moon");
  const moonReference = referenceProvider.getMoonEarthDistanceReference(referenceContext);
  const moonDistance = validateMoonEarthDistance(
    isFinitePosition(earthPosition) && isFinitePosition(moonPosition)
      ? moonPosition!.distanceTo(earthPosition!)
      : undefined,
    moonReference.available ? moonReference.range : MOON_EARTH_REFERENCE_RANGE
  );

  const positionRows = rows.map<PositionTableRow>((row) => ({
    bodyId: row.bodyId,
    bodyName: row.bodyName,
    positionMeters: input.positionsMeters.get(row.bodyId),
    distanceFromSunMeters: row.distanceFromSunMeters,
    status: row.status
  }));

  const passedCount = rows.filter((row) => row.status === "PASS").length;
  const warningCount = rows.reduce((total, row) => total + row.warningCount, 0) + moonDistance.warningCount;
  const errorCount = rows.reduce((total, row) => total + row.errorCount, 0) + moonDistance.errorCount;

  return {
    rows,
    positionRows,
    moonDistance,
    checkedCount: rows.length,
    passedCount,
    warningCount,
    errorCount
  };
}
