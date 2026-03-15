/* -- Core TypeScript types for the Jewelry Design system -- */

export type JewelryType = "bracelet";

export type MetalType =
  | "yellow_gold"
  | "white_gold"
  | "rose_gold"
  | "silver"
  | "platinum";

export type FinishType = "polished" | "matte" | "brushed" | "hammered";

export type StoneType =
  | "diamond"
  | "ruby"
  | "emerald"
  | "sapphire"
  | "none";

export type MotifType = "none" | "floral" | "geometric" | "vine";

export type BraceletStyle =
  | "tennis"
  | "bangle"
  | "cuff"
  | "chain"
  | "beaded";

/* -- Price -- */

export interface PriceBreakdown {
  material_cost: number;
  labor_cost: number;
  stone_cost: number;
  overhead: number;
  total: number;
  currency: string;
}

export interface OptimizationSuggestion {
  description: string;
  field: string;
  current_value: string;
  suggested_value: string;
  estimated_savings: number;
}

/* -- Main design (matches backend JewelryDesign schema) -- */

export interface JewelryDesign {
  design_id: string;
  metal: MetalType;
  stone: StoneType;
  finish: FinishType;
  motif: MotifType;
  center_stone: boolean;
  accent_count: number;
  band_width: number;
  bracelet_style: BraceletStyle;
  model_glb_path: string | null;
  confidence: number;
  source_image_path: string | null;
}

/* -- API request/response types -- */

export interface CustomizeRequest {
  design_id: string;
  metal?: MetalType;
  stone?: StoneType;
  finish?: FinishType;
  motif?: MotifType;
  center_stone?: boolean;
  accent_count?: number;
  band_width?: number;
  bracelet_style?: BraceletStyle;
}

export interface AnalyzeResponse {
  design: JewelryDesign;
  mesh_ready: boolean;
}

/* -- App state -- */

export type AppStatus = "idle" | "uploading" | "analyzing" | "ready" | "error";
