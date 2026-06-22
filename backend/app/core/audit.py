from __future__ import annotations

from uuid import uuid4

from app.core.security import AuthUser
from app.core.tenant_store import AuditEvent, tenant_store


def append_audit_event(
    tenant_id: str,
    actor: AuthUser,
    action: str,
    entity: str,
    entity_id: str,
    details: dict,
) -> None:
    state = tenant_store.get_or_create(tenant_id)
    state.audit_events.append(
        AuditEvent(
            event_id=str(uuid4()),
            actor_id=actor.user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            details=details,
        )
    )
