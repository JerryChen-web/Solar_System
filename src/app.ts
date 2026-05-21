import * as THREE from "three";
import { formatSimulationDate } from "./astronomy/time";
import { computeKeplerPositionMeters } from "./astronomy/kepler";
import { rotationRadiansForElapsedSeconds } from "./astronomy/rotationModel";
import { GRAVITATIONAL_CONSTANT } from "./config/constants";
import { scaleOrbitVectorMeters, visualRadiusForBody } from "./config/visualScale";
import { loadSolarSystemData, type SolarSystemData } from "./data/dataLoader";
import { createAtmosphere } from "./rendering/atmosphere";
import { createBodyMesh } from "./rendering/bodyMesh";
import { createCamera, createOrbitControls } from "./rendering/camera";
import { CameraFollowController } from "./rendering/cameraFollowController";
import { HtmlLabelLayer } from "./rendering/labels";
import { addLights } from "./rendering/lights";
import { createOrbitPath } from "./rendering/orbitPath";
import { createRenderer, resizeRenderer } from "./rendering/renderer";
import { createSaturnRing } from "./rendering/rings";
import { createScene } from "./rendering/scene";
import { pickBodyId, SelectionHighlighter } from "./rendering/selection";
import type { BodyRecord } from "./types/body";
import { BodyInfoPanel } from "./ui/bodyInfoPanel";
import { ControlPanel } from "./ui/controlPanel";
import { DebugPanel } from "./ui/debugPanel";
import { formatTimeScale } from "./ui/formatters";
import type { SimulationMode } from "./ui/modeSwitcher";

interface BodyNode {
  body: BodyRecord;
  mesh: THREE.Mesh;
  orbitPath?: THREE.LineLoop;
  radiusSceneUnits: number;
}

export class SolarSystemApp {
  private readonly data: SolarSystemData;
  private readonly scene: THREE.Scene;
  private readonly viewport: HTMLElement;
  private readonly sidePanel: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: ReturnType<typeof createOrbitControls>;
  private readonly cameraFollowController: CameraFollowController;
  private readonly labelLayer: HtmlLabelLayer;
  private readonly selectionHighlighter = new SelectionHighlighter();
  private readonly bodyInfoPanel: BodyInfoPanel;
  private readonly controlPanel: ControlPanel;
  private readonly debugPanel: DebugPanel;
  private readonly clock = new THREE.Clock();
  private readonly bodyNodes = new Map<string, BodyNode>();
  private readonly scenePositions = new Map<string, THREE.Vector3>();
  private readonly physicalPositionsMeters = new Map<string, THREE.Vector3>();
  private readonly relativeDistanceMeters = new Map<string, number>();

  private animationFrameId = 0;
  private secondsSinceEpoch = 0;
  private timeScaleSecondsPerRealSecond = 0;
  private pausedByButton = false;
  private selectedBodyId: string | null = "sun";
  private followTargetId: string | null = null;
  private mode: SimulationMode = "kepler";
  private orbitCount = 0;

  constructor(private readonly root: HTMLElement) {
    this.root.innerHTML = "";
    this.root.className = "app-root";

    const shell = document.createElement("div");
    shell.className = "app-shell";
    this.viewport = document.createElement("div");
    this.viewport.className = "viewport";
    this.sidePanel = document.createElement("aside");
    this.sidePanel.className = "side-panel";
    shell.append(this.viewport, this.sidePanel);
    this.root.appendChild(shell);

    this.data = loadSolarSystemData();
    this.scene = createScene();
    this.camera = createCamera(this.data.visualConfig, this.viewport);
    this.renderer = createRenderer(this.viewport);
    this.controls = createOrbitControls(this.camera, this.renderer.domElement);
    this.cameraFollowController = new CameraFollowController(this.camera, this.controls);
    this.labelLayer = new HtmlLabelLayer(this.viewport);

    addLights(this.scene, this.data.visualConfig);
    this.createBodyNodes();
    this.createOrbitPaths();

    this.bodyInfoPanel = new BodyInfoPanel(this.sidePanel);
    this.controlPanel = new ControlPanel(this.sidePanel, {
      simulationConfig: this.data.simulationConfig,
      onTimeScaleChange: (seconds) => {
        this.timeScaleSecondsPerRealSecond = seconds;
      },
      onPauseChange: (paused) => {
        this.pausedByButton = paused;
      },
      onReset: () => {
        this.secondsSinceEpoch = 0;
      },
      onModeChange: (mode) => {
        this.mode = mode;
      },
      onFollow: () => {
        this.followSelectedBody();
      },
      onStopFollow: () => {
        this.stopFollow();
      }
    });
    this.debugPanel = new DebugPanel(this.sidePanel);

    this.mode = this.data.simulationConfig.default_mode;
    this.selectBody("sun");
    this.registerEvents();
    this.updateBodies();
  }

