import type { ValidationStatus } from "./validationSummary";
import { normalizeReferenceUnit, type SupportedReferenceUnit } from "./referenceUnitNormalizer";

export const ALLOWED_REFERENCE_SOURCE_TYPES = [
  "local-demo",
  "manual-curated",
  "horizons-export",
  "spice-derived"
] as const;

export const CONVERTIBLE_REFERENCE_COORDINATE_SYSTEMS = [
  "heliocentric-app-j2000",
  "heliocentric-ecliptic-j2000"
] as const;

export const DEFAULT_ALLOWED_REFERENCE_BODY_IDS = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "moon",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune"
] as const;

export const DEFAULT_ALLOWED_REFERENCE_BODY_NAMES = [
  "Sun",
  "Mercury",
  "Venus",
  "Earth",
  "Moon",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune"
] as const;

export type ReferenceSourceType = (typeof ALLOWED_REFERENCE_SOURCE_TYPES)[number];
export type ConvertibleReferenceCoordinateSystem = (typeof CONVERTIBLE_REFERENCE_COORDINATE_SYSTEMS)[number];

export interface ReferenceDataContractMetadata {
  contractVersion: string;
  datasetId: string;
  sourceName: string;
  sourceType: string;
  sourceUrl?: string;
  sourceNote?: string;
  generatedTimestamp: string;
  importedTimestamp?: string;
  accuracyNote: string;
  licenseNote: string;
  coordinateSystem: string;
  origin: string;
  referenceFrame: string;
  unitSystem: string;
  timeScale: string;
  epoch?: string;
  simulationDate?: string;
  julianDate?: number;
}

export interface ReferenceDataValidationMetadata {
  expectedCoordinateUnit: string;
  expectedDistanceUnit: string;
  expectedTimeFormat: string;
  allowedBodyNames: string[];
  allowedCoordinateSystems: string[];
  allowedSourceTypes: string[];
}

export interface ReferenceDataBodyRow {
  bodyId?: string;
  bodyName: string;
  x: number;
  y: number;
  z: number;
  vx?: number;
  vy?: number;
  vz?: number;
  distanceFromSun?: number;
  moonEarthDistance?: number;
  unit: string;
  tolerance: number;
  confidence?: string;
  note: string;
}

export interface ReferenceDataContract {
  metadata: ReferenceDataContractMetadata;
  validationMetadata: ReferenceDataValidationMetadata;
  bodyRows: ReferenceDataBodyRow[];
}

export interface ReferenceDataRowDiagnostic {
  rowIndex: number;
  bodyId: string;
  bodyName: string;
  status: ValidationStatus;
  warnings: string[];
  errors: string[];
  messages: string[];
  canonicalUnit?: SupportedReferenceUnit;
}

export interface ReferenceDataContractValidationResult {
  status: ValidationStatus;
  contract: ReferenceDataContract;
  metadataWarnings: string[];
  metadataErrors: string[];
  rowDiagnostics: ReferenceDataRowDiagnostic[];
  totalRows: number;
  acceptedRows: number;
  warningCount: number;
  errorCount: number;
  messages: string[];
  canConvert: boolean;
}

export interface ValidateReferenceDataContractOptions {
  knownBodyIds?: Iterable<string>;
  knownBodyNames?: Iterable<string>;
}

