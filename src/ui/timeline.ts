import { DAY_SECONDS, JULIAN_YEAR_SECONDS } from "../config/constants";

export function formatTimeScale(secondsPerRealSecond: number): string {
  if (secondsPerRealSecond === 0) {
    return "paused";
  }
  if (secondsPerRealSecond < DAY_SECONDS) {
    return `${Math.round(secondsPerRealSecond)} s/s`;
  }
  if (secondsPerRealSecond < JULIAN_YEAR_SECONDS) {
    return `${(secondsPerRealSecond / DAY_SECONDS).toFixed(1)} days/s`;
  }
  return `${(secondsPerRealSecond / JULIAN_YEAR_SECONDS).toFixed(2)} years/s`;
}

