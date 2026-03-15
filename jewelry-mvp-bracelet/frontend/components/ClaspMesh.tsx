"use client";
import { METAL_PRESETS } from "./materialPresets";

interface ClaspProps {
  metal: string;
}

export default function ClaspMesh({ metal }: ClaspProps) {
  const preset = METAL_PRESETS[metal as keyof typeof METAL_PRESETS] ?? METAL_PRESETS.yellow_gold;
  const mat = { color: preset.color, metalness: preset.metalness, roughness: preset.roughness + 0.1 };

  return (
    <group position={[0, -1.15, 0]}>
      <mesh>
        <boxGeometry args={[0.15, 0.08, 0.08]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.05, 8]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
}
