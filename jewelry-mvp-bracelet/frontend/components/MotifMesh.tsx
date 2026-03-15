"use client";

interface MotifProps {
  motif: string;
  metal: string;
}

export default function MotifMesh({ motif, metal }: MotifProps) {
  if (motif === "none") return null;

  const color =
    metal === "yellow_gold" ? "#FFD700" :
    metal === "rose_gold" ? "#E8A090" :
    metal === "silver" ? "#C0C0C0" : "#E8E8E8";

  if (motif === "floral") {
    return (
      <group position={[0, 0, 0.18]}>
        {[0,1,2,3,4].map(i => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} />
            </mesh>
          );
        })}
        <mesh>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.05} />
        </mesh>
      </group>
    );
  }

  if (motif === "geometric") {
    return (
      <mesh position={[0, 0, 0.18]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.2, 0.04]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.05} wireframe />
      </mesh>
    );
  }

  if (motif === "vine") {
    return (
      <group position={[0, 0, 0.18]}>
        {[-0.15, 0, 0.15].map((x, i) => (
          <mesh key={i} position={[x, Math.sin(i * 2) * 0.08, 0]}>
            <torusGeometry args={[0.06, 0.02, 6, 12]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} />
          </mesh>
        ))}
      </group>
    );
  }

  return null;
}