const DEFAULT_VALIDATION_METADATA: ReferenceDataValidationMetadata = {
  expectedCoordinateUnit: "m",
  expectedDistanceUnit: "m",
  expectedTimeFormat: "ISO-8601 UTC",
  allowedBodyNames: [...DEFAULT_ALLOWED_REFERENCE_BODY_NAMES],
  allowedCoordinateSystems: [...CONVERTIBLE_REFERENCE_COORDINATE_SYSTEMS],
  allowedSourceTypes: [...ALLOWED_REFERENCE_SOURCE_TYPES]
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeString(value: unknown, fallback = "N/A"): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : fallback;
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

function readValidationMetadata(raw: unknown): ReferenceDataValidationMetadata {
  if (!isRecord(raw)) {
    return DEFAULT_VALIDATION_METADATA;
  }

  return {
    expectedCoordinateUnit: safeString(raw.expectedCoordinateUnit, DEFAULT_VALIDATION_METADATA.expectedCoordinateUnit),
    expectedDistanceUnit: safeString(raw.expectedDistanceUnit, DEFAULT_VALIDATION_METADATA.expectedDistanceUnit),
    expectedTimeFormat: safeString(raw.expectedTimeFormat, DEFAULT_VALIDATION_METADATA.expectedTimeFormat),
    allowedBodyNames: stringArray(raw.allowedBodyNames, DEFAULT_VALIDATION_METADATA.allowedBodyNames),
    allowedCoordinateSystems: stringArray(
      raw.allowedCoordinateSystems,
      DEFAULT_VALIDATION_METADATA.allowedCoordinateSystems
    ),
    allowedSourceTypes: stringArray(raw.allowedSourceTypes, DEFAULT_VALIDATION_METADATA.allowedSourceTypes)
  };
}

function validateMetadata(
  raw: Record<string, unknown>,
  validationMetadata: ReferenceDataValidationMetadata
): {
  metadata: ReferenceDataContractMetadata;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const metadata: ReferenceDataContractMetadata = {
    contractVersion: safeString(raw.contractVersion),
    datasetId: safeString(raw.datasetId),
    sourceName: safeString(raw.sourceName),
    sourceType: safeString(raw.sourceType),
    sourceUrl: optionalString(raw.sourceUrl),
    sourceNote: optionalString(raw.sourceNote),
    generatedTimestamp: safeString(raw.generatedTimestamp),
    importedTimestamp: optionalString(raw.importedTimestamp),
    accuracyNote: safeString(raw.accuracyNote),
    licenseNote: safeString(raw.licenseNote),
    coordinateSystem: safeString(raw.coordinateSystem),
    origin: safeString(raw.origin),
    referenceFrame: safeString(raw.referenceFrame),
    unitSystem: safeString(raw.unitSystem),
    timeScale: safeString(raw.timeScale),
    epoch: optionalString(raw.epoch),
    simulationDate: optionalString(raw.simulationDate),
    julianDate: finiteNumber(raw.julianDate)
  };

  const requiredFields: Array<keyof ReferenceDataContractMetadata> = [
    "contractVersion",
    "datasetId",
    "sourceName",
    "sourceType",
    "generatedTimestamp",
    "accuracyNote",
    "licenseNote",
    "coordinateSystem",
    "origin",
    "referenceFrame",
    "unitSystem",
    "timeScale"
  ];

  for (const field of requiredFields) {
    if (metadata[field] === "N/A") {
      errors.push(`Missing required metadata field: ${field}.`);
    }
  }

  if (!metadata.sourceUrl && !metadata.sourceNote) {
    errors.push("Reference data must include sourceUrl or sourceNote metadata.");
  }

  if (!metadata.simulationDate && !metadata.epoch) {
    errors.push("Reference data must include simulationDate or epoch metadata.");
  }

  if (raw.julianDate !== undefined && metadata.julianDate === undefined) {
    errors.push("Julian Date metadata must be a finite number when provided.");
  }

  if (!validationMetadata.allowedSourceTypes.includes(metadata.sourceType)) {
    errors.push(`Unsupported source type: ${metadata.sourceType}.`);
  }

  if (!validationMetadata.allowedCoordinateSystems.includes(metadata.coordinateSystem)) {
    errors.push(`Unsupported coordinate system: ${metadata.coordinateSystem}.`);
  }

  if (!CONVERTIBLE_REFERENCE_COORDINATE_SYSTEMS.includes(metadata.coordinateSystem as ConvertibleReferenceCoordinateSystem)) {
    errors.push(`Coordinate system cannot be converted by V0.7: ${metadata.coordinateSystem}.`);
  }

  if (!ALLOWED_REFERENCE_SOURCE_TYPES.includes(metadata.sourceType as ReferenceSourceType)) {
    errors.push(`Source type cannot be converted by V0.7: ${metadata.sourceType}.`);
  }

  if (metadata.origin.toLowerCase() !== "sun") {
    warnings.push(`Reference origin is ${metadata.origin}; V0.7 expects Sun-centered fixture conversion.`);
  }

  return { metadata, warnings, errors };
}

function validateOptionalFinite(value: unknown, label: string, warnings: string[]): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = finiteNumber(value);
  if (parsed === undefined) {
    warnings.push(`${label} should be a finite number when provided.`);
  }
  return parsed;
}