  start(): void {
    this.clock.start();
    this.animate();
  }

  dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }

  private createBodyNodes(): void {
    for (const body of this.data.bodies) {
      const radiusSceneUnits = visualRadiusForBody(body, this.data.visualConfig);
      const mesh = createBodyMesh(body, radiusSceneUnits);

      if (body.visual.rings) {
        mesh.add(createSaturnRing(radiusSceneUnits));
      }
      if (body.visual.atmosphere) {
        mesh.add(createAtmosphere(radiusSceneUnits));
      }

      this.scene.add(mesh);
      this.bodyNodes.set(body.id, { body, mesh, radiusSceneUnits });

      if (this.data.visualConfig.labels.enabled && body.visual.label) {
        const labelText = this.data.visualConfig.labels.show_zh_name ? body.name_zh : body.name_en;
        this.labelLayer.addLabel(body.id, labelText, mesh, radiusSceneUnits + 0.45);
      }
    }
  }

  private createOrbitPaths(): void {
    if (!this.data.simulationConfig.visual.show_orbits) {
      return;
    }

    for (const element of this.data.orbitalElements) {
      const body = this.data.bodyById.get(element.body_id);
      if (!body || !body.parent) {
        continue;
      }

      const parentBody = this.data.bodyById.get(body.parent);
      if (!parentBody) {
        continue;
      }

      const orbitPath = createOrbitPath(element, body, parentBody, this.data.visualConfig);
      this.scene.add(orbitPath);
      this.orbitCount += 1;
      const node = this.bodyNodes.get(body.id);
      if (node) {
        node.orbitPath = orbitPath;
      }
    }
  }

  private registerEvents(): void {
    window.addEventListener("resize", () => {
      resizeRenderer(this.renderer, this.camera, this.viewport);
    });

    this.renderer.domElement.addEventListener("pointerdown", (event) => {
      const bodyId = pickBodyId(
        event,
        this.camera,
        this.renderer.domElement,
        [...this.bodyNodes.values()].map((node) => node.mesh)
      );
      if (bodyId) {
        this.selectBody(bodyId);
      }
    });
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const deltaSeconds = Math.min(this.clock.getDelta(), 0.1);

    if (!this.pausedByButton && this.mode === "kepler") {
      this.secondsSinceEpoch += deltaSeconds * this.timeScaleSecondsPerRealSecond;
    }

    this.updateBodies();
    this.updateFollowCamera(deltaSeconds);
    this.controls.update();
    this.labelLayer.update(this.camera);
    const simulationDateText = formatSimulationDate(this.secondsSinceEpoch);
    this.controlPanel.setSimulationDate(simulationDateText);
    this.updateDebugPanel(simulationDateText);
    this.renderer.render(this.scene, this.camera);
  };

  private updateBodies(): void {
    this.scenePositions.clear();
    this.physicalPositionsMeters.clear();
    this.relativeDistanceMeters.clear();

    for (const body of this.data.bodies) {
      const position = this.resolveScenePosition(body);
      const node = this.bodyNodes.get(body.id);
      if (!node) {
        continue;
      }

      node.mesh.position.copy(position);
      node.mesh.rotation.y = rotationRadiansForElapsedSeconds(body, this.secondsSinceEpoch);

      if (node.orbitPath) {
        const parentPosition = this.scenePositions.get(body.parent ?? "sun") ?? new THREE.Vector3();
        node.orbitPath.position.copy(parentPosition);
      }
    }

    if (this.selectedBodyId) {
      this.updateSelectedBodyInfo(this.selectedBodyId);
    }
  }

  private resolveScenePosition(body: BodyRecord): THREE.Vector3 {
    const cached = this.scenePositions.get(body.id);
    if (cached) {
      return cached;
    }

    if (body.type === "star" || body.parent === null) {
      const origin = new THREE.Vector3();
      this.scenePositions.set(body.id, origin);
      this.physicalPositionsMeters.set(body.id, origin.clone());
      this.relativeDistanceMeters.set(body.id, 0);
      return origin;
    }

    const parentBody = this.data.bodyById.get(body.parent);
    const element = this.data.orbitalElementByBodyId.get(body.id);
    if (!parentBody || !element) {
      const origin = new THREE.Vector3();
      this.scenePositions.set(body.id, origin);
      this.physicalPositionsMeters.set(body.id, origin.clone());
      this.relativeDistanceMeters.set(body.id, 0);
      return origin;
    }

    const parentPosition = this.resolveScenePosition(parentBody);
    const parentPhysicalPosition = this.physicalPositionsMeters.get(parentBody.id) ?? new THREE.Vector3();
    const mu = GRAVITATIONAL_CONSTANT * (parentBody.mass_kg + body.mass_kg);
    const relativeMeters = computeKeplerPositionMeters(element, this.secondsSinceEpoch, mu);
    const relativeScene = scaleOrbitVectorMeters(relativeMeters, body, this.data.visualConfig);
    const position = parentPosition.clone().add(relativeScene);
    const physicalPosition = parentPhysicalPosition.clone().add(relativeMeters);

    this.scenePositions.set(body.id, position);
    this.physicalPositionsMeters.set(body.id, physicalPosition);
    this.relativeDistanceMeters.set(body.id, relativeMeters.length());
    return position;
  }

  private selectBody(bodyId: string): void {
    this.selectedBodyId = bodyId;
    this.labelLayer.setSelected(bodyId);
    this.controlPanel.setSelectedBody(bodyId);

    const node = this.bodyNodes.get(bodyId);
    if (node) {
      this.selectionHighlighter.select(node.mesh, node.radiusSceneUnits);
    }

    this.updateSelectedBodyInfo(bodyId);
  }

  private updateSelectedBodyInfo(bodyId: string): void {
    const body = this.data.bodyById.get(bodyId);
    if (!body) {
      return;
    }

    const node = this.bodyNodes.get(bodyId);
    this.bodyInfoPanel.update({
      body,
      orbitalElement: this.data.orbitalElementByBodyId.get(bodyId),
      distanceFromParentMeters: this.relativeDistanceMeters.get(bodyId),
      distanceFromCenterMeters: this.physicalPositionsMeters.get(bodyId)?.length(),
      visualRadiusSceneUnits: node?.radiusSceneUnits,
      visualRadiusScale: body.visual.radius_scale
    });
  }

  private followSelectedBody(): void {
    if (!this.selectedBodyId) {
      return;
    }

    const targetPosition = this.scenePositions.get(this.selectedBodyId);
    if (!targetPosition) {
      return;
    }

    this.followTargetId = this.selectedBodyId;
    this.cameraFollowController.follow(this.selectedBodyId, targetPosition);
    this.controlPanel.setFollowTarget(this.followTargetId);
  }

  private stopFollow(): void {
    this.followTargetId = null;
    this.cameraFollowController.stop();
    this.controlPanel.setFollowTarget(null);
  }

  private updateFollowCamera(deltaSeconds: number): void {
    const targetPosition = this.followTargetId ? this.scenePositions.get(this.followTargetId) : undefined;
    this.cameraFollowController.update(targetPosition, deltaSeconds);
  }

  private updateDebugPanel(simulationDateText: string): void {
    this.debugPanel.update({
      currentMode: this.mode,
      simulationDateText,
      timeScaleSecondsPerRealSecond: this.timeScaleSecondsPerRealSecond,
      readableTimeScale: formatTimeScale(this.timeScaleSecondsPerRealSecond),
      selectedBodyId: this.selectedBodyId,
      followTargetId: this.followTargetId,
      bodyCount: this.data.bodies.length,
      orbitCount: this.orbitCount,
      visualScaleMode: `${this.data.visualConfig.scaling.distance.mode} / ${this.data.visualConfig.scaling.radius.mode}`,
      cameraTarget: this.controls.target.clone(),
      rendererTriangles: this.renderer.info.render.triangles,
      rendererDrawCalls: this.renderer.info.render.calls,
      nBodyStatus: "N-body: scaffold only"
    });
  }
}
