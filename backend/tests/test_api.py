from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
ADMIN_HEADERS = {
    "Authorization": "Bearer superadmin-demo-token",
    "X-Tenant-Id": "tenant-alpha",
}


def test_end_to_end_procurement_reception_updates_stock_and_kpis():
    org_response = client.post(
        "/v1/organizations",
        headers=ADMIN_HEADERS,
        json={
            "name": "Gestock Africa",
            "country_code": "SN",
            "default_currency": "XOF",
            "default_timezone": "Africa/Dakar",
        },
    )
    assert org_response.status_code == 200

    item_response = client.post(
        "/v1/items",
        headers=ADMIN_HEADERS,
        json={
            "sku": "SKU-001",
            "name": "Riz 25kg",
            "unit": "bag",
            "category": "Food",
            "reorder_point": 20,
            "standard_cost": 10000,
        },
    )
    assert item_response.status_code == 200
    item_id = item_response.json()["item_id"]

    warehouse_response = client.post(
        "/v1/warehouses",
        headers=ADMIN_HEADERS,
        json={
            "code": "DKR-01",
            "name": "Entrepot Dakar",
            "company_id": "cmp-main",
            "site_id": "site-dkr",
            "location": "Dakar",
        },
    )
    assert warehouse_response.status_code == 200
    warehouse_id = warehouse_response.json()["warehouse_id"]

    po_response = client.post(
        "/v1/purchase-orders",
        headers=ADMIN_HEADERS,
        json={
            "supplier_name": "Fournisseur Sahel",
            "currency": "XOF",
            "lines": [
                {
                    "item_id": item_id,
                    "warehouse_id": warehouse_id,
                    "quantity": 30,
                    "unit_price": 10000,
                }
            ],
        },
    )
    assert po_response.status_code == 200
    purchase_order_id = po_response.json()["purchase_order_id"]

    approve_response = client.post(
        f"/v1/purchase-orders/{purchase_order_id}/approve",
        headers=ADMIN_HEADERS,
    )
    assert approve_response.status_code == 200

    receive_response = client.post(
        f"/v1/purchase-orders/{purchase_order_id}/receive",
        headers=ADMIN_HEADERS,
    )
    assert receive_response.status_code == 200
    assert receive_response.json()["status"] == "RECEIVED"

    on_hand_response = client.get(
        f"/v1/stock/on-hand?item_id={item_id}&warehouse_id={warehouse_id}",
        headers=ADMIN_HEADERS,
    )
    assert on_hand_response.status_code == 200
    assert on_hand_response.json()["on_hand"] == 30

    kpi_response = client.get("/v1/reporting/kpis", headers=ADMIN_HEADERS)
    assert kpi_response.status_code == 200
    kpis = kpi_response.json()
    assert kpis["inventory_value"] == 300000
    assert kpis["open_purchase_orders"] == 0


def test_multi_tenant_data_isolation():
    item_response = client.post(
        "/v1/items",
        headers={
            "Authorization": "Bearer superadmin-demo-token",
            "X-Tenant-Id": "tenant-beta",
        },
        json={
            "sku": "SKU-BETA",
            "name": "Produit Beta",
            "unit": "pcs",
            "category": "General",
            "reorder_point": 5,
            "standard_cost": 100,
        },
    )
    assert item_response.status_code == 200

    list_alpha = client.get("/v1/items", headers=ADMIN_HEADERS)
    list_beta = client.get(
        "/v1/items",
        headers={
            "Authorization": "Bearer superadmin-demo-token",
            "X-Tenant-Id": "tenant-beta",
        },
    )

    skus_alpha = {row["sku"] for row in list_alpha.json()}
    skus_beta = {row["sku"] for row in list_beta.json()}
    assert "SKU-BETA" not in skus_alpha
    assert "SKU-BETA" in skus_beta
