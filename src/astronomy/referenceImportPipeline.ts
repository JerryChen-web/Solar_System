import {
  validateReferenceDataContract,
  type ReferenceDataContractValidationResult,
  type ReferenceDataRowDiagnostic,
  type ValidateReferenceDataContractOptions
} from "./referenceDataContract";
import {
  parseReferenceFixture,
  type ReferenceFixture
} from "./referenceFixture";
import { toMeters } from "./referenceUnitNormalizer";

export interface ReferenceImportPipelineResult {
  validation: ReferenceDataContractValidationResult;
  convertedFixture?: ReferenceFixture;
  convertedRows: number;
  conversionMessages: string[];
}

export interface ImportReferenceDataOptions extends ValidateReferenceDataContractOptions {
  fixtureVersion?: string;
}

function convertedBodyId(diagnostic: ReferenceDataRowDiagnostic): string {
  return diagnostic.bodyId.trim().toLowerCase().replace(/\s+/g, "-");
}

function convertValueToMeters(
  value: number | undefined,
  unit: string,
  label: string,
  messages: string[]
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const converted = toMeters(value, unit);
  if (!converted.ok) {
    messages.push(`${label}: ${converted.message}`);
    return undefined;
  }
  return converted.value;
}

function buildRawFixture(
  validation: ReferenceDataContractValidationResult,
  options: ImportReferenceDataOptions
): Record<string, unknown> | undefined {
  if (!validation.canConvert) {
    return undefined;
  }

  const metadata = validation.contract.metadata;
  const bodyReferences = validation.contract.bodyRows
    .map((row, index): Record<string, unknown> | undefined => {
      const diagnostic = validation.rowDiagnostics[index];
      if (!diagnostic || diagnostic.status === "ERROR") {
        return undefined;
      }

      const messages: string[] = [];
      const expectedX = convertValueToMeters(row.x, row.unit, "x", messages);
      const expectedY = convertValueToMeters(row.y, row.unit, "y", messages);
      const expectedZ = convertValueToMeters(row.z, row.unit, "z", messages);
      const expectedDistanceFromSun = convertValueToMeters(
        row.distanceFromSun,
        row.unit,
        "distanceFromSun",
        messages
      );
      const expectedMoonEarthDistance = convertValueToMeters(
        row.moonEarthDistance,
        row.unit,
        "moonEarthDistance",
        messages
      );
      const toleranceMeters = convertValueToMeters(row.tolerance, row.unit, "tolerance", messages);

      if (
        messages.length > 0 ||
        expectedX === undefined ||
        expectedY === undefined ||
        expectedZ === undefined ||
        toleranceMeters === undefined
      ) {
        return undefined;
      }

      return {
        bodyId: row.bodyId ?? convertedBodyId(diagnostic),
        bodyName: row.bodyName,
        expectedX,
        expectedY,
        expectedZ,
        expectedDistanceFromSun,
        expectedMoonEarthDistance,
        unit: "m",
        toleranceMeters,
        note: row.note
      };
    })
    .filter((row): row is Record<string, unknown> => Boolean(row));

  return {
    fixtureVersion: options.fixtureVersion ?? metadata.contractVersion,
    sourceLabel: metadata.sourceName,
    sourceType: metadata.sourceType,
    accuracyNote: metadata.accuracyNote,
    fixtureTimestamp: metadata.importedTimestamp ?? metadata.generatedTimestamp,
    simulationDate: metadata.simulationDate ?? metadata.epoch ?? "N/A",
    julianDate: metadata.julianDate,
    coordinateSystemNote: `${metadata.coordinateSystem}; origin ${metadata.origin}; frame ${metadata.referenceFrame}; time scale ${metadata.timeScale}.`,
    unitNote: "Converted to meters by the V0.7 local reference import pipeline.",
    bodyReferences
  };
}

export function importReferenceData(
  raw: unknown,
  options: ImportReferenceDataOptions = {}
): ReferenceImportPipelineResult {
  const normalizedOptions: ImportReferenceDataOptions = {
    ...options,
    knownBodyIds: options.knownBodyIds ? [...options.knownBodyIds] : undefined,
    knownBodyNames: options.knownBodyNames ? [...options.knownBodyNames] : undefined
  };
  const validation = validateReferenceDataContract(raw, normalizedOptions);
  const conversionMessages: string[] = [];
  const rawFixture = buildRawFixture(validation, normalizedOptions);
  const convertedFixture = rawFixture
    ? parseReferenceFixture(rawFixture, { knownBodyIds: normalizedOptions.knownBodyIds })
    : undefined;

  if (!rawFixture) {
    conversionMessages.push("Import data was not converted because contract metadata or rows contain errors.");
  } else if (!convertedFixture || convertedFixture.status === "ERROR") {
    conversionMessages.push("Converted fixture contains row-level errors.");
  }

  return {
    validation,
    convertedFixture,
    convertedRows: convertedFixture?.rows.length ?? 0,
    conversionMessages,
  };
}
