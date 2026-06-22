import type { GestockSnapshot } from "../domain/models";

export const gestockSnapshot: GestockSnapshot = {
  organization: {
    id: "org-afri-supply",
    name: "AfriSupply Distribution Group",
    legalCountry: "Sénégal",
    plan: "Enterprise",
    currency: "XOF",
    language: "fr-FR",
    timezone: "Africa/Dakar",
    sites: [
      {
        id: "site-dakar",
        name: "Hub Dakar",
        city: "Dakar",
        country: "Sénégal",
        warehouses: [
          {
            id: "wh-dkr-central",
            name: "Entrepôt central Yoff",
            type: "central",
            capacityRate: 78,
            serviceLevel: 96
          },
          {
            id: "wh-dkr-cold",
            name: "Zone chaîne froide",
            type: "cold-chain",
            capacityRate: 64,
            serviceLevel: 98
          }
        ]
      },
      {
        id: "site-abidjan",
        name: "Plateforme Abidjan",
        city: "Abidjan",
        country: "Côte d'Ivoire",
        warehouses: [
          {
            id: "wh-abj-transit",
            name: "Transit Vridi",
            type: "transit",
            capacityRate: 71,
            serviceLevel: 93
          },
          {
            id: "wh-abj-retail",
            name: "Réserve distribution Plateau",
            type: "retail",
            capacityRate: 86,
            serviceLevel: 91
          }
        ]
      },
      {
        id: "site-cotonou",
        name: "Antenne Cotonou",
        city: "Cotonou",
        country: "Bénin",
        warehouses: [
          {
            id: "wh-cot-regional",
            name: "Stock régional Akpakpa",
            type: "regional",
            capacityRate: 59,
            serviceLevel: 95
          }
        ]
      }
    ]
  },
  kpis: [
    {
      label: "Valeur de stock",
      value: "2,48 Md XOF",
      trend: "+12,4% vs mois dernier",
      sentiment: "positive"
    },
    {
      label: "Taux de service",
      value: "95,1%",
      trend: "+2,1 pts sur 30 jours",
      sentiment: "positive"
    },
    {
      label: "Ruptures critiques",
      value: "18",
      trend: "-34% après réapprovisionnement",
      sentiment: "warning"
    },
    {
      label: "Rotation moyenne",
      value: "42 jours",
      trend: "Objectif groupe: 38 jours",
      sentiment: "neutral"
    }
  ],
  modules: [
    {
      id: "catalog",
      name: "Articles & catalogues",
      tagline: "Référentiel unique multi-sociétés avec variantes, lots, séries et unités.",
      domain: "Stock",
      status: "active",
      capabilities: ["Nomenclatures", "Codes-barres", "Lots et DLC", "Catégories fiscales"]
    },
    {
      id: "inventory",
      name: "Stocks & inventaires",
      tagline: "Pilotage temps réel des disponibilités, valorisations et écarts.",
      domain: "Stock",
      status: "active",
      capabilities: ["Inventaires tournants", "Réservations", "Valorisation FIFO", "Traçabilité"]
    },
    {
      id: "procurement",
      name: "Approvisionnements",
      tagline: "Réapprovisionnement intelligent basé sur seuils, prévisions et délais.",
      domain: "Achat",
      status: "active",
      capabilities: ["MRP léger", "Seuils dynamiques", "Demandes d'achat", "Workflows"]
    },
    {
      id: "purchasing",
      name: "Achats fournisseurs",
      tagline: "Gestion fournisseurs, appels d'offres, commandes et réceptions.",
      domain: "Achat",
      status: "active",
      capabilities: ["Comparaison offres", "Bons de commande", "SLA fournisseurs", "Litiges"]
    },
    {
      id: "warehouse",
      name: "Entrepôts & mouvements",
      tagline: "Flux entrants, sortants, transferts inter-sites et préparation mobile.",
      domain: "Entrepôt",
      status: "active",
      capabilities: ["Réceptions", "Picking", "Transferts", "Emplacements"]
    },
    {
      id: "analytics",
      name: "Reporting & BI",
      tagline: "Tableaux de bord configurables pour décideurs et opérations.",
      domain: "Pilotage",
      status: "available",
      capabilities: ["Exports", "Graphiques", "Alertes KPI", "Rapports planifiés"]
    },
    {
      id: "ai",
      name: "Fondations IA",
      tagline: "Socle pour prévisions, recommandations et automatisations futures.",
      domain: "Plateforme",
      status: "planned",
      capabilities: ["Forecast API", "Scoring rupture", "Suggestions achat", "Anomalies"]
    },
    {
      id: "billing",
      name: "Finance & coûts",
      tagline: "Valorisation, coûts logistiques, taxes, devises et rapprochements.",
      domain: "Finance",
      status: "available",
      capabilities: ["Multi-devises", "Coûts rendus", "Exports comptables", "Budgets"]
    }
  ],
  alerts: [
    {
      id: "alert-1",
      title: "Stock de sécurité dépassé",
      detail: "Réactifs laboratoire - Hub Dakar: 9 jours de couverture restants.",
      level: "critical",
      owner: "Responsable achats santé",
      dueIn: "Aujourd'hui"
    },
    {
      id: "alert-2",
      title: "Réception partielle fournisseur",
      detail: "Commande PO-2408: 62% reçu, reliquat annoncé au port d'Abidjan.",
      level: "high",
      owner: "Équipe réception Vridi",
      dueIn: "48 h"
    },
    {
      id: "alert-3",
      title: "Écart inventaire à justifier",
      detail: "Famille pièces détachées: écart valorisé à 4,2 M XOF.",
      level: "medium",
      owner: "Contrôle interne",
      dueIn: "5 jours"
    }
  ],
  flows: [
    {
      step: "Planifier",
      description: "Prévisions de besoin, seuils de réapprovisionnement et budgets par société.",
      automation: "Alertes seuil, suggestions d'achat et simulation de couverture."
    },
    {
      step: "Acheter",
      description: "Demandes d'achat, validation hiérarchique, comparaison fournisseur et PO.",
      automation: "Règles d'approbation, scoring fournisseur et historisation complète."
    },
    {
      step: "Réceptionner",
      description: "Réception qualitative et quantitative, lots, DLC, documents et litiges.",
      automation: "Contrôles mobiles, rapprochement commande et génération d'écarts."
    },
    {
      step: "Distribuer",
      description: "Transferts inter-sites, picking, réservations et sorties opérationnelles.",
      automation: "Priorisation des missions, codes-barres et traçabilité mouvement."
    },
    {
      step: "Piloter",
      description: "Dashboards exécutifs, analyses de rotation, rupture, coûts et performance.",
      automation: "Rapports planifiés, exports et alertes décisionnelles."
    }
  ],
  purchasePipeline: [
    {
      supplier: "MedEquip Afrique",
      category: "Équipements santé",
      amount: "184 M XOF",
      eta: "26 juin",
      status: "En transit"
    },
    {
      supplier: "LogiPack Maroc",
      category: "Emballages",
      amount: "38 M XOF",
      eta: "29 juin",
      status: "À valider"
    },
    {
      supplier: "AgroSource Bénin",
      category: "Intrants agricoles",
      amount: "71 M XOF",
      eta: "24 juin",
      status: "Réception partielle"
    }
  ],
  securityControls: [
    {
      title: "Isolation tenant",
      description: "Toutes les données sont rattachées à une organisation et segmentées par société, site et rôle.",
      coverage: "100% des entités métier"
    },
    {
      title: "RBAC & permissions",
      description: "Rôles composables pour directions, achats, magasins, finance, audit et administrateurs.",
      coverage: "32 permissions fonctionnelles"
    },
    {
      title: "Audit trail",
      description: "Journalisation des connexions, validations, modifications sensibles et mouvements de stock.",
      coverage: "Temps réel"
    },
    {
      title: "Données sensibles",
      description: "Préparation au chiffrement applicatif pour clés fiscales, contrats et documents fournisseurs.",
      coverage: "Prêt pour KMS"
    }
  ],
  integrations: [
    {
      system: "ERP & comptabilité",
      mode: "API REST",
      purpose: "Synchroniser plans comptables, factures, coûts et écritures."
    },
    {
      system: "CRM & ventes",
      mode: "Webhook",
      purpose: "Réserver les stocks dès les commandes client prioritaires."
    },
    {
      system: "Douane & transitaires",
      mode: "ETL",
      purpose: "Importer statuts portuaires, documents et dates estimées d'arrivée."
    },
    {
      system: "Mobile terrain",
      mode: "Connecteur",
      purpose: "Synchroniser scans, réceptions et inventaires hors ligne."
    }
  ],
  reports: [
    {
      title: "Santé du stock",
      metric: "95,1% taux de service",
      insight: "Les ruptures sont concentrées sur 7 références santé à marge critique."
    },
    {
      title: "Performance fournisseurs",
      metric: "88% OTIF",
      insight: "Deux fournisseurs représentent 64% des retards du trimestre."
    },
    {
      title: "Coûts logistiques",
      metric: "7,8% du CA",
      insight: "Les transferts urgents Abidjan-Dakar pèsent 21 M XOF sur 30 jours."
    }
  ],
  mobile: [
    {
      title: "Scan terrain",
      description: "Réceptions, sorties, transferts et inventaires via smartphone ou tablette."
    },
    {
      title: "Mode faible connectivité",
      description: "File d'attente locale et synchronisation contrôlée pour entrepôts éloignés."
    },
    {
      title: "Validation rapide",
      description: "Approbations d'achat, litiges et alertes critiques depuis mobile."
    }
  ]
};
