export type Dimensions = {
  width: number;
  height: number;
  depth: number;
};

export type ContainerInput = Dimensions & {
  max_weight?: number | null;
};

export type ProductInput = Dimensions & {
  id?: string | null;
  name: string;
  weight: number;
  quantity: number;
  fragile: boolean;
  stackable: boolean;
  allow_rotations: boolean;
};

export type SimulationRequest = {
  container: ContainerInput;
  products: ProductInput[];
};

export type Position = {
  x: number;
  y: number;
  z: number;
};

export type Placement = {
  item_id: string;
  product_id: string;
  product_name: string;
  position: Position;
  dimensions: Dimensions;
  original_dimensions: Dimensions;
  weight: number;
  fragile: boolean;
  stackable: boolean;
  rotation: string;
};

export type UnloadedItem = {
  item_id: string;
  product_id: string;
  product_name: string;
  dimensions: Dimensions;
  weight: number;
  fragile: boolean;
  stackable: boolean;
  reason: string;
};

export type SimulationMetrics = {
  container_volume: number;
  loaded_volume: number;
  remaining_volume: number;
  occupancy_percentage: number;
  loaded_items: number;
  unloaded_items: number;
  loaded_weight: number;
};

export type SimulationResponse = {
  container: ContainerInput;
  placements: Placement[];
  unloaded: UnloadedItem[];
  metrics: SimulationMetrics;
};
