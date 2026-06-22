from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.core.audit import append_audit_event
from app.core.modules import ensure_module_enabled
from app.core.security import AuthUser, require_permission
from app.core.tenant import get_tenant_id
from app.modules.inventory.application import InventoryService
from app.modules.inventory.domain import MovementType

router = APIRouter(prefix="/v1/stock", tags=["inventory"])
service = InventoryService()


class MovementCreateRequest(BaseModel):
    item_id: str
    warehouse_id: str
    movement_type: Literal["IN", "OUT", "ADJUSTMENT"]
    quantity: float = Field(gt=0)
    reason: str = Field(min_length=2, max_length=200)
    reference: str | None = Field(default=None, max_length=120)


@router.post("/movements")
def create_movement(
    payload: MovementCreateRequest,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("inventory:write")),
):
    ensure_module_enabled(tenant_id, "inventory")
    try:
        movement = service.create_movement(
            tenant_id=tenant_id,
            item_id=payload.item_id,
            warehouse_id=payload.warehouse_id,
            movement_type=MovementType(payload.movement_type),
            quantity=payload.quantity,
            reason=payload.reason,
            reference=payload.reference,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="inventory.movement_created",
        entity="stock_movement",
        entity_id=movement.movement_id,
        details=movement.to_dict(),
    )
    return movement


@router.get("/on-hand")
def get_on_hand(
    item_id: str = Query(...),
    warehouse_id: str = Query(...),
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("inventory:read")),
):
    ensure_module_enabled(tenant_id, "inventory")
    return {
        "item_id": item_id,
        "warehouse_id": warehouse_id,
        "on_hand": service.get_on_hand(tenant_id, item_id, warehouse_id),
    }


@router.get("/movements")
def list_movements(
    item_id: str | None = Query(default=None),
    warehouse_id: str | None = Query(default=None),
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("inventory:read")),
):
    ensure_module_enabled(tenant_id, "inventory")
    return service.list_movements(
        tenant_id=tenant_id,
        item_id=item_id,
        warehouse_id=warehouse_id,
    )
