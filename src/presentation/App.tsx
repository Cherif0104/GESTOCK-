import { useMemo, useState } from "react";
import type { GestockViewModel } from "../application/buildGestockViewModel";
import { simulateLogin } from "../application/simulateLogin";
import type { MockOrganizationAccess, MockUser, PostLoginDestination } from "../domain/models";

interface AppProps {
  model: GestockViewModel;
}

type Screen =
  | "login"
  | "first-login"
  | "mfa"
  | "organization-selection"
  | "dashboard"
  | "password-reset"
  | "support"
  | "sso";

type SecurityScreen = Extract<Screen, "first-login" | "mfa" | "password-reset" | "support" | "sso">;

interface ActiveSession {
  user: MockUser;
  organizations: MockOrganizationAccess[];
  selectedOrganization?: MockOrganizationAccess;
}

type ArticleStatus = "Actif" | "Sous stock" | "Rupture";

interface ArticleRecord {
  reference: string;
  designation: string;
  category: string;
  family: string;
  unit: string;
  averagePrice: string;
  stock: string;
  status: ArticleStatus;
  barcode: string;
  location: string;
  icon: string;
}

interface CatalogProduct {
  code: string;
  name: string;
  family: string;
  brand: string;
  type: "Produit standard" | "Produit à variantes" | "Kit" | "Nomenclature" | "Service logistique";
  variants: number;
  status: "Actif" | "Brouillon" | "Archivé";
  categoryPath: string;
  template: string;
  classification: string;
  attributes: string[];
  documents: number;
}

interface ModuleBlueprint {
  title: string;
  subtitle: string;
  submodules: string[];
  kpis: Array<[string, string, string, string]>;
  columns: string[];
  rows: string[][];
  primaryAction: string;
  secondaryAction: string;
  sideTitle: string;
  sideItems: Array<[string, string]>;
}

const navigationItems = [
  "Tableau de bord",
  "Articles",
  "Catalogue",
  "Stocks",
  "Entrées",
  "Sorties",
  "Transferts",
  "Inventaires",
  "Lots & Séries",
  "Péremptions",
  "Approvisionnements",
  "Achats",
  "Fournisseurs",
  "Entrepôts",
  "Emplacements",
  "Rapports",
  "Alertes",
  "Paramètres"
];

const recentMovements = [
  ["31/05/2024", "Réception", "REC-00045", "Paracétamol 500mg", "Entrepôt Dakar", "+ 2 500", "Amadou Diop"],
  ["31/05/2024", "Sortie", "SOR-00123", "Gants médicaux", "Entrepôt Thiès", "- 1 000", "Fatou Ndiaye"],
  ["30/05/2024", "Transfert", "TRF-00078", "Huile moteur 5L", "Dakar -> St-Louis", "-500 / +500", "Mamadou Fall"],
  ["30/05/2024", "Réception", "REC-00044", "Riz 25kg", "Entrepôt Kaolack", "+ 1 200", "Nawa Sarr"],
  ["29/05/2024", "Sortie", "SOR-00122", "Ciment 50kg", "Entrepôt Dakar", "-300", "Cheikh Ba"]
];

const warehouseStock = [
  ["Dakar", "456 780 000", "93%"],
  ["Thiès", "234 560 000", "90%"],
  ["Kaolack", "198 430 000", "88%"],
  ["Saint-Louis", "156 230 000", "91%"],
  ["Ziguinchor", "102 540 000", "87%"]
];

const topArticles = [
  ["Ciment 50kg", "125 450 000", "10,0%"],
  ["Fer à béton 12mm", "98 760 000", "7,9%"],
  ["Riz 25kg", "87 450 000", "7,0%"],
  ["Huile moteur 5L", "76 540 000", "6,1%"],
  ["Paracétamol 500mg", "54 320 000", "4,3%"]
];

const articleItems: ArticleRecord[] = [
  {
    reference: "PARA-500",
    designation: "Paracétamol 500mg",
    category: "Médicaments",
    family: "Comprimés",
    unit: "Boîte",
    averagePrice: "1 250",
    stock: "2 500",
    status: "Actif",
    barcode: "6161101234567",
    location: "Dakar / A-12",
    icon: "PARA"
  },
  {
    reference: "GANT-MED-L",
    designation: "Gants médicaux latex (L)",
    category: "Consommables",
    family: "Protection",
    unit: "Boîte",
    averagePrice: "2 850",
    stock: "1 000",
    status: "Actif",
    barcode: "6161102234567",
    location: "Thiès / B-04",
    icon: "GANT"
  },
  {
    reference: "HUILE-5L",
    designation: "Huile moteur 5L",
    category: "Lubrifiants",
    family: "Maintenance",
    unit: "Bidon",
    averagePrice: "8 500",
    stock: "750",
    status: "Actif",
    barcode: "6161103234567",
    location: "Dakar / C-08",
    icon: "OIL"
  },
  {
    reference: "CIM-50KG",
    designation: "Ciment 50kg",
    category: "Matériaux",
    family: "Construction",
    unit: "Sac",
    averagePrice: "4 200",
    stock: "300",
    status: "Sous stock",
    barcode: "6161104234567",
    location: "Kaolack / D-02",
    icon: "CIM"
  },
  {
    reference: "FER-12MM",
    designation: "Fer à béton 12mm",
    category: "Matériaux",
    family: "Construction",
    unit: "Tige",
    averagePrice: "7 850",
    stock: "150",
    status: "Sous stock",
    barcode: "6161105234567",
    location: "Dakar / D-09",
    icon: "FER"
  },
  {
    reference: "RIZ-25KG",
    designation: "Riz 25kg",
    category: "Alimentaire",
    family: "Denrées",
    unit: "Sac",
    averagePrice: "12 500",
    stock: "0",
    status: "Rupture",
    barcode: "6161106234567",
    location: "Saint-Louis / E-03",
    icon: "RIZ"
  },
  {
    reference: "CAH-A4-100P",
    designation: "Cahier A4 100 pages",
    category: "Fournitures",
    family: "Papeterie",
    unit: "Pièce",
    averagePrice: "650",
    stock: "5 200",
    status: "Actif",
    barcode: "6161107234567",
    location: "Bénin / F-01",
    icon: "A4"
  },
  {
    reference: "EAU-0.5L",
    designation: "Eau minérale 0.5L",
    category: "Boissons",
    family: "Consommables",
    unit: "Bouteille",
    averagePrice: "200",
    stock: "3 600",
    status: "Actif",
    barcode: "6161108234567",
    location: "Abidjan / G-10",
    icon: "EAU"
  },
  {
    reference: "MASQ-CHIR",
    designation: "Masques chirurgicaux",
    category: "Consommables",
    family: "Protection",
    unit: "Boîte",
    averagePrice: "1 800",
    stock: "200",
    status: "Sous stock",
    barcode: "6161109234567",
    location: "Dakar / B-11",
    icon: "MASK"
  },
  {
    reference: "AMPOULE-LED-12W",
    designation: "Ampoule LED 12W",
    category: "Électricité",
    family: "Éclairage",
    unit: "Pièce",
    averagePrice: "2 300",
    stock: "1 150",
    status: "Actif",
    barcode: "6161110234567",
    location: "Thiès / H-05",
    icon: "LED"
  }
];

const catalogProducts: CatalogProduct[] = [
  {
    code: "MDM-PARA-500",
    name: "Paracétamol 500mg",
    family: "Médicaments / Comprimés",
    brand: "BioPharma",
    type: "Produit standard",
    variants: 3,
    status: "Actif",
    categoryPath: "Consommables > Médicaments > Analgiques",
    template: "Template Médicament",
    classification: "GS1 / UNSPSC 51142000",
    attributes: ["Dosage 500mg", "Forme comprimé", "OTC", "Conservation ambiante"],
    documents: 4
  },
  {
    code: "MDM-GANT-LATEX",
    name: "Gants médicaux latex",
    family: "Consommables / Protection",
    brand: "MediSafe",
    type: "Produit à variantes",
    variants: 4,
    status: "Actif",
    categoryPath: "Consommables > Protection > Gants",
    template: "Template Produit médical",
    classification: "GS1 / UNSPSC 42132203",
    attributes: ["Taille", "Matière latex", "Stérile", "Usage unique"],
    documents: 6
  },
  {
    code: "MDM-HUILE-5L",
    name: "Huile moteur 5L",
    family: "Maintenance / Lubrifiants",
    brand: "Caterpillar",
    type: "Produit standard",
    variants: 2,
    status: "Actif",
    categoryPath: "Matériels > Maintenance > Lubrifiants",
    template: "Template Produit chimique",
    classification: "UNSPSC 15121501",
    attributes: ["Capacité 5L", "Viscosité 15W40", "Produit chimique"],
    documents: 5
  },
  {
    code: "MDM-CIMENT-50",
    name: "Ciment Portland 50kg",
    family: "Matériaux / Béton",
    brand: "CimAfrique",
    type: "Produit standard",
    variants: 1,
    status: "Actif",
    categoryPath: "Matériaux > Béton > Ciment",
    template: "Template Matériaux",
    classification: "OHADA / Classe douanière 252329",
    attributes: ["Poids 50kg", "Classe 42.5", "Palette 40 sacs"],
    documents: 3
  },
  {
    code: "MDM-TSHIRT-CORP",
    name: "T-Shirt corporate",
    family: "Textile / Uniformes",
    brand: "Gestock Wear",
    type: "Produit à variantes",
    variants: 9,
    status: "Brouillon",
    categoryPath: "Équipements > Uniformes > Textile",
    template: "Template Produit à variantes",
    classification: "ABC B / XYZ X",
    attributes: ["Couleur", "Taille", "Grammage", "Logo"],
    documents: 2
  },
  {
    code: "KIT-EPI-STD",
    name: "Kit EPI standard",
    family: "Sécurité / Kits",
    brand: "Gestock Safety",
    type: "Kit",
    variants: 0,
    status: "Actif",
    categoryPath: "Kits > Sécurité > EPI",
    template: "Template Kit",
    classification: "Classe logistique Sécurité",
    attributes: ["Casque", "Gants", "Bottes", "Gilet"],
    documents: 5
  },
  {
    code: "BOM-TABLE-BUREAU",
    name: "Table de bureau",
    family: "Mobilier / Bureau",
    brand: "OfficeLine",
    type: "Nomenclature",
    variants: 2,
    status: "Actif",
    categoryPath: "Nomenclatures > Mobilier > Tables",
    template: "Template BOM",
    classification: "UNSPSC 56101519",
    attributes: ["Plateau", "Pieds", "Visserie", "Finition"],
    documents: 4
  },
  {
    code: "MDM-PC-BUREAU",
    name: "Ordinateur bureau standard",
    family: "IT / Ordinateurs",
    brand: "Dell",
    type: "Nomenclature",
    variants: 3,
    status: "Actif",
    categoryPath: "Nomenclatures > IT > Ordinateurs",
    template: "Template Pièce détachée",
    classification: "UNSPSC 43211507",
    attributes: ["Carte mère", "RAM", "SSD", "Alimentation"],
    documents: 7
  }
];

const catalogSubmodules = [
  "Catalogue Produits",
  "Catégories",
  "Familles",
  "Marques",
  "Attributs",
  "Variantes",
  "Modèles d'articles",
  "Kits",
  "Nomenclatures",
  "Classifications",
  "Bibliothèque documentaire",
  "Historique Catalogue"
];

const categoryTree = [
  ["Consommables", "Médicaments", "Alimentaire"],
  ["Matériaux", "Béton", "Acier"],
  ["Équipements", "Uniformes", "Sécurité"],
  ["Nomenclatures", "Mobilier", "IT"]
];

