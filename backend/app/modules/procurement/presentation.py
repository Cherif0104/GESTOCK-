from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.audit import append_audit_event
from app.core.modules import ensure_module_enabled
from app.core.security import AuthUser, require_permission
from app.core.tenant import get_tenant_id
from app.modules.procurement.application import ProcurementService

router = APIRouter(prefix="/v1/purchase-orders", tags=["procurement"])
service = ProcurementService()


class PurchaseOrderLineRequest(BaseModel):
    item_id: str
    warehouse_id: str
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)


class PurchaseOrderCreateRequest(BaseModel):
    supplier_name: str = Field(min_length=2, max_length=120)
    currency: str = Field(min_length=3, max_length=3)
    lines: list[PurchaseOrderLineRequest] = Field(min_length=1)


@router.post("")
def create_purchase_order(
    payload: PurchaseOrderCreateRequest,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("procurement:write")),
):
    ensure_module_enabled(tenant_id, "procurement")
    try:
        purchase_order = service.create_purchase_order(
            tenant_id=tenant_id,
            supplier_name=payload.supplier_name,
            currency=payload.currency,
            lines=[line.model_dump() for line in payload.lines],
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="procurement.purchase_order_created",
        entity="purchase_order",
        entity_id=purchase_order.purchase_order_id,
        details=purchase_order.to_dict(),
    )
    return purchase_order


@router.get("")
def list_purchase_orders(
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("procurement:read")),
):
    ensure_module_enabled(tenant_id, "procurement")
    return service.list_purchase_orders(tenant_id)


@router.post("/{purchase_order_id}/approve")
def approve_purchase_order(
    purchase_order_id: str,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("procurement:write")),
):
    ensure_module_enabled(tenant_id, "procurement")
    try:
        purchase_order = service.approve_purchase_order(
            tenant_id=tenant_id,
            purchase_order_id=purchase_order_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="procurement.purchase_order_approved",
        entity="purchase_order",
        entity_id=purchase_order_id,
        details={"status": purchase_order["status"]},
    )
    return purchase_order


@router.post("/{purchase_order_id}/receive")
def receive_purchase_order(
    purchase_order_id: str,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("procurement:write")),
):
    ensure_module_enabled(tenant_id, "procurement")
    try:
        purchase_order = service.receive_purchase_order(
            tenant_id=tenant_id,
            purchase_order_id=purchase_order_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="procurement.purchase_order_received",
        entity="purchase_order",
        entity_id=purchase_order_id,
        details={"status": purchase_order["status"]},
    )
    return purchase_order
