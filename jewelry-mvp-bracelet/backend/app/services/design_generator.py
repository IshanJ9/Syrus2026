"""Convert image analysis dict -> JewelryDesign object."""
import hashlib, time, logging
from app.schemas.jewelry import (
    JewelryDesign, MetalType, StoneType, FinishType, MotifType, BraceletStyle
)

logger = logging.getLogger(__name__)

_METAL_MAP = {k: k for k in ["yellow_gold", "white_gold", "rose_gold", "silver", "platinum"]}
_STONE_MAP = {k: k for k in ["diamond", "ruby", "emerald", "sapphire", "none"]}
_FINISH_MAP = {k: k for k in ["polished", "matte", "brushed", "hammered"]}
_MOTIF_MAP = {k: k for k in ["none", "floral", "geometric", "vine"]}
_STYLE_MAP = {k: k for k in ["tennis", "bangle", "cuff", "chain", "beaded"]}

# Style-specific defaults
_STYLE_DEFAULTS = {
    "tennis":  {"accent_count": 20, "center_stone": False, "motif": "none",      "band_width": 0.1},
    "bangle":  {"accent_count": 4,  "center_stone": True,  "motif": "floral",    "band_width": 0.15},
    "cuff":    {"accent_count": 6,  "center_stone": True,  "motif": "geometric", "band_width": 0.3},
    "chain":   {"accent_count": 0,  "center_stone": True,  "motif": "none",      "band_width": 0.12},
    "beaded":  {"accent_count": 0,  "center_stone": False, "motif": "none",      "band_width": 0.12},
}


def generate_design_id() -> str:
    return hashlib.md5(str(time.time()).encode()).hexdigest()[:12]


def build_design(analysis: dict) -> JewelryDesign:
    style_key = analysis.get("bracelet_style", "bangle")
    if style_key not in _STYLE_MAP:
        style_key = "bangle"

    defaults = _STYLE_DEFAULTS.get(style_key, _STYLE_DEFAULTS["bangle"])

    metal_key = analysis.get("metal", "yellow_gold")
    stone_key = analysis.get("stone", "none")
    finish_key = analysis.get("finish", "polished")
    motif_key = analysis.get("motif", defaults["motif"])

    design = JewelryDesign(
        design_id=generate_design_id(),
        metal=MetalType(metal_key if metal_key in _METAL_MAP else "yellow_gold"),
        stone=StoneType(stone_key if stone_key in _STONE_MAP else "none"),
        finish=FinishType(finish_key if finish_key in _FINISH_MAP else "polished"),
        motif=MotifType(motif_key if motif_key in _MOTIF_MAP else "none"),
        center_stone=analysis.get("center_stone", defaults["center_stone"]),
        accent_count=int(analysis.get("accent_count", defaults["accent_count"])),
        band_width=float(analysis.get("band_width", defaults["band_width"])),
        bracelet_style=BraceletStyle(style_key),
        confidence=float(analysis.get("confidence", 0.5)),
    )
    logger.info("Built design: %s (style=%s)", design.design_id, design.bracelet_style)
    return design
