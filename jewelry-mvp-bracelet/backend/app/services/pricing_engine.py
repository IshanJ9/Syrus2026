"""Rule-based pricing engine for jewelry."""
from app.schemas.jewelry import JewelryDesign, PriceBreakdown, MetalType, StoneType

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
    StoneType.AMETHYST: 50.0,
    StoneType.TOPAZ: 30.0,
    StoneType.OPAL: 150.0,
    StoneType.PEARL: 80.0,
    StoneType.NONE: 0.0,
}

BRACELET_GRAMS = {
    "tennis": 8.0, "bangle": 12.0, "cuff": 18.0, "chain": 6.0, "beaded": 5.0,
}

RING_GRAMS = {
    "solitaire": 3.0, "halo": 3.5, "three_stone": 4.0, "band": 4.5, "pave": 3.0,
}

PENDANT_GRAMS = {
    "drop": 4.0, "heart": 5.0, "cross": 6.0, "charm": 3.0, "locket": 8.0,
}

EARRING_GRAMS = {
    "stud": 1.5, "hoop": 2.5, "drop": 3.0, "chandelier": 4.0, "huggie": 2.0,
}


def calculate_price(design: JewelryDesign) -> PriceBreakdown:
    jtype = design.jewelry_type.value

    if jtype == "ring" and design.ring_style:
        grams = RING_GRAMS.get(design.ring_style.value, 3.5)
    elif jtype == "pendant" and design.pendant_style:
        grams = PENDANT_GRAMS.get(design.pendant_style.value, 4.0)
    elif jtype == "earring" and design.earring_style:
        grams = EARRING_GRAMS.get(design.earring_style.value, 2.0) * 2  # pair
    else:
        grams = BRACELET_GRAMS.get(design.bracelet_style.value, 10.0)

    grams *= (1 + design.band_width * 2)
    material_cost = grams * METAL_PRICE_PER_GRAM.get(design.metal, 60.0)

    stone_ct = (0.05 * design.stone_size) if design.stone != StoneType.NONE else 0.0
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

    cheaper_metals = [MetalType.SILVER, MetalType.YELLOW_GOLD, MetalType.ROSE_GOLD]
    for m in cheaper_metals:
        test = design.model_copy(update={"metal": m})
        p = calculate_price(test).total
        if p <= target_budget:
            suggestions.append(f"Switch to {m.value} (saves ${current - p:.0f})")
            break

    if design.accent_count > 4:
        test = design.model_copy(update={"accent_count": 4})
        p = calculate_price(test).total
        suggestions.append(f"Reduce to 4 accent stones (saves ${current - p:.0f})")

    return {
        "feasible": bool(suggestions),
        "suggestions": suggestions,
        "estimated_price": current,
    }
