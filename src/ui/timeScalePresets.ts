import { DAY_SECONDS, JULIAN_YEAR_SECONDS } from "../config/constants";

export interface TimeScalePreset {
  id: string;
  label: string;
  secondsPerRealSecond: number;
}

export const timeScalePresets: TimeScalePreset[] = [
  { id: "pause", label: "Pause", secondsPerRealSecond: 0 },
  { id: "hour", label: "1 hour/s", secondsPerRealSecond: 3_600 },
  { id: "day", label: "1 day/s", secondsPerRealSecond: DAY_SECONDS },
  { id: "ten-days", label: "10 days/s", secondsPerRealSecond: DAY_SECONDS * 10 },
  { id: "thirty-days", label: "30 days/s", secondsPerRealSecond: DAY_SECONDS * 30 },
  { id: "year", label: "1 year/s", secondsPerRealSecond: JULIAN_YEAR_SECONDS }
];

export function findPresetBySeconds(secondsPerRealSecond: number): TimeScalePreset | undefined {
  return timeScalePresets.find((preset) => preset.secondsPerRealSecond === secondsPerRealSecond);
}

