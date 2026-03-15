"""Analyze a jewelry image using Gemini Flash (with PIL fallback)."""
import json, logging, os
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_ANALYSIS = {
    "metal": "yellow_gold",
    "stone": "none",
    "finish": "polished",
    "motif": "none",
    "center_stone": False,
    "accent_count": 4,
    "band_width": 0.15,
    "bracelet_style": "bangle",
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
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        with open(image_path, "rb") as f:
            img_data = f.read()

        prompt = """You are an expert jeweler. Analyze this bracelet image carefully.

CLASSIFICATION RULES:
- "tennis" bracelet: a THIN band with MANY small stones set in a continuous row all around. This is the most common fine jewelry bracelet style. If you see a line of small sparkling stones — it is tennis.
- "bangle": a rigid ring with NO visible chain links. Smooth or decorated but solid.
- "cuff": an open-ended rigid bracelet (has a gap/opening).
- "chain": visible interlocking metal links.
- "beaded": round beads strung together.

STONE RULES:
- If you see many small sparkling/clear stones in a row → "diamond", accent_count = 15-25, center_stone = false
- If stones are colored red → "ruby", blue → "sapphire", green → "emerald"
- If no stones visible → "none", accent_count = 0

METAL RULES:
- Warm yellow tone → "yellow_gold"
- Cool silvery/white tone → "white_gold" or "platinum" or "silver"
- Pinkish warm tone → "rose_gold"

Return ONLY this JSON, nothing else:
{
  "metal": "yellow_gold"|"white_gold"|"rose_gold"|"silver"|"platinum",
  "stone": "diamond"|"ruby"|"emerald"|"sapphire"|"none",
  "finish": "polished"|"matte"|"brushed"|"hammered",
  "motif": "none"|"floral"|"geometric"|"vine",
  "center_stone": true or false,
  "accent_count": 0-30,
  "band_width": 0.05-0.5,
  "bracelet_style": "tennis"|"bangle"|"cuff"|"chain"|"beaded",
  "confidence": 0.0-1.0
}"""

        import mimetypes
        mime = mimetypes.guess_type(image_path)[0] or "image/jpeg"
        response = model.generate_content([
            {"mime_type": mime, "data": img_data},
            prompt,
        ])

        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]

        data = json.loads(text.strip())
        # Validate required keys
        for k in ["metal", "stone", "finish", "bracelet_style"]:
            if k not in data:
                data[k] = DEFAULT_ANALYSIS[k]
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
