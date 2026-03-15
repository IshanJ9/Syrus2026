"use client";
import { useJewelryStore } from "@/store/useJewelryStore";
import { getExportUrl } from "@/lib/api";

export default function ExportPanel() {
  const design = useJewelryStore((s) => s.design);

  if (!design) return null;

  function downloadMesh(format: string) {
    if (!design) return;
    const url = getExportUrl(design.design_id, format);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gemforge_${design.design_id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const confidence = Math.round(design.confidence * 100);

  return (
    <div className="gem-panel p-4">
      <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Export</h2>

      <div className="space-y-2">
        <button
          onClick={() => downloadMesh("glb")}
          className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium rounded transition-colors"
        >
          Download GLB
        </button>
        <button
          onClick={() => downloadMesh("obj")}
          className="w-full py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded transition-colors"
        >
          Download OBJ
        </button>
      </div>

      <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>AI Confidence</span>
          <span className="text-amber-400">{confidence}%</span>
        </div>
        <div className="flex justify-between">
          <span>Type</span>
          <span className="capitalize">{design.jewelry_type ?? "bracelet"}</span>
        </div>
        <div className="flex justify-between">
          <span>Style</span>
          <span className="capitalize">
            {design.jewelry_type === "ring"
              ? (design.ring_style ?? "band")
              : design.jewelry_type === "pendant"
              ? (design.pendant_style ?? "drop")
              : design.jewelry_type === "earring"
              ? (design.earring_style ?? "stud")
              : design.bracelet_style}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Mesh</span>
          <span className={design.model_glb_path ? "text-green-400" : "text-yellow-400"}>
            {design.model_glb_path ? "AI Generated" : "Procedural"}
          </span>
        </div>
      </div>
    </div>
  );
}
