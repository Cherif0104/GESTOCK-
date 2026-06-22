from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from app.core.tenant_store import tenant_store
from app.modules.inventory.domain import MovementType, StockMovement


class InventoryService:
    def create_movement(
        self,
        tenant_id: str,
        item_id: str,
        warehouse_id: str,
        movement_type: MovementType,
        quantity: float,
        reason: str,
        reference: str | None = None,
    ) -> StockMovement:
        state = tenant_store.get_or_create(tenant_id)
        if item_id not in state.items:
            raise ValueError("Article introuvable.")
        if warehouse_id not in state.warehouses:
            raise ValueError("Entrepôt introuvable.")
        if quantity <= 0:
            raise ValueError("La quantité doit être strictement positive.")

        if movement_type == MovementType.OUT:
            on_hand = self.get_on_hand(tenant_id, item_id=item_id, warehouse_id=warehouse_id)
            if quantity > on_hand:
                raise ValueError("Stock insuffisant pour cette sortie.")

        movement = StockMovement(
            movement_id=f"mov-{uuid4().hex[:10]}",
            item_id=item_id,
            warehouse_id=warehouse_id,
            movement_type=movement_type,
            quantity=quantity,
            reason=reason,
            reference=reference,
            moved_at=datetime.now(UTC),
        )
        state.stock_movements.append(movement.to_dict())
        return movement

    def get_on_hand(
        self,
        tenant_id: str,
        item_id: str,
        warehouse_id: str,
    ) -> float:
        state = tenant_store.get_or_create(tenant_id)
        total = 0.0
        for movement in state.stock_movements:
            if movement["item_id"] != item_id or movement["warehouse_id"] != warehouse_id:
                continue
            if movement["movement_type"] == MovementType.OUT.value:
                total -= movement["quantity"]
            else:
                total += movement["quantity"]
        return round(total, 3)

    def list_movements(
        self,
        tenant_id: str,
        item_id: str | None = None,
        warehouse_id: str | None = None,
    ) -> list[dict]:
        state = tenant_store.get_or_create(tenant_id)
        rows = state.stock_movements
        if item_id:
            rows = [row for row in rows if row["item_id"] == item_id]
        if warehouse_id:
            rows = [row for row in rows if row["warehouse_id"] == warehouse_id]
        return rows
