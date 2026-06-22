from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.audit import append_audit_event
from app.core.modules import ensure_module_enabled
from app.core.security import AuthUser, require_permission
from app.core.tenant import get_tenant_id
from app.modules.catalog.application import CatalogService

router = APIRouter(prefix="/v1/items", tags=["catalog"])
service = CatalogService()


class ItemCreateRequest(BaseModel):
    sku: str = Field(min_length=2, max_length=40)
    name: str = Field(min_length=2, max_length=120)
    unit: str = Field(min_length=1, max_length=20)
    category: str = Field(min_length=2, max_length=60)
    reorder_point: float = Field(ge=0)
    standard_cost: float = Field(ge=0)


@router.post("")
def create_item(
    payload: ItemCreateRequest,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("catalog:write")),
):
    ensure_module_enabled(tenant_id, "catalog")
    try:
        item = service.create_item(
            tenant_id=tenant_id,
            sku=payload.sku,
            name=payload.name,
            unit=payload.unit,
            category=payload.category,
            reorder_point=payload.reorder_point,
            standard_cost=payload.standard_cost,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="catalog.item_created",
        entity="item",
        entity_id=item.item_id,
        details=item.to_dict(),
    )
    return item


@router.get("")
def list_items(
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("catalog:read")),
):
    ensure_module_enabled(tenant_id, "catalog")
    return service.list_items(tenant_id)
