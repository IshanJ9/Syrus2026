"""GET /api/export -- download design as GLB or STL."""
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.services.file_store import load_design, MODELS_DIR

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/export/{design_id}")
async def export_design(design_id: str, format: str = "glb"):
    design = load_design(design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")

    if format not in ("glb", "stl", "obj"):
        raise HTTPException(status_code=400, detail="Format must be glb, stl, or obj")

    # Check if we have a generated mesh
    for ext in (".glb", ".obj"):
        mesh_path = MODELS_DIR / f"{design_id}{ext}"
        if mesh_path.exists():
            media_types = {".glb": "model/gltf-binary", ".obj": "model/obj"}
            return FileResponse(
                str(mesh_path),
                media_type=media_types.get(ext, "application/octet-stream"),
                filename=f"gemforge_{design_id}{ext}",
            )

    raise HTTPException(status_code=404, detail="No mesh file found for this design")
