export type MetalKey = "yellow_gold" | "white_gold" | "rose_gold" | "silver" | "platinum";
export type FinishKey = "polished" | "matte" | "brushed" | "hammered";

export const METAL_PRESETS: Record<MetalKey, { color: string; metalness: number; roughness: number }> = {
  yellow_gold: { color: "#FFD700", metalness: 0.95, roughness: 0.05 },
  white_gold:  { color: "#E8E8E8", metalness: 0.95, roughness: 0.05 },
  rose_gold:   { color: "#E8A090", metalness: 0.90, roughness: 0.08 },
  silver:      { color: "#C0C0C0", metalness: 0.90, roughness: 0.10 },
  platinum:    { color: "#E5E4E2", metalness: 0.98, roughness: 0.02 },
};

export const STONE_COLORS: Record<string, string> = {
  diamond:  "#E8F4FD",
  ruby:     "#E0115F",
  emerald:  "#50C878",
  sapphire: "#0F52BA",
  none:     "#888888",
};

export const FINISH_ROUGHNESS: Record<FinishKey, number> = {
  polished: 0.0,
  matte:    0.6,
  brushed:  0.3,
  hammered: 0.5,
};
