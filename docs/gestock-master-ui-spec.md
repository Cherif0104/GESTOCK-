# GESTOCK - Document maître des maquettes Hi-Fidelity Enterprise UI

Ce document sert de source de vérité pour générer 200 à 300 écrans cohérents de
la plateforme GESTOCK dans Figma, Cursor, Lovable, Bolt ou tout autre outil de
génération d'interfaces. Il décrit uniquement des interfaces métier, sans écran
marketing, sans affiche et sans contenu promotionnel.

## 1. Principes de génération

- Chaque maquette doit ressembler à une capture d'écran d'un SaaS Enterprise en production.
- Chaque écran doit utiliser la même ossature : sidebar, topbar, zone de recherche, filtres,
  actions primaires, tableaux, cartes KPI, panneaux de détail et audit.
- Les données affichées doivent être réalistes pour une supply chain africaine :
  XOF, multi-pays, multi-sites, entrepôts urbains et régionaux, connectivité variable.
- Les écrans doivent prévoir les états : chargement, vide, erreur, accès interdit,
  données partielles, mode lecture seule, validation en attente et conflit de concurrence.
- Les écrans doivent être conçus desktop-first, tablette-ready et mobile-adaptables.

## 2. Niveau 0 - Design System

### Identité

- **Nom produit** : GESTOCK
- **Signature interne** : ERP Cloud Supply Chain
- **Logo** : monogramme `G` dans un carré arrondi, dégradé vert menthe vers ambre.
- **Style** : Enterprise, clair, dense, professionnel, inspiré COYA.PRO pour l'ossature.

### Couleurs

| Usage | Token | Valeur |
| --- | --- | --- |
| Primaire | `--gestock-primary` | `#2D9D82` |
| Primaire hover | `--gestock-primary-light` | `#34B894` |
| Primaire actif | `--gestock-primary-dark` | `#238770` |
| Vert institutionnel | `--gestock-green` | `#1A5F3A` |
| Accent ambre | `--gestock-yellow` | `#E8B923` |
| Attention | `--gestock-warning` | `#D97706` |
| Danger | `--gestock-danger` | `#DC2626` |
| Fond application | `--gestock-bg` | `#F4FAF8` |
| Cartes | `--gestock-card` | `#FFFFFF` |
| Texte principal | `--gestock-text` | `#1F2937` |
| Texte secondaire | `--gestock-muted` | `#6B7280` |
| Bordures | `--gestock-border` | `#E5E7EB` |

### Typographies

- Police : `Segoe UI`, Inter, system-ui.
- H1 écran : 28-36 px, gras 800, interlettrage `-0.04em`.
- H2 section : 18-22 px, gras 800.
- Body : 14 px, ligne 1.55.
- Table : 12-13 px, densité Enterprise.
- Badges : 11-12 px, uppercase, gras 800.

### Icônes

- Style : linéaire ou Font Awesome-like, mono-couleur.
- Taille sidebar : 16 px.
- Taille actions : 18-20 px.
- Taille KPI : pictogramme dans pastille ronde 40-44 px.

### Composants standards

| Composant | Règles UI |
| --- | --- |
| Sidebar | 13.5rem desktop, sombre `#1F2937`, nav compacte, pied Paramètres fixe |
| Topbar | Carte blanche, titre écran, contexte tenant, langue, devise, timezone |
| Search bar | Fond gris clair, icône recherche, focus vert primaire |
| Bouton primaire | Vert, effet 3D léger, ombre basse `primary-dark` |
| Bouton secondaire | Blanc, bordure neutre, ombre grise légère |
| Inputs | Rayon 12 px, label au-dessus, hint et erreur sous champ |
| Tables | Header vert pâle, lignes alternées, actions à droite, pagination curseur |
| KPI Cards | Carte blanche, icône, valeur forte, tendance, période |
| Badges | Statuts : actif, brouillon, validé, critique, expiré, bloqué |
| Alertes | Bandeau inline + centre notifications + escalade |
| Dialogues | Modal 560-840 px, footer actions, audit preview si action sensible |
| Drawer | Détail latéral pour fiche article, fournisseur, lot, mouvement |
| Toasts | Succès, erreur, avertissement, info ; auto-dismiss sauf critique |

### Responsive rules

- **Desktop >= 1200 px** : sidebar fixe, contenu en grille 12 colonnes.
- **Tablette 768-1199 px** : sidebar horizontale compacte, grilles 2 colonnes.
- **Mobile < 768 px** : topbar simplifiée, navigation drawer, tables en cartes.
- **Terrain mobile** : gros boutons, scan prioritaire, mode offline visible.

