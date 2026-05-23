import type { SimulationConfig } from "../types/config";
import { formatTimeScale } from "./formatters";
import type { SimulationMode } from "./modeSwitcher";
import { modeLabels } from "./modeSwitcher";
import { findPresetBySeconds, timeScalePresets } from "./timeScalePresets";

interface ControlPanelOptions {
  appLabel: string;
  simulationConfig: SimulationConfig;
  onTimeScaleChange: (secondsPerRealSecond: number) => void;
  onPauseChange: (paused: boolean) => void;
  onReset: () => void;
  onModeChange: (mode: SimulationMode) => void;
  onFollow: () => void;
  onStopFollow: () => void;
  onDateJump: (input: string) => { ok: true; isoDate: string } | { ok: false; error: string };
}

export class ControlPanel {
  private readonly dateElement: HTMLElement;
  private readonly fixtureSourceElement: HTMLElement;
  private readonly speedValueElement: HTMLElement;
  private readonly speedInput: HTMLInputElement;
  private readonly presetSelect: HTMLSelectElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly followButton: HTMLButtonElement;
  private readonly followTargetElement: HTMLElement;
  private readonly selectedBodyElement: HTMLElement;
  private readonly dateInput: HTMLInputElement;
  private readonly dateMessage: HTMLElement;
  private pausedByButton = false;

