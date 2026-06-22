from __future__ import annotations

from fastapi import Header, HTTPException, status


def get_tenant_id(x_tenant_id: str | None = Header(default=None)) -> str:
    if not x_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="En-tête X-Tenant-Id obligatoire.",
        )
    return x_tenant_id.strip().lower()
