"""Convert image analysis dict -> JewelryDesign object."""
import hashlib, time, logging
from app.schemas.jewelry import (
    JewelryDesign, JewelryType, MetalType, StoneType, FinishType, MotifType,
    BraceletStyle, RingStyle, PendantStyle, EarringStyle
)

logger = logging.getLogger(__name__)

_METAL_MAP = {k: k for k in ["yellow_gold", "white_gold", "rose_gold", "silver", "platinum"]}
_STONE_MAP = {k: k for k in ["diamond", "ruby", "emerald", "sapphire", "amethyst", "topaz", "opal", "pearl", "none"]}
_FINISH_MAP = {k: k for k in ["polished", "matte", "brushed", "hammered"]}
_MOTIF_MAP = {k: k for k in ["none", "floral", "geometric", "vine"]}
_BRACELET_STYLE_MAP = {k: k for k in ["tennis", "bangle", "cuff", "chain", "beaded"]}
_RING_STYLE_MAP = {k: k for k in ["solitaire", "halo", "three_stone", "band", "pave"]}
_PENDANT_STYLE_MAP = {k: k for k in ["drop", "heart", "cross", "charm", "locket"]}
_EARRING_STYLE_MAP = {k: k for k in ["stud", "hoop", "drop", "chandelier", "huggie"]}

_BRACELET_DEFAULTS = {
    "tennis":  {"accent_count": 20, "center_stone": False, "motif": "none",      "band_width": 0.1,  "stone_size": 0.4},
    "bangle":  {"accent_count": 4,  "center_stone": True,  "motif": "floral",    "band_width": 0.15, "stone_size": 0.5},
    "cuff":    {"accent_count": 6,  "center_stone": True,  "motif": "geometric", "band_width": 0.3,  "stone_size": 0.6},
    "chain":   {"accent_count": 0,  "center_stone": True,  "motif": "none",      "band_width": 0.12, "stone_size": 0.5},
    "beaded":  {"accent_count": 0,  "center_stone": False, "motif": "none",      "band_width": 0.12, "stone_size": 0.5},
}

_RING_DEFAULTS = {
    "solitaire":   {"accent_count": 0,  "center_stone": True,  "motif": "none",      "band_width": 0.08, "stone_size": 0.8},
    "halo":        {"accent_count": 12, "center_stone": True,  "motif": "none",      "band_width": 0.08, "stone_size": 0.7},
    "three_stone": {"accent_count": 2,  "center_stone": True,  "motif": "none",      "band_width": 0.08, "stone_size": 0.6},
    "band":        {"accent_count": 0,  "center_stone": False, "motif": "geometric", "band_width": 0.12, "stone_size": 0.5},
    "pave":        {"accent_count": 20, "center_stone": False, "motif": "none",      "band_width": 0.10, "stone_size": 0.3},
}

_PENDANT_DEFAULTS = {
    "drop":   {"accent_count": 0, "center_stone": True,  "motif": "none",      "band_width": 0.08, "stone_size": 0.7},
    "heart":  {"accent_count": 6, "center_stone": False, "motif": "none",      "band_width": 0.06, "stone_size": 0.4},
    "cross":  {"accent_count": 4, "center_stone": True,  "motif": "geometric", "band_width": 0.06, "stone_size": 0.5},
    "charm":  {"accent_count": 0, "center_stone": False, "motif": "floral",    "band_width": 0.08, "stone_size": 0.5},
    "locket": {"accent_count": 0, "center_stone": False, "motif": "vine",      "band_width": 0.10, "stone_size": 0.5},
}

_EARRING_DEFAULTS = {
    "stud":        {"accent_count": 0,  "center_stone": True,  "motif": "none",      "band_width": 0.06, "stone_size": 0.6},
    "hoop":        {"accent_count": 0,  "center_stone": False, "motif": "none",      "band_width": 0.06, "stone_size": 0.4},
    "drop":        {"accent_count": 2,  "center_stone": True,  "motif": "none",      "band_width": 0.05, "stone_size": 0.5},
    "chandelier":  {"accent_count": 8,  "center_stone": False, "motif": "floral",    "band_width": 0.05, "stone_size": 0.3},
    "huggie":      {"accent_count": 6,  "center_stone": False, "motif": "none",      "band_width": 0.06, "stone_size": 0.3},
}


def generate_design_id() -> str:
    return hashlib.md5(str(time.time()).encode()).hexdigest()[:12]


def _g(d: dict, key: str, fallback):
    """Get from dict, treating None as missing."""
    v = d.get(key)
    return v if v is not None else fallback


def build_design(analysis: dict) -> JewelryDesign:
    jtype = _g(analysis, "jewelry_type", "bracelet")
    if jtype not in ("bracelet", "ring", "pendant", "earring"):
        jtype = "bracelet"

    # Resolve style and defaults based on type
    if jtype == "ring":
        style_key = _g(analysis, "ring_style", "solitaire")
        if style_key not in _RING_STYLE_MAP:
            style_key = "solitaire"
        defaults = _RING_DEFAULTS[style_key]
        style_kwargs = {"ring_style": RingStyle(style_key)}
    elif jtype == "pendant":
        style_key = _g(analysis, "pendant_style", "drop")
        if style_key not in _PENDANT_STYLE_MAP:
            style_key = "drop"
        defaults = _PENDANT_DEFAULTS[style_key]
        style_kwargs = {"pendant_style": PendantStyle(style_key)}
    elif jtype == "earring":
        style_key = _g(analysis, "earring_style", "stud")
        if style_key not in _EARRING_STYLE_MAP:
            style_key = "stud"
        defaults = _EARRING_DEFAULTS[style_key]
        style_kwargs = {"earring_style": EarringStyle(style_key)}
    else:
        style_key = _g(analysis, "bracelet_style", "bangle")
        if style_key not in _BRACELET_STYLE_MAP:
            style_key = "bangle"
        defaults = _BRACELET_DEFAULTS[style_key]
        style_kwargs = {"bracelet_style": BraceletStyle(style_key)}

    metal_key = _g(analysis, "metal", "yellow_gold")
    stone_key = _g(analysis, "stone", "none")
    finish_key = _g(analysis, "finish", "polished")
    motif_key = _g(analysis, "motif", defaults["motif"])

    design = JewelryDesign(
        design_id=generate_design_id(),
        jewelry_type=JewelryType(jtype),
        metal=MetalType(metal_key if metal_key in _METAL_MAP else "yellow_gold"),
        stone=StoneType(stone_key if stone_key in _STONE_MAP else "none"),
        finish=FinishType(finish_key if finish_key in _FINISH_MAP else "polished"),
        motif=MotifType(motif_key if motif_key in _MOTIF_MAP else "none"),
        center_stone=_g(analysis, "center_stone", defaults["center_stone"]),
        accent_count=int(_g(analysis, "accent_count", defaults["accent_count"])),
        stone_size=max(0.1, float(_g(analysis, "stone_size", defaults.get("stone_size", 0.5)))),
        band_width=max(0.05, float(_g(analysis, "band_width", defaults["band_width"]))),
        confidence=max(0.0, min(1.0, float(_g(analysis, "confidence", 0.5)))),
        **style_kwargs,
    )
    logger.info("Built design: %s (type=%s, style=%s)", design.design_id, jtype, style_key)
    return design
