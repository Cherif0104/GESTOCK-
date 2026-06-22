from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any


@dataclass(slots=True)
class AuditEvent:
    event_id: str
    actor_id: str
    action: str
    entity: str
    entity_id: str
    details: dict[str, Any]
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass(slots=True)
class TenantState:
    tenant_id: str
    organizations: dict[str, dict[str, Any]] = field(default_factory=dict)
    users: dict[str, dict[str, Any]] = field(default_factory=dict)
    modules: dict[str, bool] = field(
        default_factory=lambda: {
            "organizations": True,
            "catalog": True,
            "warehouses": True,
            "inventory": True,
            "procurement": True,
            "reporting": True,
        }
    )
    items: dict[str, dict[str, Any]] = field(default_factory=dict)
    warehouses: dict[str, dict[str, Any]] = field(default_factory=dict)
    stock_movements: list[dict[str, Any]] = field(default_factory=list)
    purchase_orders: dict[str, dict[str, Any]] = field(default_factory=dict)
    audit_events: list[AuditEvent] = field(default_factory=list)


class TenantStore:
    def __init__(self) -> None:
        self._tenants: dict[str, TenantState] = {}

    def get_or_create(self, tenant_id: str) -> TenantState:
        if tenant_id not in self._tenants:
            self._tenants[tenant_id] = TenantState(tenant_id=tenant_id)
        return self._tenants[tenant_id]


tenant_store = TenantStore()