function validateRequiredFinite(value: unknown, label: string, errors: string[]): number {
  const parsed = finiteNumber(value);
  if (parsed === undefined) {
    errors.push(`${label} must be a finite number.`);
    return Number.NaN;
  }
  return parsed;
}

function validateRow(
  rawRow: unknown,
  rowIndex: number,
  validationMetadata: ReferenceDataValidationMetadata,
  knownBodyIds: Set<string>,
  knownBodyNames: Set<string>
): { row: ReferenceDataBodyRow; diagnostic: ReferenceDataRowDiagnostic } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!isRecord(rawRow)) {
    const diagnostic = {
      rowIndex,
      bodyId: `malformed-${rowIndex + 1}`,
      bodyName: "Malformed row",
      status: "ERROR" as const,
      warnings,
      errors: ["Reference data row must be an object."],
      messages: ["Reference data row must be an object."]
    };

    return {
      row: {
        bodyId: diagnostic.bodyId,
        bodyName: diagnostic.bodyName,
        x: Number.NaN,
        y: Number.NaN,
        z: Number.NaN,
        unit: "N/A",
        tolerance: Number.NaN,
        note: "N/A"
      },
      diagnostic
    };
  }

  const bodyId = optionalString(rawRow.bodyId);
  const bodyName = safeString(rawRow.bodyName, bodyId ?? `unknown-${rowIndex + 1}`);
  const canonicalUnit = normalizeReferenceUnit(rawRow.unit);
  const row: ReferenceDataBodyRow = {
    bodyId,
    bodyName,
    x: validateRequiredFinite(rawRow.x, "x", errors),
    y: validateRequiredFinite(rawRow.y, "y", errors),
    z: validateRequiredFinite(rawRow.z, "z", errors),
    vx: validateOptionalFinite(rawRow.vx, "vx", warnings),
    vy: validateOptionalFinite(rawRow.vy, "vy", warnings),
    vz: validateOptionalFinite(rawRow.vz, "vz", warnings),
    distanceFromSun: validateOptionalFinite(rawRow.distanceFromSun, "distanceFromSun", warnings),
    moonEarthDistance: validateOptionalFinite(rawRow.moonEarthDistance, "moonEarthDistance", warnings),
    unit: safeString(rawRow.unit),
    tolerance: validateRequiredFinite(rawRow.tolerance, "tolerance", errors),
    confidence: optionalString(rawRow.confidence),
    note: safeString(rawRow.note)
  };

  if (!bodyId && bodyName === `unknown-${rowIndex + 1}`) {
    errors.push("Reference data row must include bodyId or bodyName.");
  }

  if (!canonicalUnit) {
    errors.push(`Unsupported reference unit: ${String(rawRow.unit ?? "N/A")}.`);
  } else if (canonicalUnit !== normalizeReferenceUnit(validationMetadata.expectedCoordinateUnit)) {
    warnings.push(
      `Reference row unit ${row.unit} differs from expected coordinate unit ${validationMetadata.expectedCoordinateUnit}; it will be normalized when safe.`
    );
  }

  if (!Number.isFinite(row.tolerance) || row.tolerance <= 0) {
    errors.push("tolerance must be a positive finite number.");
  }

  const normalizedBodyId = bodyId?.toLowerCase();
  const normalizedBodyName = bodyName.toLowerCase();
  const knownById = normalizedBodyId ? knownBodyIds.has(normalizedBodyId) : false;
  const knownByName = knownBodyNames.has(normalizedBodyName);
  if (!knownById && !knownByName) {
    warnings.push(`Unknown reference body: ${bodyId ?? bodyName}.`);
  }

  const status = combineStatus([
    errors.length > 0 ? "ERROR" : "PASS",
    warnings.length > 0 ? "WARN" : "PASS"
  ]);
  const messages = [...errors, ...warnings];

  return {
    row,
    diagnostic: {
      rowIndex,
      bodyId: bodyId ?? normalizedBodyName,
      bodyName,
      status,
      warnings,
      errors,
      messages,
      canonicalUnit
    }
  };
}

