"""POST /api/generate -- upload image -> analyze -> generate design -> start 3D mesh gen."""
import asyncio, logging, os
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.schemas.jewelry import AnalyzeResponse
from app.services.image_analyzer import analyze_image
from app.services.design_generator import build_design
from app.services.file_store import save_design, save_upload
from app.services.mesh_generator import generate_3d_mesh

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=AnalyzeResponse)
async def generate_jewelry(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 10MB)")

    # Stage 1: Analyze image
    ext = os.path.splitext(file.filename or "img.jpg")[1] or ".jpg"
    temp_id = "temp_" + str(hash(data))[:8]
    img_path = save_upload(temp_id, data, ext)

    analysis = await analyze_image(img_path)

    # Stage 2: Build design
    design = build_design(analysis)
    design.source_image_path = img_path
    save_design(design)

    # Stage 3: 3D mesh generation (background)
    async def run_mesh():
        try:
            glb_path = await generate_3d_mesh(img_path, design.design_id)
            if glb_path:
                design.model_glb_path = glb_path
                save_design(design)
                logger.info("Mesh ready for %s: %s", design.design_id, glb_path)
        except Exception as e:
            logger.error("Mesh gen error for %s: %s", design.design_id, e)

    asyncio.create_task(run_mesh())

    return AnalyzeResponse(design=design, mesh_ready=False)
