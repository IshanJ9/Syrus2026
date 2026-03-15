"use client";
import { Canvas } from "@react-three/fiber";
import { useJewelryStore } from "@/store/useJewelryStore";
import BraceletScene from "./BraceletScene";

export default function ViewerPanel() {
  const design = useJewelryStore((s) => s.design);
  const isLoading = useJewelryStore((s) => s.status === "analyzing" || s.status === "uploading");
  const hasAIMesh = Boolean(design?.model_glb_path);
  const isMeshPending = Boolean(design && !design.model_glb_path);

  return (
    <div className="relative w-full h-full bg-gray-950">
      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#080810"]} />
        {design ? (
          <BraceletScene />
        ) : (
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#333" wireframe />
          </mesh>
        )}
      </Canvas>

      {/* HUD overlays */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${hasAIMesh ? "bg-green-900/80 text-green-300" : isMeshPending ? "bg-blue-900/80 text-blue-300 animate-pulse" : "bg-yellow-900/80 text-yellow-300"}`}>
          {hasAIMesh ? "AI Mesh" : isMeshPending ? "Generating AI Mesh..." : "Procedural"}
        </span>
        {design && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-800/80 text-gray-300 capitalize">
            {design.bracelet_style}
          </span>
        )}
      </div>

      {!design && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-600">
            <p className="text-lg font-medium">Upload a bracelet image</p>
            <p className="text-sm mt-1">to start generating your 3D model</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-amber-300 text-sm">AI is analyzing your image...</p>
            <p className="text-gray-400 text-xs mt-1">Building 3D mesh in background (30-60s)</p>
          </div>
        </div>
      )}
    </div>
  );
}
