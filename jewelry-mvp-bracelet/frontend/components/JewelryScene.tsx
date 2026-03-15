"use client";
import { Suspense } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import { useJewelryStore } from "@/store/useJewelryStore";

import BandMesh from "./BandMesh";
import StoneMesh from "./StoneMesh";
import MotifMesh from "./MotifMesh";
import ClaspMesh from "./ClaspMesh";
import RingMesh from "./RingMesh";
import PendantMesh from "./PendantMesh";
import EarringMesh from "./EarringMesh";

import TexturedBracelet from "./TexturedBracelet";
import TexturedRing from "./TexturedRing";
import TexturedPendant from "./TexturedPendant";
import TexturedEarring from "./TexturedEarring";
import GeneratedMeshViewer from "./GeneratedMeshViewer";

/* ─── Procedural renderers per jewelry type ─── */

function ProceduralBracelet() {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;
  return (
    <group>
      <BandMesh metal={design.metal} finish={design.finish} bandWidth={design.band_width} style={design.bracelet_style} />
      <StoneMesh stone={design.stone} accentCount={design.accent_count} centerStone={design.center_stone} style={design.bracelet_style} bandWidth={design.band_width} jewelryType="bracelet" stoneSize={design.stone_size} />
      <MotifMesh motif={design.motif} metal={design.metal} />
      <ClaspMesh metal={design.metal} />
    </group>
  );
}

function ProceduralRing() {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;
  return (
    <group>
      <RingMesh metal={design.metal} finish={design.finish} bandWidth={design.band_width} style={design.ring_style ?? "band"} />
      <StoneMesh stone={design.stone} accentCount={design.accent_count} centerStone={design.center_stone} style={design.ring_style ?? "band"} bandWidth={design.band_width} jewelryType="ring" stoneSize={design.stone_size} />
    </group>
  );
}

function ProceduralPendant() {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;
  return (
    <group>
      <PendantMesh metal={design.metal} finish={design.finish} bandWidth={design.band_width} style={design.pendant_style ?? "drop"} />
      <StoneMesh stone={design.stone} accentCount={design.accent_count} centerStone={design.center_stone} style={design.pendant_style ?? "drop"} bandWidth={design.band_width} jewelryType="pendant" stoneSize={design.stone_size} />
    </group>
  );
}

function ProceduralEarring() {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;
  return (
    <group>
      <EarringMesh metal={design.metal} finish={design.finish} bandWidth={design.band_width} style={design.earring_style ?? "stud"} />
      <StoneMesh stone={design.stone} accentCount={design.accent_count} centerStone={design.center_stone} style={design.earring_style ?? "stud"} bandWidth={design.band_width} jewelryType="earring" stoneSize={design.stone_size} />
    </group>
  );
}

/* ─── Procedural dispatcher ─── */

function ProceduralView() {
  const jtype = useJewelryStore((s) => s.design?.jewelry_type ?? "bracelet");
  switch (jtype) {
    case "ring":    return <ProceduralRing />;
    case "pendant": return <ProceduralPendant />;
    case "earring": return <ProceduralEarring />;
    default:        return <ProceduralBracelet />;
  }
}

/* ─── Textured dispatcher ─── */

function TexturedView({ imageUrl }: { imageUrl: string }) {
  const jtype = useJewelryStore((s) => s.design?.jewelry_type ?? "bracelet");
  switch (jtype) {
    case "ring":    return <TexturedRing imageUrl={imageUrl} />;
    case "pendant": return <TexturedPendant imageUrl={imageUrl} />;
    case "earring": return <TexturedEarring imageUrl={imageUrl} />;
    default:        return <TexturedBracelet imageUrl={imageUrl} />;
  }
}

/* ─── Stone overlay for AI mesh — scales gem positions to match AI mesh bounds ─── */

function StoneOverlay() {
  const design = useJewelryStore((s) => s.design);
  if (!design || (design.stone === "none" && !design.center_stone)) return null;

  const jtype = design.jewelry_type ?? "bracelet";
  const style =
    jtype === "ring" ? (design.ring_style ?? "band") :
    jtype === "pendant" ? (design.pendant_style ?? "drop") :
    jtype === "earring" ? (design.earring_style ?? "stud") :
    design.bracelet_style;

  // The AI mesh is auto-scaled to 3.0 units. Procedural bracelet uses R=1.1,
  // ring R=0.35, pendant/earring ~0.35. Scale the StoneMesh group so gems align.
  const scaleMap: Record<string, number> = {
    bracelet: 1.35,  // 3.0 / (1.1 * 2) ≈ 1.36
    ring: 4.0,       // 3.0 / (0.35 * 2) ≈ 4.3
    pendant: 3.0,
    earring: 3.0,
  };
  const s = scaleMap[jtype] ?? 1.35;

  return (
    <group scale={[s, s, s]}>
      <StoneMesh
        stone={design.stone}
        accentCount={design.accent_count}
        centerStone={design.center_stone}
        style={style}
        bandWidth={design.band_width}
        jewelryType={jtype}
        stoneSize={design.stone_size * 1.5}
      />
    </group>
  );
}

/* ─── AI Mesh view ─── */

function AIMeshView({ designId }: { designId: string }) {
  return (
    <Suspense fallback={<ProceduralView />}>
      <GeneratedMeshViewer designId={designId} />
      <StoneOverlay />
    </Suspense>
  );
}

/* ─── Main scene ─── */

interface SceneProps {
  showAIMesh?: boolean;
  uploadedImageUrl?: string;
}

export default function JewelryScene({ showAIMesh = false, uploadedImageUrl }: SceneProps) {
  const design = useJewelryStore((s) => s.design);
  const hasAIMesh = Boolean(design?.model_glb_path);

  let view: React.ReactNode;

  if (showAIMesh && hasAIMesh && design) {
    view = <AIMeshView designId={design.design_id} />;
  } else if (design && uploadedImageUrl) {
    view = (
      <Suspense fallback={<ProceduralView />}>
        <TexturedView imageUrl={uploadedImageUrl} />
      </Suspense>
    );
  } else {
    view = <ProceduralView />;
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-3, -3, 3]} intensity={0.6} color="#8080ff" />
      <pointLight position={[0, 0, 3]} intensity={1.0} color="#ffe4b5" />
      <spotLight position={[0, 5, 0]} intensity={0.8} angle={0.5} penumbra={0.5} color="#fffaf0" />
      <Environment preset="studio" />

      {view}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        autoRotate
        autoRotateSpeed={1.0}
        minDistance={2}
        maxDistance={8}
      />
    </>
  );
}
