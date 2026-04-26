from app.schemas import ContainerInput, ProductInput, ShapeConfig, ShapeProfilePoint, SimulationRequest
from app.services.packing import run_simulation


def test_places_single_item() -> None:
    response = run_simulation(
        SimulationRequest(
            container=ContainerInput(width=10, height=10, depth=10),
            products=[ProductInput(name="Box", width=5, height=5, depth=5, quantity=1)],
        )
    )

    assert response.metrics.loaded_items == 1
    assert response.metrics.unloaded_items == 0
    assert response.metrics.occupancy_percentage == 12.5


def test_reports_unloaded_items_when_space_is_not_available() -> None:
    response = run_simulation(
        SimulationRequest(
            container=ContainerInput(width=10, height=10, depth=10),
            products=[ProductInput(name="Large box", width=10, height=10, depth=10, quantity=2)],
        )
    )

    assert response.metrics.loaded_items == 1
    assert response.metrics.unloaded_items == 1
    assert response.unloaded[0].reason == "no_available_space"
    assert response.unloaded[0].requested_quantity == 2
    assert response.unloaded[0].loaded_quantity == 1
    assert response.unloaded[0].unloaded_quantity == 1
    assert "Entraron 1 de 2" in response.unloaded[0].explanation
    assert response.unloaded[0].suggestion


def test_rotation_can_make_product_fit() -> None:
    response = run_simulation(
        SimulationRequest(
            container=ContainerInput(width=4, height=5, depth=2),
            products=[ProductInput(name="Rotated box", width=2, height=5, depth=4, quantity=1)],
        )
    )

    assert response.metrics.loaded_items == 1
    assert response.placements[0].dimensions.width == 4
    assert response.placements[0].dimensions.depth == 2


def test_non_stackable_item_does_not_support_more_cargo() -> None:
    response = run_simulation(
        SimulationRequest(
            container=ContainerInput(width=10, height=10, depth=10),
            products=[
                ProductInput(
                    name="Base",
                    width=10,
                    height=5,
                    depth=10,
                    quantity=1,
                    stackable=False,
                    allow_rotations=False,
                ),
                ProductInput(
                    name="Top",
                    width=10,
                    height=5,
                    depth=10,
                    quantity=1,
                    allow_rotations=False,
                ),
            ],
        )
    )

    assert response.metrics.loaded_items == 1
    assert response.metrics.unloaded_items == 1


def test_container_weight_limit_is_respected() -> None:
    response = run_simulation(
        SimulationRequest(
            container=ContainerInput(width=10, height=10, depth=10, max_weight=10),
            products=[ProductInput(name="Heavy", width=2, height=2, depth=2, weight=6, quantity=2)],
        )
    )

    assert response.metrics.loaded_items == 1
    assert response.metrics.unloaded_items == 1
    assert response.unloaded[0].reason == "weight_limit_exceeded"
    assert response.unloaded[0].requested_quantity == 2
    assert response.unloaded[0].loaded_quantity == 1
    assert "peso" in response.unloaded[0].suggestion.lower()


def test_products_with_same_name_get_distinct_generated_ids() -> None:
    response = run_simulation(
        SimulationRequest(
            container=ContainerInput(width=10, height=10, depth=10),
            products=[
                ProductInput(name="Box", width=2, height=2, depth=2, quantity=1),
                ProductInput(name="Box", width=2, height=2, depth=2, quantity=1),
            ],
        )
    )

    item_ids = {placement.item_id for placement in response.placements}
    assert item_ids == {"box-1-1", "box-2-1"}


def test_product_shape_metadata_is_preserved() -> None:
    response = run_simulation(
        SimulationRequest(
            container=ContainerInput(width=10, height=10, depth=10),
            products=[
                ProductInput(
                    name="Lamp",
                    width=2,
                    height=5,
                    depth=2,
                    quantity=1,
                    shape="custom",
                    shape_config=ShapeConfig(
                        profile=[
                            ShapeProfilePoint(height_ratio=0, width_ratio=0.7, depth_ratio=0.7),
                            ShapeProfilePoint(height_ratio=0.5, width_ratio=0.2, depth_ratio=0.2),
                            ShapeProfilePoint(height_ratio=1, width_ratio=0.9, depth_ratio=0.9),
                        ],
                    ),
                )
            ],
        )
    )

    assert response.placements[0].shape == "custom"
    assert response.placements[0].shape_config is not None
    assert response.placements[0].shape_config.profile is not None
    assert response.placements[0].shape_config.profile[1].width_ratio == 0.2
