"use client";
import { useJewelryStore } from "@/store/useJewelryStore";
import { customizeJewelry } from "@/lib/api";
import type { JewelryType, BraceletStyle, RingStyle, PendantStyle, EarringStyle } from "@/types/jewelry";

const METALS = [
  { value: "yellow_gold", label: "Yellow Gold", color: "#D4A843" },
  { value: "white_gold",  label: "White Gold",  color: "#D9D9D4" },
  { value: "rose_gold",   label: "Rose Gold",   color: "#C6856C" },
  { value: "silver",      label: "Silver",      color: "#B8B8B0" },
  { value: "platinum",    label: "Platinum",    color: "#DCDCD6" },
];

const STONES = ["none","diamond","ruby","emerald","sapphire","amethyst","topaz","opal","pearl"];
const FINISHES = ["polished","matte","brushed","hammered"];
const MOTIFS = ["none","floral","geometric","vine"];

const BRACELET_STYLES: { value: BraceletStyle; label: string }[] = [
  { value: "tennis",  label: "Tennis"  },
  { value: "bangle",  label: "Bangle"  },
  { value: "cuff",    label: "Cuff"    },
  { value: "chain",   label: "Chain"   },
  { value: "beaded",  label: "Beaded"  },
];

const RING_STYLES: { value: RingStyle; label: string }[] = [
  { value: "solitaire",   label: "Solitaire"   },
  { value: "halo",         label: "Halo"         },
  { value: "three_stone",  label: "Three Stone"  },
  { value: "band",         label: "Band"         },
  { value: "pave",         label: "Pav\u00e9"    },
];

const PENDANT_STYLES: { value: PendantStyle; label: string }[] = [
  { value: "drop",   label: "Drop"   },
  { value: "heart",  label: "Heart"  },
  { value: "cross",  label: "Cross"  },
  { value: "charm",  label: "Charm"  },
  { value: "locket", label: "Locket" },
];

const EARRING_STYLES: { value: EarringStyle; label: string }[] = [
  { value: "stud",        label: "Stud"        },
  { value: "hoop",        label: "Hoop"        },
  { value: "drop",        label: "Drop"        },
  { value: "chandelier",  label: "Chandelier"  },
  { value: "huggie",      label: "Huggie"      },
];

const JEWELRY_TYPES: { value: JewelryType; label: string }[] = [
  { value: "bracelet", label: "Bracelet" },
  { value: "ring",     label: "Ring"     },
  { value: "pendant",  label: "Pendant"  },
  { value: "earring",  label: "Earring"  },
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

  async function update(changes: Record<string, unknown>) {
    if (!design) return;
    const updated = { ...design, ...changes };
    setDesign(updated as typeof design);
    try {
      const resp = await customizeJewelry({ design_id: design.design_id, ...changes });
      if (resp.design) setDesign(resp.design);
    } catch {}
  }

  const jtype = design.jewelry_type ?? "bracelet";

  /* pick active style list & current value */
  let styleOptions: { value: string; label: string }[] = BRACELET_STYLES;
  let styleKey = "bracelet_style";
  let styleVal: string = design.bracelet_style;
  if (jtype === "ring") {
    styleOptions = RING_STYLES;
    styleKey = "ring_style";
    styleVal = design.ring_style ?? "band";
  } else if (jtype === "pendant") {
    styleOptions = PENDANT_STYLES;
    styleKey = "pendant_style";
    styleVal = design.pendant_style ?? "drop";
  } else if (jtype === "earring") {
    styleOptions = EARRING_STYLES;
    styleKey = "earring_style";
    styleVal = design.earring_style ?? "stud";
  }

  return (
    <div className="gem-panel p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Customize</h2>

      {/* Jewelry Type */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Jewelry Type</label>
        <div className="grid grid-cols-4 gap-1.5">
          {JEWELRY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => update({ jewelry_type: t.value })}
              className={`text-xs py-1.5 px-2 rounded transition-colors ${jtype === t.value ? "bg-amber-500 text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style (conditional per type) */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Style</label>
        <div className="grid grid-cols-3 gap-1.5">
          {styleOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => update({ [styleKey]: s.value })}
              className={`text-xs py-1.5 px-2 rounded transition-colors ${styleVal === s.value ? "bg-amber-500 text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
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
              onClick={() => update({ metal: m.value })}
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
          onChange={(e) => update({ stone: e.target.value })}
          className="w-full bg-gray-800 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-700"
        >
          {STONES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {/* Stone Size */}
      {design.stone !== "none" && (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">
            Stone Size: <span className="text-amber-400">{design.stone_size?.toFixed(1) ?? "0.5"}</span>
          </label>
          <input
            type="range" min={0.1} max={2.0} step={0.1} value={design.stone_size ?? 0.5}
            onChange={(e) => update({ stone_size: parseFloat(e.target.value) })}
            className="w-full h-1.5 accent-amber-500"
          />
        </div>
      )}

      {/* Finish */}
      <div>
        <label className="text-xs text-gray-400 mb-1.5 block">Finish</label>
        <div className="grid grid-cols-2 gap-1.5">
          {FINISHES.map((f) => (
            <button
              key={f}
              onClick={() => update({ finish: f })}
              className={`text-xs py-1 px-2 rounded capitalize transition-colors ${design.finish === f ? "bg-amber-500 text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Motif (bracelet/pendant) */}
      {jtype !== "ring" && (
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Motif</label>
          <div className="grid grid-cols-2 gap-1.5">
            {MOTIFS.map((m) => (
              <button
                key={m}
                onClick={() => update({ motif: m })}
                className={`text-xs py-1 px-2 rounded capitalize transition-colors ${design.motif === m ? "bg-amber-500 text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

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
