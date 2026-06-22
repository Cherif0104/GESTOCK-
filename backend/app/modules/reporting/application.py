from __future__ import annotations

from collections import defaultdict

from app.core.tenant_store import tenant_store


class ReportingService:
    def get_kpis(self, tenant_id: str) -> dict:
        state = tenant_store.get_or_create(tenant_id)
        on_hand_by_item: dict[str, float] = defaultdict(float)

        for movement in state.stock_movements:
            sign = -1 if movement["movement_type"] == "OUT" else 1
            on_hand_by_item[movement["item_id"]] += sign * float(movement["quantity"])

        low_stock_count = 0
        inventory_value = 0.0
        for item in state.items.values():
            quantity = on_hand_by_item.get(item["item_id"], 0.0)
            if quantity < item["reorder_point"]:
                low_stock_count += 1
            inventory_value += quantity * item["standard_cost"]

        open_purchase_orders = sum(
            1 for po in state.purchase_orders.values() if po["status"] != "RECEIVED"
        )

        return {
            "total_items": len(state.items),
            "total_warehouses": len(state.warehouses),
            "low_stock_count": low_stock_count,
            "inventory_value": round(inventory_value, 2),
            "open_purchase_orders": open_purchase_orders,
            "stock_movements_count": len(state.stock_movements),
        }

    def get_audit_trail(self, tenant_id: str, limit: int = 50) -> list[dict]:
        state = tenant_store.get_or_create(tenant_id)
        events = list(reversed(state.audit_events[:]))
        rows = events[:limit]
        return [
            {
                "event_id": event.event_id,
                "actor_id": event.actor_id,
                "action": event.action,
                "entity": event.entity,
                "entity_id": event.entity_id,
                "details": event.details,
                "timestamp": event.timestamp.isoformat(),
            }
            for event in rows
        ]
