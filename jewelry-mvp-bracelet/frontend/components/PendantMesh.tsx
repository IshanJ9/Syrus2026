"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { METAL_PRESETS, FINISH_ROUGHNESS } from "./materialPresets";

interface PendantProps {
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

function BailMesh({ metal, finish }: { metal: string; finish: string }) {
  const mat = getMatProps(metal, finish);
  const arc = Math.PI;
  const geom = useMemo(() => new THREE.TorusGeometry(0.06, 0.015, 12, 24, arc), []);
  return (
    <mesh geometry={geom} position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <meshPhysicalMaterial {...mat} />
    </mesh>
  );
}

function ChainHint({ metal, finish }: { metal: string; finish: string }) {
  const mat = getMatProps(metal, finish);
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.3) * 0.02, 0.55 + i * 0.08, 0]}
              rotation={i % 2 === 0 ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.03, 0.008, 8, 12]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}

function DropPendant({ metal, finish }: PendantProps) {
  const mat = getMatProps(metal, finish);
  return (
    <group>
      <mesh scale={[1, 1.6, 0.4]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <BailMesh metal={metal} finish={finish} />
      <ChainHint metal={metal} finish={finish} />
    </group>
  );
}

function HeartPendant({ metal, finish }: PendantProps) {
  const mat = getMatProps(metal, finish);
  return (
    <group>
      <mesh position={[-0.1, 0.08, 0]} scale={[1, 1, 0.4]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <mesh position={[0.1, 0.08, 0]} scale={[1, 1, 0.4]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI]} scale={[1, 1, 0.4]}>
        <coneGeometry args={[0.22, 0.3, 4]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <BailMesh metal={metal} finish={finish} />
      <ChainHint metal={metal} finish={finish} />
    </group>
  );
}

function CrossPendant({ metal, finish, bandWidth }: PendantProps) {
  const mat = getMatProps(metal, finish);
  const d = bandWidth * 0.8;
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.1, 0.5, d]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.35, 0.1, d]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <BailMesh metal={metal} finish={finish} />
      <ChainHint metal={metal} finish={finish} />
    </group>
  );
}

function CharmPendant({ metal, finish, bandWidth }: PendantProps) {
  const mat = getMatProps(metal, finish);
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, bandWidth * 0.5, 32]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <BailMesh metal={metal} finish={finish} />
      <ChainHint metal={metal} finish={finish} />
    </group>
  );
}

function LocketPendant({ metal, finish }: PendantProps) {
  const mat = getMatProps(metal, finish);
  return (
    <group>
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.03, 32]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.03, 32]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.2, 0.015, 12, 48]} />
        <meshPhysicalMaterial {...mat} />
      </mesh>
      <BailMesh metal={metal} finish={finish} />
      <ChainHint metal={metal} finish={finish} />
    </group>
  );
}

export default function PendantMesh(props: PendantProps) {
  switch (props.style) {
    case "drop":   return <DropPendant {...props} />;
    case "heart":  return <HeartPendant {...props} />;
    case "cross":  return <CrossPendant {...props} />;
    case "charm":  return <CharmPendant {...props} />;
    case "locket": return <LocketPendant {...props} />;
    default:       return <DropPendant {...props} />;
  }
}
