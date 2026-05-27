import type { FocusSceneConfig } from "../rendering/focusSceneManager";
import type { SceneMode } from "../rendering/sceneModes";

interface ViewportHudState {
  mode: SceneMode;
  focusConfig?: FocusSceneConfig;
}

export class ViewportHud {
  private readonly root: HTMLDivElement;
  private readonly badge: HTMLDivElement;
  private readonly title: HTMLDivElement;
  private readonly subtitle: HTMLDivElement;
  private readonly backButton: HTMLButtonElement;

  constructor(container: HTMLElement, onBackToOverview: () => void) {
    this.root = document.createElement("div");
    this.root.className = "viewport-hud";

    this.badge = document.createElement("div");
    this.badge.className = "viewport-hud-badge";
    this.title = document.createElement("div");
    this.title.className = "viewport-hud-title";
    this.subtitle = document.createElement("div");
    this.subtitle.className = "viewport-hud-subtitle";

    this.backButton = document.createElement("button");
    this.backButton.type = "button";
    this.backButton.className = "viewport-hud-back";
    this.backButton.textContent = "Back to solar system";
    this.backButton.addEventListener("click", onBackToOverview);

    this.root.append(this.badge, this.title, this.subtitle, this.backButton);
    container.appendChild(this.root);
  }

  update(state: ViewportHudState): void {
    const isFocus = state.mode.kind === "body-focus";
    this.root.classList.toggle("is-focus", isFocus);

    if (isFocus && state.focusConfig) {
      this.badge.textContent = "Body focus";
      this.badge.style.borderColor = state.focusConfig.accentColor;
      this.badge.style.color = state.focusConfig.accentColor;
      this.title.textContent = state.focusConfig.title;
      this.subtitle.textContent = `${state.focusConfig.subtitle} Press ESC to return.`;
      this.backButton.hidden = false;
      return;
    }

    this.badge.textContent = "Overview";
    this.badge.style.borderColor = "";
    this.badge.style.color = "";
    this.title.textContent = "Click a planet to enter its local ecosystem";
    this.subtitle.textContent = "Orbit lines, labels, asteroid belt, validation, reports, and time controls stay live.";
    this.backButton.hidden = true;
  }
}
