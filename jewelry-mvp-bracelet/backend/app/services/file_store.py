"""Simple file-based design store using JSON files."""
import json, os
from pathlib import Path
from app.schemas.jewelry import JewelryDesign

STORAGE_DIR = Path(os.getenv("STORAGE_PATH", "./storage"))
DESIGNS_DIR = STORAGE_DIR / "designs"
UPLOADS_DIR = STORAGE_DIR / "uploads"
MODELS_DIR = STORAGE_DIR / "models"


def _ensure_dirs():
    for d in [DESIGNS_DIR, UPLOADS_DIR, MODELS_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def save_design(design: JewelryDesign) -> None:
    _ensure_dirs()
    path = DESIGNS_DIR / f"{design.design_id}.json"
    path.write_text(design.model_dump_json(indent=2))


def load_design(design_id: str) -> JewelryDesign | None:
    path = DESIGNS_DIR / f"{design_id}.json"
    if not path.exists():
        return None
    return JewelryDesign.model_validate_json(path.read_text())


def save_upload(design_id: str, data: bytes, ext: str = ".jpg") -> str:
    _ensure_dirs()
    path = UPLOADS_DIR / f"{design_id}{ext}"
    path.write_bytes(data)
    return str(path)
