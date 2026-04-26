from __future__ import annotations

import re
from dataclasses import dataclass
from itertools import permutations

from app.schemas import (
    Dimensions,
    Placement,
    Position,
    ProductInput,
    SimulationMetrics,
    SimulationRequest,
    SimulationResponse,
    UnloadedItem,
)

EPSILON = 1e-9


@dataclass(frozen=True)
class FreeSpace:
    x: float
    y: float
    z: float
    width: float
    height: float
    depth: float

    @property
    def volume(self) -> float:
        return self.width * self.height * self.depth


@dataclass(frozen=True)
class PackItem:
    item_id: str
    product_id: str
    product: ProductInput

    @property
    def volume(self) -> float:
        return self.product.volume


@dataclass(frozen=True)
class PlacementAttempt:
    space_index: int
    placement: Placement


def run_simulation(payload: SimulationRequest) -> SimulationResponse:
    free_spaces = [
        FreeSpace(
            x=0,
            y=0,
            z=0,
            width=payload.container.width,
            height=payload.container.height,
            depth=payload.container.depth,
        )
    ]

    placements: list[Placement] = []
    unloaded: list[UnloadedItem] = []
    loaded_weight = 0.0

    items = sorted(
        _expand_products(payload.products),
        key=lambda item: (item.product.fragile, -item.volume, item.product_id, item.item_id),
    )

    for item in items:
        if (
            payload.container.max_weight is not None
            and loaded_weight + item.product.weight > payload.container.max_weight + EPSILON
        ):
            unloaded.append(_unloaded_item(item, "weight_limit_exceeded"))
            continue

        attempt = _find_placement(item, free_spaces, placements)
        if attempt is None:
            unloaded.append(_unloaded_item(item, "no_available_space"))
            continue

        placements.append(attempt.placement)
        loaded_weight += item.product.weight

        used_space = free_spaces.pop(attempt.space_index)
        free_spaces.extend(_split_space(used_space, attempt.placement))
        free_spaces = _prune_spaces(free_spaces)

    loaded_volume = sum(placement.dimensions.volume for placement in placements)
    container_volume = payload.container.volume
    occupancy = (loaded_volume / container_volume) * 100 if container_volume else 0

    return SimulationResponse(
        container=payload.container,
        placements=placements,
        unloaded=unloaded,
        metrics=SimulationMetrics(
            container_volume=round(container_volume, 4),
            loaded_volume=round(loaded_volume, 4),
            remaining_volume=round(max(container_volume - loaded_volume, 0), 4),
            occupancy_percentage=round(occupancy, 2),
            loaded_items=len(placements),
            unloaded_items=len(unloaded),
            loaded_weight=round(loaded_weight, 4),
        ),
    )


def _expand_products(products: list[ProductInput]) -> list[PackItem]:
    items: list[PackItem] = []

    for index, product in enumerate(products, start=1):
        product_id = product.id or f"{_slugify(product.name) or 'product'}-{index}"
        for quantity_index in range(1, product.quantity + 1):
            items.append(
                PackItem(
                    item_id=f"{product_id}-{quantity_index}",
                    product_id=product_id,
                    product=product,
                )
            )

    return items


def _find_placement(
    item: PackItem,
    free_spaces: list[FreeSpace],
    placements: list[Placement],
) -> PlacementAttempt | None:
    ordered_spaces = sorted(
        enumerate(free_spaces),
        key=lambda pair: (pair[1].y, pair[1].z, pair[1].x, -pair[1].volume),
    )

    for space_index, space in ordered_spaces:
        for dimensions, rotation in _rotation_candidates(item.product):
            if not _fits_in_space(dimensions, space):
                continue

            x, y, z = space.x, space.y, space.z
            width, height, depth = dimensions

            if not _has_support(x, y, z, width, depth, placements):
                continue

            if _collides(x, y, z, width, height, depth, placements):
                continue

            placement = Placement(
                item_id=item.item_id,
                product_id=item.product_id,
                product_name=item.product.name,
                position=Position(x=x, y=y, z=z),
                dimensions=Dimensions(width=width, height=height, depth=depth),
                original_dimensions=Dimensions(
                    width=item.product.width,
                    height=item.product.height,
                    depth=item.product.depth,
                ),
                weight=item.product.weight,
                fragile=item.product.fragile,
                stackable=item.product.stackable,
                rotation=rotation,
            )
            return PlacementAttempt(space_index=space_index, placement=placement)

    return None


