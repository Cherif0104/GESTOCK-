# GESTOCK - Frontières fonctionnelles des modules

Ce document verrouille les responsabilités fonctionnelles des modules GESTOCK
afin d'eviter les duplications entre Article, Catalogue, Stock, mouvements et
inventaires.

## Principe directeur

- **Article** est l'objet operationnel stockable.
- **Catalogue** est le Master Data Management produit.
- **Stock** analyse les disponibilites, valorisations et couvertures.
- **Entrees, Sorties et Transferts** portent uniquement les workflows de
  mouvements.
- **Inventaires** porte les campagnes, ecarts et ajustements.
- **Lots & Series** existe a deux niveaux :
  - dans Article : vue d'un article donne ;
  - dans le menu principal : vue globale de tous les lots et series du systeme.

## Module Article

Article porte l'information operationnelle d'un produit stockable dans une
organisation, un site ou un entrepot.

### Onglets Article

1. **General**
   - informations generales ;
   - designation ;
   - reference ;
   - categorie affectee ;
   - image.

2. **Logistique**
   - conditionnement ;
   - dimensions ;
   - poids ;
   - palettes ;
   - conservation ;
   - transport.

3. **Stock**
   - min / max ;
   - point de commande ;
   - reapprovisionnement ;
   - gestion multi-entrepots.

4. **Identification**
   - EAN13 ;
   - QR Code ;
   - DataMatrix ;
   - SKU ;
   - impression etiquettes.

5. **Fournisseurs**
   - fournisseur principal ;
   - fournisseurs alternatifs ;
   - historique achats ;
   - performance fournisseur.

6. **Financier**
   - prix achat ;
   - prix vente ;
   - TVA ;
   - marges ;
   - comptabilite.

7. **Lots & Series**
   - lots ;
   - serialisation ;
   - tracabilite ;
   - quarantaine ;
   - peremption.

8. **Documents**
   - fiches techniques ;
   - certificats ;
   - photos ;
   - OCR ;
   - gestion versions.

9. **Historique**
   - audit trail ;
   - historique mouvements ;
   - historique prix ;
   - historique scans ;
   - historique documents.

## Module Catalogue

Catalogue ne gere pas le stock, les mouvements ou les achats. Il porte la
definition maitre des produits, attributs, variantes, classifications et
modeles.

### Sous-modules Catalogue

#### Catalogue Produits

Liste des produits maitres.

Colonnes principales :

- code produit ;
- nom produit ;
- famille ;
- marque ;
- type ;
- nombre de variantes ;
- statut.

#### Categories

Hierarchie illimitee.

Exemples :

- Consommables
  - Medicaments
  - Alimentaire
- Materiaux
  - Beton
  - Acier

#### Familles

Exemples :

- Medicaments
  - Comprimes
  - Sirops
  - Injectables

#### Marques

Exemples :

- BioPharma ;
- Samsung ;
- Bosch ;
- Caterpillar.

#### Attributs

Exemples :

- couleur ;
- taille ;
- poids ;
- capacite ;
- puissance ;
- longueur ;
- largeur ;
- hauteur.

#### Variantes

Produit maitre : T-Shirt.

Variantes :

- Rouge S ;
- Rouge M ;
- Rouge L.

#### Modeles d'articles

- template Medicament ;
- template Materiaux ;
- template Piece detachee ;
- template Produit alimentaire ;
- template Produit chimique.

#### Kits

Exemples :

- Kit EPI
  - casque ;
  - gants ;
  - bottes.
- Kit Bureau
  - PC ;
  - clavier ;
  - souris.

#### Nomenclatures (BOM)

Exemples :

- Table
  - plateau ;
  - pieds.
- Ordinateur
  - carte mere ;
  - RAM ;
  - SSD.

#### Classifications

- GS1 ;
- UNSPSC ;
- OHADA ;
- ABC ;
- XYZ ;
- classe logistique ;
- classe douaniere.

#### Bibliotheque documentaire

Documents communs :

- fiches techniques ;
- notices ;
- certificats ;
- normes.

#### Historique Catalogue

- creation produit ;
- modification attribut ;
- creation variante ;
- archivage.

## Module Stock

Stock ne repete pas l'ecran Article. Il consolide les vues de stock, la
valorisation et les analyses.

Sous-modules :

- vue globale stock ;
- disponibilites ;
- reservations ;
- valorisation ;
- couverture ;
- rotation ;
- multi-entrepots ;
- analyse ABC ;
- historique stock.

## Module Entrees

Entrees porte uniquement les receptions.

Sous-modules :

- receptions fournisseurs ;
- receptions internes ;
- receptions retours ;
- controle qualite reception ;
- receptions en attente ;
- historique receptions.

## Module Sorties

Sous-modules :

- sorties vente ;
- sorties consommation ;
- sorties projets ;
- sorties pertes ;
- sorties destruction ;
- historique sorties.

## Module Transferts

Sous-modules :

- transferts inter-entrepots ;
- transferts inter-sites ;
- reequilibrage ;
- demandes de transfert ;
- validation ;
- historique.

## Module Inventaires

Sous-modules :

- inventaire tournant ;
- inventaire annuel ;
- inventaire par zone ;
- inventaire par article ;
- ecarts ;
- ajustements ;
- historique.

## Module Lots & Series

Le menu principal Lots & Series donne une vue globale systeme, alors que
l'onglet Article donne une vue limitee a un article.

Sous-modules :

- lots actifs ;
- lots expires ;
- series ;
- quarantaine ;
- tracabilite ;
- rappels produits ;
- historique.

## Ordre de generation des prochaines maquettes

1. Catalogue.
2. Stock.
3. Entrees.
4. Sorties.
5. Transferts.
6. Inventaires.
7. Lots & Series.

Chaque module doit etre genere ecran par ecran avec le meme niveau d'exigence
visuelle, fonctionnelle et technique que la maquette Articles en cours de
reprise.
