"use client";
import { STONE_COLORS } from "./materialPresets";

interface GemProps {
  stone: string;
  size: number;
  position?: [number, number, number];
}

export function BrilliantCutGem({ stone, size, position = [0, 0, 0] }: GemProps) {
  const color = STONE_COLORS[stone] ?? STONE_COLORS.diamond;
  const crownH = size * 0.35;
  const pavilionH = size * 0.55;
  const girdle = size * 0.55;
  const table = girdle * 0.55;

  return (
    <group position={position}>
      <mesh position={[0, crownH / 2, 0]}>
        <cylinderGeometry args={[table, girdle, crownH, 8]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.0}
          roughness={0.02}
          transmission={0.85}
          transparent
          opacity={0.95}
          ior={2.42}
          thickness={1.0}
          envMapIntensity={5.0}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          specularIntensity={2.0}
        />
      </mesh>
      <mesh position={[0, -pavilionH / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[girdle, pavilionH, 8]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.0}
          roughness={0.02}
          transmission={0.85}
          transparent
          opacity={0.95}
          ior={2.42}
          thickness={1.0}
          envMapIntensity={5.0}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          specularIntensity={2.0}
        />
      </mesh>
    </group>
  );
}

export function CabochonGem({ stone, size, position = [0, 0, 0] }: GemProps) {
  const color = STONE_COLORS[stone] ?? "#888";
  const isOpal = stone === "opal";
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size * 0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={color}
          metalness={isOpal ? 0.1 : 0.05}
          roughness={isOpal ? 0.15 : 0.02}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          envMapIntensity={2.0}
          iridescence={isOpal ? 1.0 : 0.0}
          iridescenceIOR={1.3}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.4, 32]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function PearlGem({ size, position = [0, 0, 0] }: GemProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size * 0.35, 32, 32]} />
      <meshPhysicalMaterial
        color="#FDEEF4"
        metalness={0.0}
        roughness={0.15}
        sheen={1.0}
        sheenColor="#FFE4E1"
        sheenRoughness={0.2}
        clearcoat={0.8}
        envMapIntensity={1.5}
      />
    </mesh>
  );
}

export default function GemMesh(props: GemProps) {
  if (props.stone === "diamond") return <BrilliantCutGem {...props} />;
  if (props.stone === "pearl") return <PearlGem {...props} />;
  if (props.stone === "none") return null;
  return <CabochonGem {...props} />;
}
