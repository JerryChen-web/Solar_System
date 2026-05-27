import * as THREE from "three";
import {
  dateToSecondsSinceJ2000,
  parseIsoDateOnly,
  secondsSinceJ2000ToJulianDate
} from "./astronomy/julianDate";
import { formatSimulationDate } from "./astronomy/time";
import { computeKeplerPositionMeters } from "./astronomy/kepler";
import { localReferenceProvider } from "./astronomy/localReferenceProvider";
import { computeMoonPositionMeters } from "./astronomy/moonModel";
import {
  compareFixtureToPositions,
  type FixtureComparisonSummary
} from "./astronomy/fixtureComparison";
import {
  parseReferenceFixture
} from "./astronomy/referenceFixture";
import {
  formatActiveFixtureSourceIndicator,
  ReferenceFixtureSourceManager,
  type ReferenceFixtureSourceSnapshot
} from "./astronomy/referenceFixtureSourceManager";
import { rotationRadiansForElapsedSeconds } from "./astronomy/rotationModel";
import {
  buildValidationSummary,
  clonePositions,
  type ContinuityHistory,
  type ValidationSummary
} from "./astronomy/validationSummary";
import { GRAVITATIONAL_CONSTANT } from "./config/constants";
import { APP_VERSION, APP_VERSION_LABEL } from "./config/appMetadata";
import { scaleOrbitVectorMeters, visualRadiusForBody } from "./config/visualScale";
import { loadSolarSystemData, type SolarSystemData } from "./data/dataLoader";
import { createAtmosphere } from "./rendering/atmosphere";
import { createBodyMesh } from "./rendering/bodyMesh";
import { createCamera, createOrbitControls } from "./rendering/camera";
import { CameraFollowController } from "./rendering/cameraFollowController";
import {
  advanceCameraTransition,
  createBodyFocusPose,
  createCameraPose,
  createCameraTransition,
  type CameraPose,
  type CameraTransitionState
} from "./rendering/cameraTransition";
import { getFocusSceneConfig } from "./rendering/focusSceneManager";
import { HtmlLabelLayer } from "./rendering/labels";
import { addLights } from "./rendering/lights";
import { createOrbitPath } from "./rendering/orbitPath";
import { getAtmosphereVisual } from "./rendering/planetVisuals";
import { createRenderPipeline, type RenderPipeline } from "./rendering/postProcessing";
import { createRenderer, resizeRenderer } from "./rendering/renderer";
import { createPlanetRingSystem } from "./rendering/ringVisuals";
import { createScene } from "./rendering/scene";
import { pickBodyId, SelectionHighlighter } from "./rendering/selection";
import {
  createOverviewMode,
  enterBodyFocusMode,
  exitBodyFocusMode,
  isEditableKeyboardTarget,
  isFocusBodyId,
  type SceneMode
} from "./rendering/sceneModes";
import { createAsteroidBelt, createKuiperBelt } from "./rendering/smallBodyBelts";
import { createStarfield } from "./rendering/starfield";
import { createSunGlow } from "./rendering/sunVisuals";
import type { BodyRecord } from "./types/body";
import { BodyInfoPanel } from "./ui/bodyInfoPanel";
import { ControlPanel } from "./ui/controlPanel";
import { DebugPanel } from "./ui/debugPanel";
import { formatTimeScale } from "./ui/formatters";
import type { SimulationMode } from "./ui/modeSwitcher";
import { PositionTable } from "./ui/positionTable";
import { PrecisionReportPanel } from "./ui/precisionReportPanel";
import { ReferenceImportPanel } from "./ui/referenceImportPanel";
import { ValidationDashboard } from "./ui/validationDashboard";
import { ValidationReportPanel } from "./ui/validationReportPanel";
import { ViewportHud } from "./ui/viewportHud";
import sampleReferenceFixtureJson from "../data/reference/sample_fixture_v0_6.json";
import sampleReferenceImportJson from "../data/reference/sample_import_v0_7.json";

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
  private readonly renderPipeline: RenderPipeline;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: ReturnType<typeof createOrbitControls>;
  private readonly overviewControlRange: { minDistance: number; maxDistance: number };
  private readonly cameraFollowController: CameraFollowController;
  private readonly labelLayer: HtmlLabelLayer;
  private readonly viewportHud: ViewportHud;
  private readonly selectionHighlighter = new SelectionHighlighter();
  private readonly bodyInfoPanel: BodyInfoPanel;
  private readonly controlPanel: ControlPanel;
  private readonly debugPanel: DebugPanel;
  private readonly validationDashboard: ValidationDashboard;
  private readonly validationReportPanel: ValidationReportPanel;
  private readonly precisionReportPanel: PrecisionReportPanel;
  private readonly referenceImportPanel: ReferenceImportPanel;
  private readonly positionTable: PositionTable;
  private readonly referenceProvider = localReferenceProvider;
  private readonly fixtureSourceManager: ReferenceFixtureSourceManager;
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
  private sceneMode: SceneMode = createOverviewMode();
  private overviewCameraPose: CameraPose | null = null;
  private activeCameraTransition: CameraTransitionState | null = null;
  private activeCameraTransitionTarget: "overview" | "focus" | null = null;
  private orbitCount = 0;
  private validationContinuityHistory: ContinuityHistory | null = null;
  private latestValidationSummary: ValidationSummary | null = null;
  private latestFixtureComparison: FixtureComparisonSummary | null = null;

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
    const defaultReferenceFixture = parseReferenceFixture(sampleReferenceFixtureJson, {
      knownBodyIds: this.data.bodyById.keys()
    });
    this.fixtureSourceManager = new ReferenceFixtureSourceManager({
      defaultFixture: defaultReferenceFixture,
      sampleImportRaw: sampleReferenceImportJson,
      importOptions: {
        knownBodyIds: this.data.bodyById.keys(),
        knownBodyNames: this.data.bodies.map((body) => body.name_en),
        fixtureVersion: APP_VERSION
      }
    });
    this.scene = createScene();
    this.camera = createCamera(this.data.visualConfig, this.viewport);
    this.renderer = createRenderer(this.viewport);
    this.controls = createOrbitControls(this.camera, this.renderer.domElement);
    this.overviewControlRange = {
      minDistance: this.controls.minDistance,
      maxDistance: this.controls.maxDistance
    };
    this.renderPipeline = createRenderPipeline(this.renderer, this.scene, this.camera, this.viewport);
    this.cameraFollowController = new CameraFollowController(this.camera, this.controls);
    this.labelLayer = new HtmlLabelLayer(this.viewport, (bodyId) => {
      this.selectBody(bodyId);
      this.enterFocusMode(bodyId);
    });
    this.viewportHud = new ViewportHud(this.viewport, () => {
      this.exitFocusMode();
    });

    addLights(this.scene, this.data.visualConfig);
    this.scene.add(createStarfield());
    this.scene.add(createAsteroidBelt(this.data.visualConfig));
    this.scene.add(createKuiperBelt(this.data.visualConfig));
    this.createBodyNodes();
    this.createOrbitPaths();

    this.bodyInfoPanel = new BodyInfoPanel(this.sidePanel);
    this.controlPanel = new ControlPanel(this.sidePanel, {
      appLabel: APP_VERSION_LABEL,
      simulationConfig: this.data.simulationConfig,
      onTimeScaleChange: (seconds) => {
        this.timeScaleSecondsPerRealSecond = seconds;
      },
      onPauseChange: (paused) => {
        this.pausedByButton = paused;
      },
      onReset: () => {
        this.secondsSinceEpoch = 0;
        this.validationContinuityHistory = null;
        this.controlPanel.setDateInputValue(this.data.simulationConfig.time.epoch.slice(0, 10));
      },
      onModeChange: (mode) => {
        this.mode = mode;
      },
      onFollow: () => {
        this.followSelectedBody();
      },
      onStopFollow: () => {
        this.stopFollow();
      },
      onDateJump: (input) => {
        return this.jumpToDate(input);
      }
    });
    this.debugPanel = new DebugPanel(this.sidePanel);
    this.validationDashboard = new ValidationDashboard(this.sidePanel);
    this.validationReportPanel = new ValidationReportPanel(this.sidePanel, () => ({
      appVersion: APP_VERSION,
      simulationDate: formatSimulationDate(this.secondsSinceEpoch),
      julianDate: secondsSinceJ2000ToJulianDate(this.secondsSinceEpoch),
      summary: this.latestValidationSummary,
      referenceProvider: this.referenceProvider.metadata
    }));
    this.precisionReportPanel = new PrecisionReportPanel(this.sidePanel, () => ({
      appVersion: APP_VERSION,
      simulationDate: formatSimulationDate(this.secondsSinceEpoch),
      julianDate: secondsSinceJ2000ToJulianDate(this.secondsSinceEpoch),
      comparison: this.latestFixtureComparison
    }));
    this.referenceImportPanel = new ReferenceImportPanel(this.sidePanel, {
      onSelectDefault: () => {
        this.applyFixtureSource(this.fixtureSourceManager.selectDefault());
      },
      onSelectSampleImport: () => {
        this.applyFixtureSource(this.fixtureSourceManager.selectSampleImport());
      },
      onImportLocalFile: (file) => {
        void this.importLocalReferenceFile(file);
      },
      onResetDefault: () => {
        this.applyFixtureSource(this.fixtureSourceManager.resetToDefault());
      }
    });
    this.updateFixtureSourceUi();
    this.positionTable = new PositionTable(this.sidePanel);

    this.mode = this.data.simulationConfig.default_mode;
    this.selectBody("sun");
    this.updateViewportHud();
    this.registerEvents();
    this.updateBodies();
  }

  start(): void {
    this.clock.start();
    this.animate();
  }

  dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.renderPipeline.dispose();
    this.renderer.dispose();
  }

  private createBodyNodes(): void {
    for (const body of this.data.bodies) {
      const radiusSceneUnits = visualRadiusForBody(body, this.data.visualConfig);
      const mesh = createBodyMesh(body, radiusSceneUnits);

      if (body.type === "star") {
        mesh.add(createSunGlow(radiusSceneUnits));
      }

      const ringSystem = createPlanetRingSystem(body.id, radiusSceneUnits);
      if (ringSystem) {
        mesh.add(ringSystem);
      }

      const atmosphereVisual = getAtmosphereVisual(body);
      if (atmosphereVisual) {
        mesh.add(
          createAtmosphere(
            radiusSceneUnits,
            atmosphereVisual.color,
            atmosphereVisual.opacity,
            atmosphereVisual.scale
          )
        );
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
      this.renderPipeline.resize(this.viewport.clientWidth, this.viewport.clientHeight);
    });

    this.renderer.domElement.addEventListener("pointerdown", (event) => {
      const bodyId = pickBodyId(
        event,
        this.camera,
        this.renderer.domElement,
        [...this.bodyNodes.values()].map((node) => node.mesh),
        [...this.bodyNodes.entries()].map(([bodyId, node]) => ({
          bodyId,
          object: node.mesh,
          radiusSceneUnits: node.radiusSceneUnits
        }))
      );
      if (bodyId) {
        this.selectBody(bodyId);
        this.enterFocusMode(bodyId);
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.sceneMode.kind === "body-focus" && !isEditableKeyboardTarget(event.target)) {
        this.exitFocusMode();
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
    this.updateValidationSummary();
    this.updateSceneModeCamera(deltaSeconds);
    if (this.sceneMode.kind === "overview" && !this.activeCameraTransition) {
      this.updateFollowCamera(deltaSeconds);
    }
    this.controls.update();
    this.labelLayer.update(this.camera);
    const simulationDateText = formatSimulationDate(this.secondsSinceEpoch);
    this.controlPanel.setSimulationDate(simulationDateText);
    this.updateDebugPanel(simulationDateText);
    this.renderPipeline.render();
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
    const moonPosition =
      body.id === "moon"
        ? computeMoonPositionMeters(
            element,
            parentBody,
            body,
            parentPhysicalPosition,
            this.secondsSinceEpoch
          )
        : undefined;
    const relativeMeters =
      moonPosition?.relativeToEarthMeters ??
      computeKeplerPositionMeters(element, this.secondsSinceEpoch, mu);
    const relativeScene = scaleOrbitVectorMeters(relativeMeters, body, this.data.visualConfig);
    const position = parentPosition.clone().add(relativeScene);
    const physicalPosition = moonPosition?.heliocentricMeters ?? parentPhysicalPosition.clone().add(relativeMeters);

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

  private enterFocusMode(bodyId: string): void {
    if (!isFocusBodyId(bodyId)) {
      return;
    }

    const node = this.bodyNodes.get(bodyId);
    const targetPosition = this.scenePositions.get(bodyId);
    const focusConfig = getFocusSceneConfig(bodyId);
    if (!node || !targetPosition || !focusConfig) {
      return;
    }

    if (this.sceneMode.kind === "overview") {
      this.overviewCameraPose = createCameraPose(this.camera.position, this.controls.target);
    }

    this.sceneMode = enterBodyFocusMode(this.sceneMode, bodyId);
    this.controls.enabled = false;
    this.controls.minDistance = Math.max(node.radiusSceneUnits * 2.2, 0.65);
    this.controls.maxDistance = Math.max(focusConfig.minCameraDistance * 6, node.radiusSceneUnits * 28);
    const from = createCameraPose(this.camera.position, this.controls.target);
    const to = createBodyFocusPose(targetPosition, node.radiusSceneUnits, focusConfig);
    this.activeCameraTransition = createCameraTransition(from, to, 1.55);
    this.activeCameraTransitionTarget = "focus";
    this.updateViewportHud();
  }

  private exitFocusMode(): void {
    if (this.sceneMode.kind !== "body-focus") {
      return;
    }

    const to =
      this.overviewCameraPose ??
      createCameraPose(
        new THREE.Vector3(...this.data.visualConfig.camera.default_position),
        new THREE.Vector3()
      );

    this.sceneMode = exitBodyFocusMode();
    this.controls.enabled = false;
    this.controls.minDistance = this.overviewControlRange.minDistance;
    this.controls.maxDistance = this.overviewControlRange.maxDistance;
    this.activeCameraTransition = createCameraTransition(
      createCameraPose(this.camera.position, this.controls.target),
      to,
      1.25
    );
    this.activeCameraTransitionTarget = "overview";
    this.updateViewportHud();
  }

  private updateSceneModeCamera(deltaSeconds: number): void {
    if (this.activeCameraTransition) {
      if (this.activeCameraTransitionTarget === "focus" && this.sceneMode.kind === "body-focus") {
        const node = this.bodyNodes.get(this.sceneMode.bodyId);
        const targetPosition = this.scenePositions.get(this.sceneMode.bodyId);
        const focusConfig = getFocusSceneConfig(this.sceneMode.bodyId);
        if (node && targetPosition && focusConfig) {
          this.activeCameraTransition.to = createBodyFocusPose(
            targetPosition,
            node.radiusSceneUnits,
            focusConfig
          );
        }
      }

      const result = advanceCameraTransition(this.activeCameraTransition, deltaSeconds);
      this.activeCameraTransition = result.done ? null : result.transition;
      this.camera.position.copy(result.pose.position);
      this.controls.target.copy(result.pose.target);
      if (result.done) {
        this.controls.enabled = true;
        this.activeCameraTransitionTarget = null;
      }
      return;
    }

    if (this.sceneMode.kind !== "body-focus") {
      return;
    }

    const targetPosition = this.scenePositions.get(this.sceneMode.bodyId);
    if (!targetPosition) {
      return;
    }

    const previousTarget = this.controls.target.clone();
    const alpha = 1 - Math.exp(-10 * Math.max(deltaSeconds, 0));
    this.controls.target.lerp(targetPosition, alpha);
    this.camera.position.add(this.controls.target.clone().sub(previousTarget));
  }

  private updateViewportHud(): void {
    const focusConfig =
      this.sceneMode.kind === "body-focus" ? getFocusSceneConfig(this.sceneMode.bodyId) : undefined;
    this.viewportHud.update({
      mode: this.sceneMode,
      focusConfig
    });
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

  private applyFixtureSource(snapshot: ReferenceFixtureSourceSnapshot): void {
    this.updateFixtureSourceUi(snapshot);
    this.updateValidationSummary();
  }

  private updateFixtureSourceUi(snapshot: ReferenceFixtureSourceSnapshot = this.fixtureSourceManager.snapshot()): void {
    this.controlPanel.setFixtureSourceSummary(formatActiveFixtureSourceIndicator(snapshot.active));
    this.referenceImportPanel.update(snapshot);
  }

  private async importLocalReferenceFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch (error) {
        this.applyFixtureSource(
          this.fixtureSourceManager.selectFailedLocalImport(file.name, this.errorMessage(error))
        );
        return;
      }

      this.applyFixtureSource(this.fixtureSourceManager.selectLocalImport(raw, file.name));
    } catch (error) {
      this.applyFixtureSource(
        this.fixtureSourceManager.selectFailedLocalImport(file.name, this.errorMessage(error))
      );
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private updateFollowCamera(deltaSeconds: number): void {
    const targetPosition = this.followTargetId ? this.scenePositions.get(this.followTargetId) : undefined;
    this.cameraFollowController.update(targetPosition, deltaSeconds);
  }

  private updateDebugPanel(simulationDateText: string): void {
    this.debugPanel.update({
      currentMode: this.mode,
      simulationDateText,
      julianDate: secondsSinceJ2000ToJulianDate(this.secondsSinceEpoch),
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
      nBodyStatus: "N-body: scaffold only",
      validationCheckedCount: this.latestValidationSummary?.checkedCount ?? 0,
      validationPassedCount: this.latestValidationSummary?.passedCount ?? 0,
      validationWarningCount: this.latestValidationSummary?.warningCount ?? 0,
      validationErrorCount: this.latestValidationSummary?.errorCount ?? 0
    });
  }

  private jumpToDate(input: string): { ok: true; isoDate: string } | { ok: false; error: string } {
    const parsed = parseIsoDateOnly(input);
    if (!parsed.ok) {
      return parsed;
    }

    this.secondsSinceEpoch = dateToSecondsSinceJ2000(parsed.date);
    this.validationContinuityHistory = null;
    this.updateBodies();
    this.updateValidationSummary();
    return { ok: true, isoDate: parsed.isoDate };
  }

  private updateValidationSummary(): void {
    const summary = buildValidationSummary({
      bodies: this.data.bodies,
      bodyById: this.data.bodyById,
      orbitalElementByBodyId: this.data.orbitalElementByBodyId,
      positionsMeters: this.physicalPositionsMeters,
      secondsSinceEpoch: this.secondsSinceEpoch,
      continuityHistory: this.validationContinuityHistory,
      referenceProvider: this.referenceProvider
    });

    this.latestValidationSummary = summary;
    this.latestFixtureComparison = compareFixtureToPositions({
      fixture: this.fixtureSourceManager.snapshot().active.fixture,
      positionsMeters: this.physicalPositionsMeters
    });
    this.validationDashboard.update(summary);
    this.validationReportPanel.update(summary);
    this.precisionReportPanel.update(this.latestFixtureComparison);
    this.positionTable.update(summary.positionRows);
    this.validationContinuityHistory = {
      positionsMeters: clonePositions(this.physicalPositionsMeters),
      secondsSinceEpoch: this.secondsSinceEpoch
    };
  }
}
