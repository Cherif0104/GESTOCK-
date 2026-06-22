from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from enum import StrEnum


class MovementType(StrEnum):
    IN = "IN"
    OUT = "OUT"
    ADJUSTMENT = "ADJUSTMENT"


@dataclass(slots=True, frozen=True)
class StockMovement:
    movement_id: str
    item_id: str
    warehouse_id: str
    movement_type: MovementType
    quantity: float
    reason: str
    reference: str | None
    moved_at: datetime

    def to_dict(self) -> dict:
        data = asdict(self)
        data["movement_type"] = self.movement_type.value
        data["moved_at"] = self.moved_at.astimezone(UTC).isoformat()
        return data
