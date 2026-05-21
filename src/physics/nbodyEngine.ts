import type { BodyState } from "./bodyState";
import { velocityVerletStep } from "./integrators";

export class NBodyEngine {
  private states: BodyState[];

  constructor(initialStates: BodyState[]) {
    this.states = initialStates.map((state) => ({ ...state }));
  }

  getStates(): BodyState[] {
    return this.states.map((state) => ({ ...state }));
  }

  step(dtSeconds: number): BodyState[] {
    this.states = velocityVerletStep(this.states, dtSeconds);
    return this.getStates();
  }
}

