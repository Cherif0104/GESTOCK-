from __future__ import annotations

from uuid import uuid4

from app.core.tenant_store import tenant_store
from app.modules.organizations.domain import Organization, TenantUser


class OrganizationService:
    def create_organization(
        self,
        tenant_id: str,
        name: str,
        country_code: str,
        default_currency: str,
        default_timezone: str,
    ) -> Organization:
        state = tenant_store.get_or_create(tenant_id)
        organization = Organization(
            organization_id=f"org-{uuid4().hex[:10]}",
            name=name,
            country_code=country_code,
            default_currency=default_currency,
            default_timezone=default_timezone,
        )
        state.organizations[organization.organization_id] = organization.to_dict()
        return organization

    def list_organizations(self, tenant_id: str) -> list[dict]:
        state = tenant_store.get_or_create(tenant_id)
        return list(state.organizations.values())

    def create_user(
        self,
        tenant_id: str,
        organization_id: str,
        full_name: str,
        email: str,
        role: str,
    ) -> TenantUser:
        state = tenant_store.get_or_create(tenant_id)
        if organization_id not in state.organizations:
            raise ValueError("Organisation introuvable.")
        user = TenantUser(
            user_id=f"usr-{uuid4().hex[:10]}",
            organization_id=organization_id,
            full_name=full_name,
            email=email,
            role=role,
        )
        state.users[user.user_id] = user.to_dict()
        return user

    def list_users(self, tenant_id: str) -> list[dict]:
        state = tenant_store.get_or_create(tenant_id)
        return list(state.users.values())

    def set_module_status(
        self,
        tenant_id: str,
        module_key: str,
        enabled: bool,
    ) -> dict[str, bool]:
        state = tenant_store.get_or_create(tenant_id)
        if module_key not in state.modules:
            raise ValueError("Module inconnu.")
        state.modules[module_key] = enabled
        return state.modules

    def list_modules(self, tenant_id: str) -> dict[str, bool]:
        state = tenant_store.get_or_create(tenant_id)
        return state.modules
