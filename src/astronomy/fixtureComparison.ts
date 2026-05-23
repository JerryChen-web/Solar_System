import * as THREE from "three";
import type { ReferenceFixture, ReferenceFixtureRow } from "./referenceFixture";
import type { ValidationStatus } from "./validationSummary";

export interface FixtureComparisonRow {
  bodyId: string;
  bodyName: string;
  status: ValidationStatus;
  dxMeters?: number;
  dyMeters?: number;
  dzMeters?: number;
  positionDeltaMeters?: number;
  radialDistanceDeltaMeters?: number;
  percentageError?: number;
  moonEarthDistanceDeltaMeters?: number;
  toleranceMeters: number;
  messages: string[];
}

export interface FixtureComparisonSummary {
  fixture: ReferenceFixture;
  rows: FixtureComparisonRow[];
  comparedCount: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  maxPositionDeltaMeters?: number;
  averagePositionDeltaMeters?: number;
  maxPercentageError?: number;
}

export interface CompareFixtureInput {
  fixture: ReferenceFixture;
  positionsMeters: Map<string, THREE.Vector3>;
}

function isFiniteVector(vector: THREE.Vector3 | undefined): vector is THREE.Vector3 {
  return Boolean(
    vector &&
      Number.isFinite(vector.x) &&
      Number.isFinite(vector.y) &&
      Number.isFinite(vector.z)
  );
}

function combineStatus(statuses: ValidationStatus[]): ValidationStatus {
  if (statuses.includes("ERROR")) {
    return "ERROR";
  }
  if (statuses.includes("WARN")) {
    return "WARN";
  }
  return "PASS";
}

function safePercentageError(positionDeltaMeters: number, referenceMagnitudeMeters: number): number | undefined {
  if (!Number.isFinite(positionDeltaMeters) || !Number.isFinite(referenceMagnitudeMeters) || referenceMagnitudeMeters <= 0) {
    return undefined;
  }
  return (positionDeltaMeters / referenceMagnitudeMeters) * 100;
}

function compareRow(row: ReferenceFixtureRow, positionsMeters: Map<string, THREE.Vector3>): FixtureComparisonRow {
  const messages = [...row.messages];
  if (row.status === "ERROR") {
    return {
      bodyId: row.bodyId,
      bodyName: row.bodyName,
      status: "ERROR",
      toleranceMeters: row.toleranceMeters,
      messages
    };
  }

  const simulated = positionsMeters.get(row.bodyId);
  if (!isFiniteVector(simulated)) {
    messages.push("Simulated body position is missing or not finite.");
    return {
      bodyId: row.bodyId,
      bodyName: row.bodyName,
      status: "ERROR",
      toleranceMeters: row.toleranceMeters,
      messages
    };
  }

  if (!row.expectedPositionMeters) {
    messages.push("Fixture row has no finite expected position.");
    return {
      bodyId: row.bodyId,
      bodyName: row.bodyName,
      status: "ERROR",
      toleranceMeters: row.toleranceMeters,
      messages
    };
  }

  const dxMeters = simulated.x - row.expectedPositionMeters.x;
  const dyMeters = simulated.y - row.expectedPositionMeters.y;
  const dzMeters = simulated.z - row.expectedPositionMeters.z;
  const positionDeltaMeters = Math.hypot(dxMeters, dyMeters, dzMeters);
  const simulatedDistanceFromSun = simulated.length();
  const expectedDistanceFromSun =
    row.expectedDistanceFromSunMeters ?? Math.hypot(
      row.expectedPositionMeters.x,
      row.expectedPositionMeters.y,
      row.expectedPositionMeters.z
    );
  const radialDistanceDeltaMeters = Number.isFinite(expectedDistanceFromSun)
    ? Math.abs(simulatedDistanceFromSun - expectedDistanceFromSun)
    : undefined;
  const percentageError = safePercentageError(positionDeltaMeters, expectedDistanceFromSun);

  let moonEarthDistanceDeltaMeters: number | undefined;
  if (row.expectedMoonEarthDistanceMeters !== undefined) {
    const earth = positionsMeters.get("earth");
    const moon = positionsMeters.get("moon");
    if (isFiniteVector(earth) && isFiniteVector(moon)) {
      moonEarthDistanceDeltaMeters = Math.abs(moon.distanceTo(earth) - row.expectedMoonEarthDistanceMeters);
    } else {
      messages.push("Moon-Earth fixture comparison requires finite Earth and Moon positions.");
    }
  }

  const deltaChecks = [
    positionDeltaMeters,
    radialDistanceDeltaMeters,
    moonEarthDistanceDeltaMeters
  ].filter((value): value is number => value !== undefined);
  const hasInvalidDelta = deltaChecks.some((value) => !Number.isFinite(value));
  const exceedsTolerance = deltaChecks.some((value) => value > row.toleranceMeters);

  if (row.bodyId === "sun") {
    messages.push("Sun is compared as the local reference body.");
  }
  if (exceedsTolerance) {
    messages.push("Fixture delta exceeds the row tolerance.");
  }

  const status = combineStatus([
    row.status,
    hasInvalidDelta ? "ERROR" : "PASS",
    messages.some((message) => message.includes("requires finite")) ? "ERROR" : "PASS",
    exceedsTolerance ? "WARN" : "PASS"
  ]);

  return {
    bodyId: row.bodyId,
    bodyName: row.bodyName,
    status,
    dxMeters,
    dyMeters,
    dzMeters,
    positionDeltaMeters,
    radialDistanceDeltaMeters,
    percentageError,
    moonEarthDistanceDeltaMeters,
    toleranceMeters: row.toleranceMeters,
    messages
  };
}

export function compareFixtureToPositions(input: CompareFixtureInput): FixtureComparisonSummary {
  const rows = input.fixture.rows.map((row) => compareRow(row, input.positionsMeters));
  const finitePositionDeltas = rows
    .map((row) => row.positionDeltaMeters)
    .filter((value): value is number => Number.isFinite(value));
  const finitePercentageErrors = rows
    .map((row) => row.percentageError)
    .filter((value): value is number => Number.isFinite(value));

  return {
    fixture: input.fixture,
    rows,
    comparedCount: rows.length,
    passedCount: rows.filter((row) => row.status === "PASS").length,
    warningCount: rows.filter((row) => row.status === "WARN").length,
    errorCount: rows.filter((row) => row.status === "ERROR").length,
    maxPositionDeltaMeters:
      finitePositionDeltas.length > 0 ? Math.max(...finitePositionDeltas) : undefined,
    averagePositionDeltaMeters:
      finitePositionDeltas.length > 0
        ? finitePositionDeltas.reduce((total, value) => total + value, 0) / finitePositionDeltas.length
        : undefined,
    maxPercentageError:
      finitePercentageErrors.length > 0 ? Math.max(...finitePercentageErrors) : undefined
  };
}
