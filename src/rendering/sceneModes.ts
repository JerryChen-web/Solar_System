export const FOCUS_BODY_IDS = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune"
] as const;

export type FocusBodyId = (typeof FOCUS_BODY_IDS)[number];

export type SceneMode =
  | { kind: "overview" }
  | { kind: "body-focus"; bodyId: FocusBodyId };

const focusBodyIdSet = new Set<string>(FOCUS_BODY_IDS);

export function createOverviewMode(): SceneMode {
  return { kind: "overview" };
}

export function isFocusBodyId(bodyId: string): bodyId is FocusBodyId {
  return focusBodyIdSet.has(bodyId);
}

export function enterBodyFocusMode(currentMode: SceneMode, bodyId: string): SceneMode {
  if (!isFocusBodyId(bodyId)) {
    return currentMode;
  }

  return { kind: "body-focus", bodyId };
}

export function exitBodyFocusMode(): SceneMode {
  return createOverviewMode();
}

export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "select" ||
    tagName === "textarea" ||
    target.isContentEditable
  );
}