## 3. Contrat commun pour chaque écran

Chaque écran doit être généré avec les rubriques suivantes. Les valeurs communes
ci-dessous s'appliquent sauf exception indiquée dans la matrice.

- **Nom de l'écran** : libellé métier exact.
- **Objectif métier** : tâche principale à accomplir.
- **Utilisateur cible** : rôle principal, rôles secondaires.
- **Widgets** : composants visibles.
- **Actions** : CTA primaires, secondaires, actions bulk.
- **Données affichées** : champs et exemples réalistes.
- **Permissions** : permissions RBAC/ABAC.
- **États** : loading, empty, error, forbidden, locked, success.
- **Responsive** : desktop/tablette/mobile.
- **Cas limites** : absence données, conflits, droits insuffisants, offline.
- **UX Notes** : comportement, hiérarchie, raccourcis, confirmations.
- **Design Notes** : placement, densité, couleurs, composants visuels.
- **Composants techniques** : `AppShell`, `DataTable`, `KpiCard`, `Drawer`, `Modal`, etc.
- **API consommées** : endpoints `/v1`.
- **Événements métiers** : événements de domaine émis.
- **Audit Trail** : action, ressource, avant/après, acteur.
- **Notifications** : in-app, email, SMS, WhatsApp.
- **Workflow** : étapes et transitions.
- **Règles métier** : validations et invariants.
- **KPIs calculés** : métriques affichées.

## 4. Données réalistes de référence

- Organisations : `AfriSupply Distribution Group`, `Clinique Teranga`, `AgroLog Bénin`.
- Pays : Sénégal, Côte d'Ivoire, Bénin, Mali, Burkina Faso, Togo.
- Devises : XOF, GHS, NGN, EUR.
- Sites : Hub Dakar, Transit Vridi, Stock régional Akpakpa, Dépôt Bamako.
- Articles : réactifs laboratoire, intrants agricoles, pièces détachées,
  emballages, équipements froid, consommables chantier.
- Fournisseurs : MedEquip Afrique, LogiPack Maroc, AgroSource Bénin,
  TransitPro Abidjan, PharmaWest Dakar.

## 5. Matrice des écrans fonctionnels

> Abréviations utilisées dans la matrice :  
> **API** = API consommées ; **Evt** = événements métiers ; **Audit** = journalisation ;
> **Notif** = notifications ; **KPI** = indicateurs calculés.

### Niveau 1 - Authentification

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Login | Connecter un utilisateur interne. Cible : tous rôles. | Carte login, email, mot de passe, choix rôle mock en démo, CTA connexion. | Email `admin@gestock.local`, tenant détecté, état erreur credentials, compte verrouillé. Permission publique. Responsive mobile prioritaire. | API `POST /v1/auth/login`. Evt `auth.session.created`. Audit succès/échec login. Notif sécurité après 5 échecs. KPI taux échec login. |
| Inscription | Créer un compte organisation ou invitation. Cible : owner/admin. | Formulaire organisation, nom, email, pays, devise, taille, CTA créer. | Champs OHADA, XOF par défaut, état invitation expirée. Permission publique contrôlée. | API `POST /v1/tenants/register`. Evt `tenant.created`. Audit création tenant. Notif email activation. |
| Mot de passe oublié | Réinitialiser accès. Cible : tous. | Email, captcha léger, confirmation non énumérante. | Message constant même si email inexistant. | API `POST /v1/auth/password-reset`. Audit demande reset. Notif email. |
| MFA | Vérifier second facteur. Cible : admin, auditeur, direction. | Code TOTP, recovery code, appareil reconnu. | Erreur code expiré, mode secours, blocage après tentatives. | API `POST /v1/auth/mfa/verify`. Evt `auth.mfa.verified`. Audit MFA. |
| Sélection organisation | Choisir tenant/société. Cible : utilisateurs multi-organisations. | Liste organisations, plan, pays, rôle, recherche. | `AfriSupply`, `Clinique Teranga`; accès suspendu visible. | API `GET /v1/me/tenants`, `POST /v1/session/tenant`. Audit changement tenant. |
| Première connexion | Finaliser profil. Cible : invité. | Acceptation conditions, mot de passe, MFA, préférences langue/devise. | États lien expiré, rôle non assigné. | API `POST /v1/auth/onboarding`. Evt `user.activated`. Notif admin. |

