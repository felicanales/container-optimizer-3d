from pydantic import BaseModel, ConfigDict, Field


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


class ProductInput(Dimensions):
    model_config = ConfigDict(str_strip_whitespace=True)

    id: str | None = None
    name: str = Field(min_length=1, max_length=120)
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
    weight: float
    fragile: bool
    stackable: bool
    rotation: str


class UnloadedItem(BaseModel):
    item_id: str
    product_id: str
    product_name: str
    dimensions: Dimensions
    weight: float
    fragile: bool
    stackable: bool
    reason: str


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
