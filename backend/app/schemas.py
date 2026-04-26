from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ProductShape = Literal["box", "cylinder", "pyramid", "custom"]


class Dimensions(BaseModel):
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    depth: float = Field(gt=0)

    @property
    def volume(self) -> float:
        return self.width * self.height * self.depth


class Position(BaseModel):
    x: float = Field(ge=0)
    y: float = Field(ge=0)
    z: float = Field(ge=0)


class ContainerInput(Dimensions):
    max_weight: float | None = Field(default=None, gt=0)


class ShapeProfilePoint(BaseModel):
    height_ratio: float = Field(ge=0, le=1.0)
    width_ratio: float = Field(ge=0.05, le=1.0)
    depth_ratio: float = Field(ge=0.05, le=1.0)


class ShapeConfig(BaseModel):
    top_width_ratio: float = Field(default=0.55, ge=0.05, le=1.0)
    top_depth_ratio: float = Field(default=0.55, ge=0.05, le=1.0)
    radial_segments: int = Field(default=24, ge=3, le=64)
    profile: list[ShapeProfilePoint] | None = Field(default=None, min_length=2, max_length=12)


class ProductInput(Dimensions):
    model_config = ConfigDict(str_strip_whitespace=True)

    id: str | None = None
    name: str = Field(min_length=1, max_length=120)
    shape: ProductShape = "box"
    shape_config: ShapeConfig | None = None
    weight: float = Field(default=0, ge=0)
    quantity: int = Field(default=1, ge=1, le=1000)
    fragile: bool = False
    stackable: bool = True
    allow_rotations: bool = True


class SimulationRequest(BaseModel):
    container: ContainerInput
    products: list[ProductInput] = Field(min_length=1)


class Placement(BaseModel):
    item_id: str
    product_id: str
    product_name: str
    position: Position
    dimensions: Dimensions
    original_dimensions: Dimensions
    shape: ProductShape
    shape_config: ShapeConfig | None = None
    weight: float
    fragile: bool
    stackable: bool
    rotation: str


class UnloadedItem(BaseModel):
    item_id: str
    product_id: str
    product_name: str
    dimensions: Dimensions
    shape: ProductShape
    shape_config: ShapeConfig | None = None
    weight: float
    fragile: bool
    stackable: bool
    allow_rotations: bool = True
    reason: str
    requested_quantity: int = Field(default=1, ge=1)
    loaded_quantity: int = Field(default=0, ge=0)
    unloaded_quantity: int = Field(default=1, ge=1)
    explanation: str = ""
    suggestion: str = ""


class SimulationMetrics(BaseModel):
    container_volume: float
    loaded_volume: float
    remaining_volume: float
    occupancy_percentage: float
    loaded_items: int
    unloaded_items: int
    loaded_weight: float


class SimulationResponse(BaseModel):
    container: ContainerInput
    placements: list[Placement]
    unloaded: list[UnloadedItem]
    metrics: SimulationMetrics
