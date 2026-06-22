# Roadmap GESTOCK

## V0.1 — Fondations (livré dans cette PR)

- Monorepo (pnpm workspaces) API NestJS + Web Next.js + package shared
- Schéma Prisma multi-tenant (organisation, identité, RBAC, catalogue, achats,
  réceptions, stock, mouvements, inventaires, alertes, audit)
- API REST avec OpenAPI/Swagger sur tous les modules
- Auth JWT + refresh + RBAC granulaire (33 permissions)
- Workflows : achats (DRAFT→…→RECEIVED), réceptions (impact stock), inventaires
  (planning→comptage→validation→écarts), stock (transferts, ajustements)
- Frontend Next.js premium : landing, auth, dashboard exécutif, pages métier
  (articles, stock, entrepôts, fournisseurs, achats, réceptions, inventaires, alertes,
  reporting, organisation, paramètres), thème clair/sombre
- Data de démo riche : 1 organisation, 3 utilisateurs, 1 société, 2 sites, 3
  entrepôts, 5 articles, 3 fournisseurs, stock initial avec mouvements

## V0.2 — Opérations terrain

- Module **Ventes & commandes clients** (mirror du module Achats)
- Module **Picking & expédition** (préparation de commande, bons de livraison)
- **Emplacements détaillés** (zones, allées, racks, niveaux, bin) avec règles de
  picking par défaut (FIFO/FEFO/LIFO)
- **Réservations de stock** liées aux commandes clients

## V0.3 — Visibilité & décisions

- **Dashboards configurables** (drag & drop des widgets)
- **Exports** Excel / PDF / CSV depuis chaque liste et rapport
- **Notifications** : e-mail (SMTP), webhooks, push mobile
- **Recherche full-text globale** (Postgres tsvector ou OpenSearch)

## V0.4 — Intégrations

- Connecteurs **comptabilité** (Sage, Odoo, SAP B1)
- Connecteurs **paiement mobile africain** (Wave, Orange Money, MTN MoMo)
- **Webhooks sortants** sur événements (PO approuvée, stock bas, etc.)
- **GraphQL Gateway** optionnelle au-dessus de l'API REST
- **OAuth2 / OIDC** pour clients tiers, **API keys** scoped par organisation

## V0.5 — Mobile terrain

- **Application mobile React Native** (Android-first)
  - Réception, picking, inventaire au scan code-barres
  - Mode **offline-first** avec synchronisation différée
  - Photos de quai, signatures de réception

## V0.6 — Intelligence

- **Prévision de demande** (Prophet, ARIMA, ML)
- **Recommandations de réapprovisionnement** par fournisseur préférentiel
- **Détection d'anomalies** sur mouvements (vol, erreurs de saisie)
- **OCR factures** + matching automatique avec PO
- **Assistant LLM** : questions en langage naturel sur l'activité

## V0.7 — Enterprise & conformité

- **SSO** SAML 2.0 + OIDC
- **MFA** (TOTP, WebAuthn, SMS via Twilio)
- **Chiffrement au repos** des champs sensibles (PII, montants)
- **Conformité** : RGPD (UE), traçabilité fiscale CEMAC/UEMOA
- **Multi-région** (EU, AF-ZA, AF-WS) avec résidence des données

## V1.0 — Plateforme

- **Marketplace d'extensions** (apps tierces certifiées)
- **Workflow engine** configurable (low-code)
- **API publique versionnée** + SDK officiels (JS/TS, Python, PHP)
- **SLA** et offres Cloud managées (Starter / Business / Enterprise)
