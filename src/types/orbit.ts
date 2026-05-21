export interface OrbitalElementRecord {
  body_id: string;
  parent?: string;
  a_au: number;
  e: number;
  i_deg: number;
  L_deg: number;
  long_peri_deg: number;
  long_node_deg: number;
  notes?: string;
}

export interface OrbitalElementsCatalog {
  unit_system: "AU_DEG";
  epoch: string;
  source?: string;
  notes?: string;
  elements: OrbitalElementRecord[];
}

