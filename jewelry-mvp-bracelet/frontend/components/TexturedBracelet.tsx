"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { useJewelryStore } from "@/store/useJewelryStore";
import { getImageUrl } from "@/lib/api";

interface Props {
  /** Fallback blob URL from the browser (instant) or backend URL */
  imageUrl?: string;
}

export default function TexturedBracelet({ imageUrl }: Props) {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;

  // Resolve the image URL: prefer passed-in blob URL, else fetch from backend
  const url = imageUrl || getImageUrl(design.design_id);

  return <TexturedBand url={url} style={design.bracelet_style} bandWidth={design.band_width} />;
}

function TexturedBand({
  url,
  style,
  bandWidth,
}: {
  url: string;
  style: string;
  bandWidth: number;
}) {
  const texture = useLoader(THREE.TextureLoader, url);

  // Configure texture for wrapping around the torus
  const tex = useMemo(() => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Repeat the image around the bracelet circumference for tiling
    texture.repeat.set(4, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [texture]);

  // Choose geometry based on style
  const R = 1.1; // bracelet radius
  const bw = Math.max(bandWidth, 0.12); // ensure visible thickness

  // For cuff, use an arc; for everything else, full torus
  const isCuff = style === "cuff";
  const arc = isCuff ? (280 / 360) * Math.PI * 2 : Math.PI * 2;
  const rot = isCuff ? -arc / 2 - Math.PI / 2 : 0;

  return (
    <group>
      <mesh rotation={[0, 0, rot]}>
        <torusGeometry args={[R, bw, 48, 200, arc]} />
        <meshStandardMaterial
          map={tex}
          metalness={0.05}
          roughness={0.35}
          envMapIntensity={0.3}
        />
      </mesh>
    </group>
  );
}
