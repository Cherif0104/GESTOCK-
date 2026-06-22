from __future__ import annotations

from fastapi import FastAPI

from app.modules.catalog.presentation import router as catalog_router
from app.modules.inventory.presentation import router as inventory_router
from app.modules.organizations.presentation import router as organizations_router
from app.modules.procurement.presentation import router as procurement_router
from app.modules.reporting.presentation import router as reporting_router
from app.modules.warehouses.presentation import router as warehouses_router

app = FastAPI(
    title="GESTOCK API",
    version="0.1.0",
    summary="Plateforme SaaS Cloud de gestion des stocks et supply chain",
    description=(
        "API multi-tenant de GESTOCK. Isolation par tenant via X-Tenant-Id, "
        "sécurité RBAC par permissions et journalisation des opérations."
    ),
)

app.include_router(organizations_router)
app.include_router(catalog_router)
app.include_router(warehouses_router)
app.include_router(inventory_router)
app.include_router(procurement_router)
app.include_router(reporting_router)


@app.get("/health", tags=["system"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
