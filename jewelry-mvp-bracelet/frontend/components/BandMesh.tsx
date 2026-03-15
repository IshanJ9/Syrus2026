"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { METAL_PRESETS, FINISH_ROUGHNESS } from "./materialPresets";

interface BandProps {
  metal: string;
  finish: string;
  bandWidth: number;
  style: string;
}

function getMetal(metal: string, finish: string) {
  const preset = METAL_PRESETS[metal as keyof typeof METAL_PRESETS] ?? METAL_PRESETS.yellow_gold;
  const fr = FINISH_ROUGHNESS[finish as keyof typeof FINISH_ROUGHNESS] ?? 0;
  return { color: preset.color, metalness: preset.metalness, roughness: Math.min(1, preset.roughness + fr) };
}

// ── Tennis ───────────────────────────────────────────────────────────────
function TennisBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMetal(metal, finish);
  const segments = 24;
  const radius = 1.1;
  const links = useMemo(() => {
    const arr = [];
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      arr.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, angle });
    }
    return arr;
  }, [radius, segments]);

  return (
    <group>
      {links.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, 0]} rotation={[0, 0, l.angle]}>
          <boxGeometry args={[0.22, bandWidth * 1.5, bandWidth * 1.5]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}

// ── Bangle ───────────────────────────────────────────────────────────────
function BangleBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMetal(metal, finish);
  return (
    <mesh>
      <torusGeometry args={[1.1, bandWidth, 32, 128]} />
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}

// ── Cuff ─────────────────────────────────────────────────────────────────
function CuffBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMetal(metal, finish);
  const arc = (280 / 360) * Math.PI * 2;
  const geom = useMemo(() => new THREE.TorusGeometry(1.1, bandWidth, 16, 128, arc), [bandWidth, arc]);
  const rot = -arc / 2 - Math.PI / 2;
  return (
    <mesh geometry={geom} rotation={[0, 0, rot]}>
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}

// ── Chain ─────────────────────────────────────────────────────────────────
function ChainBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMetal(metal, finish);
  const links = 20;
  const radius = 1.05;
  const arr = useMemo(() => {
    const a = [];
    for (let i = 0; i < links; i++) {
      const angle = (i / links) * Math.PI * 2;
      a.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, angle, flip: i % 2 });
    }
    return a;
  }, [links, radius]);

  return (
    <group>
      {arr.map((l, i) => (
        <mesh key={i} position={[l.x, l.y, 0]} rotation={[l.flip ? Math.PI / 2 : 0, 0, l.angle + Math.PI / 2]}>
          <torusGeometry args={[bandWidth * 1.4, bandWidth * 0.45, 8, 32]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}

// ── Beaded ────────────────────────────────────────────────────────────────
function BeadedBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMetal(metal, finish);
  const beads = 28;
  const radius = 1.05;
  const arr = useMemo(() => {
    const a = [];
    for (let i = 0; i < beads; i++) {
      const angle = (i / beads) * Math.PI * 2;
      a.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
    return a;
  }, [beads, radius]);

  return (
    <group>
      {arr.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0]}>
          <sphereGeometry args={[bandWidth * 0.9, 16, 16]} />
          <meshStandardMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}

export default function BandMesh(props: BandProps) {
  switch (props.style) {
    case "tennis":  return <TennisBand {...props} />;
    case "cuff":    return <CuffBand {...props} />;
    case "chain":   return <ChainBand {...props} />;
    case "beaded":  return <BeadedBand {...props} />;
    default:        return <BangleBand {...props} />;
  }
}
