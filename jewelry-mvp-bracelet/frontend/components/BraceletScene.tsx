"use client";
import { Suspense } from "react";
import { OrbitControls, Environment } from "@react-three/drei";
import { useJewelryStore } from "@/store/useJewelryStore";
import BandMesh from "./BandMesh";
import StoneMesh from "./StoneMesh";
import MotifMesh from "./MotifMesh";
import ClaspMesh from "./ClaspMesh";
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

/** Procedural stones — used both standalone and as overlay on AI mesh */
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

export default function BraceletScene() {
  const design = useJewelryStore((s) => s.design);
  const hasAIMesh = Boolean(design?.model_glb_path);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-3, -3, 3]} intensity={0.6} color="#8080ff" />
      <pointLight position={[0, 0, 3]} intensity={1.0} color="#ffe4b5" />
      <spotLight position={[0, 5, 0]} intensity={0.8} angle={0.5} penumbra={0.5} color="#fffaf0" />
      <Environment preset="studio" />

      {hasAIMesh && design ? (
        <Suspense fallback={<ProceduralBracelet />}>
          {/* Hybrid: AI mesh for base shape + procedural stones on top */}
          <GeneratedMeshViewer designId={design.design_id} />
          <StoneOverlay />
        </Suspense>
      ) : (
        <ProceduralBracelet />
      )}

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