const moduleBlueprints: Record<string, ModuleBlueprint> = {
  Stocks: {
    title: "Stocks",
    subtitle: "Vue globale des disponibilités, réservations, valorisations et couvertures multi-entrepôts.",
    submodules: [
      "Vue globale stock",
      "Disponibilités",
      "Réservations",
      "Valorisation",
      "Couverture",
      "Rotation",
      "Multi-entrepôts",
      "Analyse ABC",
      "Historique stock"
    ],
    kpis: [
      ["1,24 Md", "Valeur stock", "▤", "blue"],
      ["92,4%", "Disponibilité", "◇", "green"],
      ["350", "Réservations", "□", "purple"],
      ["78 j", "Couverture", "◷", "orange"]
    ],
    columns: ["Entrepôt", "Articles", "Valeur", "Disponible", "Réservé", "Couverture", "Statut"],
    rows: [
      ["Dakar", "1 245", "456 780 000", "93%", "350", "82 j", "Stable"],
      ["Thiès", "768", "234 560 000", "90%", "180", "65 j", "À surveiller"],
      ["Kaolack", "614", "198 430 000", "88%", "96", "54 j", "Stable"],
      ["Saint-Louis", "402", "156 230 000", "91%", "74", "71 j", "Stable"]
    ],
    primaryAction: "Analyser couverture",
    secondaryAction: "Exporter stock",
    sideTitle: "Alertes stock",
    sideItems: [["Ruptures critiques", "28 articles"], ["Surstock", "17 références"], ["Réservations bloquées", "9 lignes"]]
  },
  Entrées: {
    title: "Entrées",
    subtitle: "Réceptions fournisseurs, internes, retours et contrôle qualité réception.",
    submodules: [
      "Réceptions fournisseurs",
      "Réceptions internes",
      "Réceptions retours",
      "Contrôle qualité réception",
      "Réceptions en attente",
      "Historique réceptions"
    ],
    kpis: [
      ["42", "Réceptions ouvertes", "▥", "blue"],
      ["18", "En attente QC", "△", "orange"],
      ["96,8%", "Conformité", "♢", "green"],
      ["7", "Retards", "◷", "red"]
    ],
    columns: ["Réception", "Origine", "Fournisseur/Site", "Articles", "Statut", "Contrôle", "Date prévue"],
    rows: [
      ["REC-00045", "Fournisseur", "PHARMA CI", "Paracétamol 500mg", "Réceptionnée", "Conforme", "31/05/2024"],
      ["REC-00046", "Interne", "Hub Dakar", "Gants latex", "En attente", "À contrôler", "01/06/2024"],
      ["RET-00012", "Retour", "Client B2B", "Ciment 50kg", "À traiter", "Litige", "02/06/2024"]
    ],
    primaryAction: "Nouvelle réception",
    secondaryAction: "Scanner BL",
    sideTitle: "Qualité réception",
    sideItems: [["Lots à contrôler", "18"], ["Écarts quantité", "5"], ["Documents manquants", "3"]]
  },
  Sorties: {
    title: "Sorties",
    subtitle: "Sorties vente, consommation, projets, pertes, destruction et historique.",
    submodules: [
      "Sorties vente",
      "Sorties consommation",
      "Sorties projets",
      "Sorties pertes",
      "Sorties destruction",
      "Historique sorties"
    ],
    kpis: [
      ["64", "Sorties du jour", "⇧", "blue"],
      ["12", "À valider", "☑", "orange"],
      ["4", "Pertes", "△", "red"],
      ["98%", "Traçabilité", "♢", "green"]
    ],
    columns: ["Sortie", "Type", "Article", "Entrepôt", "Quantité", "Demandeur", "Statut"],
    rows: [
      ["SOR-00123", "Vente", "Gants médicaux latex", "Thiès", "-1 000", "Fatou Ndiaye", "Validée"],
      ["SOR-00124", "Projet", "Fer à béton 12mm", "Dakar", "-120", "Mamadou Fall", "Préparée"],
      ["SOR-00125", "Consommation", "Cahier A4", "Bénin", "-80", "Grâce Mensah", "À valider"]
    ],
    primaryAction: "Créer sortie",
    secondaryAction: "Préparer picking",
    sideTitle: "Contrôles sortie",
    sideItems: [["Picking en retard", "6"], ["Sorties à approuver", "12"], ["Destructions sensibles", "2"]]
  },
  Transferts: {
    title: "Transferts",
    subtitle: "Transferts inter-entrepôts, inter-sites, rééquilibrage, demandes et validations.",
    submodules: [
      "Transferts inter-entrepôts",
      "Transferts inter-sites",
      "Rééquilibrage",
      "Demandes de transfert",
      "Validation",
      "Historique"
    ],
    kpis: [
      ["21", "Transferts ouverts", "⇆", "blue"],
      ["8", "En transit", "▤", "orange"],
      ["3", "Écarts transport", "△", "red"],
      ["94%", "Réception conforme", "♢", "green"]
    ],
    columns: ["Transfert", "Source", "Destination", "Article", "Quantité", "Transport", "Statut"],
    rows: [
      ["TRF-00078", "Dakar", "Saint-Louis", "Huile moteur 5L", "500", "Interne", "En transit"],
      ["TRF-00079", "Abidjan", "Dakar", "Masques chirurgicaux", "1 200", "Transit", "Demandé"],
      ["TRF-00080", "Kaolack", "Thiès", "Riz 25kg", "300", "Interne", "Réceptionné"]
    ],
    primaryAction: "Demander transfert",
    secondaryAction: "Valider réception",
    sideTitle: "Rééquilibrage suggéré",
    sideItems: [["Dakar → Thiès", "Gants latex"], ["Kaolack → Dakar", "Riz 25kg"], ["Bénin → Abidjan", "Eau 0.5L"]]
  },
  Inventaires: {
    title: "Inventaires",
    subtitle: "Inventaires tournants, annuels, par zone, par article, écarts et ajustements.",
    submodules: [
      "Inventaire tournant",
      "Inventaire annuel",
      "Inventaire par zone",
      "Inventaire par article",
      "Écarts",
      "Ajustements",
      "Historique"
    ],
    kpis: [
      ["14", "Campagnes actives", "☑", "blue"],
      ["2,1%", "Écart moyen", "△", "orange"],
      ["86%", "Comptage réalisé", "▦", "green"],
      ["9", "Ajustements à valider", "◇", "red"]
    ],
    columns: ["Campagne", "Périmètre", "Articles", "Progression", "Écart valeur", "Responsable", "Statut"],
    rows: [
      ["INV-TOUR-05", "Zone A Dakar", "245", "86%", "1,2M", "Nawa Sarr", "En cours"],
      ["INV-ANN-24", "Tous sites", "2 356", "12%", "0", "Moussa Traoré", "Planifié"],
      ["INV-ART-88", "Paracétamol", "1", "100%", "0", "Amadou Diop", "Clôturé"]
    ],
    primaryAction: "Créer inventaire",
    secondaryAction: "Saisir comptage",
    sideTitle: "Écarts sensibles",
    sideItems: [["Écart Ciment", "4,2M FCFA"], ["Écart Gants", "850 unités"], ["Validation manager", "9 lignes"]]
  },
  "Lots & Séries": {
    title: "Lots & Séries",
    subtitle: "Vue globale de tous les lots, séries, quarantaines, traçabilité et rappels produits.",
    submodules: ["Lots actifs", "Lots expirés", "Séries", "Quarantaine", "Traçabilité", "Rappels produits", "Historique"],
    kpis: [
      ["1 842", "Lots actifs", "▣", "blue"],
      ["36", "Proches expiration", "◷", "orange"],
      ["12", "Quarantaine", "△", "red"],
      ["100%", "Traçabilité", "♢", "green"]
    ],
    columns: ["Lot/Série", "Article", "Entrepôt", "Quantité", "Expiration", "Statut", "Traçabilité"],
    rows: [
      ["LOT-240501", "Paracétamol 500mg", "Dakar", "720", "15/08/2024", "Actif", "Complète"],
      ["LOT-240488", "Gants latex", "Thiès", "450", "12/12/2026", "Actif", "Complète"],
      ["SER-PC-0091", "Ordinateur bureau", "Dakar", "1", "-", "Série", "Complète"]
    ],
    primaryAction: "Tracer un lot",
    secondaryAction: "Créer rappel",
    sideTitle: "Alertes lots",
    sideItems: [["Expiration < 90 jours", "36"], ["Quarantaine", "12"], ["Rappel produit", "1 actif"]]
  },
  Péremptions: {
    title: "Péremptions",
    subtitle: "Pilotage des dates de péremption, alertes, seuils, retraits et actions préventives.",
    submodules: ["À surveiller", "Proches expiration", "Expirés", "Retraits", "Seuils alerte", "Historique"],
    kpis: [
      ["142", "À surveiller", "◷", "orange"],
      ["28", "< 30 jours", "△", "red"],
      ["7", "Expirés", "▣", "red"],
      ["96%", "Traitement", "♢", "green"]
    ],
    columns: ["Article", "Lot", "Entrepôt", "Quantité", "Expiration", "Jours restants", "Action"],
    rows: [
      ["Paracétamol 500mg", "LOT-240501", "Dakar", "720", "15/08/2024", "75", "Surveiller"],
      ["Produit alimentaire", "LOT-240477", "Kaolack", "180", "10/07/2024", "39", "Accélérer sortie"],
      ["Réactif chimique", "LOT-240122", "Bénin", "24", "25/06/2024", "5", "Bloquer"]
    ],
    primaryAction: "Créer action retrait",
    secondaryAction: "Exporter péremptions",
    sideTitle: "Priorités",
    sideItems: [["Risque sanitaire", "3 lots"], ["Sortie accélérée", "18 lots"], ["Blocage recommandé", "7 lots"]]
  },
  Approvisionnements: {
    title: "Approvisionnements",
    subtitle: "Demandes de réapprovisionnement, suggestions, seuils et consolidation besoins.",
    submodules: ["Besoins", "Suggestions", "Demandes", "Seuils", "Prévisions", "Historique"],
    kpis: [
      ["58", "Besoins détectés", "□", "blue"],
      ["22", "Demandes ouvertes", "▤", "orange"],
      ["15,2M", "Valeur suggérée", "◇", "green"],
      ["9", "Urgences", "△", "red"]
    ],
    columns: ["Besoin", "Article", "Entrepôt", "Quantité suggérée", "Priorité", "Source", "Statut"],
    rows: [
      ["BES-00091", "Ciment 50kg", "Dakar", "1 500", "Haute", "Seuil min", "À valider"],
      ["BES-00092", "Masques chirurgicaux", "Thiès", "800", "Moyenne", "Prévision", "Brouillon"],
      ["BES-00093", "Riz 25kg", "Saint-Louis", "2 000", "Critique", "Rupture", "Urgent"]
    ],
    primaryAction: "Générer demande",
    secondaryAction: "Calculer besoins",
    sideTitle: "Moteur de suggestion",
    sideItems: [["Seuils déclenchés", "31"], ["Prévisions IA", "18"], ["Ruptures immédiates", "9"]]
  },
  Achats: {
    title: "Achats",
    subtitle: "Demandes d'achat, commandes fournisseurs, validations, réceptions et performance.",
    submodules: ["Demandes d'achat", "Commandes", "Validations", "Réceptions liées", "Contrats", "Historique"],
    kpis: [
      ["32", "Commandes ouvertes", "▱", "blue"],
      ["12,5M", "Montant engagé", "◇", "green"],
      ["8", "À approuver", "☑", "orange"],
      ["5", "Retards fournisseur", "△", "red"]
    ],
    columns: ["Commande", "Fournisseur", "Articles", "Montant", "Devise", "Statut", "Échéance"],
    rows: [
      ["PO-2408", "PHARMA CI", "Paracétamol", "4 500 000", "XOF", "Approuvée", "05/06/2024"],
      ["PO-2409", "MedEquip", "Gants latex", "2 850 000", "XOF", "Envoyée", "07/06/2024"],
      ["DA-0014", "CimAfrique", "Ciment", "6 300 000", "XOF", "Validation", "03/06/2024"]
    ],
    primaryAction: "Créer commande",
    secondaryAction: "Nouvelle demande",
    sideTitle: "Workflow achats",
    sideItems: [["DG à valider", "2"], ["Finance", "6"], ["Relance fournisseur", "5"]]
  },
  Fournisseurs: {
    title: "Fournisseurs",
    subtitle: "Référentiel fournisseurs, contacts, contrats, évaluations et performance.",
    submodules: ["Liste fournisseurs", "Contacts", "Contrats", "Évaluations", "Documents", "Historique"],
    kpis: [
      ["248", "Fournisseurs actifs", "♙", "blue"],
      ["92%", "Performance moyenne", "♢", "green"],
      ["14", "Contrats expirent", "◷", "orange"],
      ["6", "Risques", "△", "red"]
    ],
    columns: ["Fournisseur", "Pays", "Catégorie", "Performance", "Contrats", "Dernière commande", "Statut"],
    rows: [
      ["PHARMA CI", "Côte d'Ivoire", "Médicaments", "97%", "3", "PO-2408", "Actif"],
      ["MedEquip", "Sénégal", "Consommables", "91%", "2", "PO-2409", "Actif"],
      ["CimAfrique", "Sénégal", "Matériaux", "86%", "1", "DA-0014", "À surveiller"]
    ],
    primaryAction: "Nouveau fournisseur",
    secondaryAction: "Évaluer fournisseur",
    sideTitle: "Conformité fournisseur",
    sideItems: [["KYC incomplets", "8"], ["Documents expirés", "14"], ["Score faible", "6"]]
  },
  Entrepôts: {
    title: "Entrepôts",
    subtitle: "Sites, entrepôts, capacités, zones, emplacements et performance opérationnelle.",
    submodules: ["Entrepôts", "Zones", "Capacités", "Température", "Équipes", "Historique"],
    kpis: [
      ["8", "Entrepôts", "⌂", "blue"],
      ["78,3%", "Occupation", "▦", "green"],
      ["4", "Zones froides", "❄", "blue"],
      ["3", "Surcharges", "△", "orange"]
    ],
    columns: ["Entrepôt", "Site", "Type", "Occupation", "Service", "Responsable", "Statut"],
    rows: [
      ["Entrepôt Dakar", "Dakar", "Central", "78%", "96%", "Amadou Diop", "Opérationnel"],
      ["Entrepôt Thiès", "Thiès", "Régional", "64%", "93%", "Fatou Ndiaye", "Opérationnel"],
      ["Zone froide Yoff", "Dakar", "Cold-chain", "71%", "98%", "Nawa Sarr", "Surveillé"]
    ],
    primaryAction: "Créer entrepôt",
    secondaryAction: "Plan capacité",
    sideTitle: "Capacité",
    sideItems: [["Surcharge", "3 zones"], ["Disponible", "21%"], ["Maintenance", "2 équipements"]]
  },
  Emplacements: {
    title: "Emplacements",
    subtitle: "Adressage warehouse : zones, allées, racks, bacs, codes-barres et capacités.",
    submodules: ["Plan emplacements", "Zones", "Racks", "Bacs", "Codes-barres", "Historique"],
    kpis: [
      ["1 240", "Emplacements", "⌖", "blue"],
      ["82%", "Occupation", "▦", "green"],
      ["74", "Libres", "□", "orange"],
      ["12", "Bloqués", "△", "red"]
    ],
    columns: ["Code", "Entrepôt", "Zone", "Type", "Occupation", "Article principal", "Statut"],
    rows: [
      ["DKR-A-12", "Dakar", "A", "Rack", "86%", "Paracétamol", "Actif"],
      ["THI-B-04", "Thiès", "B", "Bac", "62%", "Gants latex", "Actif"],
      ["DKR-COLD-01", "Dakar", "Froid", "Palette", "91%", "Réactifs", "Contrôlé"]
    ],
    primaryAction: "Créer emplacement",
    secondaryAction: "Imprimer codes",
    sideTitle: "Adressage",
    sideItems: [["Sans code-barres", "24"], ["Capacité faible", "17"], ["Bloqués", "12"]]
  },
  Rapports: {
    title: "Rapports",
    subtitle: "BI opérationnelle : stocks, achats, mouvements, valorisation, alertes et exports.",
    submodules: ["Tableaux de bord", "Stocks", "Achats", "Mouvements", "Valorisation", "Exports", "Historique"],
    kpis: [
      ["18", "Rapports actifs", "▥", "blue"],
      ["7", "Planifiés", "◷", "green"],
      ["42", "Exports mois", "⇩", "purple"],
      ["3", "Échecs", "△", "red"]
    ],
    columns: ["Rapport", "Domaine", "Fréquence", "Dernière génération", "Format", "Destinataires", "Statut"],
    rows: [
      ["Valorisation stock", "Stock", "Mensuel", "31/05/2024", "PDF/XLSX", "Direction", "Succès"],
      ["Ruptures critiques", "Alertes", "Quotidien", "01/06/2024", "PDF", "Stock", "Succès"],
      ["Performance achats", "Achats", "Hebdo", "30/05/2024", "XLSX", "Finance", "Planifié"]
    ],
    primaryAction: "Créer rapport",
    secondaryAction: "Exporter maintenant",
    sideTitle: "Exports",
    sideItems: [["PDF", "24"], ["Excel", "18"], ["API", "6"]]
  },
  Alertes: {
    title: "Alertes",
    subtitle: "Centre d'alertes : ruptures, péremptions, retards, écarts, qualité et workflows.",
    submodules: ["Toutes", "Critiques", "Stock", "Péremption", "Achats", "Qualité", "Historique"],
    kpis: [
      ["12", "Critiques", "△", "red"],
      ["28", "Stocks faibles", "▤", "orange"],
      ["9", "Péremptions", "◷", "orange"],
      ["86%", "Traitement SLA", "♢", "green"]
    ],
    columns: ["Alerte", "Domaine", "Objet", "Priorité", "Responsable", "Échéance", "Statut"],
    rows: [
      ["ALT-0001", "Stock", "Riz 25kg rupture", "Critique", "Nadia Kouamé", "Aujourd'hui", "Ouverte"],
      ["ALT-0002", "Péremption", "LOT-240501", "Haute", "Amadou Diop", "7 jours", "En cours"],
      ["ALT-0003", "Achats", "Retard PO-2409", "Moyenne", "Ibrahima Sow", "2 jours", "Ouverte"]
    ],
    primaryAction: "Traiter alerte",
    secondaryAction: "Créer règle",
    sideTitle: "SLA alertes",
    sideItems: [["En retard", "4"], ["Aujourd'hui", "12"], ["Escaladées", "3"]]
  },
  Paramètres: {
    title: "Paramètres",
    subtitle: "Administration tenant : utilisateurs, rôles, RBAC, workflow, sécurité, intégrations et audit.",
    submodules: ["Organisation", "Utilisateurs", "Rôles & permissions", "Workflows", "Sécurité", "Intégrations", "Audit"],
    kpis: [
      ["156", "Utilisateurs", "♙", "blue"],
      ["18", "Rôles", "☑", "green"],
      ["7", "Workflows", "▧", "purple"],
      ["100%", "Audit actif", "♢", "green"]
    ],
    columns: ["Paramètre", "Domaine", "Valeur", "Portée", "Dernière modification", "Acteur", "Statut"],
    rows: [
      ["MFA Direction", "Sécurité", "Obligatoire", "Rôles sensibles", "31/05/2024", "Admin", "Actif"],
      ["RLS Tenant", "Données", "Activé", "Organisation", "30/05/2024", "Système", "Actif"],
      ["Workflow achats", "Validation", "DG > Finance", "Achats", "29/05/2024", "Admin", "Actif"]
    ],
    primaryAction: "Ajouter utilisateur",
    secondaryAction: "Configurer rôle",
    sideTitle: "Sécurité",
    sideItems: [["MFA requis", "3 rôles"], ["Sessions actives", "42"], ["Événements audit", "1 284"]]
  }
};

