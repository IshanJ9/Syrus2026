/* ── Core TypeScript types for the Jewelry Design system ── */

export type JewelryType = "bracelet";

export type MetalType =
  | "yellow_gold"
  | "white_gold"
  | "rose_gold"
  | "sterling_silver"
  | "platinum";

export type FinishType = "polished" | "matte" | "brushed" | "hammered";

export type StyleType =
  | "minimalist"
  | "ornate"
  | "floral"
  | "geometric"
  | "vintage"
  | "modern";

export type ComplexityType = "simple" | "medium" | "ornate";

export type StoneType =
  | "diamond"
  | "ruby"
  | "sapphire"
  | "emerald"
  | "moissanite"
  | "cubic_zirconia"
  | "amethyst"
  | "none";

export type BraceletSize = "XS" | "S" | "M" | "L" | "XL";

export type BraceletStyle =
  | "tennis"
  | "bangle"
  | "cuff"
  | "chain"
  | "beaded";

/* ── Component types ── */

export interface BandComponent {
  width_mm: number;
  thickness_mm: number;
  profile: "round" | "flat" | "domed";
}

export interface MotifComponent {
  enabled: boolean;
  shape: "sphere" | "torus_knot" | "flower" | "shield" | "plain";
  size_mm: number;
}

export interface AccentStoneComponent {
  position_angle: number;
  size_mm: number;
}

export interface ClaspComponent {
  style: "lobster" | "toggle" | "magnetic" | "box";
  length_mm: number;
}

export interface StoneComponent {
  stone_type: StoneType;
  color: string;
  carat: number;
  cut: "round" | "oval" | "cushion" | "emerald" | "pear";
}

/* ── Price ── */

export interface PriceBreakdown {
  metal_cost: number;
  center_stone_cost: number;
  accent_stone_cost: number;
  finish_cost: number;
  labor_cost: number;
  subtotal: number;
  markup_percent: number;
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

/* ── AI analysis ── */

export interface AIAnalysis {
  style: StyleType;
  complexity: ComplexityType;
  motif_description: string;
  detected_metal_hint: string;
  detected_stone_hint: string;
  confidence: number;
}

/* ── Components / stones containers ── */

export interface BraceletComponents {
  band: BandComponent;
  center_motif: MotifComponent;
  accent_stones: AccentStoneComponent[];
  clasp: ClaspComponent;
}

export interface StonesConfig {
  center_stone: StoneComponent | null;
  accent_stone_type: StoneType;
  accent_stone_color: string;
  accent_stone_count: number;
}

/* ── Main design ── */

export interface JewelryDesign {
  design_id: string;
  jewelry_type: JewelryType;
  source_image_path: string;
  preview_image_path: string | null;
  model_glb_path: string | null;

  ai_analysis: AIAnalysis;

  metal: MetalType;
  finish: FinishType;
  bracelet_style: BraceletStyle;
  bracelet_size: BraceletSize;
  estimated_weight_g: number;

  components: BraceletComponents;
  stones: StonesConfig;

  price_breakdown: PriceBreakdown;
  budget_target: number | null;
  optimization_suggestions: OptimizationSuggestion[];

  created_at: string;
  updated_at: string;
}

/* ── API request/response types ── */

export interface UploadResponse {
  image_path: string;
  filename: string;
}

export interface CustomizeRequest {
  design_id: string;
  metal?: MetalType;
  finish?: FinishType;
  bracelet_style?: BraceletStyle;
  bracelet_size?: BraceletSize;
  center_stone_type?: StoneType;
  center_stone_color?: string;
  center_stone_carat?: number;
  accent_stone_type?: StoneType;
  accent_stone_color?: string;
  accent_stone_count?: number;
  band_width_mm?: number;
  band_thickness_mm?: number;
  motif_shape?: string;
  motif_size_mm?: number;
}

/* ── App state ── */

export type AppStatus = "idle" | "uploading" | "analyzing" | "ready" | "error";
