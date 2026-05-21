export interface SourceRecord {
  id: string;
  name: string;
  tier: string;
  url: string;
  type: string;
  used_for: string[];
  status: string;
  notes: string;
}

export interface SourceRegistry {
  sources: SourceRecord[];
}

