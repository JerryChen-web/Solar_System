import { J2000_EPOCH_ISO } from "../config/constants";

export const J2000_JULIAN_DATE = 2451545.0;
export const UNIX_EPOCH_JULIAN_DATE = 2440587.5;
export const MILLISECONDS_PER_DAY = 86_400_000;

export type DateParseResult =
  | { ok: true; date: Date; isoDate: string }
  | { ok: false; error: string };

export function dateToJulianDate(date: Date): number {
  const time = date.getTime();
  if (!Number.isFinite(time)) {
    throw new RangeError("Cannot convert an invalid Date to Julian Date.");
  }
  return time / MILLISECONDS_PER_DAY + UNIX_EPOCH_JULIAN_DATE;
}

export function dateToSecondsSinceJ2000(date: Date): number {
  const time = date.getTime();
  if (!Number.isFinite(time)) {
    throw new RangeError("Cannot convert an invalid Date to seconds since J2000.");
  }
  return (time - new Date(J2000_EPOCH_ISO).getTime()) / 1000;
}

export function secondsSinceJ2000ToJulianDate(secondsSinceEpoch: number): number {
  if (!Number.isFinite(secondsSinceEpoch)) {
    throw new RangeError("secondsSinceEpoch must be finite.");
  }
  return J2000_JULIAN_DATE + secondsSinceEpoch / 86_400;
}

export function parseIsoDateOnly(input: string): DateParseResult {
  const trimmed = input.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return { ok: false, error: "Use YYYY-MM-DD format." };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { ok: false, error: "Date is not valid." };
  }

  return {
    ok: true,
    date,
    isoDate: `${match[1]}-${match[2]}-${match[3]}`
  };
}

