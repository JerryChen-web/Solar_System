import * as THREE from "three";

interface LabelRecord {
  element: HTMLDivElement;
  target: THREE.Object3D;
  offsetY: number;
}

export class HtmlLabelLayer {
  private readonly labels = new Map<string, LabelRecord>();

  constructor(
    private readonly container: HTMLElement,
    private readonly onLabelClick?: (bodyId: string) => void
  ) {}

  addLabel(bodyId: string, text: string, target: THREE.Object3D, offsetY: number): void {
    const element = document.createElement("div");
    element.className = "body-label";
    element.dataset.bodyId = bodyId;
    element.setAttribute("aria-label", `${text} label`);
    element.textContent = text;
    element.addEventListener("click", (event) => {
      event.stopPropagation();
      this.onLabelClick?.(bodyId);
    });
    this.container.appendChild(element);
    this.labels.set(bodyId, { element, target, offsetY });
  }

  setSelected(bodyId: string | null): void {
    for (const [id, label] of this.labels) {
      label.element.classList.toggle("is-selected", id === bodyId);
    }
  }

  update(camera: THREE.Camera): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    for (const label of this.labels.values()) {
      const worldPosition = new THREE.Vector3();
      label.target.getWorldPosition(worldPosition);
      worldPosition.y += label.offsetY;
      worldPosition.project(camera);

      const visible = worldPosition.z > -1 && worldPosition.z < 1;
      label.element.style.display = visible ? "block" : "none";
      if (!visible) {
        continue;
      }

      const x = (worldPosition.x * 0.5 + 0.5) * width;
      const y = (-worldPosition.y * 0.5 + 0.5) * height;
      label.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    }
  }
}
