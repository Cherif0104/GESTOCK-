from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.audit import append_audit_event
from app.core.modules import ensure_module_enabled
from app.core.security import AuthUser, require_permission
from app.core.tenant import get_tenant_id
from app.modules.warehouses.application import WarehouseService

router = APIRouter(prefix="/v1/warehouses", tags=["warehouses"])
service = WarehouseService()


class WarehouseCreateRequest(BaseModel):
    code: str = Field(min_length=2, max_length=30)
    name: str = Field(min_length=2, max_length=120)
    company_id: str = Field(min_length=2, max_length=40)
    site_id: str = Field(min_length=2, max_length=40)
    location: str = Field(min_length=2, max_length=120)


@router.post("")
def create_warehouse(
    payload: WarehouseCreateRequest,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("warehouses:write")),
):
    ensure_module_enabled(tenant_id, "warehouses")
    try:
        warehouse = service.create_warehouse(
            tenant_id=tenant_id,
            code=payload.code,
            name=payload.name,
            company_id=payload.company_id,
            site_id=payload.site_id,
            location=payload.location,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="warehouse.created",
        entity="warehouse",
        entity_id=warehouse.warehouse_id,
        details=warehouse.to_dict(),
    )
    return warehouse


@router.get("")
def list_warehouses(
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("warehouses:read")),
):
    ensure_module_enabled(tenant_id, "warehouses")
    return service.list_warehouses(tenant_id)
