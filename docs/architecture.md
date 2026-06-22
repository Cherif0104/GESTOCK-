# Architecture cible GESTOCK (Blueprint Enterprise)

## 1) Positionnement

GESTOCK est conçu comme une plateforme SaaS B2B cloud-native de pilotage logistique : stocks, achats, approvisionnement, entrepots, mouvements, inventaires et performance supply chain.

La plateforme vise un niveau de maturité comparable aux ERP internationaux tout en restant adaptée aux contextes africains (connectivité variable, hétérogénéité des tailles d'organisation, besoins multi-pays et multi-devises).

## 2) Principes directeurs

- **Multi-tenant strict** (isolation logique et sécurité)
- **API First** (interopérabilité ERP/Finance/CRM/RH)
- **Domain Driven Design**
- **Architecture modulaire** (feature toggles par client)
- **Auditabilité complète**
- **Scalabilité horizontale**
- **Observabilité native**
- **Mobile first et UX orientée opérations**

## 3) Architecture logique

Chaque domaine suit la séparation suivante :

- `domain`: entités, invariants, règles métier
- `application`: orchestrations, cas d'usage, transactions
- `infrastructure`: persistance, messaging, providers externes
- `presentation`: API REST, websockets, (plus tard GraphQL)

### Domaines fonctionnels

1. Organizations & IAM
2. Catalog & Master Data
3. Warehouses & Sites
4. Inventory & Movements
5. Procurement & Replenishment
6. Reporting & BI
7. Integrations Hub (à étendre)
8. AI/Optimization layer (fondations prêtes)

## 4) Multi-tenant / multi-organisation

Un tenant contient :

- plusieurs sociétés
- plusieurs sites
- plusieurs entrepots
- ses utilisateurs
- ses workflows
- ses modules activés

Isolation recommandée en production :

- Row-Level Security (PostgreSQL)
- chiffrement tenant-aware
- clés de chiffrement segmentées par organisation sensible

## 5) Sécurité Enterprise

- AuthN : OIDC (Keycloak / Auth0 / Azure AD)
- AuthZ : RBAC + ABAC (permissions par rôle, site, entrepot, société)
- Journalisation : audit trail horodaté de toute action critique
- Durcissement : rate limiting, WAF, secret manager, rotation des clés
- Gouvernance : séparation des devoirs (SoD), historique et forensic

## 6) Données et performance

- PostgreSQL comme base transactionnelle principale
- Redis pour cache, sessions, queues courtes
- Bus d'événements (Kafka / NATS / RabbitMQ) pour intégrations et analytics
- Data mart BI pour rapports décisionnels (star schema)

## 7) Observabilité et opérations

- Logs structurés (JSON)
- Traces distribuées (OpenTelemetry)
- Métriques SLI/SLO
- Alerting proactif (latence API, erreurs, saturation workers)
- Stratégie CI/CD avec tests multi-couches et scans sécurité

## 8) Expérience produit

- Dashboards exécutifs configurables
- Vue 360 des ruptures, rotations, lead-times fournisseurs
- Workflows guidés pour réception, inventaire, approvisionnement
- UX responsive desktop/tablette/mobile

## 9) Internationalisation

- i18n (fr, en, ar dans phases ultérieures)
- multi-devises (XOF, XAF, NGN, USD, EUR...)
- multi-fuseaux horaires
- formats locaux (date, nombre, fiscalité configurable)

## 10) Feuille d'extension technique

1. **Phase 1 (ce dépôt):** socle API modulaire multi-tenant + sécurité + audit + domaines clés
2. **Phase 2:** PostgreSQL + migrations + repository pattern concret + events outbox
3. **Phase 3:** front web enterprise + mobile ops + reporting avancé
4. **Phase 4:** IA (prévisions de demande, recommandations d'achat, scoring fournisseurs)

## 11) Endpoints livrés dans ce socle

- `/v1/organizations` (+ users, modules)
- `/v1/items`
- `/v1/warehouses`
- `/v1/stock/movements`, `/v1/stock/on-hand`
- `/v1/purchase-orders` (+ approve, receive)
- `/v1/reporting/kpis`, `/v1/reporting/audit-trail`

Ce socle constitue une base industrialisable pour produire un produit GESTOCK complet et commercialisable.