### Niveau 2 - Dashboard Exécutif

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Vue DG | Piloter la supply chain consolidée. Cible : Direction. | KPI cards, graphiques, carte entrepôts, alertes, filtres période/site. | Valeur stock `2,48 Md XOF`, disponibilité `95,1%`, rotation `42 jours`, ruptures `18`. Permission `dashboard:executive`. | API `GET /v1/dashboard/executive`. Evt aucun en lecture. Audit consultation si export. Notif alertes critiques. KPI valeur, disponibilité, rotation, commandes ouvertes. |
| Évolution stock | Analyser tendance stock. Cible : Direction/stock. | Courbe 12 mois, filtres catégorie/site, export. | Entrées/sorties, stock moyen, saisonnalité. | API `GET /v1/analytics/stock-trend`. KPI variation stock, couverture jours. |
| Top produits | Identifier produits critiques. | Table top valeur, top rotation, top rupture. | SKU, nom, famille, valeur, disponibilité. | API `GET /v1/analytics/top-items`. Audit export. |
| Top fournisseurs | Suivre performance fournisseur. | Classement OTIF, retards, litiges, score. | MedEquip 88% OTIF, LogiPack 92%. | API `GET /v1/analytics/suppliers`. KPI OTIF, retard moyen. |
| Consommation | Visualiser consommation. | Bar chart par mois/service/site. | Dotation chantier, santé, retail. | API `GET /v1/analytics/consumption`. |
| Carte entrepôts | Localiser et surveiller dépôts. | Carte Afrique de l'Ouest, pins capacité/service, drawer détail. | Dakar 78%, Vridi 71%, Akpakpa 59%. | API `GET /v1/warehouses/map`. |
| Alertes exécutives | Voir stock critique, péremption, commandes retardées. | Liste priorisée, CTA assigner, escalader, ignorer. | Critique, élevé, modéré. | API `GET /v1/alerts`. Evt `alert.acknowledged`, `alert.escalated`. Audit action alerte. Notif in-app/SMS/WhatsApp. |

### Niveau 3 - Gestion des Articles

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Liste articles | Rechercher et gérer articles. Cible : responsable stock. | DataTable, filtres catégorie, statut, lot, dépôt, actions bulk. | SKU `LAB-REACT-009`, UOM, famille, seuil, stock global. Permission `item:read`. | API `GET /v1/items`. Audit export. KPI nombre articles actifs, % à risque. |
| Création article | Créer référentiel article. | Formulaire multi-onglets : général, unités, stockage, fiscalité, photos. | SKU unique, nom, UOM, catégorie, suivi lot/série. Permission `item:write`. | API `POST /v1/items`. Evt `catalog.item.created`. Audit before null/after. Workflow brouillon -> actif. |
| Édition article | Modifier fiche article. | Formulaire prérempli, verrou concurrence, historique changements. | Cas limite stock existant bloque changement UOM. | API `PATCH /v1/items/:id`. Evt `catalog.item.updated`. Audit diff. |
| Consultation article | Voir fiche 360. | Header article, stock par dépôt, lots, prix, documents, mouvements. | Disponible/réservé/bloqué, valeur FIFO. | API `GET /v1/items/:id`. |
| Historique article | Tracer toutes actions. | Timeline mouvements, changements master data, validations. | Acteur, date, type action. | API `GET /v1/items/:id/history`. Audit lecture sensible optionnel. |
| Photos | Gérer images article. | Galerie, upload, image principale, suppression. | Formats jpg/png/webp, limite taille. | API `POST /v1/files`, `PATCH /v1/items/:id/media`. Audit document. |
| Documents | Attacher fiches techniques. | Upload PDF, tags, expiration document. | FDS, certificat, garantie. | API `GET/POST /v1/items/:id/documents`. Notif document expirant. |
| Variantes | Gérer tailles/couleurs/modèles. | Matrice variantes, génération SKU. | Attributs marque, modèle, conditionnement. | API `POST /v1/items/:id/variants`. |
| Lots | Activer suivi lot/DLC. | Table lots, DLC, quantité, statut. | Lot `LOT-24-DKR-118`, DLC 2026-09-30. | API `GET /v1/lots?itemId=`. KPI lots expirant. |
| Séries | Suivre numéros de série. | Recherche série, statut, localisation. | Série unique, garantie, affectation. | API `GET /v1/serials`. |
| Tarification | Gérer prix et valorisation. | Prix achat moyen, coûts rendus, devise, historique. | XOF/EUR, FIFO/CMUP. | API `GET/PATCH /v1/items/:id/pricing`. Audit financier. |

