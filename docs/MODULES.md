# Modules métier GESTOCK

Chaque module suit la même architecture : `module.ts` + `controller.ts` + `service.ts`
+ `dto/*.ts`, avec isolation tenant via `@OrgId()` et autorisation via `@RequirePermissions()`.

## Auth (`/auth`)
- `POST /register` — création organisation + admin
- `POST /login` — émet access + refresh tokens
- `POST /refresh` — rotation des tokens
- `POST /logout` — révocation refresh
- `GET  /me` — session courante (user + permissions)

## Utilisateurs (`/users`)
CRUD complet, attribution multi-rôles, activation/désactivation, changement de mot de passe.

## Organisations (`/organizations`)
- `GET    /current` — fiche organisation
- `PATCH  /current` — mise à jour (langue, devise, fuseau, identifiant fiscal…)
- `GET    /current/stats` — KPIs synthétiques

## Sociétés / Sites / Entrepôts (`/companies` `/sites` `/warehouses`)
Hiérarchie multi-niveaux Société → Site → Entrepôt → Emplacement. CRUD + filtres.

## Catégories (`/categories`)
Arborescence catégories articles (parent/enfants).

## Articles (`/products`)
- CRUD + recherche full-text (nom, SKU, code-barres)
- Politique de stock (min/max/reorder/leadTime)
- Traçabilité (lot / série / péremption)
- `GET /products/units` — unités de mesure disponibles

## Fournisseurs (`/suppliers`)
CRUD, conditions de paiement, devise, notation 0-5, liens article-fournisseur.

## Achats (`/purchase-orders`)
Workflow complet :

```
DRAFT ──submit──▶ SUBMITTED ──approve──▶ APPROVED ──order──▶ ORDERED
                                                                  │
                                            ┌─partiellement───────┘
                                            ▼
                                   PARTIALLY_RECEIVED ──fully──▶ RECEIVED / CLOSED
            └──────────────cancel──────────────▶ CANCELLED
```

Génération automatique de référence `PO-YYYYMM-NNNN`.

## Réceptions (`/receipts`)
- Création multi-lignes (avec liens vers lignes PO)
- Confirmation = application transactionnelle au stock
- Met à jour `receivedQty` des lignes PO + statut de la PO

## Stock (`/stock`)
- `GET /positions` — positions par article × entrepôt (filtre `lowStock=true`)
- `GET /movements` — journal des mouvements (filtres type, produit, entrepôt)
- `POST /transfers` — transfert inter-entrepôts (génère 2 mouvements : OUT + IN)
- `POST /adjustments` — ajustement signé (ADJUSTMENT_IN / ADJUSTMENT_OUT)

## Inventaires (`/inventories`)
- `POST /` — démarre un inventaire (pré-remplissage avec positions actuelles)
- `PATCH /:id/lines/:lineId` — mise à jour de la quantité comptée + variance auto
- `POST /:id/complete` — clôture du comptage
- `POST /:id/validate` — applique les écarts au stock (mouvements INVENTORY)

## Alertes (`/alerts`)
- `GET /` — liste filtrable (severity, type, acknowledged)
- `POST /recompute` — re-calcul à partir des positions stock
- `POST /:id/acknowledge` — accusé de réception

## Dashboard (`/dashboard`)
- `GET /overview` — KPIs, mouvements récents, valeur stock
- `GET /movements-by-type?days=30`
- `GET /top-products?limit=10`

## Audit (`/audit`)
- `GET /` — journal filtrable (type d'entité, utilisateur, plage temporelle)

## Health (`/health`)
- `GET /` — santé service + dépendance DB
