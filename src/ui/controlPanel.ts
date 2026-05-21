import type { SimulationConfig } from "../types/config";
import { DAY_SECONDS } from "../config/constants";
import { formatTimeScale } from "./timeline";
import type { SimulationMode } from "./modeSwitcher";
import { modeLabels } from "./modeSwitcher";

interface ControlPanelOptions {
  simulationConfig: SimulationConfig;
  onTimeScaleChange: (secondsPerRealSecond: number) => void;
  onPauseChange: (paused: boolean) => void;
  onReset: () => void;
  onModeChange: (mode: SimulationMode) => void;
}

export class ControlPanel {
  private readonly dateElement: HTMLElement;
  private readonly speedValueElement: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;
  private paused = false;

  constructor(container: HTMLElement, options: ControlPanelOptions) {
    const panel = document.createElement("section");
    panel.className = "panel controls";

    const title = document.createElement("h1");
    title.textContent = "Solar_System";

    this.dateElement = document.createElement("div");
    this.dateElement.className = "simulation-date";

    const speedLabel = document.createElement("label");
    speedLabel.className = "control-row";
    speedLabel.textContent = "Time";
    const speedInput = document.createElement("input");
    speedInput.type = "range";
    speedInput.min = "0";
    speedInput.max = "365";
    speedInput.step = "1";
    speedInput.value = String(
      Math.round(options.simulationConfig.time.default_time_scale_seconds_per_real_second / DAY_SECONDS)
    );
    this.speedValueElement = document.createElement("span");
    this.speedValueElement.className = "control-value";
    speedLabel.append(speedInput, this.speedValueElement);

    const modeRow = document.createElement("label");
    modeRow.className = "control-row";
    modeRow.textContent = "Mode";
    const modeSelect = document.createElement("select");
    for (const mode of options.simulationConfig.available_modes as SimulationMode[]) {
      const option = document.createElement("option");
      option.value = mode;
      option.textContent = modeLabels[mode];
      modeSelect.appendChild(option);
    }
    modeSelect.value = options.simulationConfig.default_mode;
    modeRow.appendChild(modeSelect);

    const buttonRow = document.createElement("div");
    buttonRow.className = "button-row";
    this.pauseButton = document.createElement("button");
    this.pauseButton.type = "button";
    this.pauseButton.textContent = "Pause";
    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Reset";
    buttonRow.append(this.pauseButton, resetButton);

    const modeNote = document.createElement("p");
    modeNote.className = "mode-note";
    modeNote.textContent = "N-body is scaffolded for V2; V0.1 runs the Kepler path.";

    panel.append(title, this.dateElement, speedLabel, modeRow, buttonRow, modeNote);
    container.appendChild(panel);

    const emitSpeed = (): void => {
      const seconds = Number(speedInput.value) * DAY_SECONDS;
      this.speedValueElement.textContent = formatTimeScale(seconds);
      options.onTimeScaleChange(seconds);
    };

    speedInput.addEventListener("input", emitSpeed);
    emitSpeed();

    this.pauseButton.addEventListener("click", () => {
      this.paused = !this.paused;
      this.pauseButton.textContent = this.paused ? "Play" : "Pause";
      options.onPauseChange(this.paused);
    });

    resetButton.addEventListener("click", options.onReset);
    modeSelect.addEventListener("change", () => {
      options.onModeChange(modeSelect.value as SimulationMode);
    });
  }

  setSimulationDate(dateText: string): void {
    this.dateElement.textContent = dateText;
  }
}

