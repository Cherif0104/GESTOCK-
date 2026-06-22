from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.audit import append_audit_event
from app.core.security import AuthUser, require_permission
from app.core.tenant import get_tenant_id
from app.modules.organizations.application import OrganizationService

router = APIRouter(prefix="/v1/organizations", tags=["organizations"])
service = OrganizationService()


class OrganizationCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    country_code: str = Field(min_length=2, max_length=2)
    default_currency: str = Field(min_length=3, max_length=3)
    default_timezone: str = Field(min_length=3, max_length=60)


class UserCreateRequest(BaseModel):
    full_name: str = Field(min_length=3, max_length=120)
    email: str = Field(min_length=5, max_length=200)
    role: str = Field(min_length=2, max_length=50)


@router.post("")
def create_organization(
    payload: OrganizationCreateRequest,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("organizations:manage")),
):
    organization = service.create_organization(
        tenant_id=tenant_id,
        name=payload.name,
        country_code=payload.country_code.upper(),
        default_currency=payload.default_currency.upper(),
        default_timezone=payload.default_timezone,
    )
    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="organization.created",
        entity="organization",
        entity_id=organization.organization_id,
        details=organization.to_dict(),
    )
    return organization


@router.get("")
def list_organizations(
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("catalog:read")),
):
    return service.list_organizations(tenant_id)


@router.post("/{organization_id}/users")
def create_user(
    organization_id: str,
    payload: UserCreateRequest,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("organizations:manage")),
):
    try:
        user = service.create_user(
            tenant_id=tenant_id,
            organization_id=organization_id,
            full_name=payload.full_name,
            email=payload.email,
            role=payload.role,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="organization.user_created",
        entity="user",
        entity_id=user.user_id,
        details=user.to_dict(),
    )
    return user


@router.get("/users")
def list_users(
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("organizations:manage")),
):
    return service.list_users(tenant_id)


@router.get("/modules")
def list_modules(
    tenant_id: str = Depends(get_tenant_id),
    _: AuthUser = Depends(require_permission("organizations:manage")),
):
    return service.list_modules(tenant_id)


@router.put("/modules/{module_key}")
def toggle_module(
    module_key: str,
    enabled: bool,
    tenant_id: str = Depends(get_tenant_id),
    actor: AuthUser = Depends(require_permission("organizations:manage")),
):
    try:
        modules = service.set_module_status(
            tenant_id=tenant_id,
            module_key=module_key,
            enabled=enabled,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    append_audit_event(
        tenant_id=tenant_id,
        actor=actor,
        action="module.updated",
        entity="module",
        entity_id=module_key,
        details={"enabled": enabled},
    )
    return modules
