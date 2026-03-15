"""
Mesh generator -- converts 2D bracelet image -> 3D GLB mesh
by calling Hugging Face Spaces via gradio_client.
All GPU work runs remotely -- zero local GPU needed.
"""
from __future__ import annotations
import logging, os, shutil
from pathlib import Path

logger = logging.getLogger(__name__)

STORAGE_DIR = Path(os.getenv("STORAGE_PATH", "./storage"))
MODELS_DIR = STORAGE_DIR / "models"


def _ensure_dirs():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)


def _convert_obj_to_glb(obj_path: str) -> str | None:
    """Convert OBJ to GLB using trimesh."""
    try:
        import trimesh
        mesh = trimesh.load(obj_path, force="mesh")
        glb_path = obj_path.rsplit(".", 1)[0] + ".glb"
        mesh.export(glb_path, file_type="glb")
        logger.info("Converted OBJ->GLB: %s", glb_path)
        return glb_path
    except Exception as e:
        logger.warning("OBJ->GLB conversion failed: %s", e)
        return None


def _save_glb(source_path: str, design_id: str) -> str:
    """Copy mesh to local storage, converting OBJ->GLB if needed."""
    _ensure_dirs()
    ext = Path(source_path).suffix.lower() or ".glb"

    if ext == ".obj":
        glb_source = _convert_obj_to_glb(source_path)
        if glb_source:
            dest = MODELS_DIR / f"{design_id}.glb"
            shutil.copy2(glb_source, str(dest))
            logger.info("Saved converted GLB for %s -> %s", design_id, dest)
            return str(dest)

    dest = MODELS_DIR / f"{design_id}{ext}"
    shutil.copy2(source_path, str(dest))
    logger.info("Saved mesh for %s -> %s", design_id, dest)
    return str(dest)


def _find_file(result, extensions=(".glb", ".obj")) -> str | None:
    """Extract a usable mesh file path from gradio result."""
    if result is None:
        return None
    if isinstance(result, str):
        if result.startswith(("http://", "https://")):
            return None
        p = Path(result)
        if p.is_file() and p.suffix.lower() in extensions:
            return result
        if p.is_file() and p.stat().st_size > 1024:
            return result
        if p.is_dir():
            for ext in extensions:
                found = list(p.glob(f"*{ext}"))
                if found:
                    return str(found[0])
        return None
    if isinstance(result, (list, tuple)):
        for item in result:
            r = _find_file(item, extensions)
            if r:
                return r
        return None
    if isinstance(result, dict):
        for key in ("value", "path", "url", "name"):
            if key in result:
                r = _find_file(result[key], extensions)
                if r:
                    return r
        return None
    if hasattr(result, "path"):
        return _find_file(getattr(result, "path"), extensions)
    return None


async def _generate_hunyuan(image_path: str, design_id: str) -> str | None:
    try:
        from gradio_client import Client, handle_file
        logger.info("[Hunyuan] Connecting to frogleo/Image-to-3D ...")
        client = Client("frogleo/Image-to-3D")
        result = client.predict(
            handle_file(image_path),
            5, 5.5, 1234, 256, 8000, 10000, True,
            api_name="/gen_shape",
        )
        logger.info(
            "[Hunyuan] Result types: %s",
            [type(r).__name__ for r in result] if isinstance(result, (list, tuple)) else type(result).__name__,
        )
        glb = _find_file(result)
        if glb:
            return _save_glb(glb, design_id)
        logger.warning("[Hunyuan] No valid mesh in result")
        return None
    except Exception as e:
        logger.error("[Hunyuan] Failed: %s", e)
        return None


async def _generate_trellis(image_path: str, design_id: str) -> str | None:
    try:
        from gradio_client import Client, handle_file
        logger.info("[TRELLIS] Connecting ...")
        client = Client("trellis-community/TRELLIS")
        result = client.predict(
            handle_file(image_path), [], False, 0,
            7.5, 12, 3.0, 12, "stochastic", 0.95, 1024,
            api_name="/generate_and_extract_glb",
        )
        glb = _find_file(result)
        if glb:
            return _save_glb(glb, design_id)
        return None
    except Exception as e:
        logger.error("[TRELLIS] Failed: %s", e)
        return None


async def generate_3d_mesh(image_path: str, design_id: str) -> str | None:
    logger.info("Starting 3D mesh generation for %s", design_id)
    glb = await _generate_hunyuan(image_path, design_id)
    if glb:
        return glb
    logger.info("Primary failed, trying TRELLIS ...")
    glb = await _generate_trellis(image_path, design_id)
    if glb:
        return glb
    logger.warning("All 3D generation failed for %s", design_id)
    return None
