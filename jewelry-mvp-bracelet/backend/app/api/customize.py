"""POST /api/customize -- update design attributes."""
from fastapi import APIRouter, HTTPException
from app.schemas.jewelry import JewelryDesign, CustomizeRequest, PriceBreakdown
from app.services.file_store import load_design, save_design
from app.services.pricing_engine import calculate_price

router = APIRouter()


@router.post("/customize", response_model=dict)
async def customize_design(req: CustomizeRequest):
    design = load_design(req.design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")

    updates = {}
    if req.metal is not None:
        updates["metal"] = req.metal
    if req.stone is not None:
        updates["stone"] = req.stone
    if req.finish is not None:
        updates["finish"] = req.finish
    if req.motif is not None:
        updates["motif"] = req.motif
    if req.center_stone is not None:
        updates["center_stone"] = req.center_stone
    if req.accent_count is not None:
        updates["accent_count"] = req.accent_count
    if req.band_width is not None:
        updates["band_width"] = req.band_width
    if req.bracelet_style is not None:
        updates["bracelet_style"] = req.bracelet_style

    design = design.model_copy(update=updates)
    save_design(design)

    price = calculate_price(design)
    mesh_ready = design.model_glb_path is not None

    return {"design": design.model_dump(), "price": price.model_dump(), "mesh_ready": mesh_ready}


@router.get("/price/{design_id}", response_model=PriceBreakdown)
async def get_price(design_id: str):
    design = load_design(design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    return calculate_price(design)


@router.get("/design/{design_id}", response_model=JewelryDesign)
async def get_design(design_id: str):
    design = load_design(design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    return design
