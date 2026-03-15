"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { METAL_PRESETS, FINISH_ROUGHNESS } from "./materialPresets";

interface RingProps {
  metal: string;
  finish: string;
  bandWidth: number;
  style: string;
}

function getMatProps(metal: string, finish: string) {
  const preset = METAL_PRESETS[metal as keyof typeof METAL_PRESETS] ?? METAL_PRESETS.yellow_gold;
  const fr = FINISH_ROUGHNESS[finish as keyof typeof FINISH_ROUGHNESS] ?? 0;
  return {
    color: preset.color,
    metalness: preset.metalness,
    roughness: Math.min(1, preset.roughness + fr),
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    reflectivity: 1.0,
    envMapIntensity: 1.8,
  };
}

const R = 0.35; // ring radius (finger-sized)

function SolitaireBand({ metal, finish, bandWidth }: RingProps) {
  const mat = getMatProps(metal, finish);
  return (
    <group>
      <mesh>
        <torusGeometry args={[R, bandWidth, 48, 128]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* 4 prongs at the crown */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const px = Math.cos(angle) * bandWidth * 0.5;
        const py = Math.sin(angle) * bandWidth * 0.5;
        return (
          <mesh key={i} position={[R, py, px + bandWidth * 1.2]}
                rotation={[Math.cos(angle) * 0.2, 0, Math.sin(angle) * 0.2]}>
            <cylinderGeometry args={[0.012, 0.006, bandWidth * 1.8, 6]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        );
      })}
    </group>
  );
}

function HaloBand({ metal, finish, bandWidth }: RingProps) {
  const mat = getMatProps(metal, finish);
  const haloCount = 12;
  const haloR = bandWidth * 1.2;
  return (
    <group>
      <mesh>
        <torusGeometry args={[R, bandWidth, 48, 128]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* Raised platform */}
      <mesh position={[R, 0, bandWidth * 0.8]}>
        <cylinderGeometry args={[haloR, haloR * 0.9, bandWidth * 0.4, 16]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* Halo ring of tiny prong nubs */}
      {Array.from({ length: haloCount }).map((_, i) => {
        const a = (i / haloCount) * Math.PI * 2;
        return (
          <mesh key={i} position={[R + Math.cos(a) * haloR * 0.8, Math.sin(a) * haloR * 0.8, bandWidth * 1.2]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        );
      })}
    </group>
  );
}

function ThreeStoneBand({ metal, finish, bandWidth }: RingProps) {
  const mat = getMatProps(metal, finish);
  return (
    <group>
      <mesh>
        <torusGeometry args={[R, bandWidth, 48, 128]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* Three prong settings along the top */}
      {[-0.12, 0, 0.12].map((offset, i) => (
        <group key={i} position={[R, offset, bandWidth * (i === 1 ? 1.0 : 0.7)]}>
          {[0, 1, 2, 3].map((j) => {
            const a = (j / 4) * Math.PI * 2;
            const pr = 0.02;
            return (
              <mesh key={j} position={[Math.cos(a) * pr, Math.sin(a) * pr, 0]}>
                <cylinderGeometry args={[0.008, 0.004, bandWidth * 1.2, 4]} />
                <meshPhysicalMaterial {...mat} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

function PlainBand({ metal, finish, bandWidth }: RingProps) {
  const mat = getMatProps(metal, finish);
  return (
    <mesh>
      <torusGeometry args={[R, bandWidth * 1.5, 48, 128]} />
      <meshPhysicalMaterial {...mat} />
    </mesh>
  );
}

function PaveBand({ metal, finish, bandWidth }: RingProps) {
  const mat = getMatProps(metal, finish);
  const stoneCount = 20;
  return (
    <group>
      <mesh>
        <torusGeometry args={[R, bandWidth, 48, 128]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* Tiny stones along the top 180 degrees */}
      {Array.from({ length: stoneCount }).map((_, i) => {
        const angle = (i / stoneCount) * Math.PI * 2;
        const x = Math.cos(angle) * R;
        const y = Math.sin(angle) * R;
        return (
          <mesh key={i} position={[x, y, bandWidth * 0.9]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function RingMesh(props: RingProps) {
  switch (props.style) {
    case "solitaire":   return <SolitaireBand {...props} />;
    case "halo":        return <HaloBand {...props} />;
    case "three_stone": return <ThreeStoneBand {...props} />;
    case "pave":        return <PaveBand {...props} />;
    default:            return <PlainBand {...props} />;
  }
}
