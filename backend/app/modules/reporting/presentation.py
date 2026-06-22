from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.modules import ensure_module_enabled
from app.core.security import AuthUser, require_permission
from app.core.tenant import get_tenant_id
from app.modules.reporting.application import ReportingService

router = APIRouter(prefix="/v1/reporting", tags=["reporting"])
service = ReportingService()


@router.get("/kpis")
def get_kpis(
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("reporting:read")),
):
    ensure_module_enabled(tenant_id, "reporting")
    return service.get_kpis(tenant_id)


@router.get("/audit-trail")
def get_audit_trail(
    limit: int = Query(default=50, ge=1, le=200),
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("reporting:read")),
):
    ensure_module_enabled(tenant_id, "reporting")
    return service.get_audit_trail(tenant_id, limit=limit)
