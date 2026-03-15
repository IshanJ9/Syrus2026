"""Analyze a jewelry image using Gemini Flash (with PIL fallback)."""
import json, logging, os
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_ANALYSIS = {
    "jewelry_type": "bracelet",
    "metal": "yellow_gold",
    "stone": "none",
    "finish": "polished",
    "motif": "none",
    "center_stone": False,
    "accent_count": 4,
    "stone_size": 0.5,
    "band_width": 0.15,
    "bracelet_style": "bangle",
    "ring_style": None,
    "pendant_style": None,
    "earring_style": None,
    "confidence": 0.5,
}


async def analyze_image(image_path: str) -> dict:
    """Returns a dict with jewelry attributes."""
    result = await _analyze_with_gemini(image_path)
    if result:
        return result
    return _analyze_with_pil(image_path)


async def _analyze_with_gemini(image_path: str) -> dict | None:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai

        client = genai.Client(api_key=api_key)

        with open(image_path, "rb") as f:
            img_data = f.read()

        prompt = """You are an expert jeweler. Analyze this jewelry image carefully.

STEP 1 — Identify the jewelry TYPE:
- "bracelet": worn around the wrist, larger circular shape
- "ring": worn on a finger, small circular band
- "pendant": a decorative piece that hangs from a chain or necklace
- "earring": worn on the ear (studs, hoops, danglers, etc.)

STEP 2 — Identify the SUB-STYLE based on type:

If BRACELET:
- "tennis": thin band with many small stones in a continuous row
- "bangle": rigid ring, smooth or decorated but solid
- "cuff": open-ended rigid bracelet (has a gap)
- "chain": visible interlocking metal links
- "beaded": round beads strung together

If RING:
- "solitaire": single prominent center stone on a plain band
- "halo": center stone surrounded by a ring of smaller stones
- "three_stone": three stones in a row (center larger)
- "band": plain or decorated band with no prominent stone
- "pave": band covered with many tiny stones

If PENDANT:
- "drop": teardrop or elongated hanging shape
- "heart": heart-shaped body
- "cross": cross-shaped body
- "charm": small decorative shape (disc, star, etc.)
- "locket": oval/round hinged case

If EARRING:
- "stud": small, sits directly on the earlobe, usually a single stone or shape
- "hoop": circular or semi-circular ring shape
- "drop": hangs below the earlobe with a dangling element
- "chandelier": elaborate multi-tiered dangling design
- "huggie": small thick hoop that hugs the earlobe closely

STEP 3 — Analyze materials:

STONE RULES:
- Clear/white sparkling stones -> "diamond"
- Red stones -> "ruby"
- Blue stones -> "sapphire"
- Green stones -> "emerald"
- Purple stones -> "amethyst"
- Yellow/orange stones -> "topaz"
- Iridescent/milky stones -> "opal"
- Round lustrous white/cream -> "pearl"
- No stones -> "none"

METAL RULES:
- Warm yellow tone -> "yellow_gold"
- Cool silvery/white tone -> "white_gold" or "platinum" or "silver"
- Pinkish warm tone -> "rose_gold"

Return ONLY this JSON, nothing else:
{
  "jewelry_type": "bracelet"|"ring"|"pendant"|"earring",
  "metal": "yellow_gold"|"white_gold"|"rose_gold"|"silver"|"platinum",
  "stone": "diamond"|"ruby"|"emerald"|"sapphire"|"amethyst"|"topaz"|"opal"|"pearl"|"none",
  "finish": "polished"|"matte"|"brushed"|"hammered",
  "motif": "none"|"floral"|"geometric"|"vine",
  "center_stone": true or false,
  "accent_count": 0-30,
  "stone_size": 0.3-1.5,
  "band_width": 0.05-0.5,
  "bracelet_style": "tennis"|"bangle"|"cuff"|"chain"|"beaded",
  "ring_style": "solitaire"|"halo"|"three_stone"|"band"|"pave",
  "pendant_style": "drop"|"heart"|"cross"|"charm"|"locket",
  "earring_style": "stud"|"hoop"|"drop"|"chandelier"|"huggie",
  "confidence": 0.0-1.0
}

IMPORTANT: Only fill in the style field that matches the jewelry_type.
Set the other style fields to null."""

        import mimetypes
        mime = mimetypes.guess_type(image_path)[0] or "image/jpeg"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                genai.types.Part.from_bytes(data=img_data, mime_type=mime),
                prompt,
            ],
        )

        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        data = json.loads(text.strip())
        # Validate required keys
        for k in ["jewelry_type", "metal", "stone", "finish"]:
            if k not in data:
                data[k] = DEFAULT_ANALYSIS[k]
        # Set style defaults based on detected type
        jtype = data.get("jewelry_type", "bracelet")
        if jtype == "bracelet":
            data.setdefault("bracelet_style", "bangle")
        elif jtype == "ring":
            data.setdefault("ring_style", "solitaire")
        elif jtype == "pendant":
            data.setdefault("pendant_style", "drop")
        elif jtype == "earring":
            data.setdefault("earring_style", "stud")
        data.setdefault("stone_size", 0.5)
        data.setdefault("confidence", 0.8)
        logger.info("Gemini analysis: %s", data)
        return data
    except Exception as e:
        logger.warning("Gemini analysis failed: %s", e)
        return None


def _analyze_with_pil(image_path: str) -> dict:
    """Fallback: use color analysis to guess metal type."""
    try:
        from colorthief import ColorThief
        ct = ColorThief(image_path)
        palette = ct.get_palette(color_count=3, quality=1)
        r, g, b = palette[0]

        if r > 180 and g > 140 and b < 100:
            metal = "yellow_gold"
        elif r > 190 and g > 190 and b > 190:
            metal = "white_gold"
        elif r > 180 and g < 120 and b < 100:
            metal = "rose_gold"
        elif r < 150 and g < 150 and b > 160:
            metal = "silver"
        else:
            metal = "yellow_gold"

        result = {**DEFAULT_ANALYSIS, "metal": metal, "confidence": 0.4}
        logger.info("PIL fallback analysis: %s", result)
        return result
    except Exception as e:
        logger.warning("PIL fallback failed: %s", e)
        return DEFAULT_ANALYSIS.copy()
