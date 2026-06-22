from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(slots=True, frozen=True)
class Item:
    item_id: str
    sku: str
    name: str
    unit: str
    category: str
    reorder_point: float
    standard_cost: float

    def to_dict(self) -> dict:
        return asdict(self)
