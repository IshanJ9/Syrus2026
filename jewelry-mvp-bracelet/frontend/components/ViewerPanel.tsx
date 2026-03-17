"use client";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useJewelryStore } from "@/store/useJewelryStore";
import JewelryScene from "./JewelryScene";

export default function ViewerPanel() {
  const design = useJewelryStore((s) => s.design);
  const uploadedImageUrl = useJewelryStore((s) => s.uploadedImagePath);
  const isLoading = useJewelryStore((s) => s.status === "analyzing" || s.status === "uploading");
  const hasAIMesh = Boolean(design?.model_glb_path);
  const isMeshPending = Boolean(design && !design.model_glb_path);
  const [showAIMesh, setShowAIMesh] = useState(false);

  return (
    <div className="relative w-full h-full bg-gray-950">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#1a1a2e"]} />
        {design ? (
          <JewelryScene showAIMesh={showAIMesh} uploadedImageUrl={uploadedImageUrl || undefined} />
        ) : (
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#333" wireframe />
          </mesh>
        )}
      </Canvas>

      {/* HUD overlays */}
      <div className="absolute top-3 left-3 flex gap-2 items-center">
        {design && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-800/80 text-gray-300 capitalize">
            {design.jewelry_type} &middot; {design.jewelry_type === "ring" ? (design.ring_style ?? "band") : design.jewelry_type === "pendant" ? (design.pendant_style ?? "drop") : design.jewelry_type === "earring" ? (design.earring_style ?? "stud") : design.bracelet_style}
          </span>
        )}
        {isMeshPending && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-900/80 text-blue-300 animate-pulse">
            Generating AI Mesh...
          </span>
        )}
      </div>

      {/* AI Mesh toggle — only show when AI mesh is available */}
      {hasAIMesh && (
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowAIMesh(!showAIMesh)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              showAIMesh
                ? "bg-green-600 text-white"
                : "bg-gray-700/80 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {showAIMesh ? "AI Mesh ON" : "Show AI Mesh"}
          </button>
        </div>
      )}

      {!design && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-600">
            <p className="text-lg font-medium">Upload a jewelry image</p>
            <p className="text-sm mt-1">to start generating your 3D model</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-amber-300 text-sm">AI is analyzing your image...</p>
            <p className="text-gray-400 text-xs mt-1">Building 3D mesh in background</p>
          </div>
        </div>
      )}
    </div>
  );
}