### Niveau 4 - Catalogue Produits

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Catégories | Structurer catalogue. | Arborescence, drag/drop, compteur articles. | Santé, Agro, Emballages, Pièces. `catalog:write`. | API `GET/POST /v1/catalog/categories`. Evt `catalog.category.created`. Audit. |
| Sous-catégories | Détailler familles. | Parent, règles de seuil, taxes. | Réactifs, consommables, froid. | API `PATCH /v1/catalog/categories/:id`. |
| Marques | Gérer marques. | Table marques, pays, fournisseur principal. | Roche, LogiPack, AgroSource. | API `GET/POST /v1/catalog/brands`. |
| Familles | Piloter regroupements analytiques. | Famille, compte comptable, règles stock. | Famille à forte rotation. | API `GET/POST /v1/catalog/families`. |
| Unités | Administrer UOM. | Unité base, conversions, décimales. | Pièce, carton, kg, litre. | API `GET/POST /v1/catalog/uom`. Règle conversion non modifiable si stock. |
| Attributs | Définir attributs dynamiques. | Attribut, type, valeurs, obligatoire. | Température, conditionnement, puissance. | API `GET/POST /v1/catalog/attributes`. |

### Niveau 5 - Entrepôts

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Liste entrepôts | Superviser dépôts. | Cards + table, filtres pays/site/type, carte miniature. | Central Yoff, Transit Vridi, Akpakpa. `warehouse:read`. | API `GET /v1/warehouses`. KPI capacité, service. |
| Création entrepôt | Ajouter dépôt. | Formulaire site, type, capacité, responsable, géoloc. | Type central/régional/froid/transit. | API `POST /v1/warehouses`. Evt `warehouse.created`. Audit. |
| Fiche entrepôt | Voir dépôt 360. | Header, capacité, zones, stock, mouvements, équipe. | Capacité 78%, service 96%. | API `GET /v1/warehouses/:id`. |
| Carte géographique | Localiser réseau. | Map, pins, statut capacité, couche pays. | Coordonnées GPS, rayon livraison. | API `GET /v1/warehouses/map`. |
| Occupation | Analyser taux occupation. | Heatmap zones, courbe occupation, alertes saturation. | Zone A 91%, froid 64%. | API `GET /v1/warehouses/:id/occupancy`. |
| Capacité | Paramétrer capacité. | Volumes, palettes, poids, seuil alerte. | Max palettes, m3, kg. | API `PATCH /v1/warehouses/:id/capacity`. |

### Niveau 6 - Structure Logistique

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Zones | Découper entrepôt. | Plan zones, table, règles stockage. | Froid, quarantaine, picking. | API `GET/POST /v1/warehouse-zones`. Audit config. |
| Allées | Gérer allées. | Liste par zone, capacité, sens circulation. | A1, A2, B1. | API `GET/POST /v1/aisles`. |
| Rayonnages | Paramétrer racks. | Rack, niveaux, contraintes poids. | R-A1-03. | API `GET/POST /v1/racks`. |
| Emplacements | Gérer bins. | Table bins, code-barres, statut. | A1-R03-N02-B04. | API `GET/POST /v1/locations`. KPI occupation emplacement. |
| Mapping visuel | Construire plan. | Canvas drag/drop, grille, zoom. | Couleurs capacité/statut. | API `GET/PATCH /v1/warehouse-layouts`. |
| Vue 2D | Visualiser dépôt. | Plan 2D, filtres zones, clic emplacement. | Statut vide/occupé/bloqué. | API `GET /v1/warehouse-layouts/:id/2d`. |
| Vue 3D | Visualiser volumes. | Rendu volumétrique, niveaux, palettes. | Option avancée desktop. | API `GET /v1/warehouse-layouts/:id/3d`. |

### Niveau 7 - Stocks

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Vue temps réel | Suivre disponibilités live. | KPI, table positions, websocket status. | Stock mis à jour toutes 30 s. | API `GET /v1/stock-levels`, WS `stock.updated`. KPI disponibilité. |
| Stock global | Consolider stock tenant. | Table article x quantité x valeur. | Total XOF, disponible, réservé. | API `GET /v1/stocks/global`. |
| Stock par dépôt | Voir par entrepôt. | Filtres dépôt/site/pays, drill-down. | Dakar, Vridi, Akpakpa. | API `GET /v1/stocks/by-warehouse`. |
| Stock par emplacement | Voir bins. | Arborescence zone/allée/rack/bin. | A1-R03. | API `GET /v1/stocks/by-location`. |
| Stock réservé | Suivre réservations. | Source réservation, commande, expiration. | Réservé pour chantier ou vente. | API `GET /v1/stocks/reserved`. |
| Stock disponible | Identifier disponible ATP. | Quantité ATP, lead time, promesse. | Disponible = on hand - réservé - bloqué. | API `GET /v1/stocks/available`. |
| Stock bloqué | Gérer quarantaines. | Motif blocage, libération, responsable. | Qualité, litige, péremption. | API `GET/POST /v1/stocks/blocked`. Audit sensible. |

