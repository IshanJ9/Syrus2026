"use client";
import { Suspense } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import { useJewelryStore } from "@/store/useJewelryStore";
import BandMesh from "./BandMesh";
import StoneMesh from "./StoneMesh";
import MotifMesh from "./MotifMesh";
import ClaspMesh from "./ClaspMesh";
import TexturedBracelet from "./TexturedBracelet";
import GeneratedMeshViewer from "./GeneratedMeshViewer";

function ProceduralBracelet() {
  const design = useJewelryStore((s) => s.design);
  if (!design) return null;

  return (
    <group>
      <BandMesh
        metal={design.metal}
        finish={design.finish}
        bandWidth={design.band_width}
        style={design.bracelet_style}
      />
      <StoneOverlay />
      <MotifMesh motif={design.motif} metal={design.metal} />
      <ClaspMesh metal={design.metal} />
    </group>
  );
}

function StoneOverlay() {
  const design = useJewelryStore((s) => s.design);
  if (!design || design.stone === "none") return null;

  return (
    <StoneMesh
      stone={design.stone}
      accentCount={design.accent_count}
      centerStone={design.center_stone}
      style={design.bracelet_style}
      bandWidth={design.band_width}
    />
  );
}

function AIMeshView({ designId }: { designId: string }) {
  return (
    <Suspense fallback={<ProceduralBracelet />}>
      <GeneratedMeshViewer designId={designId} />
      <StoneOverlay />
    </Suspense>
  );
}

interface SceneProps {
  showAIMesh?: boolean;
  /** Browser blob URL of the uploaded image for instant texture mapping */
  uploadedImageUrl?: string;
}

export default function BraceletScene({ showAIMesh = false, uploadedImageUrl }: SceneProps) {
  const design = useJewelryStore((s) => s.design);
  const hasAIMesh = Boolean(design?.model_glb_path);

  // Determine which view to render:
  // 1. AI mesh (if toggled on and available)
  // 2. Image-textured bracelet (primary — uses uploaded photo as texture)
  // 3. Procedural bracelet (fallback if no image available)
  let braceletView: React.ReactNode;

  if (showAIMesh && hasAIMesh && design) {
    braceletView = <AIMeshView designId={design.design_id} />;
  } else if (design && uploadedImageUrl) {
    braceletView = (
      <Suspense fallback={<ProceduralBracelet />}>
        <TexturedBracelet imageUrl={uploadedImageUrl} />
        <StoneOverlay />
      </Suspense>
    );
  } else {
    braceletView = <ProceduralBracelet />;
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-3, -3, 3]} intensity={0.6} color="#8080ff" />
      <pointLight position={[0, 0, 3]} intensity={1.0} color="#ffe4b5" />
      <spotLight position={[0, 5, 0]} intensity={0.8} angle={0.5} penumbra={0.5} color="#fffaf0" />
      <Environment preset="studio" />

      {braceletView}

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
