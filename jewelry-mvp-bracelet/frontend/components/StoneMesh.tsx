"use client";
import { useMemo } from "react";
import GemMesh from "./GemMesh";
import type { JewelryType } from "@/types/jewelry";

interface StoneProps {
  stone: string;
  accentCount: number;
  centerStone: boolean;
  style: string;
  bandWidth: number;
  jewelryType?: JewelryType;
  stoneSize?: number;
}

export default function StoneMesh({
  stone,
  accentCount,
  centerStone,
  style,
  bandWidth,
  jewelryType = "bracelet",
  stoneSize = 0.5,
}: StoneProps) {
  if (stone === "none" && !centerStone) return null;

  const gemSize = stoneSize * 0.3;

  /* ── Earring: center stone on the front face ── */
  if (jewelryType === "earring") {
    return (
      <group>
        {centerStone && (
          <GemMesh stone={stone} size={gemSize * 1.3} position={[0, 0.2, 0.04]} />
        )}
        {stone !== "none" && accentCount > 0 &&
          Array.from({ length: Math.min(accentCount, 6) }).map((_, i) => {
            const angle = (i / Math.min(accentCount, 6)) * Math.PI * 2;
            const r = 0.08;
            return (
              <GemMesh key={i} stone={stone} size={gemSize * 0.4} position={[Math.cos(angle) * r, 0.2 + Math.sin(angle) * r, 0.04]} />
            );
          })}
      </group>
    );
  }

  /* ── Pendant: center stone at origin ── */
  if (jewelryType === "pendant") {
    return (
      <group>
        {centerStone && (
          <GemMesh stone={stone} size={gemSize * 1.4} position={[0, 0, 0.05]} />
        )}
      </group>
    );
  }

  /* ── Ring: stones along top of torus (R=0.35) ── */
  if (jewelryType === "ring") {
    const R = 0.35;
    if (style === "pave") {
      const count = Math.max(accentCount, 10);
      return (
        <group>
          {Array.from({ length: count }).map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            return (
              <GemMesh
                key={i}
                stone={stone}
                size={gemSize * 0.5}
                position={[Math.cos(angle) * R, Math.sin(angle) * R, bandWidth * 0.9]}
              />
            );
          })}
        </group>
      );
    }
    return (
      <group>
        {centerStone && (
          <GemMesh stone={stone} size={gemSize * 1.2} position={[R, 0, bandWidth * 1.2]} />
        )}
        {stone !== "none" && accentCount > 0 &&
          Array.from({ length: Math.min(accentCount, 6) }).map((_, i) => {
            const offset = ((i + 1) / (Math.min(accentCount, 6) + 1) - 0.5) * 0.3;
            return (
              <GemMesh key={i} stone={stone} size={gemSize * 0.6} position={[R, offset, bandWidth * 0.8]} />
            );
          })}
      </group>
    );
  }

  /* ── Bracelet: stones along torus (R=1.1) ── */
  const radius = 1.1;

  // Tennis: stones all around 360
  if (style === "tennis") {
    const count = Math.max(accentCount, 16);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const positions = useMemo(() => {
      const arr: [number, number, number][] = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        arr.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0]);
      }
      return arr;
    }, [count]);

    return (
      <group>
        {positions.map((pos, i) => (
          <GemMesh key={i} stone={stone} size={gemSize * 0.7} position={pos} />
        ))}
      </group>
    );
  }

  // Arc styles: center stone + accent stones along arc
  return (
    <group>
      {centerStone && (
        <GemMesh stone={stone} size={gemSize * 1.2} position={[radius, 0, bandWidth * 0.7]} />
      )}
      {stone !== "none" && accentCount > 0 &&
        Array.from({ length: Math.min(accentCount, 8) }).map((_, i) => {
          const angle = ((i + 1) / (Math.min(accentCount, 8) + 1) - 0.5) * Math.PI * 1.2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <GemMesh key={i} stone={stone} size={gemSize * 0.6} position={[x, y, bandWidth * 0.5]} />
          );
        })}
    </group>
  );
}
