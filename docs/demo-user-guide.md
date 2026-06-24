# Guide de demonstration utilisateur - GESTOCK

## Nature de la version

Cette version de GESTOCK est une **demonstration fonctionnelle**. Elle permet de
presenter l'experience produit, les parcours utilisateurs et la logique ERP,
mais elle n'est pas encore connectee a une base de donnees de production.

Les donnees sont simulees en mode mock pour montrer :

- le login multi-tenant ;
- le dashboard interactif ;
- le module Articles ;
- le module Catalogue ;
- les autres modules comme espaces de travail de presentation.

## Connexion

Sur la page de connexion, utiliser le menu **Comptes de test** pour pre-remplir
un utilisateur.

Mot de passe commun :

```text
gestock-demo
```

Comptes recommandes pour la demonstration :

| Email | Role | Parcours |
| --- | --- | --- |
| `admin@gestock.local` | Administrateur | Acces direct au dashboard |
| `stock@gestock.local` | Responsable Stock | Acces direct au dashboard |
| `achats@gestock.local` | Acheteur | Selection d'organisation |
| `direction@gestock.local` | Direction | Parcours MFA / groupe multi-organisation |
| `audit@gestock.local` | Auditeur | Premiere connexion / securite |

## Parcours de demonstration conseille

### 1. Login et multi-tenant

1. Ouvrir la page de connexion.
2. Choisir un compte de test.
3. Montrer la logique :
   - organisation unique : acces direct ;
   - groupe multi-filiales : selection d'organisation ;
   - profils sensibles : MFA ou premiere connexion.

### 2. Dashboard

Montrer :

- KPI cliquables ;
- panneau de detail KPI ;
- alertes traitables ;
- tableaux de mouvements et stock ;
- filtres de periode ;
- notifications et messages dans le header.

### 3. Module Articles

Montrer :

- recherche, filtres et vues liste/grille ;
- creation d'un article ;
- formulaire complet par onglets ;
- listes enrichissables ;
- onglets et champs personnalisables ;
- fiche detail article ;
- modification des donnees ;
- galerie images ;
- scan code-barres ;
- documents/OCR ;
- audit trail.

### 4. Module Catalogue

Montrer :

- liste des produits maitres ;
- recherche et selection ;
- creation / modification d'un produit maitre ;
- formulaire MDM configurable ;
- sous-modules Catalogue : categories, familles, marques, attributs, variantes,
  modeles, kits, BOM, classifications, documents ;
- separation claire entre Catalogue et Articles.

## Ce qui est deja presentable

- Experience visuelle moderne.
- Navigation ERP avec sidebar.
- Login et routage multi-tenant simules.
- Dashboard interactif.
- Articles avance.
- Catalogue initialise.
- Referentiels enrichissables.
- Formulaires configurables.

## Limites actuelles a expliquer au client

Cette version n'est pas encore une version production :

- pas encore de base de donnees reelle ;
- pas encore de comptes clients reels ;
- pas encore de stockage permanent des modifications ;
- pas encore d'API metier connectee ;
- pas encore de RBAC/RLS applique par backend ;
- certains modules restent des espaces de presentation mockes.

## Positionnement commercial recommande

Presenter GESTOCK comme :

> une maquette fonctionnelle avancee permettant de valider l'ergonomie, les
> modules, les parcours metiers et le niveau de personnalisation attendu avant
> de lancer l'implementation backend et l'integration aux donnees reelles.

## Modules a ne pas presenter comme finalises

Les modules suivants sont visibles mais ne sont pas encore au meme niveau que
Articles et Catalogue :

- Stocks ;
- Entrees ;
- Sorties ;
- Transferts ;
- Inventaires ;
- Lots & Series global ;
- Achats ;
- Fournisseurs ;
- Entrepots ;
- Rapports ;
- Parametres.

Ils servent aujourd'hui a montrer la profondeur cible de la plateforme.