### Niveau 8 - Entrées de Stock

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Réception fournisseur | Réceptionner hors PO. | Formulaire fournisseur, lignes, lots, scan. | Quantité, DLC, emplacement. `stock:receive`. | API `POST /v1/receipts/supplier`. Evt `stock.receipt.created`. Audit mouvement. |
| Réception achat | Réceptionner PO. | PO lookup, lignes attendues/reçues, écarts. | PO-2408, 62% reçu. | API `POST /v1/purchase-orders/:id/receive`. Notif acheteur si écart. |
| Entrée manuelle | Ajuster entrée. | Motif obligatoire, pièce justificative. | Don, retour, régularisation. | API `POST /v1/stock-movements`. Audit avec approbation si seuil. |
| Import Excel | Importer entrées. | Upload, mapping colonnes, prévalidation, erreurs. | Fichier .xlsx, 500 lignes. | API `POST /v1/imports/stock-in`. Evt `import.completed`. |
| Scan mobile | Entrée terrain. | Caméra, scan QR/code-barres, offline queue. | Lot, quantité, bin. | API mobile sync `POST /v1/mobile/sync`. Audit device. |

### Niveau 9 - Sorties de Stock

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Consommation | Sortir pour usage interne. | Demande service, articles, coût centre. | Service laboratoire, chantier. | API `POST /v1/issues/consumption`. Evt `stock.issued`. |
| Vente | Sortir pour commande client. | Référence vente, client, picking. | CRM externe. | API `POST /v1/issues/sale`. |
| Distribution | Distribuer agences. | Bénéficiaire, programme, preuve livraison. | ONG/institution. | API `POST /v1/issues/distribution`. |
| Dotation | Affecter matériel/personne. | Collaborateur, durée, retour prévu. | EPI, équipement IT. | API `POST /v1/issues/allocation`. |
| Sortie chantier | Approvisionner chantier. | Chantier, conducteur travaux, véhicule. | Bamako chantier B12. | API `POST /v1/issues/project`. Notif responsable chantier. |

### Niveau 10 - Transferts

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Inter dépôts | Déplacer stock entre entrepôts. | Source, destination, lignes, transporteur. | Dakar -> Abidjan. | API `POST /v1/transfers`. Workflow brouillon -> expédié -> reçu. |
| Inter magasins | Déplacer entre magasins internes. | Magasin source/destination, validation locale. | Retail Plateau -> Akpakpa. | API `POST /v1/store-transfers`. |
| Historique transferts | Tracer transferts. | Timeline, preuve, écarts. | Retard, partiel, annulé. | API `GET /v1/transfers/history`. |
| Validation transfert | Valider réception. | Quantité reçue, écart, litige. | Écart transport. | API `POST /v1/transfers/:id/validate`. Audit. |

### Niveau 11 - Inventaires

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Inventaire annuel | Planifier inventaire global. | Planning, équipes, périmètre, gel stock. | Clôture annuelle. | API `POST /v1/inventories/annual`. Workflow planifié -> comptage -> validation. |
| Inventaire tournant | Compter par rotation. | Sélection ABC, tournée, assignations. | Classe A hebdo. | API `POST /v1/inventories/cycle`. |
| Inventaire surprise | Contrôle inopiné. | Création rapide, accès restreint. | Audit interne. | API `POST /v1/inventories/surprise`. Notif limitée. |
| Comptage mobile | Saisie terrain. | Scan, quantité, photo, offline. | Device, compteur, emplacement. | API `POST /v1/mobile/inventory-counts`. |
| Validation écarts | Approuver écarts. | Avant/après, valeur écart, commentaire. | Écart 4,2 M XOF. | API `POST /v1/inventories/:id/approve-variance`. Audit critique. |

### Niveau 12 - Lots & Séries

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Recherche lot | Retrouver lot. | Recherche lot/DLC/article/fournisseur. | `LOT-24-DKR-118`. | API `GET /v1/lots/search`. |
| Historique lot | Tracer cycle lot. | Timeline réception, transferts, sorties. | Qui, où, quand. | API `GET /v1/lots/:id/history`. |
| Traçabilité | Répondre rappel qualité. | Arbre amont/aval, clients/sites impactés. | Rappel fournisseur. | API `GET /v1/traceability`. Notif sites impactés. |
| Localisation | Voir où se trouve lot/série. | Carte dépôt, bins, quantités. | Zone froid Dakar. | API `GET /v1/lots/:id/locations`. |