  constructor(container: HTMLElement, private readonly options: ControlPanelOptions) {
    const panel = document.createElement("section");
    panel.className = "panel controls";

    const title = document.createElement("h1");
    title.textContent = options.appLabel;

    this.dateElement = document.createElement("div");
    this.dateElement.className = "simulation-date";

    this.fixtureSourceElement = document.createElement("div");
    this.fixtureSourceElement.className = "fixture-source-line";
    this.fixtureSourceElement.textContent = "Active fixture: loading";

    this.selectedBodyElement = document.createElement("div");
    this.selectedBodyElement.className = "status-line";
    this.selectedBodyElement.textContent = "Selected: none";

    this.followTargetElement = document.createElement("div");
    this.followTargetElement.className = "status-line";
    this.followTargetElement.textContent = "Follow target: none";

    const speedLabel = document.createElement("label");
    speedLabel.className = "control-row";
    speedLabel.textContent = "Time";
    this.speedInput = document.createElement("input");
    this.speedInput.type = "range";
    this.speedInput.min = String(options.simulationConfig.time.min_time_scale);
    this.speedInput.max = String(options.simulationConfig.time.max_time_scale);
    this.speedInput.step = "3600";
    this.speedInput.value = String(options.simulationConfig.time.default_time_scale_seconds_per_real_second);
    this.speedValueElement = document.createElement("span");
    this.speedValueElement.className = "control-value";
    speedLabel.append(this.speedInput, this.speedValueElement);

    const presetRow = document.createElement("label");
    presetRow.className = "control-row";
    presetRow.textContent = "Preset";
    this.presetSelect = document.createElement("select");
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = "Custom slider";
    this.presetSelect.appendChild(customOption);
    for (const preset of timeScalePresets) {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.label;
      this.presetSelect.appendChild(option);
    }
    presetRow.appendChild(this.presetSelect);

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

    const dateRow = document.createElement("label");
    dateRow.className = "control-row";
    dateRow.textContent = "Date";
    this.dateInput = document.createElement("input");
    this.dateInput.type = "text";
    this.dateInput.inputMode = "numeric";
    this.dateInput.placeholder = "YYYY-MM-DD";
    this.dateInput.value = options.simulationConfig.time.epoch.slice(0, 10);
    const jumpButton = document.createElement("button");
    jumpButton.type = "button";
    jumpButton.textContent = "Jump";
    dateRow.append(this.dateInput, jumpButton);

    this.dateMessage = document.createElement("div");
    this.dateMessage.className = "date-message";
    this.dateMessage.textContent = "Date input uses UTC midnight.";

    const buttonRow = document.createElement("div");
    buttonRow.className = "button-row";
    this.pauseButton = document.createElement("button");
    this.pauseButton.type = "button";
    this.pauseButton.textContent = "Pause";
    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Reset";
    buttonRow.append(this.pauseButton, resetButton);

    const followRow = document.createElement("div");
    followRow.className = "button-row";
    this.followButton = document.createElement("button");
    this.followButton.type = "button";
    this.followButton.textContent = "Follow";
    const stopFollowButton = document.createElement("button");
    stopFollowButton.type = "button";
    stopFollowButton.textContent = "Stop Follow";
    followRow.append(this.followButton, stopFollowButton);

    const modeNote = document.createElement("p");
    modeNote.className = "mode-note";
    modeNote.textContent = "N-body is scaffolded for V2; V0.3 runs the Kepler path with local approximate astronomy data.";

    panel.append(
      title,
      this.dateElement,
      this.fixtureSourceElement,
      this.selectedBodyElement,
      this.followTargetElement,
      speedLabel,
      presetRow,
      modeRow,
      dateRow,
      this.dateMessage,
      buttonRow,
      followRow,
      modeNote
    );
    container.appendChild(panel);

    this.speedInput.addEventListener("input", () => {
      this.applyTimeScale(Number(this.speedInput.value), true);
    });

    this.presetSelect.addEventListener("change", () => {
      const preset = timeScalePresets.find((candidate) => candidate.id === this.presetSelect.value);
      if (preset) {
        this.applyTimeScale(preset.secondsPerRealSecond, true);
      }
    });

    this.pauseButton.addEventListener("click", () => {
      this.pausedByButton = !this.pausedByButton;
      this.pauseButton.textContent = this.pausedByButton ? "Play" : "Pause";
      options.onPauseChange(this.pausedByButton);
    });

    resetButton.addEventListener("click", options.onReset);
    modeSelect.addEventListener("change", () => {
      options.onModeChange(modeSelect.value as SimulationMode);
    });
    this.followButton.addEventListener("click", options.onFollow);
    stopFollowButton.addEventListener("click", options.onStopFollow);
    jumpButton.addEventListener("click", () => {
      this.jumpToInputDate();
    });
    this.dateInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        this.jumpToInputDate();
      }
    });

    this.applyTimeScale(options.simulationConfig.time.default_time_scale_seconds_per_real_second, true);
    this.setSelectedBody(null);
    this.setFollowTarget(null);
  }

  setSimulationDate(dateText: string): void {
    this.dateElement.textContent = dateText;
  }

  setFixtureSourceSummary(summary: string): void {
    this.fixtureSourceElement.textContent = summary;
  }

  setSelectedBody(bodyId: string | null): void {
    this.selectedBodyElement.textContent = `Selected: ${bodyId ?? "none"}`;
    this.followButton.disabled = bodyId === null;
    this.followButton.title = bodyId === null ? "Select a body before following." : "";
  }

  setFollowTarget(bodyId: string | null): void {
    this.followTargetElement.textContent = `Follow target: ${bodyId ?? "none"}`;
  }

  setTimeScale(secondsPerRealSecond: number): void {
    this.applyTimeScale(secondsPerRealSecond, false);
  }

  setDateInputValue(isoDate: string): void {
    this.dateInput.value = isoDate;
    this.dateMessage.textContent = "Date input uses UTC midnight.";
    this.dateMessage.classList.remove("is-error");
  }

  private applyTimeScale(secondsPerRealSecond: number, emit: boolean): void {
    const clampedSeconds = Math.min(
      Math.max(secondsPerRealSecond, this.options.simulationConfig.time.min_time_scale),
      this.options.simulationConfig.time.max_time_scale
    );
    this.speedInput.value = String(clampedSeconds);
    this.speedValueElement.textContent = formatTimeScale(clampedSeconds);
    this.presetSelect.value = findPresetBySeconds(clampedSeconds)?.id ?? "custom";

    if (emit) {
      this.options.onTimeScaleChange(clampedSeconds);
    }
  }

  private jumpToInputDate(): void {
    const result = this.options.onDateJump(this.dateInput.value);
    if (result.ok) {
      this.dateInput.value = result.isoDate;
      this.dateMessage.textContent = `Jumped to ${result.isoDate} UTC.`;
      this.dateMessage.classList.remove("is-error");
    } else {
      this.dateMessage.textContent = result.error;
      this.dateMessage.classList.add("is-error");
    }
  }
}
