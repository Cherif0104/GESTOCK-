from __future__ import annotations

from fastapi import HTTPException, status

from app.core.tenant_store import tenant_store


def ensure_module_enabled(tenant_id: str, module_key: str) -> None:
    state = tenant_store.get_or_create(tenant_id)
    if not state.modules.get(module_key, False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Le module '{module_key}' est désactivé pour ce tenant.",
        )
