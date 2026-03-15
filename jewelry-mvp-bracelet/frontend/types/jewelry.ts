/* -- Core TypeScript types for the Jewelry Design system -- */

export type JewelryType = "bracelet" | "ring" | "pendant" | "earring";

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
  | "amethyst"
  | "topaz"
  | "opal"
  | "pearl"
  | "none";

export type MotifType = "none" | "floral" | "geometric" | "vine";

export type BraceletStyle =
  | "tennis"
  | "bangle"
  | "cuff"
  | "chain"
  | "beaded";

export type RingStyle =
  | "solitaire"
  | "halo"
  | "three_stone"
  | "band"
  | "pave";

export type PendantStyle =
  | "drop"
  | "heart"
  | "cross"
  | "charm"
  | "locket";

export type EarringStyle =
  | "stud"
  | "hoop"
  | "drop"
  | "chandelier"
  | "huggie";

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
  jewelry_type: JewelryType;
  metal: MetalType;
  stone: StoneType;
  finish: FinishType;
  motif: MotifType;
  center_stone: boolean;
  accent_count: number;
  stone_size: number;
  band_width: number;
  bracelet_style: BraceletStyle;
  ring_style: RingStyle | null;
  pendant_style: PendantStyle | null;
  earring_style: EarringStyle | null;
  model_glb_path: string | null;
  confidence: number;
  source_image_path: string | null;
}

/* -- API request/response types -- */

export interface CustomizeRequest {
  design_id: string;
  jewelry_type?: JewelryType;
  metal?: MetalType;
  stone?: StoneType;
  finish?: FinishType;
  motif?: MotifType;
  center_stone?: boolean;
  accent_count?: number;
  stone_size?: number;
  band_width?: number;
  bracelet_style?: BraceletStyle;
  ring_style?: RingStyle;
  pendant_style?: PendantStyle;
  earring_style?: EarringStyle;
}

export interface AnalyzeResponse {
  design: JewelryDesign;
  mesh_ready: boolean;
}

/* -- App state -- */

export type AppStatus = "idle" | "uploading" | "analyzing" | "ready" | "error";
