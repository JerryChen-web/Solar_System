export type BodyType = "star" | "planet" | "moon";

export interface BodyVisual {
  color: string;
  radius_scale: number;
  emissive?: boolean;
  label?: boolean;
  atmosphere?: boolean;
  rings?: boolean;
}

export interface BodyRecord {
  id: string;
  name_en: string;
  name_zh: string;
  type: BodyType;
  parent: string | null;
  mass_kg: number;
  mean_radius_m: number;
  rotation_period_s: number;
  visual: BodyVisual;
}

export interface BodiesCatalog {
  unit_system: "SI";
  epoch: string;
  source?: string;
  notes?: string;
  bodies: BodyRecord[];
}

