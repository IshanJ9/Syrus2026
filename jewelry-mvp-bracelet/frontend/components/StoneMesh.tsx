"use client";
import { useMemo } from "react";
import { STONE_COLORS } from "./materialPresets";

interface StoneProps {
  stone: string;
  accentCount: number;
  centerStone: boolean;
  style: string;
  bandWidth: number;
}

function stoneColor(stone: string) {
  return STONE_COLORS[stone] ?? "#888";
}

function stoneMat(stone: string) {
  const color = stoneColor(stone);
  if (stone === "diamond") {
    return {
      color,
      metalness: 0.0,
      roughness: 0.0,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 3.0,
    };
  }
  if (stone !== "none") {
    return {
      color,
      metalness: 0.05,
      roughness: 0.02,
      transparent: false,
      opacity: 1.0,
      envMapIntensity: 2.0,
    };
  }
  return {
    color,
    metalness: 0.3,
    roughness: 0.3,
    transparent: false,
    opacity: 1.0,
    envMapIntensity: 1.0,
  };
}

export default function StoneMesh({ stone, accentCount, centerStone, style, bandWidth }: StoneProps) {
  if (stone === "none" && !centerStone) return null;

  const mat = stoneMat(stone);
  const radius = 1.1;
  const stoneR = bandWidth * 0.7;

  // Tennis: stones all around 360°
  if (style === "tennis") {
    const count = Math.max(accentCount, 16);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const positions = useMemo(() => {
      const arr = [];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        arr.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as [number, number, number]);
      }
      return arr;
    }, [count, radius]);

    return (
      <group>
        {positions.map((pos, i) => (
          <mesh key={i} position={pos}>
            <octahedronGeometry args={[stoneR * 0.7, 2]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        ))}
      </group>
    );
  }

  // Arc styles: center stone + accent stones along arc
  return (
    <group>
      {centerStone && (
        <mesh position={[radius, 0, stoneR + bandWidth * 0.5]}>
          <octahedronGeometry args={[stoneR * 1.2, 2]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      )}
      {stone !== "none" && accentCount > 0 &&
        Array.from({ length: Math.min(accentCount, 8) }).map((_, i) => {
          const angle = ((i + 1) / (Math.min(accentCount, 8) + 1) - 0.5) * Math.PI * 1.2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <mesh key={i} position={[x, y, stoneR * 0.5]}>
              <octahedronGeometry args={[stoneR * 0.65, 0]} />
              <meshStandardMaterial {...mat} />
            </mesh>
          );
        })
      }
    </group>
  );
}