### Niveau 13 - Péremptions

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Produits expirés | Lister expirés. | Table DLC dépassée, valeur, action blocage. | Réactifs, médicaments. | API `GET /v1/expirations/expired`. |
| Alertes péremption | Prévenir avant DLC. | Seuils 30/60/90 jours, escalade. | Critique < 30 jours. | API `GET /v1/expirations/alerts`. Notif email/WhatsApp. |
| Prévisions DLC | Anticiper pertes. | Projection consommation vs DLC. | Perte prévue XOF. | API `GET /v1/expirations/forecast`. KPI valeur à risque. |
| Tableau de suivi | Piloter actions. | Kanban vendre/transférer/détruire. | Statuts action. | API `PATCH /v1/expirations/actions`. Audit destruction. |

### Niveau 14 - Approvisionnements

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Demande d'achat | Initier besoin. | Formulaire article, quantité, justification, budget. | Depuis rupture ou manuel. | API `POST /v1/purchase-requests`. Evt `procurement.request.created`. |
| Workflow validation | Valider demande. | Étapes, approbateurs, seuils, commentaires. | Responsable -> Finance -> DG. | API `POST /v1/purchase-requests/:id/approve`. Audit. |
| Historique demandes | Suivre demandes. | Table statut, temps cycle, demandeur. | Brouillon, soumis, rejeté. | API `GET /v1/purchase-requests`. |
| KPI approvisionnement | Mesurer performance. | Délai moyen, taux rejet, besoin critique. | Cycle 3,8 jours. | API `GET /v1/procurement/kpis`. |

### Niveau 15 - Achats

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Bon de commande | Créer/valider PO. | Lignes, fournisseur, taxes, devise, conditions. | PO-2408, XOF, MedEquip. | API `POST /v1/purchase-orders`. Workflow draft -> submitted -> approved. |
| Réception achat | Rapprocher PO réception. | Quantité attendue/reçue, lots, écarts. | Réception partielle. | API `POST /v1/purchase-orders/:id/receive`. |
| Facturation | Enregistrer facture fournisseur. | Facture, montants, taxes, pièces jointes. | Facture PDF, échéance. | API `POST /v1/supplier-invoices`. Audit financier. |
| Paiement | Suivre paiement. | Échéancier, statut, référence comptable. | Partiel, payé, retard. | API `PATCH /v1/supplier-invoices/:id/payment`. |

### Niveau 16 - Fournisseurs

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Liste fournisseurs | Gérer base fournisseurs. | Table, score, pays, catégories, statut. | MedEquip, LogiPack, AgroSource. | API `GET /v1/suppliers`. KPI OTIF moyen. |
| Fiche fournisseur | Vue 360 fournisseur. | Profil, contrats, commandes, score, litiges. | Pays, devise, contacts. | API `GET /v1/suppliers/:id`. |
| Contrats | Gérer contrats. | Dates, clauses, documents, renouvellement. | Contrat cadre 2026. | API `GET/POST /v1/supplier-contracts`. Notif expiration. |
| Performance | Mesurer SLA. | OTIF, retards, qualité, litiges. | Score 88/100. | API `GET /v1/suppliers/:id/performance`. |
| Évaluations | Évaluer fournisseur. | Questionnaire, notes, commentaire, validation. | Qualité, prix, délai. | API `POST /v1/supplier-evaluations`. Audit. |

### Niveau 17 - Portail Fournisseur

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Connexion fournisseur | Accès externe sécurisé. | Login fournisseur, MFA optionnel, tenant branding. | Compte fournisseur actif. | API `POST /v1/portal/auth/login`. Audit externe. |
| Suivi commandes | Fournisseur suit PO. | Liste PO, statut, ETA, commentaires. | PO approuvé, en transit. | API `GET /v1/portal/purchase-orders`. |
| Factures fournisseur | Déposer factures. | Upload facture, statut rapprochement. | PDF, montant, taxes. | API `POST /v1/portal/invoices`. Notif acheteur. |
| Documents fournisseur | Partager documents. | Certificats, RIB, contrats, expiration. | Certificat qualité. | API `POST /v1/portal/documents`. |

### Niveau 18 - Reporting

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Rapports opérationnels | Produire rapports stock/mouvements. | Bibliothèque rapports, paramètres, export. | Stock par dépôt, mouvements. | API `GET /v1/reports/operational`. Audit export. |
| Rapports financiers | Valoriser stock et achats. | Valorisation FIFO/CMUP, coûts rendus. | 2,48 Md XOF. | API `GET /v1/reports/financial`. |
| Rapports logistiques | Mesurer entrepôts/transferts. | Rotation, occupation, délais transfert. | Service 95,1%. | API `GET /v1/reports/logistics`. |
| Rapports exécutifs | Synthèse DG. | Pack PDF, période, comparaison. | Mois, trimestre, année. | API `POST /v1/reports/executive/export`. |