export function validateReferenceDataContract(
  raw: unknown,
  options: ValidateReferenceDataContractOptions = {}
): ReferenceDataContractValidationResult {
  if (!isRecord(raw)) {
    const metadata = {
      contractVersion: "N/A",
      datasetId: "N/A",
      sourceName: "N/A",
      sourceType: "N/A",
      generatedTimestamp: "N/A",
      accuracyNote: "N/A",
      licenseNote: "N/A",
      coordinateSystem: "N/A",
      origin: "N/A",
      referenceFrame: "N/A",
      unitSystem: "N/A",
      timeScale: "N/A"
    };
    return {
      status: "ERROR",
      contract: {
        metadata,
        validationMetadata: DEFAULT_VALIDATION_METADATA,
        bodyRows: []
      },
      metadataWarnings: [],
      metadataErrors: ["Reference data contract root must be an object."],
      rowDiagnostics: [],
      totalRows: 0,
      acceptedRows: 0,
      warningCount: 0,
      errorCount: 1,
      messages: ["Reference data contract root must be an object."],
      canConvert: false
    };
  }

  const validationMetadata = readValidationMetadata(raw.validationMetadata);
  const knownBodyIds = new Set([
    ...DEFAULT_ALLOWED_REFERENCE_BODY_IDS.map((bodyId) => bodyId.toLowerCase()),
    ...(options.knownBodyIds ? [...options.knownBodyIds].map((bodyId) => bodyId.toLowerCase()) : [])
  ]);
  const knownBodyNames = new Set([
    ...validationMetadata.allowedBodyNames.map((bodyName) => bodyName.toLowerCase()),
    ...(options.knownBodyNames ? [...options.knownBodyNames].map((bodyName) => bodyName.toLowerCase()) : [])
  ]);
  const metadataResult = validateMetadata(raw, validationMetadata);
  const rawRows = Array.isArray(raw.bodyRows) ? raw.bodyRows : [];
  const rowErrors = Array.isArray(raw.bodyRows) ? [] : ["Reference data bodyRows must be an array."];
  const parsedRows = rawRows.map((row, index) =>
    validateRow(row, index, validationMetadata, knownBodyIds, knownBodyNames)
  );
  const rowDiagnostics = parsedRows.map((item) => item.diagnostic);
  const bodyRows = parsedRows.map((item) => item.row);
  const metadataErrors = [...metadataResult.errors, ...rowErrors];
  const metadataWarnings = metadataResult.warnings;
  const rowWarningCount = rowDiagnostics.reduce((total, row) => total + row.warnings.length, 0);
  const rowErrorCount = rowDiagnostics.reduce((total, row) => total + row.errors.length, 0);
  const warningCount = metadataWarnings.length + rowWarningCount;
  const errorCount = metadataErrors.length + rowErrorCount;
  const status = combineStatus([
    errorCount > 0 ? "ERROR" : "PASS",
    warningCount > 0 ? "WARN" : "PASS"
  ]);
  const messages = [
    ...metadataErrors,
    ...metadataWarnings,
    ...rowDiagnostics.flatMap((diagnostic) => diagnostic.messages)
  ];

  return {
    status,
    contract: {
      metadata: metadataResult.metadata,
      validationMetadata,
      bodyRows
    },
    metadataWarnings,
    metadataErrors,
    rowDiagnostics,
    totalRows: bodyRows.length,
    acceptedRows: rowDiagnostics.filter((diagnostic) => diagnostic.status !== "ERROR").length,
    warningCount,
    errorCount,
    messages,
    canConvert: metadataErrors.length === 0
  };
}
