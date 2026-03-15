"use client";
import { useState, useEffect } from "react";
import { useJewelryStore } from "@/store/useJewelryStore";
import { getPrice } from "@/lib/api";
import { PriceBreakdown } from "@/types/jewelry";

export default function BudgetPanel() {
  const design = useJewelryStore((s) => s.design);
  const [price, setPrice] = useState<PriceBreakdown | null>(null);

  useEffect(() => {
    if (!design) return;
    getPrice(design.design_id).then(setPrice).catch(() => {});
  }, [design?.design_id, design?.metal, design?.stone, design?.accent_count]);

  if (!design) return null;

  return (
    <div className="gem-panel p-4">
      <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Price Estimate</h2>
      {price ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Material</span><span>${price.material_cost.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Labor</span><span>${price.labor_cost.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Stones</span><span>${price.stone_cost.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Overhead</span><span>${price.overhead.toFixed(0)}</span>
          </div>
          <div className="border-t border-gray-700 pt-1.5 flex justify-between text-sm font-semibold text-amber-400">
            <span>Total</span><span>${price.total.toFixed(0)}</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 text-xs">Loading price...</p>
      )}
    </div>
  );
}