export function App({ model }: AppProps) {
  const [screen, setScreen] = useState<Screen>("login");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [activeNav, setActiveNav] = useState("Tableau de bord");
  const [workspaceNotice, setWorkspaceNotice] = useState<string | null>(null);

  const defaultOrganization = useMemo(
    () =>
      session?.organizations.find(
        (organization) =>
          organization.id === session.user.defaultOrganizationId || organization.isDefault
      ),
    [session]
  );

  const routeAfterSecurity = (nextSession: ActiveSession) => {
    const selected =
      nextSession.selectedOrganization ??
      nextSession.organizations.find(
        (organization) =>
          organization.id === nextSession.user.defaultOrganizationId || organization.isDefault
      );

    if (selected || nextSession.organizations.length === 1) {
      const selectedOrganization = selected ?? nextSession.organizations[0];
      const dashboardSession = { ...nextSession, selectedOrganization };
      setSession(dashboardSession);
      persistSession(dashboardSession, "dashboard");
      setScreen("dashboard");
      return;
    }

    persistSession(nextSession, "organization-selection");
    setScreen("organization-selection");
  };

  const handleLogin = (formData: FormData) => {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = simulateLogin(model.mockUsers, email, password);

    if (!result.ok) {
      setLoginError(result.message);
      return;
    }

    const nextSession: ActiveSession = {
      user: result.user,
      organizations: result.organizations,
      selectedOrganization: result.organization
    };

    setLoginError(null);
    setSession(nextSession);
    persistSession(nextSession, result.destination);

    if (result.destination === "dashboard") {
      setScreen("dashboard");
      return;
    }

    if (result.destination === "organization-selection") {
      setScreen("organization-selection");
      return;
    }

    setScreen(result.destination);
  };

  const handleOrganizationSelect = (organization: MockOrganizationAccess) => {
    if (!session) return;

    const nextSession = { ...session, selectedOrganization: organization };
    setSession(nextSession);
    persistSession(nextSession, "dashboard");
    setScreen("dashboard");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("gestock.mockSession");
    setSession(null);
    setWorkspaceNotice(null);
    setActiveNav("Tableau de bord");
    setScreen("login");
  };

  if (screen === "login") {
    return (
      <LoginScreen
        demoUsers={model.mockUsers}
        loginError={loginError}
        onAction={setScreen}
        onLogin={handleLogin}
      />
    );
  }

  if (screen === "first-login" || screen === "mfa" || screen === "password-reset" || screen === "support" || screen === "sso") {
    return (
      <SecurityStepScreen
        screen={screen}
        session={session}
        onBack={() => setScreen("login")}
        onContinue={() => (session ? routeAfterSecurity(session) : setScreen("login"))}
      />
    );
  }

  if (screen === "organization-selection" && session) {
    return (
      <OrganizationSelectionScreen
        defaultOrganizationId={defaultOrganization?.id}
        onAction={setScreen}
        onLogout={handleLogout}
        onSelect={handleOrganizationSelect}
        organizations={session.organizations}
        user={session.user}
      />
    );
  }

  if (screen === "dashboard" && session?.selectedOrganization) {
    return (
      <DashboardScreen
        activeNav={activeNav}
        model={model}
        notice={workspaceNotice}
        onAction={(message) => setWorkspaceNotice(message)}
        onLogout={handleLogout}
        onNav={setActiveNav}
        onSwitchOrganization={() => setScreen("organization-selection")}
        organization={session.selectedOrganization}
        user={session.user}
      />
    );
  }

  return (
    <LoginScreen
      demoUsers={model.mockUsers}
      loginError={loginError}
      onAction={setScreen}
      onLogin={handleLogin}
    />
  );
}

function persistSession(session: ActiveSession, destination: PostLoginDestination) {
  sessionStorage.setItem(
    "gestock.mockSession",
    JSON.stringify({
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      destination,
      organizationId: session.selectedOrganization?.id ?? null,
      organizationCount: session.organizations.length
    })
  );
}

function LoginScreen({
  demoUsers,
  loginError,
  onAction,
  onLogin
}: {
  demoUsers: MockUser[];
  loginError: string | null;
  onAction: (screen: Screen) => void;
  onLogin: (formData: FormData) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillDemoUser = (user: MockUser) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return (
    <main className="login-page" aria-label="Connexion GESTOCK">
      <section className="brand-panel" aria-label="Présentation de GESTOCK">
        <div className="brand-overlay" />

        <div className="brand-content">
          <Logo className="gestock-logo" />

          <p className="brand-subtitle">
            PLATEFORME DE GESTION DES STOCKS
            <br />
            ET APPROVISIONNEMENTS
          </p>

          <h1>
            Maîtrisez <span>vos stocks.</span>
            <br />
            Optimisez votre chaîne
            <br />
            d'approvisionnement.
          </h1>

          <div className="feature-list">
            <FeatureCard icon="▣" title="Visibilité en temps réel" text="Suivez vos stocks et mouvements en direct." />
            <FeatureCard icon="▤" title="Performance opérationnelle" text="Prenez les bonnes décisions, plus rapidement." />
            <FeatureCard icon="◇" title="Traçabilité complète" text="Suivez chaque article, lot et mouvement." />
            <FeatureCard icon="♢" title="Alertes intelligentes" text="Anticipez les ruptures et péremptions." />
          </div>

          <div className="login-ops-preview" aria-label="Aperçu opérationnel GESTOCK">
            <header>
              <strong>Tour de contrôle stock</strong>
              <span>Live mock</span>
            </header>
            <div>
              <small>Disponibilité</small>
              <b>92,4%</b>
              <em>+4,2%</em>
            </div>
            <div>
              <small>Réceptions du jour</small>
              <b>18</b>
              <em>7 validées</em>
            </div>
            <div>
              <small>Alertes critiques</small>
              <b>12</b>
              <em>à traiter</em>
            </div>
          </div>
        </div>

        <small className="copyright">© 2024 GESTOCK. Tous droits réservés.</small>
      </section>

      <section className="auth-panel" aria-label="Formulaire de connexion">
        <button className="language-button" type="button">
          <span aria-hidden="true">◎</span>
          Français
          <span aria-hidden="true">⌄</span>
        </button>

        <div className="dots" aria-hidden="true" />

        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault();
            onLogin(new FormData(event.currentTarget));
          }}
        >
          <header>
            <h2>
              Connexion à <span>GESTOCK</span>
            </h2>
            <p>Accédez à votre espace de gestion</p>
          </header>

          <label className="field">
            <span>Adresse e-mail</span>
            <div className="input-shell">
              <i aria-hidden="true">✉</i>
              <input
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Entrez votre adresse e-mail"
                type="email"
                value={email}
              />
            </div>
          </label>

          <label className="field">
            <span>Mot de passe</span>
            <div className="input-shell">
              <i aria-hidden="true">▣</i>
              <input
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Entrez votre mot de passe"
                type="password"
                value={password}
              />
              <button aria-label="Afficher le mot de passe" type="button">
                ◉
              </button>
            </div>
          </label>

          <div className="form-options">
            <label>
              <input defaultChecked type="checkbox" />
              <span>Se souvenir de moi</span>
            </label>
            <button onClick={() => onAction("password-reset")} type="button">
              Mot de passe oublié ?
            </button>
          </div>

          <details className="demo-user-picker">
            <summary>Comptes de test</summary>
            <div>
              {demoUsers.map((user) => (
                <button key={user.id} onClick={() => fillDemoUser(user)} type="button">
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.role} · {user.email}</small>
                  </span>
                  <em>{user.organizations.length > 1 ? "Multi-org" : "Direct"}</em>
                </button>
              ))}
            </div>
          </details>

          {loginError ? (
            <p className="login-error" role="alert">
              {loginError}
            </p>
          ) : null}

          <button className="submit-button" type="submit">
            Se connecter
          </button>

          <div className="divider">
            <span />
            <small>OU</small>
            <span />
          </div>

          <button className="sso-button" onClick={() => onAction("sso")} type="button">
            <span aria-hidden="true">▥</span>
            Se connecter avec SSO / Enterprise
          </button>

          <footer className="first-login">
            <strong>Première connexion à GESTOCK ?</strong>
            <button onClick={() => onAction("support")} type="button">
              Contacter votre administrateur
            </button>
          </footer>
        </form>

        <div className="trust-row" aria-label="Engagements sécurité">
          <TrustItem icon="♢" title="Sécurisé" text="Données chiffrées" />
          <TrustItem icon="☁" title="Hébergé au Sénégal" text="Haute disponibilité" />
          <TrustItem icon="♙" title="Multi-utilisateurs" text="Accès par rôles" />
          <TrustItem icon="◷" title="Audit complet" text="Traçabilité totale" />
        </div>
      </section>
    </main>
  );
}

function OrganizationSelectionScreen({
  defaultOrganizationId,
  onAction,
  onLogout,
  onSelect,
  organizations,
  user
}: {
  defaultOrganizationId?: string;
  onAction: (screen: Screen) => void;
  onLogout: () => void;
  onSelect: (organization: MockOrganizationAccess) => void;
  organizations: MockOrganizationAccess[];
  user: MockUser;
}) {
  return (
    <main className="tenant-shell">
      <TenantSidebar step={2} />

      <section className="tenant-main">
        <header className="tenant-header">
          <div>
            <h1>Sélection de l'organisation</h1>
            <p>Choisissez l'organisation avec laquelle vous souhaitez continuer.</p>
          </div>
          <div className="tenant-actions">
            <button type="button">◎ Français ⌄</button>
            <button onClick={onLogout} type="button">
              ⇱ Se déconnecter
            </button>
          </div>
        </header>

        <section className="organization-panel">
          <div className="organization-toolbar">
            <label>
              <span>⌕</span>
              <input placeholder="Rechercher une organisation..." />
            </label>
            <div>
              <button className="active" type="button">▦</button>
              <button type="button">☷</button>
            </div>
          </div>

          <div className="organization-grid">
            {organizations.map((organization, index) => (
              <button
                className={`organization-card ${organization.id === defaultOrganizationId ? "selected" : ""}`}
                key={organization.id}
                onClick={() => onSelect(organization)}
                type="button"
              >
                <span className={`org-mark org-mark-${(index % 5) + 1}`} aria-hidden="true" />
                <span className="org-card-body">
                  <strong>{organization.name}</strong>
                  {organization.id === defaultOrganizationId ? (
                    <em>Organisation active</em>
                  ) : null}
                  <small>
                    {organization.country} • {organization.city}
                  </small>
                  <small>{organization.domain}</small>
                </span>
                <span className="org-arrow">›</span>
                <span className="org-meta">
                  <span>
                    <small>Utilisateurs</small>
                    <b>{organization.users}</b>
                  </span>
                  <span>
                    <small>Entrepôts</small>
                    <b>{organization.warehouses}</b>
                  </span>
                  <span>
                    <small>Rôle par défaut</small>
                    <b>{organization.role}</b>
                  </span>
                </span>
              </button>
            ))}

            <button className="organization-card add-organization" onClick={() => onAction("support")} type="button">
              <span>＋</span>
              <strong>Accéder à une autre organisation</strong>
              <small>Vous avez été invité à rejoindre une nouvelle organisation ?</small>
              <em>Utiliser un code d'accès</em>
            </button>
          </div>

          <footer className="organization-info">
            <span>ⓘ</span>
            <div>
              <strong>Organisation active</strong>
              <p>C'est l'organisation qui sera ouverte par défaut lors de votre prochaine connexion.</p>
            </div>
            <button onClick={() => onAction("support")} type="button">⚙ Gérer mes organisations</button>
          </footer>
        </section>

        <div className="secure-footer">♙ Connexion sécurisée · Données chiffrées · Conformité ISO 27001 · {user.role}</div>
      </section>
    </main>
  );
}