### Niveau 19 - BI

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Dashboard avancé | Composer analyses. | Widgets configurables, drag/drop, sauvegarde vues. | KPI dynamiques. | API `GET/PATCH /v1/bi/dashboards`. |
| Drill Down | Explorer détail KPI. | Breadcrumb analytique, filtres, table détail. | Région -> site -> article. | API `GET /v1/bi/drilldown`. |
| Filtres BI | Créer segments. | Pays, site, catégorie, fournisseur, période. | Filtres sauvegardés. | API `POST /v1/bi/filters`. |
| KPI dynamiques | Définir KPI. | Formule, source, seuils, visualisation. | Couverture = stock/conso moyenne. | API `POST /v1/bi/kpis`. Audit formule. |

### Niveau 20 - Alertes

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Centre notifications | Centraliser alertes. | Inbox, filtres gravité, assignation, résolution. | Critique stock, PO retard. | API `GET /v1/notifications`. Evt `notification.read`. |
| Emails | Paramétrer emails. | Templates, destinataires, fréquence. | Alerte rupture quotidienne. | API `PATCH /v1/notification-channels/email`. |
| SMS | Paramétrer SMS. | Seuils, numéros, crédits. | Urgence uniquement. | API `PATCH /v1/notification-channels/sms`. |
| WhatsApp | Paramétrer WhatsApp. | Templates approuvés, groupes, opt-in. | Entrepôt distant. | API `PATCH /v1/notification-channels/whatsapp`. |
| Escalades | Définir escalade. | Règles délai, niveau, responsable. | Après 48h vers DG. | API `POST /v1/escalation-rules`. Audit config. |

### Niveau 21 - Workflow Engine

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Designer graphique | Créer workflows. | Canvas, nœuds, connecteurs, simulation. | Achat > 50M XOF. | API `GET/PATCH /v1/workflows`. Audit version. |
| BPMN | Import/export BPMN. | Diagramme BPMN, validation syntaxe. | XML BPMN. | API `POST /v1/workflows/bpmn/import`. |
| Conditions | Paramétrer règles. | Builder conditionnel, champs métier, opérateurs. | Si montant > seuil. | API `POST /v1/workflow-conditions`. |
| Automatisation | Déclencher actions. | Webhooks, emails, tâches, assignation. | Auto créer PO depuis rupture. | API `POST /v1/workflow-automations`. Evt `workflow.automation.executed`. |

### Niveau 22 - Administration

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Utilisateurs | Gérer accès. | Table users, invitation, suspension, MFA. | Admin, acheteur, magasinier. | API `GET/POST /v1/users`. Audit sécurité. |
| Rôles | Gérer rôles. | Liste rôles, scopes site/dépôt. | tenant_admin, buyer. | API `GET/POST /v1/roles`. |
| Permissions | Matrice permissions. | Ressource x action x rôle, recherche. | item:write, stock:adjust. | API `GET/PATCH /v1/permissions/matrix`. Audit critique. |
| Audit Trail | Consulter journal. | Table immuable, filtres acteur/action/date. | before/after JSON, IP. | API `GET /v1/audit/events`. Permission `audit:read`. |
| Logs | Diagnostiquer système. | Logs applicatifs, requestId, tenantId. | Erreurs API, sync mobile. | API `GET /v1/platform/logs`. |

### Niveau 23 - Paramètres

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Organisation | Paramétrer tenant. | Nom, pays, logo, domaines, plan. | AfriSupply, Sénégal. | API `GET/PATCH /v1/tenant`. Audit. |
| Devises | Gérer devises. | Devises actives, taux, source. | XOF, EUR, USD. | API `GET/PATCH /v1/settings/currencies`. |
| Langues | Gérer langues. | FR/EN/PT, fallback, formats. | Français par défaut. | API `PATCH /v1/settings/languages`. |
| Taxes | Configurer taxes. | TVA, exonération, pays, catégorie. | TVA 18% Sénégal. | API `GET/POST /v1/settings/taxes`. |
| Référentiels | Administrer listes. | Motifs, statuts, types entrepôt, UOM. | Motif ajustement. | API `GET/PATCH /v1/settings/referentials`. |

