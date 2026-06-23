# Audit initial - Module Catalogue

## Statut

Le module Catalogue entre en V1 fonctionnelle en mode mock. Il reprend la
methode validee sur Articles, mais avec une frontiere differente : Catalogue
porte le Master Data Management produit et ne gere pas les stocks, mouvements
ou achats.

## Perimetre fonctionnel pose

### Liste Produits maitres

- Recherche par code, nom, famille, marque, type et classification.
- Selection multiple.
- Suppression mock.
- Edition et creation via formulaire complet.
- KPI recalcules depuis les produits maitres mockes.

### Sous-modules Catalogue

- Catalogue Produits.
- Categories.
- Familles.
- Marques.
- Attributs.
- Variantes.
- Modeles d'articles.
- Kits.
- Nomenclatures (BOM).
- Classifications.
- Bibliotheque documentaire.
- Historique.

### Formulaire Produit maitre

- Onglets MDM configurables.
- Listes enrichissables : famille, marque, type, statut, modele,
  classification.
- Champs personnalises par onglet.
- Sauvegarde mock vers la liste Catalogue.
- Enregistrer et Enregistrer & Nouveau.

### Detail Produit maitre

- Informations master data.
- Attributs obligatoires.
- Variantes.
- Documents communs.
- Gouvernance MDM.
- Kits & nomenclatures.
- Actions Catalogue.

## Corrections / ajouts realises

- Remplacement des actions inertes par creation, edition, suppression et
  selection.
- Ajout d'un panneau de gouvernance MDM visible.
- Ajout d'un sous-module actif avec description fonctionnelle.
- Ajout du formulaire Catalogue configurable.

## Restant pour cloture Catalogue complete

- Rendre chaque sous-module Catalogue totalement editable comme Articles :
  categories, familles, marques, attributs, variantes, modeles, kits, BOM,
  classifications, documents et historique.
- Ajouter import referentiel avec mapping avance.
- Ajouter audit trail detaille par changement de referentiel.
- Ajouter persistance Supabase/RLS et gouvernance de droits MDM.

## Reference

Catalogue doit rester un module MDM produit. Les donnees operationnelles de
stock, mouvements, achats et receptions doivent rester dans leurs modules
dedies.
