"use client";

import dynamic from "next/dynamic";
import { useJewelryStore } from "@/store/useJewelryStore";
import UploadPanel from "@/components/UploadPanel";
import CustomizationPanel from "@/components/CustomizationPanel";
import ExportPanel from "@/components/ExportPanel";
import BudgetPanel from "@/components/BudgetPanel";

const ViewerPanel = dynamic(() => import("@/components/ViewerPanel"), { ssr: false });

export default function HomePage() {
  const design = useJewelryStore((s) => s.design);

  return (
    <main className="h-screen w-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-950/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black text-sm">G</div>
          <h1 className="text-lg font-semibold tracking-wide">GemForge</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">AI Jewelry Studio</span>
        </div>
        {design && (
          <span className="text-xs text-gray-400">
            Design ID: <span className="text-amber-400 font-mono">{design.design_id}</span>
          </span>
        )}
      </header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <aside className="w-72 shrink-0 flex flex-col gap-3 p-3 overflow-y-auto border-r border-gray-800">
          <UploadPanel />
          <BudgetPanel />
        </aside>

        {/* Center: 3D Viewer */}
        <section className="flex-1 relative">
          <ViewerPanel />
        </section>

        {/* Right panel */}
        <aside className="w-80 shrink-0 flex flex-col gap-3 p-3 overflow-y-auto border-l border-gray-800">
          <CustomizationPanel />
          <ExportPanel />
        </aside>
      </div>
    </main>
  );
}
