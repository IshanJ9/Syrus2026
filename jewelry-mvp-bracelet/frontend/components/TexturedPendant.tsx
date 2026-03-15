"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { useJewelryStore } from "@/store/useJewelryStore";
import { getImageUrl } from "@/lib/api";

interface Props {
  imageUrl?: string;
}

export default function TexturedPendant({ imageUrl }: Props) {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;
  const url = imageUrl || getImageUrl(design.design_id);
  return <TexturedBody url={url} />;
}

function TexturedBody({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url);
  const tex = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [texture]);

  return (
    <group>
      {/* Front face with photo */}
      <mesh>
        <circleGeometry args={[0.3, 64]} />
        <meshStandardMaterial map={tex} metalness={0.0} roughness={0.4} side={THREE.FrontSide} />
      </mesh>
      {/* Back face (metallic) */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.01]}>
        <circleGeometry args={[0.3, 64]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Bail at top */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}
