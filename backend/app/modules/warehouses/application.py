from __future__ import annotations

from uuid import uuid4

from app.core.tenant_store import tenant_store
from app.modules.warehouses.domain import Warehouse


class WarehouseService:
    def create_warehouse(
        self,
        tenant_id: str,
        code: str,
        name: str,
        company_id: str,
        site_id: str,
        location: str,
    ) -> Warehouse:
        state = tenant_store.get_or_create(tenant_id)
        normalized_code = code.upper()
        if any(existing["code"] == normalized_code for existing in state.warehouses.values()):
            raise ValueError("Code entrepôt déjà utilisé.")

        warehouse = Warehouse(
            warehouse_id=f"wh-{uuid4().hex[:10]}",
            code=normalized_code,
            name=name,
            company_id=company_id,
            site_id=site_id,
            location=location,
        )
        state.warehouses[warehouse.warehouse_id] = warehouse.to_dict()
        return warehouse

    def list_warehouses(self, tenant_id: str) -> list[dict]:
        state = tenant_store.get_or_create(tenant_id)
        return list(state.warehouses.values())