def _rotation_candidates(product: ProductInput) -> list[tuple[tuple[float, float, float], str]]:
    original = (product.width, product.height, product.depth)
    if not product.allow_rotations:
        return [(original, "original")]

    unique_dimensions = sorted(
        set(permutations(original, 3)),
        key=lambda dimensions: (dimensions[1], -(dimensions[0] * dimensions[2]), dimensions[0], dimensions[2]),
    )

    candidates: list[tuple[tuple[float, float, float], str]] = []
    for dimensions in unique_dimensions:
        rotation = "original" if dimensions == original else f"{dimensions[0]}x{dimensions[1]}x{dimensions[2]}"
        candidates.append((dimensions, rotation))
    return candidates


def _fits_in_space(dimensions: tuple[float, float, float], space: FreeSpace) -> bool:
    width, height, depth = dimensions
    return (
        width <= space.width + EPSILON
        and height <= space.height + EPSILON
        and depth <= space.depth + EPSILON
    )


def _has_support(
    x: float,
    y: float,
    z: float,
    width: float,
    depth: float,
    placements: list[Placement],
) -> bool:
    if y <= EPSILON:
        return True

    for placement in placements:
        top = placement.position.y + placement.dimensions.height
        if abs(top - y) > EPSILON:
            continue

        if not placement.stackable or placement.fragile:
            continue

        covers_width = (
            placement.position.x <= x + EPSILON
            and placement.position.x + placement.dimensions.width + EPSILON >= x + width
        )
        covers_depth = (
            placement.position.z <= z + EPSILON
            and placement.position.z + placement.dimensions.depth + EPSILON >= z + depth
        )

        if covers_width and covers_depth:
            return True

    return False


def _collides(
    x: float,
    y: float,
    z: float,
    width: float,
    height: float,
    depth: float,
    placements: list[Placement],
) -> bool:
    for placement in placements:
        if (
            _overlaps(x, x + width, placement.position.x, placement.position.x + placement.dimensions.width)
            and _overlaps(y, y + height, placement.position.y, placement.position.y + placement.dimensions.height)
            and _overlaps(z, z + depth, placement.position.z, placement.position.z + placement.dimensions.depth)
        ):
            return True
    return False


def _overlaps(a_min: float, a_max: float, b_min: float, b_max: float) -> bool:
    return a_min < b_max - EPSILON and a_max > b_min + EPSILON


def _split_space(space: FreeSpace, placement: Placement) -> list[FreeSpace]:
    width = placement.dimensions.width
    height = placement.dimensions.height
    depth = placement.dimensions.depth

    candidates = [
        FreeSpace(
            x=space.x + width,
            y=space.y,
            z=space.z,
            width=space.width - width,
            height=space.height,
            depth=space.depth,
        ),
        FreeSpace(
            x=space.x,
            y=space.y,
            z=space.z + depth,
            width=space.width,
            height=space.height,
            depth=space.depth - depth,
        ),
    ]

    if placement.stackable and not placement.fragile:
        candidates.append(
            FreeSpace(
                x=space.x,
                y=space.y + height,
                z=space.z,
                width=width,
                height=space.height - height,
                depth=depth,
            )
        )

    return [space for space in candidates if _is_usable_space(space)]


def _prune_spaces(spaces: list[FreeSpace]) -> list[FreeSpace]:
    usable_spaces = [space for space in spaces if _is_usable_space(space)]
    pruned: list[FreeSpace] = []

    for index, space in enumerate(usable_spaces):
        if any(index != other_index and _contains(other, space) for other_index, other in enumerate(usable_spaces)):
            continue
        pruned.append(space)

    return pruned


def _is_usable_space(space: FreeSpace) -> bool:
    return space.width > EPSILON and space.height > EPSILON and space.depth > EPSILON


def _contains(outer: FreeSpace, inner: FreeSpace) -> bool:
    return (
        outer.x <= inner.x + EPSILON
        and outer.y <= inner.y + EPSILON
        and outer.z <= inner.z + EPSILON
        and outer.x + outer.width + EPSILON >= inner.x + inner.width
        and outer.y + outer.height + EPSILON >= inner.y + inner.height
        and outer.z + outer.depth + EPSILON >= inner.z + inner.depth
    )


def _unloaded_item(item: PackItem, reason: str) -> UnloadedItem:
    return UnloadedItem(
        item_id=item.item_id,
        product_id=item.product_id,
        product_name=item.product.name,
        dimensions=Dimensions(width=item.product.width, height=item.product.height, depth=item.product.depth),
        weight=item.product.weight,
        fragile=item.product.fragile,
        stackable=item.product.stackable,
        reason=reason,
    )


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug
