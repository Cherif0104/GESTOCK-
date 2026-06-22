from __future__ import annotations

from uuid import uuid4

from app.core.tenant_store import tenant_store
from app.modules.inventory.application import InventoryService
from app.modules.inventory.domain import MovementType
from app.modules.procurement.domain import (
    PurchaseOrder,
    PurchaseOrderLine,
    PurchaseOrderStatus,
)


class ProcurementService:
    def __init__(self) -> None:
        self._inventory_service = InventoryService()

    def create_purchase_order(
        self,
        tenant_id: str,
        supplier_name: str,
        currency: str,
        lines: list[dict],
    ) -> PurchaseOrder:
        state = tenant_store.get_or_create(tenant_id)
        po_lines: list[PurchaseOrderLine] = []
        for line in lines:
            if line["item_id"] not in state.items:
                raise ValueError("Un article de la commande est introuvable.")
            if line["warehouse_id"] not in state.warehouses:
                raise ValueError("Un entrepôt de la commande est introuvable.")
            po_lines.append(
                PurchaseOrderLine(
                    item_id=line["item_id"],
                    warehouse_id=line["warehouse_id"],
                    quantity=line["quantity"],
                    unit_price=line["unit_price"],
                )
            )

        purchase_order = PurchaseOrder(
            purchase_order_id=f"po-{uuid4().hex[:10]}",
            supplier_name=supplier_name,
            currency=currency.upper(),
            status=PurchaseOrderStatus.DRAFT,
            lines=po_lines,
        )
        state.purchase_orders[purchase_order.purchase_order_id] = purchase_order.to_dict()
        return purchase_order

    def list_purchase_orders(self, tenant_id: str) -> list[dict]:
        state = tenant_store.get_or_create(tenant_id)
        return list(state.purchase_orders.values())

    def approve_purchase_order(self, tenant_id: str, purchase_order_id: str) -> dict:
        state = tenant_store.get_or_create(tenant_id)
        purchase_order = state.purchase_orders.get(purchase_order_id)
        if not purchase_order:
            raise ValueError("Bon de commande introuvable.")
        if purchase_order["status"] != PurchaseOrderStatus.DRAFT.value:
            raise ValueError("Seules les commandes DRAFT peuvent être approuvées.")
        purchase_order["status"] = PurchaseOrderStatus.APPROVED.value
        return purchase_order

    def receive_purchase_order(self, tenant_id: str, purchase_order_id: str) -> dict:
        state = tenant_store.get_or_create(tenant_id)
        purchase_order = state.purchase_orders.get(purchase_order_id)
        if not purchase_order:
            raise ValueError("Bon de commande introuvable.")
        if purchase_order["status"] != PurchaseOrderStatus.APPROVED.value:
            raise ValueError("Seules les commandes APPROVED peuvent être réceptionnées.")

        for line in purchase_order["lines"]:
            self._inventory_service.create_movement(
                tenant_id=tenant_id,
                item_id=line["item_id"],
                warehouse_id=line["warehouse_id"],
                movement_type=MovementType.IN,
                quantity=line["quantity"],
                reason="Réception fournisseur",
                reference=purchase_order_id,
            )

        purchase_order["status"] = PurchaseOrderStatus.RECEIVED.value
        return purchase_order
