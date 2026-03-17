"use client";
import { METAL_PRESETS, FINISH_ROUGHNESS } from "./materialPresets";
import type { MetalKey, FinishKey } from "./materialPresets";

interface Props {
  metal: string;
  finish: string;
  bandWidth: number;
  style: string;
}

export default function EarringMesh({ metal, finish, style }: Props) {
  const preset = METAL_PRESETS[metal as MetalKey] ?? METAL_PRESETS.yellow_gold;
  const roughness = Math.min(1, preset.roughness + (FINISH_ROUGHNESS[finish as FinishKey] ?? 0));

  const matProps = {
    color: preset.color,
    metalness: preset.metalness,
    roughness,
    envMapIntensity: 1.5,
    clearcoat: 0.3,
  };

  if (style === "hoop") {
    return (
      <mesh>
        <torusGeometry args={[0.35, 0.04, 24, 64]} />
        <meshPhysicalMaterial {...matProps} />
      </mesh>
    );
  }

  if (style === "drop" || style === "dangle") {
    return (
      <group>
        {/* Hook */}
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.06, 0.015, 16, 32, Math.PI]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
        {/* Drop body */}
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  // Stud (default)
  return (
    <mesh>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshPhysicalMaterial {...matProps} />
    </mesh>
  );
}