### Niveau 24 - Application Mobile

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Dashboard mobile | Prioriser tâches terrain. | Cartes tâches, alertes, sync status. | Réceptions, inventaires. | API `GET /v1/mobile/tasks`. KPI tâches restantes. |
| Scan QR | Scanner articles/bins. | Caméra, torche, saisie manuelle fallback. | QR lot, code emplacement. | API `POST /v1/mobile/scans`. Audit device. |
| Réception mobile | Réceptionner rapidement. | Scan PO, quantité, lot, photo. | Offline queue. | API `POST /v1/mobile/receipts`. |
| Inventaire mobile | Compter terrain. | Mission, scan, quantité, commentaire. | Écart détecté. | API `POST /v1/mobile/inventory-counts`. |
| Sortie mobile | Sortir stock. | Scan article, motif, bénéficiaire, signature. | Dotation chantier. | API `POST /v1/mobile/issues`. |
| Validation mobile | Approuver actions. | Liste validations, swipe approve/reject. | Achat, transfert, écart. | API `POST /v1/mobile/approvals`. Notif push. |

### Niveau 25 - IA Supply Chain

| Écran | Objectif / cible | Widgets et actions | Données / permissions / états | Workflow, API, audit et KPI |
| --- | --- | --- | --- | --- |
| Prévisions | Prévoir demande/stock. | Courbes forecast, confiance, scénario. | 30/60/90 jours. | API `GET /v1/ai/forecasts`. KPI précision forecast. |
| Suggestions commandes | Recommander achats. | Liste suggestions, justification, CTA créer demande. | Quantité optimale, fournisseur recommandé. | API `GET /v1/ai/purchase-suggestions`. Evt `ai.suggestion.accepted`. |
| Risques rupture | Scorer ruptures. | Score risque, facteurs, impact financier. | Réactifs risque 91/100. | API `GET /v1/ai/stockout-risks`. Notif critique. |
| Analyse consommation | Détecter anomalies. | Variations, saisonnalité, outliers. | Pic consommation Dakar. | API `GET /v1/ai/consumption-analysis`. |
| Recommandations | Action plan IA. | Cartes actions, priorité, gain estimé. | Transférer, acheter, bloquer, liquider. | API `GET /v1/ai/recommendations`. Audit acceptation/rejet. |

## 6. Workflows complets à scénariser en maquettes

### Workflow A - Rupture vers achat et réception

1. Alerte rupture critique créée.
2. Responsable stock ouvre détail article.
3. Création demande d'achat depuis l'alerte.
4. Validation manager puis finance.
5. Conversion en bon de commande.
6. Envoi fournisseur.
7. Réception partielle.
8. Mise à jour stock disponible.
9. Clôture alerte.
10. Audit complet visible.

### Workflow B - Inventaire tournant avec écart

1. Planification inventaire sur famille A.
2. Assignation équipe mobile.
3. Comptage par scan.
4. Détection écart.
5. Justification et pièce jointe.
6. Validation responsable.
7. Ajustement stock.
8. Notification audit.

### Workflow C - Péremption et transfert préventif

1. Détection lot expirant dans 30 jours.
2. Prévision consommation insuffisante.
3. Recommandation IA de transfert.
4. Création transfert vers dépôt consommateur.
5. Validation expédition.
6. Réception dépôt cible.
7. Mise à jour KPI pertes évitées.

## 7. Standards techniques pour génération automatique

- Chaque écran doit être nommé `LevelXX/ScreenName`.
- Chaque composant doit avoir un équivalent technique :
  - `AppShell`, `Sidebar`, `Topbar`, `DashboardHeaderBar`
  - `KpiCard`, `DataTable`, `EntityDrawer`, `ConfirmDialog`
  - `WorkflowStepper`, `AuditTimeline`, `NotificationCenter`
  - `MapPanel`, `WarehouseCanvas2D`, `MobileScanPanel`
- Chaque API doit renvoyer un objet `{ data, pagination?, meta?, auditContext? }`.
- Chaque action sensible doit exiger `reason` ou `comment` si elle modifie stock,
  valeur financière, permissions ou audit.
- Chaque écran doit inclure `tenantId`, `userId`, `role`, `scope` dans le contexte UI.

## 8. Définition de réussite d'une maquette

Une maquette GESTOCK est valide si :

- elle ne contient aucun bloc marketing ;
- elle est utilisable par un rôle métier identifié ;
- elle affiche des données réalistes ;
- elle montre les permissions et états clés ;
- elle respecte la même grille, palette, typographie et densité ;
- elle prévoit audit, notifications et workflow ;
- elle peut être transformée en composant React sans réinterprétation majeure.
