// src/types.ts

// --- Modelos de ENTRADA (Lo que enviamos al backend) ---
export interface EdgeInput {
  source: number;
  target: number;
  capacity: number;
}

export interface GraphInput {
  num_nodes: number;
  edges: EdgeInput[];
  source_node: number;
  sink_node: number;
}

// --- Modelos de SALIDA (Lo que recibimos del backend) ---
export interface StepResult {
  path: number[];
  bottleneck: number;
  current_total_flow: number;
}

export interface MinCutResult {
  S_side: number[];
  T_side: number[];
}

export interface SolveResponse {
  max_flow: number;
  steps: StepResult[];
  min_cut: MinCutResult;
}