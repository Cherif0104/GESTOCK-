# GESTOCK

Plateforme SaaS Cloud de gestion des stocks, approvisionnements, achats, entrepots et supply chain, conçue pour les organisations africaines (PME, grands comptes, ONG, secteur public, santé, distribution, logistique).

## Objectif du dépôt

Ce dépôt fournit une **fondation technique exécutable** de GESTOCK avec :

- architecture modulaire orientée domaine (DDD)
- isolation multi-tenant stricte
- sécurité RBAC par permissions
- audit trail natif
- modules activables/désactivables par tenant
- endpoints API-first pour catalogue, entrepots, stocks, achats et reporting

## Stack actuelle

- **Backend**: FastAPI (Python 3.12+)
- **Architecture**: Domain / Application / Infrastructure (in-memory demo) / Presentation
- **Tests**: Pytest + TestClient

## Arborescence

```text
backend/
  app/
    core/
    modules/
      organizations/
      catalog/
      warehouses/
      inventory/
      procurement/
      reporting/
    main.py
  tests/
docs/
  architecture.md
```

## Lancement rapide

```bash
pip install -e .[dev]
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Swagger: `http://localhost:8000/docs`

## Headers obligatoires

Chaque appel API doit inclure :

- `Authorization: Bearer <token>`
- `X-Tenant-Id: <tenant-id>`

Tokens de démo :

- `superadmin-demo-token`
- `operator-demo-token`

## Modules implémentés

1. **Organizations** (multi-sociétés, utilisateurs, activation de modules)
2. **Catalog** (articles, SKU, seuil de réapprovisionnement)
3. **Warehouses** (multi-sites / multi-entrepôts)
4. **Inventory** (mouvements IN/OUT/ADJUSTMENT, stock disponible)
5. **Procurement** (bons de commande, approbation, réception)
6. **Reporting** (KPIs exécutifs et audit trail)

## Qualité et tests

```bash
python3 -m pytest
```

## Vision Enterprise (prochaine étape)

La base présente sert de noyau pour industrialiser :

- persistance PostgreSQL et événements asynchrones
- architecture hexagonale complète
- IAM/OIDC, SSO, chiffrement et conformité
- dashboards BI avancés
- moteur de workflows
- intégrations ERP/Finance/CRM/RH
- app mobile terrain
- fonctions IA (prévisions, recommandations, automatisations)

Voir `docs/architecture.md` pour le blueprint détaillé.
