# Audit de cloture - Module Articles

## Statut

Le module Articles est considere comme module de reference GESTOCK V1 en mode
mock fonctionnel. Il couvre les workflows visuels, fonctionnels et configurables
necessaires avant connexion API/Supabase.

## Perimetre couvert

### 1. Liste Articles

- Recherche multi-criteres : reference, designation, code-barres, categorie,
  emplacement.
- Filtres par categorie et statut.
- KPI cliquables.
- Selection multiple.
- Actions de masse : impression et export mock.
- Vues table et grille.
- Actions ligne : ouvrir, modifier, supprimer.

### 2. Creation et modification

- Formulaire complet par onglets.
- Onglets : General, Logistique, Stock, Identification, Fournisseurs,
  Financier, Lots & Series, Documents, Autres.
- Sauvegarde mock vers la liste Articles.
- Enregistrer et Enregistrer & Nouveau.
- Listes enrichissables directement depuis le formulaire.
- Ajout et renommage d'onglets.
- Ajout de champs personnalises par onglet.

### 3. Fiche detail Article

- Header article avec statut, reference, barcode, categorie, unite.
- Edition des donnees brutes.
- Suppression article.
- Gestion de galerie image : ajouter, supprimer, definir image principale.
- Panneau stock lateral.
- Actions rapides : entree, sortie, transfert, ajustement, duplication,
  desactivation.

### 4. Onglets metier

- General : informations, image principale, controle fiche, validation qualite.
- Logistique : conditionnement, dimensions, transport, validation et simulation
  palette.
- Stock : seuils, reservation, reapprovisionnement.
- Identification : EAN13, QR, DataMatrix, SKU, impressions et scan.
- Fournisseurs : fournisseur principal, performance, demande de prix.
- Financier : scenarios de marge, prix, TVA, ecritures comptables mock.
- Lots & Series : lot actif, tracabilite, quarantaine, rappel produit.
- Documents : documents, versions, OCR, signature, archivage.
- Historique : audit filtrable, export, verification de chainage.

### 5. Import, scan et etiquettes

- Import CSV/Excel mock avec mapping et previsualisation.
- Ajout des lignes importees a la liste.
- Scan code-barres/QR avec ouverture de fiche si trouvee.
- Generation/impression d'etiquettes et POS en mock.

## Incoherences identifiees et corrigees

- Le formulaire de creation initial etait trop simplifie par rapport aux donnees
  affichees dans les onglets.
- Les listes etaient figees ; elles sont maintenant enrichissables.
- Les onglets etaient statiques ; ils ont maintenant une zone de donnees source
  editable.
- Les images etaient representatives ; elles sont maintenant gerees via galerie
  mock.
- La sidebar et le header etaient partiellement inertes ; ils ont ete rendus
  interactifs.

## Restant avant backend

- Persister les articles, images, referentiels, champs personnalises et onglets
  en base.
- Connecter les workflows a Supabase/PostgreSQL avec RLS.
- Ajouter permissions RBAC/ABAC par action : creer, modifier, supprimer,
  imprimer, importer, approuver, auditer.
- Remplacer les notices mock par API events et audit trail reel.

## Reference pour les prochains modules

Les modules Catalogue, Stock, Entrees, Sorties, Transferts, Inventaires et Lots
& Series doivent reprendre le meme niveau :

- liste fonctionnelle ;
- detail par onglets ;
- creation/modification complete ;
- donnees source editables ;
- referentiels enrichissables ;
- actions metier mockees ;
- audit et documentation de cloture.
