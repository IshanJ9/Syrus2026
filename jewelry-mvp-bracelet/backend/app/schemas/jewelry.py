from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


class MetalType(str, Enum):
    YELLOW_GOLD = "yellow_gold"
    WHITE_GOLD = "white_gold"
    ROSE_GOLD = "rose_gold"
    SILVER = "silver"
    PLATINUM = "platinum"


class StoneType(str, Enum):
    DIAMOND = "diamond"
    RUBY = "ruby"
    EMERALD = "emerald"
    SAPPHIRE = "sapphire"
    NONE = "none"


class FinishType(str, Enum):
    POLISHED = "polished"
    MATTE = "matte"
    BRUSHED = "brushed"
    HAMMERED = "hammered"


class MotifType(str, Enum):
    NONE = "none"
    FLORAL = "floral"
    GEOMETRIC = "geometric"
    VINE = "vine"


class BraceletStyle(str, Enum):
    TENNIS = "tennis"
    BANGLE = "bangle"
    CUFF = "cuff"
    CHAIN = "chain"
    BEADED = "beaded"


class JewelryDesign(BaseModel):
    design_id: str
    metal: MetalType = MetalType.YELLOW_GOLD
    stone: StoneType = StoneType.NONE
    finish: FinishType = FinishType.POLISHED
    motif: MotifType = MotifType.NONE
    center_stone: bool = False
    accent_count: int = Field(default=0, ge=0, le=30)
    band_width: float = Field(default=0.15, ge=0.05, le=0.5)
    bracelet_style: BraceletStyle = BraceletStyle.BANGLE
    model_glb_path: Optional[str] = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    source_image_path: Optional[str] = None


class AnalyzeResponse(BaseModel):
    design: JewelryDesign
    mesh_ready: bool = False


class CustomizeRequest(BaseModel):
    design_id: str
    metal: Optional[MetalType] = None
    stone: Optional[StoneType] = None
    finish: Optional[FinishType] = None
    motif: Optional[MotifType] = None
    center_stone: Optional[bool] = None
    accent_count: Optional[int] = Field(default=None, ge=0, le=30)
    band_width: Optional[float] = Field(default=None, ge=0.05, le=0.5)
    bracelet_style: Optional[BraceletStyle] = None


class PriceBreakdown(BaseModel):
    material_cost: float
    labor_cost: float
    stone_cost: float
    overhead: float
    total: float
    currency: str = "USD"


class ExportRequest(BaseModel):
    design_id: str
    format: str = "glb"  # "glb" or "stl"
