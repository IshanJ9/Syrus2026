"use client";
import { useJewelryStore } from "@/store/useJewelryStore";
import { customizeJewelry } from "@/lib/api";

const METALS = [
  { value: "yellow_gold", label: "Yellow Gold", color: "#FFD700" },
  { value: "white_gold",  label: "White Gold",  color: "#E8E8E8" },
  { value: "rose_gold",   label: "Rose Gold",   color: "#E8A090" },
  { value: "silver",      label: "Silver",      color: "#C0C0C0" },
  { value: "platinum",    label: "Platinum",    color: "#E5E4E2" },
];

const STONES = ["none","diamond","ruby","emerald","sapphire"];
const FINISHES = ["polished","matte","brushed","hammered"];
const MOTIFS = ["none","floral","geometric","vine"];
const STYLES = [
  { value: "tennis",  label: "Tennis"  },
  { value: "bangle",  label: "Bangle"  },
  { value: "cuff",    label: "Cuff"    },
  { value: "chain",   label: "Chain"   },
  { value: "beaded",  label: "Beaded"  },
];

export default function CustomizationPanel() {
  const design = useJewelryStore((s) => s.design);
  const setDesign = useJewelryStore((s) => s.setDesign);

  if (!design) {
    return (
      <div className="gem-panel p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Customize</h2>
        <p className="text-gray-600 text-sm">Upload an image to start customizing</p>
      </div>
    );
  }

  async function update(changes: Partial<typeof design>) {
    if (!design) return;
    const updated = { ...design, ...changes };
    setDesign(updated);
    try {
      const resp = await customizeJewelry({ design_id: design.design_id, ...changes });
      if (resp.design) setDesign(resp.design);
    } catch {}
  }

  return (
    <div className="gem-panel p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Customize</h2>

      {/* Bracelet Style */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Style</label>
        <div className="grid grid-cols-3 gap-1.5">
          {STYLES.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ bracelet_style: s.value as typeof design.bracelet_style })}
              className={`text-xs py-1.5 px-2 rounded transition-colors ${design.bracelet_style === s.value ? "bg-amber-500 text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metal */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Metal</label>
        <div className="flex gap-2 flex-wrap">
          {METALS.map((m) => (
            <button
              key={m.value}
              onClick={() => update({ metal: m.value as typeof design.metal })}
              title={m.label}
              className={`w-7 h-7 rounded-full ring-2 transition-all ${design.metal === m.value ? "ring-amber-400 scale-110" : "ring-gray-600 hover:ring-gray-400"}`}
              style={{ background: m.color }}
            />
          ))}
        </div>
      </div>

      {/* Stone */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Stone</label>
        <select
          value={design.stone}
          onChange={(e) => update({ stone: e.target.value as typeof design.stone })}
          className="w-full bg-gray-800 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-700"
        >
          {STONES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {/* Finish */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Finish</label>
        <div className="grid grid-cols-2 gap-1.5">
          {FINISHES.map((f) => (
            <button
              key={f}
              onClick={() => update({ finish: f as typeof design.finish })}
              className={`text-xs py-1 px-2 rounded capitalize transition-colors ${design.finish === f ? "bg-amber-500 text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Motif */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Motif</label>
        <div className="grid grid-cols-2 gap-1.5">
          {MOTIFS.map((m) => (
            <button
              key={m}
              onClick={() => update({ motif: m as typeof design.motif })}
              className={`text-xs py-1 px-2 rounded capitalize transition-colors ${design.motif === m ? "bg-amber-500 text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Count */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">
          Accent Stones: <span className="text-amber-400">{design.accent_count}</span>
        </label>
        <input
          type="range" min={0} max={20} value={design.accent_count}
          onChange={(e) => update({ accent_count: parseInt(e.target.value) })}
          className="w-full h-1.5 accent-amber-500"
        />
      </div>

      {/* Center Stone */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400">Center Stone</label>
        <button
          onClick={() => update({ center_stone: !design.center_stone })}
          className={`w-10 h-5 rounded-full transition-colors relative ${design.center_stone ? "bg-amber-500" : "bg-gray-700"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${design.center_stone ? "translate-x-5" : "translate-x-0.5"}`} />
        </button>
      </div>
    </div>
  );
}