function DashboardScreen({
  activeNav,
  model,
  notice,
  onAction,
  onLogout,
  onNav,
  onSwitchOrganization,
  organization,
  user
}: {
  activeNav: string;
  model: GestockViewModel;
  notice: string | null;
  onAction: (message: string | null) => void;
  onLogout: () => void;
  onNav: (item: string) => void;
  onSwitchOrganization: () => void;
  organization: MockOrganizationAccess;
  user: MockUser;
}) {
  const isDashboard = activeNav === "Tableau de bord";
  const isArticles = activeNav === "Articles";
  const isCatalogue = activeNav === "Catalogue";
  const [selectedArticle, setSelectedArticle] = useState<ArticleRecord | null>(null);
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<CatalogProduct | null>(null);
  const [openTopbarPanel, setOpenTopbarPanel] = useState<"notifications" | "messages" | "user" | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [readMessageIds, setReadMessageIds] = useState<string[]>([]);
  const [topbarSearch, setTopbarSearch] = useState("");
  const searchPlaceholder =
    activeNav === "Articles"
      ? selectedArticle
        ? "Rechercher (articles, commandes, fournisseurs...)"
        : "Rechercher (articles, références, codes-barres...)"
      : "Rechercher (articles, commandes, fournisseurs...)";

  return (
    <main className="erp-shell">
      <aside className="erp-sidebar">
        <Logo className="erp-logo" />
        <button className="erp-org-switch" onClick={onSwitchOrganization} type="button">
          <span className="org-cube" />
          <span>
            <strong>{organization.name}</strong>
            <small>{organization.city}, {organization.country}</small>
          </span>
          <b>⌄</b>
        </button>

        <nav>
          {navigationItems.map((item) => (
            <button
              className={item === activeNav ? "active" : ""}
              key={item}
              onClick={() => {
                onNav(item);
                if (item !== "Articles") {
                  setSelectedArticle(null);
                }
                if (item !== "Catalogue") {
                  setSelectedCatalogProduct(null);
                }
              }}
              type="button"
            >
              <span>{iconForNav(item)}</span>
              {item}
              {item === "Alertes" ? <em>12</em> : null}
            </button>
          ))}
        </nav>

        <section className="quick-actions">
          <strong>Réception rapide</strong>
          <button onClick={() => onAction("Scanner code-barres ouvert : caméra, lecteur USB et recherche EAN prêts en mock.")} type="button">▥ Scanner un code-barres</button>
        </section>

        <small>© 2024 {organization.name}. Tous droits réservés.</small>
      </aside>

      <section className="erp-main">
        <header className="erp-topbar">
          <button onClick={() => onAction("Menu latéral compact activé en mode mock.")} type="button">☰</button>
          <label>
            <span>⌕</span>
            <input
              onChange={(event) => setTopbarSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && topbarSearch.trim()) {
                  onAction(`Recherche globale lancée : ${topbarSearch.trim()}`);
                }
              }}
              placeholder={searchPlaceholder}
              value={topbarSearch}
            />
            <kbd>Ctrl + K</kbd>
          </label>
          <div className="topbar-actions">
            <button
              className={openTopbarPanel === "notifications" ? "active" : ""}
              onClick={() => setOpenTopbarPanel(openTopbarPanel === "notifications" ? null : "notifications")}
              type="button"
            >
              ♧<em>{Math.max(0, 12 - readNotificationIds.length)}</em>
            </button>
            <button
              className={openTopbarPanel === "messages" ? "active" : ""}
              onClick={() => setOpenTopbarPanel(openTopbarPanel === "messages" ? null : "messages")}
              type="button"
            >
              ✉<em>{Math.max(0, 5 - readMessageIds.length)}</em>
            </button>
            <button onClick={() => onAction("Aide contextuelle du dashboard.")} type="button">?</button>
            <button
              className={`user-menu ${openTopbarPanel === "user" ? "active" : ""}`}
              onClick={() => setOpenTopbarPanel(openTopbarPanel === "user" ? null : "user")}
              type="button"
            >
              <span />
              <b>{user.name}</b>
              <small>{user.role}</small>
              ⌄
            </button>
          </div>
        </header>

        {openTopbarPanel ? (
          <TopbarPanel
            onAction={onAction}
            onClose={() => setOpenTopbarPanel(null)}
            onLogout={onLogout}
            onReadMessage={(id) =>
              setReadMessageIds((current) => current.includes(id) ? current : [...current, id])
            }
            onReadNotification={(id) =>
              setReadNotificationIds((current) => current.includes(id) ? current : [...current, id])
            }
            organization={organization}
            panel={openTopbarPanel}
            readMessageIds={readMessageIds}
            readNotificationIds={readNotificationIds}
            user={user}
          />
        ) : null}

        <div className="dashboard-page">
          {notice ? (
            <p className="workspace-notice">
              {notice}
              <button onClick={() => onAction(null)} type="button">×</button>
            </p>
          ) : null}

          {isArticles ? (
            <ArticlesModule
              article={selectedArticle}
              onAction={onAction}
              onBack={() => setSelectedArticle(null)}
              onOpenArticle={(nextArticle) => setSelectedArticle(nextArticle)}
            />
          ) : isCatalogue ? (
            <CatalogueModule
              onAction={onAction}
              onBack={() => setSelectedCatalogProduct(null)}
              onOpenProduct={(product) => setSelectedCatalogProduct(product)}
              product={selectedCatalogProduct}
            />
          ) : (
            <>
              <header className="dashboard-header">
                <div>
                  <h1>{activeNav}</h1>
                  <p>{isDashboard ? "Vue d'ensemble de votre activité" : "Module connecté en données mock, prêt pour les sous-fonctionnalités."}</p>
                </div>
                <div>
                  <button type="button">01/05/2024 - 31/05/2024 ◷</button>
                  <button onClick={() => onAction("Personnalisation du dashboard activée.")} type="button">Personnaliser ⚙</button>
                </div>
              </header>

              {isDashboard ? (
                <DashboardContent model={model} onAction={onAction} />
              ) : (
                <ModuleWorkbench
                  moduleName={activeNav}
                  onAction={onAction}
                  organization={organization}
                />
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function TopbarPanel({
  onAction,
  onClose,
  onLogout,
  onReadMessage,
  onReadNotification,
  organization,
  panel,
  readMessageIds,
  readNotificationIds,
  user
}: {
  onAction: (message: string | null) => void;
  onClose: () => void;
  onLogout: () => void;
  onReadMessage: (id: string) => void;
  onReadNotification: (id: string) => void;
  organization: MockOrganizationAccess;
  panel: "notifications" | "messages" | "user";
  readMessageIds: string[];
  readNotificationIds: string[];
  user: MockUser;
}) {
  const notifications = [
    { id: "rupture-riz", title: "Rupture critique", text: "Riz 25kg indisponible à Saint-Louis.", tone: "danger" },
    { id: "stock-ciment", title: "Sous stock", text: "Ciment 50kg sous seuil à Kaolack.", tone: "warning" },
    { id: "expiry-para", title: "Péremption proche", text: "Lot PARA-500-L24 à contrôler sous 18 jours.", tone: "info" },
    { id: "receipt-delay", title: "Réception en retard", text: "Commande PO-0048 attend validation fournisseur.", tone: "warning" }
  ];
  const messages = [
    { id: "msg-1", from: "BioPharma Sénégal", subject: "Confirmation livraison PARA-500", time: "08:12" },
    { id: "msg-2", from: "Entrepôt Thiès", subject: "Demande de transfert gants L", time: "07:45" },
    { id: "msg-3", from: "Direction Achats", subject: "Validation prix huile moteur", time: "Hier" },
    { id: "msg-4", from: "Qualité réception", subject: "Certificat lot CIM-50KG", time: "Hier" },
    { id: "msg-5", from: "Support GESTOCK", subject: "Session audit planifiée", time: "Lun." }
  ];

  return (
    <aside className="topbar-panel">
      <header>
        <div>
          <strong>
            {panel === "notifications" ? "Centre de notifications" : panel === "messages" ? "Messages & mailing" : "Compte utilisateur"}
          </strong>
          <small>{organization.name}</small>
        </div>
        <button onClick={onClose} type="button">×</button>
      </header>

      {panel === "notifications" ? (
        <div className="topbar-panel-list">
          {notifications.map((notification) => {
            const isRead = readNotificationIds.includes(notification.id);
            return (
              <button
                className={`topbar-item ${notification.tone} ${isRead ? "read" : ""}`}
                key={notification.id}
                onClick={() => {
                  onReadNotification(notification.id);
                  onAction(`Notification ouverte : ${notification.title} - ${notification.text}`);
                }}
                type="button"
              >
                <span />
                <b>{notification.title}</b>
                <small>{notification.text}</small>
                <em>{isRead ? "Lu" : "Nouveau"}</em>
              </button>
            );
          })}
          <button className="topbar-panel-primary" onClick={() => onAction("Centre complet des alertes ouvert.")} type="button">
            Ouvrir toutes les alertes
          </button>
        </div>
      ) : null}

      {panel === "messages" ? (
        <div className="topbar-panel-list">
          {messages.map((message) => {
            const isRead = readMessageIds.includes(message.id);
            return (
              <button
                className={`topbar-message ${isRead ? "read" : ""}`}
                key={message.id}
                onClick={() => {
                  onReadMessage(message.id);
                  onAction(`Message ouvert : ${message.subject}`);
                }}
                type="button"
              >
                <span>{message.from.slice(0, 2).toUpperCase()}</span>
                <b>{message.from}</b>
                <small>{message.subject}</small>
                <em>{message.time}</em>
              </button>
            );
          })}
          <div className="topbar-compose">
            <input placeholder="Écrire à un fournisseur, site ou utilisateur..." />
            <button onClick={() => onAction("Brouillon de message créé en mode mock.")} type="button">Composer</button>
          </div>
        </div>
      ) : null}

      {panel === "user" ? (
        <div className="topbar-user-panel">
          <div className="topbar-user-card">
            <span />
            <strong>{user.name}</strong>
            <small>{user.email}</small>
            <em>{user.role} · {organization.city}</em>
          </div>
          <button onClick={() => onAction("Profil utilisateur ouvert : informations, sécurité, préférences.")} type="button">Profil & préférences</button>
          <button onClick={() => onAction("Gestion des sessions active : appareil courant, historique, MFA.")} type="button">Sécurité du compte</button>
          <button onClick={() => onAction("Centre d'aide contextuel ouvert.")} type="button">Aide & support</button>
          <button className="danger" onClick={onLogout} type="button">Se déconnecter</button>
        </div>
      ) : null}
    </aside>
  );
}

function formatCompactCurrency(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2).replace(".", ",")} Md`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }

  return value.toLocaleString("fr-FR");
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function formatSignedPercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1).replace(".", ",")}%`;
}

function parseNumericValue(value: string) {
  return Number(value.replace(/\s/g, "").replace(",", ".")) || 0;
}

function productVisualClass(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("paracétamol") || normalized.includes("masque") || normalized.includes("gant")) {
    return "product-visual-medical";
  }

  if (normalized.includes("huile") || normalized.includes("ampoule")) {
    return "product-visual-industrial";
  }

  if (normalized.includes("ciment") || normalized.includes("fer")) {
    return "product-visual-material";
  }

  if (normalized.includes("riz") || normalized.includes("eau")) {
    return "product-visual-food";
  }

  return "product-visual-office";
}

function DashboardContent({
  model,
  onAction
}: {
  model: GestockViewModel;
  onAction: (message: string | null) => void;
}) {
  const ranges = ["7 jours", "30 derniers jours", "Trimestre", "Année"];
  const [activeKpiId, setActiveKpiId] = useState("stock-value");
  const [activeRange, setActiveRange] = useState("30 derniers jours");
  const [activeCategory, setActiveCategory] = useState("Matières premières");
  const [handledAlerts, setHandledAlerts] = useState<string[]>([]);

  const dashboardFacts = {
    stockValue: 1_248_540_000,
    previousStockValue: 1_109_812_000,
    availableUnits: 2738,
    totalUnits: 2964,
    stockoutReferences: 56,
    previousStockoutReferences: 61,
    openOrders: 32,
    openOrdersValue: 12_500_000,
    activeArticles: 2356,
    previousActiveArticles: 2229
  };

  const computedKpis = [
    {
      id: "stock-value",
      label: "Valeur totale du stock",
      value: formatCompactCurrency(dashboardFacts.stockValue),
      trend: `${formatSignedPercent(percentChange(dashboardFacts.stockValue, dashboardFacts.previousStockValue))} vs mois précédent`,
      icon: "▤",
      tone: "positive",
      formula: "Somme des quantités disponibles x coût moyen pondéré par article et entrepôt.",
      details: [
        ["Dakar", "456 780 000 FCFA"],
        ["Thiès", "234 560 000 FCFA"],
        ["Kaolack", "198 430 000 FCFA"]
      ]
    },
    {
      id: "availability",
      label: "Taux de disponibilité",
      value: `${((dashboardFacts.availableUnits / dashboardFacts.totalUnits) * 100).toFixed(1).replace(".", ",")}%`,
      trend: "+ 4,2% vs mois précédent",
      icon: "⌁",
      tone: "positive",
      formula: "Articles disponibles / articles demandés sur la période active.",
      details: [
        ["Disponible", `${dashboardFacts.availableUnits} unités`],
        ["Total demandé", `${dashboardFacts.totalUnits} unités`],
        ["Écart", `${dashboardFacts.totalUnits - dashboardFacts.availableUnits} unités`]
      ]
    },
    {
      id: "stockouts",
      label: "Ruptures de stock",
      value: String(dashboardFacts.stockoutReferences),
      trend: `${dashboardFacts.previousStockoutReferences - dashboardFacts.stockoutReferences} références récupérées`,
      icon: "△",
      tone: "danger",
      formula: "Références actives avec stock disponible inférieur ou égal à zéro.",
      details: [
        ["Riz 25kg", "0 unité"],
        ["Réactifs QC", "0 unité"],
        ["Pièces critiques", "4 références"]
      ]
    },
    {
      id: "orders",
      label: "Commandes ouvertes",
      value: String(dashboardFacts.openOrders),
      trend: `${formatCompactCurrency(dashboardFacts.openOrdersValue)} engagés`,
      icon: "□",
      tone: "neutral",
      formula: "Commandes fournisseurs non clôturées, tous entrepôts actifs confondus.",
      details: [
        ["Approuvées", "14 commandes"],
        ["Envoyées", "11 commandes"],
        ["En retard", "7 commandes"]
      ]
    },
    {
      id: "active-items",
      label: "Articles actifs",
      value: dashboardFacts.activeArticles.toLocaleString("fr-FR"),
      trend: `${formatSignedPercent(percentChange(dashboardFacts.activeArticles, dashboardFacts.previousActiveArticles))} vs mois précédent`,
      icon: "◇",
      tone: "positive",
      formula: "Articles opérationnels actifs, hors brouillons catalogue et articles archivés.",
      details: [
        ["Médicaments", "624 articles"],
        ["Consommables", "518 articles"],
        ["Matériaux", "402 articles"]
      ]
    }
  ];

  const selectedKpi = computedKpis.find((kpi) => kpi.id === activeKpiId) ?? computedKpis[0];
  const categoryDistribution = [
    ["Matières premières", "32%", "1"],
    ["Produits finis", "28%", "2"],
    ["Consommables", "20%", "3"],
    ["Pièces de rechange", "12%", "4"],
    ["Autres", "8%", "5"]
  ];

  const nextRange = () => {
    const currentIndex = ranges.indexOf(activeRange);
    const next = ranges[(currentIndex + 1) % ranges.length];
    setActiveRange(next);
    onAction(`Période dashboard changée : ${next}. Les KPI sont recalculés en simulation.`);
  };

  return (
    <>
      <section className="kpi-grid">
        {computedKpis.map((kpi) => (
          <button
            className={`kpi-card ${kpi.id === activeKpiId ? "active" : ""}`}
            key={kpi.id}
            onClick={() => setActiveKpiId(kpi.id)}
            type="button"
          >
            <small>{kpi.label}</small>
            <strong>{kpi.value}</strong>
            <span className={kpi.tone}>{kpi.trend}</span>
            <i>{kpi.icon}</i>
          </button>
        ))}
      </section>

      <section className="dashboard-insight-panel">
        <div>
          <small>KPI actif</small>
          <strong>{selectedKpi.label}</strong>
          <p>{selectedKpi.formula}</p>
        </div>
        <div className="insight-breakdown">
          {selectedKpi.details.map(([label, value]) => (
            <span key={label}>
              <small>{label}</small>
              <b>{value}</b>
            </span>
          ))}
        </div>
      </section>

      <section className="analytics-grid">
        <article className="chart-card wide">
          <header>
            <strong>Évolution de la valeur du stock</strong>
            <button onClick={nextRange} type="button">{activeRange} ⌄</button>
          </header>
          <div className="line-chart">
            <span style={{ left: "4%", bottom: "26%" }} />
            <span style={{ left: "12%", bottom: "42%" }} />
            <span style={{ left: "21%", bottom: "35%" }} />
            <span style={{ left: "30%", bottom: "53%" }} />
            <span style={{ left: "39%", bottom: "43%" }} />
            <span style={{ left: "49%", bottom: "64%" }} />
            <span style={{ left: "59%", bottom: "82%" }} />
            <span style={{ left: "69%", bottom: "83%" }} />
            <span style={{ left: "79%", bottom: "95%" }} />
            <span style={{ left: "89%", bottom: "88%" }} />
            <span style={{ left: "97%", bottom: "100%" }} />
          </div>
          <p className="chart-caption">
            Série calculée depuis les valorisations journalières simulées. Point haut : 1,31 Md FCFA.
          </p>
        </article>

        <article className="chart-card donut-card">
          <strong>Répartition du stock par catégorie</strong>
          <div className="donut-row">
            <div className="donut" />
            <ul>
              {categoryDistribution.map(([label, percent, colorIndex]) => (
                <li key={label}>
                  <button
                    className={activeCategory === label ? "active" : ""}
                    onClick={() => setActiveCategory(label)}
                    type="button"
                  >
                    <span className={`category-dot category-dot-${colorIndex}`} />
                    {label}
                    <b>{percent}</b>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <small>Catégorie sélectionnée : {activeCategory}</small>
        </article>

        <article className="chart-card alerts-card">
          <strong>Alertes critiques</strong>
          {model.alerts.slice(0, 4).map((alert, index) => (
            <p className={handledAlerts.includes(alert.id) ? "handled" : ""} key={alert.id}>
              <span>{["△", "⚠", "◇", "↻"][index]}</span>
              {alert.title}
              <b>{[12, 28, 9, 7][index]}</b>
              <button
                onClick={() => {
                  setHandledAlerts((current) =>
                    current.includes(alert.id) ? current : [...current, alert.id]
                  );
                  onAction(`Alerte prise en charge : ${alert.title}`);
                }}
                type="button"
              >
                Traiter
              </button>
            </p>
          ))}
          <button onClick={() => onAction("Centre d'alertes ouvert depuis le dashboard.")} type="button">Voir toutes les alertes</button>
        </article>
      </section>

      <section className="tables-grid">
        <InteractiveDataTable
          className="large"
          columns={["Date", "Type", "Référence", "Article", "Entrepôt", "Quantité", "Utilisateur"]}
          onAction={onAction}
          rows={recentMovements}
          title="Mouvements récents"
        />
        <InteractiveDataTable
          columns={["Entrepôt", "Valeur (FCFA)", "Disponibilité"]}
          onAction={onAction}
          rows={warehouseStock}
          title="Stock par entrepôt"
        />
        <InteractiveDataTable
          columns={["Article", "Valeur (FCFA)", "% Total"]}
          onAction={onAction}
          rows={topArticles}
          title="Top 5 articles par valeur"
        />
      </section>

      <section className="indicator-strip">
        {[
          ["Rotation des stocks", "4,2", "fois"],
          ["Délai moyen d'approvisionnement", "6,4", "jours"],
          ["Taux de service", "96,8%", ""],
          ["Taux d'occupation", "78,3%", ""],
          ["Coût de possession", "4,8%", "de la valeur du stock"]
        ].map(([label, value, suffix]) => (
          <button key={label} onClick={() => onAction(`Analyse ${label} ouverte en drill-down mock.`)} type="button">
            <small>{label}</small>
            <strong>{value}</strong>
            <span>{suffix}</span>
            <em>+ 0,6 vs mois précédent</em>
          </button>
        ))}
      </section>
    </>
  );
}

function ArticlesModule({
  article,
  onAction,
  onBack,
  onOpenArticle
}: {
  article: ArticleRecord | null;
  onAction: (message: string | null) => void;
  onBack: () => void;
  onOpenArticle: (article: ArticleRecord) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "Tous">("Tous");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [actionPanel, setActionPanel] = useState<"create" | "import" | "scan" | "columns" | null>(null);
  const [draftArticles, setDraftArticles] = useState<ArticleRecord[]>([]);
  const articles = [...draftArticles, ...articleItems];
  const categories = ["Toutes", ...Array.from(new Set(articles.map((item) => item.category)))];
  const filteredArticles = articles.filter((item) => {
    const matchesQuery = [item.reference, item.designation, item.barcode, item.category, item.location]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesStatus = statusFilter === "Tous" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "Toutes" || item.category === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });
  const selectedArticles = articles.filter((item) => selectedReferences.includes(item.reference));
  const stockValue = filteredArticles.reduce(
    (total, item) => total + parseNumericValue(item.averagePrice) * parseNumericValue(item.stock),
    0
  );
  const articleKpis: Array<[string, string, string, string, ArticleStatus | "Tous"]> = [
    [String(articles.length), "Articles actifs", "◇", "green", "Tous"],
    [String(articles.filter((item) => item.status === "Sous stock").length), "Sous stock", "△", "orange", "Sous stock"],
    [String(articles.filter((item) => item.status === "Rupture").length), "Rupture de stock", "△", "red", "Rupture"],
    ["3", "Prochains à péremption", "□", "purple", "Tous"],
    [`${Math.round((articles.filter((item) => item.status === "Actif").length / articles.length) * 100)}%`, "Couverture active", "♢", "green", "Actif"]
  ];

  const toggleReference = (reference: string) => {
    setSelectedReferences((current) =>
      current.includes(reference)
        ? current.filter((item) => item !== reference)
        : [...current, reference]
    );
  };

  const toggleAllVisible = () => {
    const visibleReferences = filteredArticles.map((item) => item.reference);
    const allVisibleSelected = visibleReferences.every((reference) => selectedReferences.includes(reference));
    setSelectedReferences((current) =>
      allVisibleSelected
        ? current.filter((reference) => !visibleReferences.includes(reference))
        : Array.from(new Set([...current, ...visibleReferences]))
    );
  };

  const cycleCategory = () => {
    const currentIndex = categories.indexOf(categoryFilter);
    setCategoryFilter(categories[(currentIndex + 1) % categories.length]);
  };

  if (article) {
    return (
      <ArticleDetail
        article={article}
        onAction={onAction}
        onBack={onBack}
      />
    );
  }

  return (
    <section className="articles-page">
      <header className="articles-header">
        <div>
          <h1>Articles</h1>
          <p>Gérez l'ensemble de vos articles et produits avec données, filtres et actions opérationnelles.</p>
        </div>
        <div>
          <button onClick={() => setActionPanel(actionPanel === "import" ? null : "import")} type="button">
            ⇩ Importer des articles
          </button>
          <button className="primary" onClick={() => setActionPanel(actionPanel === "create" ? null : "create")} type="button">
            + Nouvel article
          </button>
        </div>
      </header>

      <section className="article-kpis">
        {articleKpis.map(([value, label, icon, tone, nextStatus]) => (
          <button
            className={statusFilter === nextStatus ? "active" : ""}
            key={label}
            onClick={() => setStatusFilter(nextStatus)}
            type="button"
          >
            <strong>{value}</strong>
            <small>{label}</small>
            <span className={tone}>{icon}</span>
          </button>
        ))}
      </section>

      <section className="article-live-summary">
        <div>
          <small>Résultat actif</small>
          <strong>{filteredArticles.length} article(s)</strong>
          <span>{statusFilter} · {categoryFilter}</span>
        </div>
        <div>
          <small>Valorisation filtrée</small>
          <strong>{formatCompactCurrency(stockValue)} FCFA</strong>
          <span>Prix moyen x stock disponible</span>
        </div>
        <div>
          <small>Sélection</small>
          <strong>{selectedReferences.length} ligne(s)</strong>
          <span>{selectedArticles.map((item) => item.reference).slice(0, 2).join(", ") || "Aucune sélection"}</span>
        </div>
        <div className="article-bulk-actions">
          <button disabled={selectedReferences.length === 0} onClick={() => onAction(`${selectedReferences.length} article(s) envoyés en impression étiquettes.`)} type="button">
            Imprimer sélection
          </button>
          <button disabled={selectedReferences.length === 0} onClick={() => onAction(`${selectedReferences.length} article(s) préparés pour export Excel.`)} type="button">
            Exporter
          </button>
        </div>
      </section>

      {actionPanel ? (
        <ArticleActionPanel
          articles={articles}
          mode={actionPanel}
          onAction={onAction}
          onClose={() => setActionPanel(null)}
          onCreateArticle={(nextArticle) => {
            setDraftArticles((current) => [nextArticle, ...current]);
            setActionPanel(null);
            onAction(`Article ${nextArticle.reference} créé en mode mock et ajouté à la liste.`);
          }}
          onImportArticles={(nextArticles) => {
            setDraftArticles((current) => [...nextArticles, ...current]);
            setActionPanel(null);
            onAction(`${nextArticles.length} articles importés en mode mock après mapping des colonnes.`);
          }}
          onOpenArticle={onOpenArticle}
        />
      ) : null}

      <section className="article-list-card">
        <div className="article-filters">
          <label>
            <span>⌕</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un article, une référence, un code-barres..."
              value={query}
            />
          </label>
          <button onClick={cycleCategory} type="button">Catégorie : {categoryFilter} ⌄</button>
          <button onClick={() => setStatusFilter(statusFilter === "Tous" ? "Actif" : statusFilter === "Actif" ? "Sous stock" : statusFilter === "Sous stock" ? "Rupture" : "Tous")} type="button">
            Statut : {statusFilter} ⌄
          </button>
          <button onClick={() => setActionPanel(actionPanel === "scan" ? null : "scan")} type="button">▥ Scanner</button>
          <button onClick={() => {
            setQuery("");
            setStatusFilter("Tous");
            setCategoryFilter("Toutes");
            setSelectedReferences([]);
          }} type="button">↻ Réinitialiser</button>
          <div>
            <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} type="button">▦</button>
            <button className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")} type="button">☷</button>
            <button className={actionPanel === "columns" ? "active" : ""} onClick={() => setActionPanel(actionPanel === "columns" ? null : "columns")} type="button">⚙</button>
          </div>
        </div>

        {viewMode === "table" ? (
          <table className="articles-table">
            <thead>
              <tr>
                <th><input aria-label="Sélectionner tous les articles visibles" checked={filteredArticles.length > 0 && filteredArticles.every((item) => selectedReferences.includes(item.reference))} onChange={toggleAllVisible} type="checkbox" /></th>
                <th>Référence ↕</th>
                <th>Désignation</th>
                <th>Catégorie</th>
                <th>Unité</th>
                <th>Prix moyen (FCFA)</th>
                <th>Stock disponible</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((item) => (
                <tr className={selectedReferences.includes(item.reference) ? "selected" : ""} key={item.reference}>
                  <td><input aria-label={`Sélectionner ${item.reference}`} checked={selectedReferences.includes(item.reference)} onChange={() => toggleReference(item.reference)} type="checkbox" /></td>
                  <td>
                    <button className="article-reference" onClick={() => onOpenArticle(item)} type="button">
                      <span>{item.icon}</span>
                      <b>{item.reference}</b>
                    </button>
                  </td>
                  <td>
                    <div className="article-product-cell">
                      <ProductVisual label={item.icon} name={item.designation} />
                      <span>{item.designation}<small>{item.barcode}</small></span>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.unit}</td>
                  <td>{item.averagePrice}</td>
                  <td>{item.stock}</td>
                  <td><em className={`status-pill ${statusClass(item.status)}`}>{item.status}</em></td>
                  <td>
                    <div className="row-actions">
                      <button aria-label="Voir" onClick={() => onOpenArticle(item)} type="button">⊙</button>
                      <button aria-label="Modifier" onClick={() => setActionPanel("create")} type="button">✎</button>
                      <button aria-label="Plus" onClick={() => onAction(`Menu actions de ${item.reference} : dupliquer, archiver, QR, lots.`)} type="button">…</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="article-grid-view">
            {filteredArticles.map((item) => (
              <article className={selectedReferences.includes(item.reference) ? "selected" : ""} key={item.reference}>
                <ProductVisual label={item.icon} name={item.designation} />
                <div>
                  <em className={`status-pill ${statusClass(item.status)}`}>{item.status}</em>
                  <h3>{item.designation}</h3>
                  <p>{item.reference} · {item.location}</p>
                  <strong>{item.stock} {item.unit}(s)</strong>
                </div>
                <footer>
                  <button onClick={() => toggleReference(item.reference)} type="button">
                    {selectedReferences.includes(item.reference) ? "Retirer" : "Sélectionner"}
                  </button>
                  <button onClick={() => onOpenArticle(item)} type="button">Ouvrir</button>
                </footer>
              </article>
            ))}
          </div>
        )}

        <footer className="article-pagination">
          <span>Affichage de 1 à {filteredArticles.length} sur {articles.length} articles mockés</span>
          <div>
            <button type="button">«</button>
            <button type="button">‹</button>
            <button className="active" type="button">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <span>...</span>
            <button type="button">236</button>
            <button type="button">›</button>
            <button type="button">»</button>
          </div>
          <button type="button">10 / page ⌄</button>
        </footer>
      </section>
    </section>
  );
}

function ArticleActionPanel({
  articles,
  mode,
  onAction,
  onClose,
  onCreateArticle,
  onImportArticles,
  onOpenArticle
}: {
  articles: ArticleRecord[];
  mode: "create" | "import" | "scan" | "columns";
  onAction: (message: string | null) => void;
  onClose: () => void;
  onCreateArticle: (article: ArticleRecord) => void;
  onImportArticles: (articles: ArticleRecord[]) => void;
  onOpenArticle: (article: ArticleRecord) => void;
}) {
  const [scanValue, setScanValue] = useState("6161101234567");
  const scannedArticle = articles.find((item) => item.barcode === scanValue.trim());
  const importPreview: ArticleRecord[] = [
    {
      reference: "THERMO-IR",
      designation: "Thermomètre infrarouge",
      category: "Médicaments",
      family: "Dispositifs médicaux",
      unit: "Pièce",
      averagePrice: "18 500",
      stock: "64",
      status: "Actif",
      barcode: "6161111234567",
      location: "Dakar / MED-09",
      icon: "IR"
    },
    {
      reference: "BUREAU-140",
      designation: "Bureau administratif 140cm",
      category: "Mobilier",
      family: "Bureau",
      unit: "Pièce",
      averagePrice: "85 000",
      stock: "12",
      status: "Sous stock",
      barcode: "6161112234567",
      location: "Abidjan / MOB-02",
      icon: "DESK"
    }
  ];

  return (
    <section className="article-action-panel">
      <header>
        <div>
          <strong>
            {mode === "create" ? "Créer / modifier un article" : mode === "import" ? "Import Articles CSV / Excel" : mode === "scan" ? "Scanner code-barres / QR" : "Colonnes & affichage"}
          </strong>
          <small>Workflow mock fonctionnel, prêt à connecter à l'API.</small>
        </div>
        <button onClick={onClose} type="button">×</button>
      </header>

      {mode === "create" ? (
        <form
          className="article-form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const reference = String(form.get("reference") || "").trim().toUpperCase();
            const designation = String(form.get("designation") || "").trim();
            const category = String(form.get("category") || "Consommables");

            if (!reference || !designation) {
              onAction("Création impossible : référence et désignation sont obligatoires.");
              return;
            }

            onCreateArticle({
              reference,
              designation,
              category,
              family: String(form.get("family") || "Famille mock"),
              unit: String(form.get("unit") || "Pièce"),
              averagePrice: String(form.get("averagePrice") || "0"),
              stock: String(form.get("stock") || "0"),
              status: "Actif",
              barcode: String(form.get("barcode") || `616${Date.now().toString().slice(-10)}`),
              location: String(form.get("location") || "Dakar / NEW-01"),
              icon: reference.slice(0, 4)
            });
          }}
        >
          <label><span>Référence *</span><input name="reference" placeholder="ex. GEL-HYDRO-500" /></label>
          <label><span>Désignation *</span><input name="designation" placeholder="Gel hydroalcoolique 500ml" /></label>
          <label><span>Catégorie</span><input name="category" defaultValue="Consommables" /></label>
          <label><span>Famille</span><input name="family" defaultValue="Hygiène" /></label>
          <label><span>Unité</span><input name="unit" defaultValue="Flacon" /></label>
          <label><span>Prix moyen</span><input name="averagePrice" defaultValue="1 750" /></label>
          <label><span>Stock initial</span><input name="stock" defaultValue="240" /></label>
          <label><span>Code-barres</span><input name="barcode" defaultValue="6161113234567" /></label>
          <label className="wide"><span>Emplacement</span><input name="location" defaultValue="Dakar / HYG-01" /></label>
          <div className="article-toggle-row">
            <label><input defaultChecked type="checkbox" /> Article stockable</label>
            <label><input defaultChecked type="checkbox" /> Suivi code-barres</label>
            <label><input type="checkbox" /> Gestion par lot</label>
          </div>
          <footer>
            <button onClick={onClose} type="button">Annuler</button>
            <button className="primary" type="submit">Sauvegarder l'article</button>
          </footer>
        </form>
      ) : null}

      {mode === "import" ? (
        <div className="article-import-panel">
          <div className="upload-zone">
            <strong>Déposer un fichier CSV / Excel</strong>
            <small>Simulation : le fichier est validé, mappé puis prévisualisé.</small>
            <button onClick={() => onAction("Fichier articles_mock.xlsx chargé en mémoire mock.")} type="button">Choisir un fichier</button>
          </div>
          <ArticleMiniTable
            columns={["Colonne fichier", "Champ GESTOCK", "Statut"]}
            rows={[
              ["SKU", "Référence", "OK"],
              ["Product name", "Désignation", "OK"],
              ["Warehouse", "Emplacement", "À confirmer"]
            ]}
          />
          <footer>
            <button onClick={() => onAction("Erreurs d'import prévisualisées : 1 emplacement à confirmer.")} type="button">Voir erreurs</button>
            <button className="primary" onClick={() => onImportArticles(importPreview)} type="button">Importer 2 lignes propres</button>
          </footer>
        </div>
      ) : null}

      {mode === "scan" ? (
        <div className="article-scan-panel">
          <label>
            <span>Code EAN13 / QR / DataMatrix</span>
            <input onChange={(event) => setScanValue(event.target.value)} value={scanValue} />
          </label>
          <div className="scanner-frame">
            <span />
            <b>{scanValue || "Scanner..."}</b>
          </div>
          {scannedArticle ? (
            <article>
              <ProductVisual label={scannedArticle.icon} name={scannedArticle.designation} />
              <div>
                <strong>{scannedArticle.designation}</strong>
                <small>{scannedArticle.reference} · {scannedArticle.location}</small>
                <em className={`status-pill ${statusClass(scannedArticle.status)}`}>{scannedArticle.status}</em>
              </div>
              <button onClick={() => onOpenArticle(scannedArticle)} type="button">Ouvrir la fiche</button>
            </article>
          ) : (
            <p>Aucun article trouvé pour ce code. Vous pouvez créer une nouvelle fiche depuis ce scan.</p>
          )}
        </div>
      ) : null}

      {mode === "columns" ? (
        <div className="article-columns-panel">
          {["Photo", "Référence", "Désignation", "Catégorie", "Prix moyen", "Stock", "Statut", "Actions"].map((column) => (
            <label key={column}>
              <input defaultChecked type="checkbox" />
              <span>{column}</span>
            </label>
          ))}
          <button onClick={() => onAction("Préférence de colonnes sauvegardée pour cet utilisateur.")} type="button">Sauvegarder l'affichage</button>
        </div>
      ) : null}
    </section>
  );
}

function ArticleDetail({
  article,
  onAction,
  onBack
}: {
  article: ArticleRecord;
  onAction: (message: string | null) => void;
  onBack: () => void;
}) {
  const articleTabs = [
    "Général",
    "Logistique",
    "Stock",
    "Identification",
    "Fournisseurs",
    "Financier",
    "Lots & Séries",
    "Documents",
    "Historique"
  ];
  const [activeTab, setActiveTab] = useState(articleTabs[0]);

  return (
    <section className="article-detail-page">
      <div className="article-breadcrumb">
        <button onClick={onBack} type="button">Articles</button>
        <span>›</span>
        <strong>Détail de l'article</strong>
      </div>

      <header className="article-detail-header">
        <ProductVisual label={article.icon} name={article.designation} />
        <div className="article-identity">
          <em className={`status-pill ${statusClass(article.status)}`}>{article.status}</em>
          <h1>{article.designation}</h1>
          <button onClick={() => onAction("Article ajouté aux favoris.")} type="button">☆</button>
          <button onClick={() => onAction("Menu contextuel article ouvert.")} type="button">⋮</button>
          <dl>
            <div>
              <dt>Référence</dt>
              <dd>{article.reference}</dd>
            </div>
            <div>
              <dt>Code-barres (EAN13)</dt>
              <dd className="barcode-value">{article.barcode}<span aria-hidden="true" /></dd>
            </div>
            <div>
              <dt>Catégorie</dt>
              <dd>{article.category}</dd>
            </div>
            <div>
              <dt>Unité de vente</dt>
              <dd><button onClick={() => onAction("Sélecteur unité de vente ouvert.")} type="button">{article.unit} (20) ⌄</button></dd>
            </div>
          </dl>
          <p>
            Analgésique et antipyrétique indiqué dans le traitement symptomatique des douleurs légères à modérées et/ou de la fièvre.
          </p>
          <div className="article-tags">
            <span>Antipyrétique</span>
            <span>Analgésique</span>
            <span>OTC</span>
          </div>
        </div>
        <div className="article-detail-actions">
          <button onClick={() => onAction("Impression étiquette prête : code-barres EAN13 et QR de traçabilité.")} type="button">▦ Imprimer étiquette</button>
          <button onClick={() => onAction("Impression POS préparée.")} type="button">▤ Imprimer POS</button>
          <button onClick={() => onAction("QR Code généré en mock pour l'article PARA-500.")} type="button">▦ Générer QR Code</button>
          <button className="primary" onClick={() => onAction("Mode modification article ouvert.")} type="button">✎ Modifier</button>
        </div>
      </header>

      <div className="article-detail-grid">
        <article className="article-tabs-card">
          <nav className="article-tabs">
            {articleTabs.map((tab) => (
              <button
                className={tab === activeTab ? "active" : ""}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </nav>

          <ArticleTabContent activeTab={activeTab} article={article} onAction={onAction} />
        </article>

        <aside className="article-side-panel">
          <article className="stock-preview">
            <header>
              <strong>Aperçu du stock</strong>
              <button onClick={() => onAction("Ouverture du détail temps réel du stock.")} type="button">Voir le détail ›</button>
            </header>
            <div>
              {[
                ["Stock disponible", "2 500", "Boîtes", "green"],
                ["Stock réservé", "350", "Boîtes", "blue"],
                ["Stock bloqué", "120", "Boîtes", "orange"],
                ["Stock total", "2 970", "Boîtes", "dark"]
              ].map(([label, value, unit, tone]) => (
                <section key={label}>
                  <small>{label}</small>
                  <b className={tone}>{value}</b>
                  <span>{unit}</span>
                </section>
              ))}
            </div>
            <p>Dernière mise à jour : 31/05/2024 14:32 <button onClick={() => onAction("Aperçu stock temps réel actualisé en mock.")} type="button">↻ Actualiser</button></p>
          </article>

          <SideCard
            title="Informations commerciales"
            rows={[
              ["Prix d'achat moyen", "850 FCFA"],
              ["Prix de vente (unitaire)", "1 250 FCFA"],
              ["TVA", "18%"],
              ["Marge brute", "47,1%"],
              ["Code douanier", "30049000"],
              ["Pays d'origine", "France"],
              ["Fournisseur principal", "PHARMA CI"]
            ]}
          />

          <article className="quick-article-actions">
            <strong>Actions rapides</strong>
            {[
              "Créer une entrée de stock",
              "Créer une sortie de stock",
              "Transférer le stock",
              "Ajuster le stock",
              "Dupliquer l'article",
              "Désactiver l'article"
            ].map((action) => (
              <button className={action.includes("Désactiver") ? "danger" : ""} key={action} onClick={() => onAction(`${action} : workflow mock prêt.`)} type="button">
                {action}
              </button>
            ))}
          </article>

          <article className="article-warning">
            <strong>Alertes</strong>
            <p>Péremption la plus proche : Lot LOT-240501</p>
            <span>Expire le 15/08/2024 (75 jours)</span>
            <button onClick={() => onAction("Liste des lots et péremptions ouverte en mock.")} type="button">Voir tous les lots</button>
          </article>
        </aside>
      </div>

      <footer className="article-audit">
        Créé le 15/01/2024 par Amadou DIOP
        <span>Dernière modification le 31/05/2024 à 14:32 par Fatou NDIAYE</span>
      </footer>
    </section>
  );
}

function ArticleTabContent({
  activeTab,
  article,
  onAction
}: {
  activeTab: string;
  article: ArticleRecord;
  onAction: (message: string | null) => void;
}) {
  if (activeTab === "Général") {
    return (
      <div className="article-info-columns">
        <section>
          <h2>Informations générales</h2>
          <InfoRows
            rows={[
              ["Référence interne", article.reference],
              ["Désignation", article.designation],
              ["Description détaillée", "Analgésique et antipyrétique indiqué dans le traitement symptomatique des douleurs légères à modérées et/ou de la fièvre."],
              ["Catégorie", "Médicaments > Analgiques"],
              ["Famille", article.family],
              ["Marque", "BIOPHARMA"],
              ["Laboratoire", "BIOPHARMA"],
              ["Statut", article.status],
              ["Image principale", "packaging-para-500.png"]
            ]}
          />
        </section>
        <section>
          <h2>Images</h2>
          <div className="article-images">
            <ProductVisual label="PARA" name="Paracétamol" />
            <ProductVisual label="TAB" name="Blister" />
            <ProductVisual label="BOX" name="Boîte" />
            <button onClick={() => onAction("Ajout d'image produit ouvert.")} type="button">＋</button>
          </div>
          <h2>Qualité fiche</h2>
          <div className="article-mini-metrics">
            {[
              ["Complétude", "96%"],
              ["Documents", "4"],
              ["Dernière revue", "31/05/2024"]
            ].map(([label, value]) => (
              <span key={label}><small>{label}</small><b>{value}</b></span>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "Logistique") {
    return (
      <div className="article-info-columns">
        <section>
          <h2>Conditionnement & dimensions</h2>
          <InfoRows
            rows={[
              ["Unité de base", "Boîte"],
              ["Contenu de l'unité", "20 comprimés"],
              ["Unité de vente", "Boîte (20)"],
              ["Unité d'achat", "Carton (50 boîtes)"],
              ["Poids net", "0,050 kg"],
              ["Poids brut", "0,062 kg"],
              ["Volume", "0,00012 m³"],
              ["Dimensions", "12 x 8 x 3 cm"]
            ]}
          />
        </section>
        <section>
          <h2>Palettes, conservation & transport</h2>
          <InfoRows
            rows={[
              ["Conditionnement", "Boîte en carton"],
              ["Cartons par palette", "80"],
              ["Boîtes par palette", "4 000"],
              ["Température conservation", "Ambiante"],
              ["Plage température", "15°C - 30°C"],
              ["Transport", "Sec / non dangereux"],
              ["Fragilité", "Standard"],
              ["Durée de vie", "36 mois"]
            ]}
          />
        </section>
      </div>
    );
  }

  if (activeTab === "Stock") {
    return (
      <div className="article-tab-stack">
        <section className="article-mini-metrics">
          {[
            ["Stock min", "500 boîtes"],
            ["Stock max", "4 500 boîtes"],
            ["Point commande", "850 boîtes"],
            ["Réapprovisionnement", "Automatique"]
          ].map(([label, value]) => (
            <span key={label}><small>{label}</small><b>{value}</b></span>
          ))}
        </section>
        <ArticleMiniTable
          columns={["Entrepôt", "Emplacement", "Disponible", "Réservé", "Bloqué", "Statut"]}
          rows={[
            ["Dakar", "A-12", "2 500", "350", "120", "Actif"],
            ["Thiès", "B-04", "1 000", "80", "0", "Actif"],
            ["Kaolack", "C-03", "300", "0", "0", "Sous stock"]
          ]}
        />
      </div>
    );
  }

  if (activeTab === "Identification") {
    return (
      <div className="article-info-columns">
        <section>
          <h2>Codes & identifiants</h2>
          <InfoRows
            rows={[
              ["Code-barres (EAN13)", article.barcode],
              ["Code-barres (EAN14)", "6161101234564"],
              ["DataMatrix", "01061611012345671724081510LOT240501"],
              ["QR Code", "GESTOCK://item/PARA-500"],
              ["SKU", "PARA500-BOX20"],
              ["Code interne", "ART-2024-001256"],
              ["Référence fabricant", "PARA500-BIO"]
            ]}
          />
        </section>
        <section>
          <h2>Impression & scan</h2>
          <div className="article-action-grid">
            {["Imprimer étiquette", "Imprimer POS", "Générer QR Code", "Générer DataMatrix", "Tester scan EAN13", "Associer nouveau code"].map((action) => (
              <button key={action} onClick={() => onAction(`${action} : prêt en mode mock.`)} type="button">{action}</button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "Fournisseurs") {
    return (
      <div className="article-tab-stack">
        <ArticleMiniTable
          columns={["Fournisseur", "Référence", "Prix achat", "Délai", "Performance", "Statut"]}
          rows={[
            ["PHARMA CI", "PARA500-BIO", "850 FCFA", "5 jours", "97%", "Principal"],
            ["MedEquip", "ME-PARA-500", "890 FCFA", "7 jours", "91%", "Alternatif"],
            ["Dakar Pharma", "DP-500", "910 FCFA", "4 jours", "88%", "Alternatif"]
          ]}
        />
        <section className="article-action-grid">
          {["Ajouter fournisseur", "Comparer performance", "Voir historique achats", "Créer demande prix"].map((action) => (
            <button key={action} onClick={() => onAction(`${action} : workflow fournisseur prêt.`)} type="button">{action}</button>
          ))}
        </section>
      </div>
    );
  }

  if (activeTab === "Financier") {
    return (
      <div className="article-info-columns">
        <section>
          <h2>Prix, taxes & marges</h2>
          <InfoRows
            rows={[
              ["Prix d'achat moyen", "850 FCFA"],
              ["Prix de vente unitaire", "1 250 FCFA"],
              ["TVA", "18%"],
              ["Marge brute", "47,1%"],
              ["Coût de possession", "4,8%"],
              ["Valorisation stock", "3 125 000 FCFA"]
            ]}
          />
        </section>
        <section>
          <h2>Comptabilité</h2>
          <InfoRows
            rows={[
              ["Compte stock", "311100 - Médicaments"],
              ["Compte achat", "601200 - Achats santé"],
              ["Compte vente", "701100 - Ventes articles"],
              ["Méthode valorisation", "CUMP"],
              ["Devise", "XOF"],
              ["Centre de coût", "Supply Santé"]
            ]}
          />
        </section>
      </div>
    );
  }

  if (activeTab === "Lots & Séries") {
    return (
      <div className="article-tab-stack">
        <ArticleMiniTable
          columns={["Lot/Série", "Quantité", "Expiration", "Statut", "Traçabilité", "Emplacement"]}
          rows={[
            ["LOT-240501", "720", "15/08/2024", "Actif", "Complète", "Dakar A-12"],
            ["LOT-240488", "960", "12/12/2026", "Actif", "Complète", "Thiès B-04"],
            ["LOT-240401", "120", "01/07/2024", "Quarantaine", "En contrôle", "Dakar Q-02"]
          ]}
        />
        <section className="article-action-grid">
          {["Tracer lot", "Mettre en quarantaine", "Créer rappel produit", "Voir péremptions"].map((action) => (
            <button key={action} onClick={() => onAction(`${action} : workflow lot prêt.`)} type="button">{action}</button>
          ))}
        </section>
      </div>
    );
  }

  if (activeTab === "Documents") {
    return (
      <div className="article-info-columns">
        <section>
          <h2>Documents associés</h2>
          <div className="document-list">
            {["Fiche technique.pdf", "Certificat d'analyse.pdf", "Notice utilisation.pdf", "Autorisation mise sur marché.pdf"].map((document, index) => (
              <button key={document} onClick={() => onAction(`${document} prêt pour téléchargement mock.`)} type="button">
                <span>▣ {document}</span>
                <small>{[245, 320, 512, 780][index]} KB</small>
                <small>v{index + 1}.0</small>
                <b>⇩</b>
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>OCR & versions</h2>
          <div className="article-action-grid">
            {["Ajouter document", "Lancer OCR", "Comparer versions", "Signer document", "Archiver version"].map((action) => (
              <button key={action} onClick={() => onAction(`${action} : document workflow prêt.`)} type="button">{action}</button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="article-tab-stack">
      <ArticleMiniTable
        columns={["Date", "Type", "Action", "Acteur", "Canal", "Détail"]}
        rows={[
          ["31/05/2024 14:32", "Modification", "Prix de vente mis à jour", "Fatou NDIAYE", "Web", "1 200 → 1 250 FCFA"],
          ["31/05/2024 09:14", "Scan", "EAN13 scanné", "Amadou DIOP", "Mobile", article.barcode],
          ["30/05/2024 17:40", "Mouvement", "Réception stock", "Nawa Sarr", "Entrepôt", "+ 2 500 boîtes"],
          ["12/01/2024 10:02", "Document", "Fiche technique ajoutée", "Admin", "Web", "v1.0"]
        ]}
      />
    </div>
  );
}

function ArticleMiniTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <table className="article-mini-table">
      <thead>
        <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join("-")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function CatalogueModule({
  onAction,
  onBack,
  onOpenProduct,
  product
}: {
  onAction: (message: string | null) => void;
  onBack: () => void;
  onOpenProduct: (product: CatalogProduct) => void;
  product: CatalogProduct | null;
}) {
  if (product) {
    return (
      <CatalogProductDetail
        onAction={onAction}
        onBack={onBack}
        product={product}
      />
    );
  }

  return (
    <section className="catalogue-page">
      <header className="catalogue-header">
        <div>
          <h1>Catalogue</h1>
          <p>Master Data Management produit : produits maîtres, variantes, attributs, classifications et modèles.</p>
        </div>
        <div>
          <button onClick={() => onAction("Import référentiel Catalogue ouvert : produits maîtres, attributs, familles, marques et classifications.")} type="button">
            ⇩ Importer référentiel
          </button>
          <button className="primary" onClick={() => onAction("Assistant Nouveau produit maître prêt : modèle, attributs, variantes, documents et classifications.")} type="button">
            + Nouveau produit maître
          </button>
        </div>
      </header>

      <section className="catalogue-kpis">
        {[
          ["1 284", "Produits maîtres", "▧", "blue"],
          ["342", "Variantes", "◇", "green"],
          ["86", "Catégories", "☷", "purple"],
          ["24", "Modèles d'articles", "▣", "orange"],
          ["97,8%", "Qualité référentiel", "♢", "green"]
        ].map(([value, label, icon, tone]) => (
          <article key={label}>
            <strong>{value}</strong>
            <small>{label}</small>
            <span className={tone}>{icon}</span>
          </article>
        ))}
      </section>

      <nav className="catalogue-subnav">
        {catalogSubmodules.map((submodule, index) => (
          <button
            className={index === 0 ? "active" : ""}
            key={submodule}
            onClick={() => onAction(`${submodule} prêt : écran dédié à générer dans le module Catalogue.`)}
            type="button"
          >
            {submodule}
          </button>
        ))}
      </nav>

      <section className="catalogue-grid">
        <article className="catalogue-products-card">
          <div className="catalogue-filters">
            <label>
              <span>⌕</span>
              <input placeholder="Rechercher un produit maître..." />
            </label>
            {["Famille", "Marque", "Type", "Statut", "Classification"].map((filter) => (
              <button key={filter} onClick={() => onAction(`Filtre Catalogue ${filter} activé en mode mock.`)} type="button">
                {filter} ⌄
              </button>
            ))}
            <button onClick={() => onAction("Filtres Catalogue réinitialisés.")} type="button">↻ Réinitialiser</button>
          </div>

          <table className="catalogue-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Code produit</th>
                <th>Nom produit</th>
                <th>Famille</th>
                <th>Marque</th>
                <th>Type</th>
                <th>Nb variantes</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalogProducts.map((item) => (
                <tr key={item.code}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <button className="catalogue-code" onClick={() => onOpenProduct(item)} type="button">
                      <span>{item.code.slice(4, 8)}</span>
                      <b>{item.code}</b>
                    </button>
                  </td>
                  <td>{item.name}</td>
                  <td>{item.family}</td>
                  <td>{item.brand}</td>
                  <td>{item.type}</td>
                  <td>{item.variants}</td>
                  <td><em className={`catalogue-status ${catalogStatusClass(item.status)}`}>{item.status}</em></td>
                  <td>
                    <div className="row-actions">
                      <button aria-label="Voir" onClick={() => onOpenProduct(item)} type="button">⊙</button>
                      <button aria-label="Modifier" onClick={() => onAction(`Édition du produit maître ${item.code} ouverte.`)} type="button">✎</button>
                      <button aria-label="Plus" onClick={() => onAction(`Menu MDM ${item.code} : variantes, modèle, archivage, duplication.`)} type="button">…</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <footer className="article-pagination">
            <span>Affichage de 1 à 8 sur 1.284 produits maîtres</span>
            <div>
              <button type="button">«</button>
              <button className="active" type="button">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <span>...</span>
              <button type="button">129</button>
              <button type="button">»</button>
            </div>
            <button type="button">10 / page ⌄</button>
          </footer>
        </article>

        <aside className="catalogue-side">
          <article className="catalogue-tree-card">
            <header>
              <strong>Hiérarchie catégories</strong>
              <button onClick={() => onAction("Gestion hiérarchie catégories ouverte.")} type="button">Gérer</button>
            </header>
            {categoryTree.map(([root, child, leaf]) => (
              <div className="tree-branch" key={root}>
                <b>{root}</b>
                <span>└ {child}</span>
                <small>└ {leaf}</small>
              </div>
            ))}
          </article>

          <article className="catalogue-reference-card">
            <strong>Référentiels actifs</strong>
            {[
              ["Familles", "64", "Comprimés, Sirops, Injectables"],
              ["Marques", "42", "BioPharma, Samsung, Bosch"],
              ["Attributs", "128", "Couleur, Taille, Poids, Capacité"],
              ["Classifications", "7", "GS1, UNSPSC, OHADA, ABC, XYZ"]
            ].map(([label, value, text]) => (
              <button key={label} onClick={() => onAction(`${label} : référentiel prêt en mode mock.`)} type="button">
                <span>
                  <b>{label}</b>
                  <small>{text}</small>
                </span>
                <strong>{value}</strong>
              </button>
            ))}
          </article>

          <article className="catalogue-warning">
            <strong>Qualité master data</strong>
            <p>18 produits maîtres sans classification GS1.</p>
            <p>7 variantes sans attribut obligatoire.</p>
            <button onClick={() => onAction("Rapport qualité master data ouvert.")} type="button">Corriger les anomalies</button>
          </article>
        </aside>
      </section>
    </section>
  );
}

function CatalogProductDetail({
  onAction,
  onBack,
  product
}: {
  onAction: (message: string | null) => void;
  onBack: () => void;
  product: CatalogProduct;
}) {
  return (
    <section className="catalogue-detail-page">
      <div className="article-breadcrumb">
        <button onClick={onBack} type="button">Catalogue</button>
        <span>›</span>
        <strong>Produit maître</strong>
      </div>

      <header className="catalogue-detail-header">
        <ProductVisual label={product.code.slice(4, 8)} />
        <div className="catalogue-identity">
          <em className={`catalogue-status ${catalogStatusClass(product.status)}`}>{product.status}</em>
          <h1>{product.name}</h1>
          <p>{product.categoryPath}</p>
          <dl>
            <div>
              <dt>Code produit</dt>
              <dd>{product.code}</dd>
            </div>
            <div>
              <dt>Famille</dt>
              <dd>{product.family}</dd>
            </div>
            <div>
              <dt>Marque</dt>
              <dd>{product.brand}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>{product.type}</dd>
            </div>
          </dl>
        </div>
        <div className="article-detail-actions">
          <button onClick={() => onAction("Création variante ouverte depuis le produit maître.")} type="button">◇ Créer variante</button>
          <button onClick={() => onAction("Génération article opérationnel depuis modèle Catalogue prête.")} type="button">▧ Générer article</button>
          <button onClick={() => onAction("Duplication produit maître prête.")} type="button">▤ Dupliquer</button>
          <button className="primary" onClick={() => onAction("Mode édition produit maître ouvert.")} type="button">✎ Modifier</button>
        </div>
      </header>

      <div className="catalogue-detail-grid">
        <article className="article-tabs-card">
          <nav className="article-tabs">
            {["Master data", "Attributs", "Variantes", "Modèles", "Kits & BOM", "Classifications", "Documents", "Historique"].map((tab, index) => (
              <button className={index === 0 ? "active" : ""} key={tab} onClick={() => onAction(`Onglet Catalogue ${tab} prêt à détailler.`)} type="button">
                {tab}
              </button>
            ))}
          </nav>

          <div className="catalogue-detail-content">
            <section>
              <h2>Informations master data</h2>
              <InfoRows
                rows={[
                  ["Code produit", product.code],
                  ["Nom produit", product.name],
                  ["Famille", product.family],
                  ["Marque", product.brand],
                  ["Type", product.type],
                  ["Modèle affecté", product.template],
                  ["Chemin catégorie", product.categoryPath],
                  ["Classification", product.classification],
                  ["Statut MDM", product.status]
                ]}
              />
            </section>

            <section>
              <h2>Attributs obligatoires</h2>
              <div className="attribute-grid">
                {product.attributes.map((attribute) => (
                  <span key={attribute}>{attribute}</span>
                ))}
              </div>

              <h2>Variantes</h2>
              <div className="variant-list">
                {["Rouge S", "Rouge M", "Rouge L", "Bleu M"].slice(0, Math.max(1, Math.min(product.variants, 4))).map((variant) => (
                  <button key={variant} onClick={() => onAction(`Variante ${variant} ouverte en mock.`)} type="button">
                    <span>{variant}</span>
                    <small>Attributs complets</small>
                  </button>
                ))}
              </div>

              <h2>Bibliothèque documentaire</h2>
              <div className="document-list">
                {["Fiche technique commune.pdf", "Norme classification.pdf", "Notice produit maître.pdf"].map((document, index) => (
                  <button key={document} onClick={() => onAction(`${document} prêt pour consultation.`)} type="button">
                    <span>▣ {document}</span>
                    <small>{[210, 184, 390][index]} KB</small>
                    <small>MDM</small>
                    <b>⇩</b>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </article>

        <aside className="catalogue-side">
          <SideCard
            title="Gouvernance MDM"
            rows={[
              ["Propriétaire", "Data Steward Catalogue"],
              ["Qualité données", "97,8%"],
              ["Version", "v3.2"],
              ["Dernière revue", "31/05/2024"],
              ["Workflow", "Validé"]
            ]}
          />

          <article className="catalogue-reference-card">
            <strong>Kits & nomenclatures</strong>
            {[
              ["Kit EPI", "Casque + Gants + Bottes"],
              ["Kit Bureau", "PC + Clavier + Souris"],
              ["BOM Table", "Plateau + Pieds"],
              ["BOM PC", "Carte mère + RAM + SSD"]
            ].map(([label, text]) => (
              <button key={label} onClick={() => onAction(`${label} ouvert en mock.`)} type="button">
                <span>
                  <b>{label}</b>
                  <small>{text}</small>
                </span>
                <strong>›</strong>
              </button>
            ))}
          </article>

          <article className="quick-article-actions">
            <strong>Actions Catalogue</strong>
            {[
              "Créer une catégorie enfant",
              "Ajouter un attribut",
              "Créer une variante",
              "Associer un modèle",
              "Lier une classification",
              "Archiver le produit maître"
            ].map((action) => (
              <button className={action.includes("Archiver") ? "danger" : ""} key={action} onClick={() => onAction(`${action} : workflow Catalogue prêt.`)} type="button">
                {action}
              </button>
            ))}
          </article>
        </aside>
      </div>

      <footer className="article-audit">
        Produit maître créé le 12/01/2024 par Data Steward
        <span>Dernière modification le 31/05/2024 à 10:18 par Aminata DIOP</span>
      </footer>
    </section>
  );
}

function InfoRows({ rows }: { rows: string[][] }) {
  return (
    <dl className="info-rows">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SideCard({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <article className="side-info-card">
      <strong>{title}</strong>
      <InfoRows rows={rows} />
    </article>
  );
}

function ProductVisual({ label, name = "Produit" }: { label: string; name?: string }) {
  return (
    <div className={`product-visual ${productVisualClass(name)}`}>
      <span>{label}</span>
      <b>{name}</b>
      <small>Photo article</small>
    </div>
  );
}

function DataTable({
  className = "",
  columns,
  rows,
  title
}: {
  className?: string;
  columns: string[];
  rows: string[][];
  title: string;
}) {
  return (
    <article className={`table-card ${className}`}>
      <strong>{title}</strong>
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <button type="button">Voir tous les éléments</button>
    </article>
  );
}

function InteractiveDataTable({
  className = "",
  columns,
  onAction,
  rows,
  title
}: {
  className?: string;
  columns: string[];
  onAction: (message: string | null) => void;
  rows: string[][];
  title: string;
}) {
  return (
    <article className={`table-card ${className}`}>
      <strong>{title}</strong>
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`}>
                  {index === 0 ? (
                    <button
                      className="table-link"
                      onClick={() => onAction(`${title} : détail ${cell} ouvert en drill-down mock.`)}
                      type="button"
                    >
                      {cell}
                    </button>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => onAction(`${title} : vue complète ouverte.`)} type="button">Voir tous les éléments</button>
    </article>
  );
}

function ModuleWorkbench({
  moduleName,
  onAction,
  organization
}: {
  moduleName: string;
  onAction: (message: string | null) => void;
  organization: MockOrganizationAccess;
}) {
  const blueprint = moduleBlueprints[moduleName] ?? {
    title: moduleName,
    subtitle: `Module ${moduleName.toLowerCase()} relié au contexte de ${organization.name}.`,
    submodules: ["Vue générale", "Liste", "Détail", "Historique", "Paramètres"],
    kpis: [
      ["--", "Indicateur principal", "▧", "blue"],
      ["--", "En cours", "◷", "orange"],
      ["--", "À valider", "☑", "purple"],
      ["--", "Qualité", "♢", "green"]
    ],
    columns: ["Référence", "Objet", "Type", "Statut", "Responsable", "Échéance"],
    rows: [
      ["MOCK-001", moduleName, "Workflow", "Préparé", "Équipe GESTOCK", "À définir"],
      ["MOCK-002", `${moduleName} avancé`, "Paramétrage", "Mock", "Administrateur", "À définir"]
    ],
    primaryAction: "Créer",
    secondaryAction: "Importer",
    sideTitle: "Contexte",
    sideItems: [["Organisation", organization.name], ["Mode", "Mock"], ["Sécurité", "RBAC/RLS préparé"]]
  } satisfies ModuleBlueprint;

  return (
    <section className="module-workbench">
      <header className="module-workbench-header">
        <div>
          <h2>{blueprint.title}</h2>
          <p>{blueprint.subtitle}</p>
        </div>
        <div>
          <button onClick={() => onAction(`${blueprint.secondaryAction} ouvert dans ${blueprint.title}.`)} type="button">
            ⇩ {blueprint.secondaryAction}
          </button>
          <button className="primary" onClick={() => onAction(`${blueprint.primaryAction} ouvert dans ${blueprint.title}.`)} type="button">
            + {blueprint.primaryAction}
          </button>
        </div>
      </header>

      <nav className="module-subnav">
        {blueprint.submodules.map((submodule, index) => (
          <button
            className={index === 0 ? "active" : ""}
            key={submodule}
            onClick={() => onAction(`${blueprint.title} > ${submodule} prêt pour écran détaillé.`)}
            type="button"
          >
            {submodule}
          </button>
        ))}
      </nav>

      <section className="module-kpi-grid">
        {blueprint.kpis.map(([value, label, icon, tone]) => (
          <article key={label}>
            <strong>{value}</strong>
            <small>{label}</small>
            <span className={tone}>{icon}</span>
          </article>
        ))}
      </section>

      <div className="module-workbench-grid">
        <article className="module-table-card">
          <div className="module-table-toolbar">
            <label>
              <span>⌕</span>
              <input placeholder={`Rechercher dans ${blueprint.title.toLowerCase()}...`} />
            </label>
            <button onClick={() => onAction(`Filtres ${blueprint.title} ouverts.`)} type="button">Filtres ⌄</button>
            <button onClick={() => onAction(`Export ${blueprint.title} préparé.`)} type="button">Exporter</button>
            <button onClick={() => onAction(`Colonnes ${blueprint.title} configurables.`)} type="button">⚙</button>
          </div>

          <table>
            <thead>
              <tr>
                {blueprint.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blueprint.rows.map((row) => (
                <tr key={row.join("-")}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                  <td>
                    <div className="row-actions">
                      <button onClick={() => onAction(`Détail ${row[0]} ouvert dans ${blueprint.title}.`)} type="button">⊙</button>
                      <button onClick={() => onAction(`Édition ${row[0]} ouverte dans ${blueprint.title}.`)} type="button">✎</button>
                      <button onClick={() => onAction(`Menu actions ${row[0]} ouvert dans ${blueprint.title}.`)} type="button">…</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <aside className="module-side-card">
          <strong>{blueprint.sideTitle}</strong>
          {blueprint.sideItems.map(([label, value]) => (
            <button key={label} onClick={() => onAction(`${label} : ${value}`)} type="button">
              <span>{label}</span>
              <b>{value}</b>
            </button>
          ))}
          <div className="module-security-note">
            <small>Tenant actif</small>
            <strong>{organization.name}</strong>
            <p>Les actions sont mockées mais préparées pour RBAC, audit trail et RLS Supabase.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function SecurityStepScreen({
  onBack,
  onContinue,
  screen,
  session
}: {
  onBack: () => void;
  onContinue: () => void;
  screen: SecurityScreen;
  session: ActiveSession | null;
}) {
  const copy = {
    "first-login": {
      title: "Initialisation du compte",
      text: "Définissez votre mot de passe, confirmez vos informations et acceptez la politique de sécurité avant d'accéder à GESTOCK.",
      button: "Finaliser la première connexion"
    },
    mfa: {
      title: "Vérification MFA",
      text: "Un code de sécurité a été envoyé au canal configuré pour ce profil. En simulation, le bouton valide directement l'étape.",
      button: "Valider le code MFA"
    },
    "password-reset": {
      title: "Réinitialiser le mot de passe",
      text: "Cette page sera reliée aux emails transactionnels. Pour l'instant, elle confirme que le CTA est bien branché.",
      button: "Envoyer le lien de réinitialisation"
    },
    support: {
      title: "Support administrateur",
      text: "Demande d'accès, invitation organisation ou support de première connexion. Cette étape prépare le workflow d'assistance.",
      button: "Créer la demande support"
    },
    sso: {
      title: "Connexion SSO / Enterprise",
      text: "Préparation de l'authentification OIDC/SAML pour les grands comptes et groupes multi-filiales.",
      button: "Continuer la simulation SSO"
    }
  }[screen];

  return (
    <main className="security-page">
      <section>
        <Logo className="security-logo" />
        <article>
          <small>{session?.user.email ?? "GESTOCK Security"}</small>
          <h1>{copy.title}</h1>
          <p>{copy.text}</p>
          {screen === "mfa" ? <input maxLength={6} placeholder="000000" /> : null}
          <div>
            <button onClick={onBack} type="button">Retour</button>
            <button onClick={session ? onContinue : onBack} type="button">{copy.button}</button>
          </div>
        </article>
      </section>
    </main>
  );
}

function TenantSidebar({ step }: { step: number }) {
  return (
    <aside className="tenant-sidebar">
      <Logo className="tenant-logo" />
      <p>PLATEFORME DE GESTION DES STOCKS<br />ET APPROVISIONNEMENTS</p>

      <ol>
        {["Connexion", "Sélection organisation", "Espace de travail"].map((label, index) => {
          const currentStep = index + 1;
          return (
            <li className={currentStep <= step ? "done" : ""} key={label}>
              <span>{currentStep < step ? "✓" : currentStep}</span>
              {label}
            </li>
          );
        })}
      </ol>

      <section>
        <strong>Besoin d'aide ?</strong>
        <small>Contactez votre administrateur ou l'équipe support.</small>
        <button type="button">Contacter le support</button>
      </section>

      <small>© 2024 GESTOCK. Tous droits réservés.</small>
    </aside>
  );
}

function Logo({ className }: { className: string }) {
  return (
    <div className={className} aria-label="GESTOCK">
      <span>GES</span>
      <strong>TOCK</strong>
      <i aria-hidden="true">◆</i>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="feature-card">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function TrustItem({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="trust-item">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </article>
  );
}

function iconForNav(item: string) {
  const icons: Record<string, string> = {
    "Tableau de bord": "▦",
    Articles: "◇",
    Catalogue: "▤",
    Stocks: "▤",
    Entrées: "▥",
    Sorties: "⇄",
    Transferts: "⇆",
    Inventaires: "☑",
    "Lots & Séries": "▣",
    Péremptions: "◷",
    Approvisionnements: "□",
    Achats: "▱",
    Fournisseurs: "♙",
    Entrepôts: "⌂",
    Emplacements: "⌖",
    Rapports: "▥",
    Alertes: "♧",
    Paramètres: "⚙"
  };

  return icons[item] ?? "▧";
}

function statusClass(status: ArticleStatus) {
  return status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function catalogStatusClass(status: CatalogProduct["status"]) {
  return status
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}
