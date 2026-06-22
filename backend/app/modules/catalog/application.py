from __future__ import annotations

from uuid import uuid4

from app.core.tenant_store import tenant_store
from app.modules.catalog.domain import Item


class CatalogService:
    def create_item(
        self,
        tenant_id: str,
        sku: str,
        name: str,
        unit: str,
        category: str,
        reorder_point: float,
        standard_cost: float,
    ) -> Item:
        state = tenant_store.get_or_create(tenant_id)
        normalized_sku = sku.upper()
        if any(existing["sku"] == normalized_sku for existing in state.items.values()):
            raise ValueError("SKU déjà existant.")

        item = Item(
            item_id=f"itm-{uuid4().hex[:10]}",
            sku=normalized_sku,
            name=name,
            unit=unit,
            category=category,
            reorder_point=reorder_point,
            standard_cost=standard_cost,
        )
        state.items[item.item_id] = item.to_dict()
        return item

    def list_items(self, tenant_id: str) -> list[dict]:
        state = tenant_store.get_or_create(tenant_id)
        return list(state.items.values())
