import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.api.generate import router as generate_router
from app.api.customize import router as customize_router
from app.api.export import router as export_router

app = FastAPI(title="GemForge API", version="1.0.0")

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage paths
STORAGE_DIR = Path(os.getenv("STORAGE_PATH", "./storage"))
MODELS_DIR = STORAGE_DIR / "models"

# Ensure storage directories exist at startup
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Include routers
app.include_router(generate_router, prefix="/api")
app.include_router(customize_router, prefix="/api")
app.include_router(export_router, prefix="/api")


@app.get("/api/mesh/{design_id}")
async def serve_mesh(design_id: str):
    """Serve a GLB or OBJ mesh file for the given design_id."""
    glb_path = MODELS_DIR / f"{design_id}.glb"
    if glb_path.exists():
        return FileResponse(
            str(glb_path),
            media_type="model/gltf-binary",
            filename=f"{design_id}.glb",
        )

    obj_path = MODELS_DIR / f"{design_id}.obj"
    if obj_path.exists():
        return FileResponse(
            str(obj_path),
            media_type="model/obj",
            filename=f"{design_id}.obj",
        )

    return JSONResponse(status_code=404, content={"detail": "Mesh not found"})


@app.get("/health")
async def health_check():
    return {"status": "ok"}
