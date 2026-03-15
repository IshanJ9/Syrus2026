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

// ── Tennis: row of small rectangular prong settings ──────────────────────
function TennisBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMatProps(metal, finish);
  const segments = 36;
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
          <boxGeometry args={[0.15, bandWidth * 1.2, bandWidth * 1.2]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}

// ── Bangle: smooth torus ─────────────────────────────────────────────────
function BangleBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMatProps(metal, finish);
  return (
    <mesh>
      <torusGeometry args={[1.1, bandWidth, 48, 128]} />
      <meshPhysicalMaterial {...mat} />
    </mesh>
  );
}

// ── Cuff: open arc with thick band ──────────────────────────────────────
function CuffBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMatProps(metal, finish);
  const arc = (280 / 360) * Math.PI * 2;
  const geom = useMemo(() => new THREE.TorusGeometry(1.1, bandWidth, 24, 128, arc), [bandWidth, arc]);
  const rot = -arc / 2 - Math.PI / 2;
  return (
    <group>
      <mesh geometry={geom} rotation={[0, 0, rot]}>
        <meshPhysicalMaterial {...mat} />
      </mesh>
      {/* End caps */}
      {[rot, rot + arc].map((a, i) => (
        <mesh key={i} position={[Math.cos(a + Math.PI / 2) * 1.1, Math.sin(a + Math.PI / 2) * 1.1, 0]}>
          <sphereGeometry args={[bandWidth * 1.2, 16, 16]} />
          <meshPhysicalMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}

// ── Chain: clearly visible interlocking ring links ───────────────────────
function ChainBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMatProps(metal, finish);
  const linkCount = 22;
  const R = 1.1;

  // Individual link dimensions — sized so each ring is clearly visible
  const linkR = 0.1;     // link ring major radius (visible hole in center)
  const tubeR = 0.028;   // wire thickness of each ring

  const links = useMemo(() => {
    const arr: { x: number; y: number; angle: number; odd: boolean }[] = [];
    for (let i = 0; i < linkCount; i++) {
      const angle = (i / linkCount) * Math.PI * 2;
      arr.push({
        x: Math.cos(angle) * R,
        y: Math.sin(angle) * R,
        angle,
        odd: i % 2 === 1,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {links.map((l, i) => (
        <group key={i} position={[l.x, l.y, 0]} rotation={[0, 0, l.angle]}>
          {/* Even links: ring in YZ plane (spans along tangent, hole faces radial)
              Odd links:  ring in XZ plane (spans radially, hole faces tangent)
              This creates the alternating interlocking pattern of a real chain */}
          <mesh
            rotation={l.odd ? [Math.PI / 2, 0, 0] : [0, Math.PI / 2, 0]}
            scale={[1, 1.3, 1]}
          >
            <torusGeometry args={[linkR, tubeR, 12, 20]} />
            <meshPhysicalMaterial {...mat} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Beaded: string of polished spheres ───────────────────────────────────
function BeadedBand({ metal, finish, bandWidth }: BandProps) {
  const mat = getMatProps(metal, finish);
  const beads = 32;
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
          <sphereGeometry args={[bandWidth * 0.85, 24, 24]} />
          <meshPhysicalMaterial {...mat} />
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
