from __future__ import annotations

from dataclasses import asdict, dataclass
from enum import StrEnum


class PurchaseOrderStatus(StrEnum):
    DRAFT = "DRAFT"
    APPROVED = "APPROVED"
    RECEIVED = "RECEIVED"


@dataclass(slots=True, frozen=True)
class PurchaseOrderLine:
    item_id: str
    warehouse_id: str
    quantity: float
    unit_price: float

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass(slots=True, frozen=True)
class PurchaseOrder:
    purchase_order_id: str
    supplier_name: str
    currency: str
    status: PurchaseOrderStatus
    lines: list[PurchaseOrderLine]

    def to_dict(self) -> dict:
        return {
            "purchase_order_id": self.purchase_order_id,
            "supplier_name": self.supplier_name,
            "currency": self.currency,
            "status": self.status.value,
            "lines": [line.to_dict() for line in self.lines],
        }
