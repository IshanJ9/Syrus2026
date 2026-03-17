"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { useJewelryStore } from "@/store/useJewelryStore";
import { getImageUrl } from "@/lib/api";

interface Props {
  imageUrl?: string;
}

export default function TexturedEarring({ imageUrl }: Props) {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;

  const url = imageUrl || getImageUrl(design.design_id);

  return <TexturedEarringInner url={url} style={design.earring_style ?? "stud"} />;
}

function TexturedEarringInner({ url, style }: { url: string; style: string }) {
  const texture = useLoader(THREE.TextureLoader, url);

  const tex = useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [texture]);

  const isHoop = style === "hoop";
  const isDrop = style === "drop" || style === "dangle";

  if (isHoop) {
    return (
      <mesh>
        <torusGeometry args={[0.35, 0.04, 24, 64]} />
        <meshStandardMaterial map={tex} metalness={0.05} roughness={0.35} envMapIntensity={0.3} />
      </mesh>
    );
  }

  if (isDrop) {
    return (
      <group>
        {/* Hook */}
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.06, 0.015, 16, 32, Math.PI]} />
          <meshStandardMaterial map={tex} metalness={0.05} roughness={0.35} />
        </mesh>
        {/* Drop body */}
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial map={tex} metalness={0.05} roughness={0.35} envMapIntensity={0.3} />
        </mesh>
      </group>
    );
  }

  // Stud (default)
  return (
    <mesh>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial map={tex} metalness={0.05} roughness={0.35} envMapIntensity={0.3} />
    </mesh>
  );
}
