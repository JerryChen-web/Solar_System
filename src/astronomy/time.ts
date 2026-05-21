import { J2000_EPOCH_ISO } from "../config/constants";

export function simulationDateFromSeconds(secondsSinceEpoch: number): Date {
  return new Date(new Date(J2000_EPOCH_ISO).getTime() + secondsSinceEpoch * 1000);
}

export function formatSimulationDate(secondsSinceEpoch: number): string {
  return simulationDateFromSeconds(secondsSinceEpoch).toISOString().replace(".000Z", "Z");
}

