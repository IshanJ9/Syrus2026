export type MetalKey = "yellow_gold" | "white_gold" | "rose_gold" | "silver" | "platinum";
export type FinishKey = "polished" | "matte" | "brushed" | "hammered";

export const METAL_PRESETS: Record<MetalKey, { color: string; metalness: number; roughness: number }> = {
  yellow_gold: { color: "#D4A843", metalness: 0.92, roughness: 0.12 },
  white_gold:  { color: "#D9D9D4", metalness: 0.93, roughness: 0.08 },
  rose_gold:   { color: "#C6856C", metalness: 0.88, roughness: 0.12 },
  silver:      { color: "#B8B8B0", metalness: 0.90, roughness: 0.14 },
  platinum:    { color: "#DCDCD6", metalness: 0.95, roughness: 0.06 },
};

export const STONE_COLORS: Record<string, string> = {
  diamond:  "#E8F4FD",
  ruby:     "#E0115F",
  emerald:  "#50C878",
  sapphire: "#0F52BA",
  amethyst: "#9966CC",
  topaz:    "#FFC87C",
  opal:     "#E0E0F0",
  pearl:    "#FDEEF4",
  none:     "#888888",
};

export const FINISH_ROUGHNESS: Record<FinishKey, number> = {
  polished: 0.0,
  matte:    0.6,
  brushed:  0.3,
  hammered: 0.5,
};
