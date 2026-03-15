"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { useJewelryStore } from "@/store/useJewelryStore";
import { getImageUrl } from "@/lib/api";

interface Props {
  imageUrl?: string;
}

export default function TexturedRing({ imageUrl }: Props) {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;
  const url = imageUrl || getImageUrl(design.design_id);
  return <TexturedBand url={url} bandWidth={design.band_width} />;
}

function TexturedBand({ url, bandWidth }: { url: string; bandWidth: number }) {
  const texture = useLoader(THREE.TextureLoader, url);
  const tex = useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [texture]);

  const R = 0.35;
  const bw = Math.max(bandWidth, 0.06);

  return (
    <mesh>
      <torusGeometry args={[R, bw, 48, 128]} />
      <meshStandardMaterial map={tex} metalness={0.05} roughness={0.35} envMapIntensity={0.3} />
    </mesh>
  );
}
