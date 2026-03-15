"""Rule-based pricing engine for jewelry."""
from app.schemas.jewelry import JewelryDesign, PriceBreakdown, MetalType, StoneType

# Price per gram USD
METAL_PRICE_PER_GRAM = {
    MetalType.YELLOW_GOLD: 60.0,
    MetalType.WHITE_GOLD: 62.0,
    MetalType.ROSE_GOLD: 58.0,
    MetalType.SILVER: 0.85,
    MetalType.PLATINUM: 95.0,
}

STONE_PRICE_PER_CT = {
    StoneType.DIAMOND: 800.0,
    StoneType.RUBY: 300.0,
    StoneType.EMERALD: 250.0,
    StoneType.SAPPHIRE: 200.0,
    StoneType.NONE: 0.0,
}

BRACELET_GRAMS = {
    "tennis": 8.0,
    "bangle": 12.0,
    "cuff": 18.0,
    "chain": 6.0,
    "beaded": 5.0,
}


def calculate_price(design: JewelryDesign) -> PriceBreakdown:
    style = design.bracelet_style.value
    grams = BRACELET_GRAMS.get(style, 10.0) * (1 + design.band_width * 2)

    material_cost = grams * METAL_PRICE_PER_GRAM.get(design.metal, 60.0)

    stone_ct = 0.05 if design.stone != StoneType.NONE else 0.0
    stone_count = design.accent_count + (1 if design.center_stone else 0)
    stone_cost = stone_count * stone_ct * STONE_PRICE_PER_CT.get(design.stone, 0.0)

    labor_cost = material_cost * 0.3 + stone_cost * 0.1
    overhead = (material_cost + labor_cost + stone_cost) * 0.15
    total = material_cost + labor_cost + stone_cost + overhead

    return PriceBreakdown(
        material_cost=round(material_cost, 2),
        labor_cost=round(labor_cost, 2),
        stone_cost=round(stone_cost, 2),
        overhead=round(overhead, 2),
        total=round(total, 2),
    )


def optimize_budget(design: JewelryDesign, target_budget: float) -> dict:
    """Suggest changes to hit target budget."""
    suggestions = []
    current = calculate_price(design).total

    if current <= target_budget:
        return {"feasible": True, "suggestions": [], "estimated_price": current}

    # Try cheaper metal
    cheaper_metals = [MetalType.SILVER, MetalType.YELLOW_GOLD, MetalType.ROSE_GOLD]
    for m in cheaper_metals:
        test = design.model_copy(update={"metal": m})
        p = calculate_price(test).total
        if p <= target_budget:
            suggestions.append(f"Switch to {m.value} (saves ${current - p:.0f})")
            break

    # Try reducing stones
    if design.accent_count > 4:
        test = design.model_copy(update={"accent_count": 4})
        p = calculate_price(test).total
        suggestions.append(f"Reduce to 4 accent stones (saves ${current - p:.0f})")

    return {
        "feasible": bool(suggestions),
        "suggestions": suggestions,
        "estimated_price": current,
    }
