import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export interface RenderPipeline {
  render: () => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

export function createRenderPipeline(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  container: HTMLElement
): RenderPipeline {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(container.clientWidth, container.clientHeight);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.38,
      0.45,
      0.86
    )
  );

  return {
    render: () => {
      composer.render();
    },
    resize: (width, height) => {
      composer.setSize(width, height);
    },
    dispose: () => {
      composer.dispose();
    }
  };
}
