export interface SimulationConfig {
  project_name: string;
  version: string;
  unit_system: "SI";
  default_mode: "kepler" | "nbody_placeholder";
  available_modes: string[];
  reference_frame: string;
  center: string;
  time: {
    epoch: string;
    default_time_scale_seconds_per_real_second: number;
    min_time_scale: number;
    max_time_scale: number;
  };
  physics: {
    G_m3_kg_s2: number;
    AU_m: number;
    day_s: number;
    julian_year_s: number;
    integrator: string;
    time_step_s: number;
    enable_mutual_gravity: boolean;
    enable_relativity: boolean;
    enable_solar_radiation_pressure: boolean;
  };
  visual: {
    distance_scale_mode: string;
    radius_scale_mode: string;
    show_orbits: boolean;
    show_labels: boolean;
    show_grid: boolean;
    show_axes: boolean;
    camera_default_target: string;
  };
}

export interface VisualConfig {
  visual_units: {
    base: string;
    note: string;
  };
  scaling: {
    distance: {
      inner_planet_scale: number;
      outer_planet_scale: number;
      moon_distance_scale: number;
      mode: string;
    };
    radius: {
      mode: string;
      min_visible_radius: number;
      max_visible_radius: number;
    };
  };
  orbits: {
    line_segments: number;
    line_opacity: number;
    show_inclination: boolean;
  };
  labels: {
    enabled: boolean;
    font_size: number;
    show_zh_name: boolean;
    show_en_name: boolean;
  };
  camera: {
    enable_orbit_controls: boolean;
    near: number;
    far: number;
    default_position: [number, number, number];
    follow_enabled: boolean;
  };
  lighting: {
    sun_as_point_light: boolean;
    ambient_light_intensity: number;
    sun_light_intensity: number;
  };
}

