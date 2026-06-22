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
  mockUsers: [
    {
      id: "usr-direction",
      name: "Aminata Diop",
      email: "direction@gestock.local",
      password: "gestock-demo",
      role: "Direction",
      scope: "Groupe - tous pays",
      description: "Vue exécutive, KPI consolidés, risques et performance supply chain.",
      firstLogin: false,
      mfaRequired: true,
      organizations: [
        {
          id: "org-gestock-sa",
          name: "GESTOCK SA",
          country: "Sénégal",
          city: "Dakar",
          domain: "gestock-sa.sn",
          status: "active",
          isDefault: false,
          role: "Direction",
          users: 156,
          warehouses: 8
        },
        {
          id: "org-gestock-ci",
          name: "GESTOCK Côte d'Ivoire",
          country: "Côte d'Ivoire",
          city: "Abidjan",
          domain: "gestock-ci.ci",
          status: "active",
          isDefault: false,
          role: "Direction",
          users: 87,
          warehouses: 5
        },
        {
          id: "org-gestock-mali",
          name: "GESTOCK Mali",
          country: "Mali",
          city: "Bamako",
          domain: "gestock-ml.ml",
          status: "active",
          isDefault: false,
          role: "Direction",
          users: 64,
          warehouses: 3
        },
        {
          id: "org-gestock-bf",
          name: "GESTOCK Burkina Faso",
          country: "Burkina Faso",
          city: "Ouagadougou",
          domain: "gestock-bf.bf",
          status: "active",
          isDefault: false,
          role: "Direction",
          users: 45,
          warehouses: 2
        },
        {
          id: "org-gestock-bj",
          name: "GESTOCK Bénin",
          country: "Bénin",
          city: "Cotonou",
          domain: "gestock-bj.bj",
          status: "active",
          isDefault: false,
          role: "Direction",
          users: 38,
          warehouses: 2
        }
      ],
      permissions: ["Pilotage", "Reporting", "Validation stratégique", "Audit lecture"]
    },
    {
      id: "usr-admin",
      name: "Moussa Traoré",
      email: "admin@gestock.local",
      password: "gestock-demo",
      role: "Administrateur",
      scope: "Tenant complet",
      description: "Paramétrage organisation, utilisateurs, rôles, sites et modules.",
      firstLogin: false,
      mfaRequired: false,
      defaultOrganizationId: "org-gestock-sa",
      organizations: [
        {
          id: "org-gestock-sa",
          name: "GESTOCK SA",
          country: "Sénégal",
          city: "Dakar",
          domain: "gestock-sa.sn",
          status: "active",
          isDefault: true,
          role: "Administrateur",
          users: 156,
          warehouses: 8
        }
      ],
      permissions: ["Administration", "Sécurité", "Modules", "Intégrations"]
    },
    {
      id: "usr-stock",
      name: "Nadia Kouamé",
      email: "stock@gestock.local",
      password: "gestock-demo",
      role: "Responsable Stock",
      scope: "Stocks et inventaires",
      description: "Supervision disponibilité, seuils, inventaires, écarts et transferts.",
      firstLogin: false,
      mfaRequired: false,
      defaultOrganizationId: "org-gestock-ci",
      organizations: [
        {
          id: "org-gestock-ci",
          name: "GESTOCK Côte d'Ivoire",
          country: "Côte d'Ivoire",
          city: "Abidjan",
          domain: "gestock-ci.ci",
          status: "active",
          isDefault: true,
          role: "Responsable Stock",
          users: 87,
          warehouses: 5
        }
      ],
      permissions: ["Articles", "Stocks", "Inventaires", "Mouvements"]
    },
    {
      id: "usr-buyer",
      name: "Ibrahima Sow",
      email: "achats@gestock.local",
      password: "gestock-demo",
      role: "Acheteur",
      scope: "Achats fournisseurs",
      description: "Demandes d'achat, commandes fournisseurs, relances et réceptions.",
      firstLogin: false,
      mfaRequired: false,
      organizations: [
        {
          id: "org-gestock-sa",
          name: "GESTOCK SA",
          country: "Sénégal",
          city: "Dakar",
          domain: "gestock-sa.sn",
          status: "active",
          isDefault: false,
          role: "Acheteur",
          users: 156,
          warehouses: 8
        },
        {
          id: "org-gestock-bf",
          name: "GESTOCK Burkina Faso",
          country: "Burkina Faso",
          city: "Ouagadougou",
          domain: "gestock-bf.bf",
          status: "active",
          isDefault: false,
          role: "Acheteur",
          users: 45,
          warehouses: 2
        }
      ],
      permissions: ["Fournisseurs", "Demandes d'achat", "Commandes", "Réceptions"]
    },
    {
      id: "usr-warehouse",
      name: "Grâce Mensah",
      email: "magasin@gestock.local",
      password: "gestock-demo",
      role: "Magasinier",
      scope: "Entrepôt assigné",
      description: "Réceptions, sorties, picking, inventaires terrain et scan mobile.",
      firstLogin: false,
      mfaRequired: false,
      defaultOrganizationId: "org-gestock-bj",
      organizations: [
        {
          id: "org-gestock-bj",
          name: "GESTOCK Bénin",
          country: "Bénin",
          city: "Cotonou",
          domain: "gestock-bj.bj",
          status: "active",
          isDefault: true,
          role: "Magasinier",
          users: 38,
          warehouses: 2
        }
      ],
      permissions: ["Réception", "Sortie stock", "Picking", "Scan mobile"]
    },
    {
      id: "usr-auditor",
      name: "Jean-Baptiste Talla",
      email: "audit@gestock.local",
      password: "gestock-demo",
      role: "Auditeur",
      scope: "Lecture seule contrôlée",
      description: "Contrôle interne, journal d'audit, conformité et écarts sensibles.",
      firstLogin: true,
      mfaRequired: true,
      organizations: [
        {
          id: "org-gestock-sa",
          name: "GESTOCK SA",
          country: "Sénégal",
          city: "Dakar",
          domain: "gestock-sa.sn",
          status: "active",
          isDefault: false,
          role: "Auditeur",
          users: 156,
          warehouses: 8
        }
      ],
      permissions: ["Audit trail", "Historique", "Reporting lecture", "Conformité"]
    }
  ],
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
  ],
  agentResponsibilities: [
    {
      agent: "Claude Opus 4.7 Thinking",
      role: "Architecte Enterprise",
      mission: "Sécuriser les décisions structurantes avant l'industrialisation du SaaS.",
      ownership: [
        "Architecture multi-tenant",
        "DDD et frontières de domaines",
        "RBAC, audit trail et conformité",
        "ADR et arbitrages techniques"
      ],
      immediateDeliverables: [
        "ADR tenancy et isolation données",
        "Matrice rôles-permissions",
        "Modèle cible des domaines stock, achat et entrepôt"
      ],
      status: "assigned"
    },
    {
      agent: "GPT 5.3 Codex Hackfast",
      role: "Ingénieur backend & infrastructure",
      mission: "Construire le moteur transactionnel et les contrats API de GESTOCK.",
      ownership: [
        "Backend API v1",
        "PostgreSQL et migrations",
        "Authentification et middleware tenant",
        "Tests backend, CI et intégrations"
      ],
      immediateDeliverables: [
        "Squelette API versionné",
        "Schéma base organizations, users, roles, items, stocks",
        "Endpoints health, tenant snapshot et stocks"
      ],
      status: "assigned"
    },
    {
      agent: "GPT 5.5 Hackfast",
      role: "Produit, logique métier & front-end",
      mission: "Transformer la vitrine actuelle en application métier actionnable.",
      ownership: [
        "Workflows opérationnels",
        "Pages front et composants",
        "UX mobile-first",
        "Documentation fonctionnelle"
      ],
      immediateDeliverables: [
        "Pages Stocks, Articles, Achats et Fournisseurs",
        "Workflow rupture vers demande d'achat",
        "Design system léger et navigation applicative"
      ],
      status: "in-progress"
    }
  ],
  deliveryWorkstreams: [
    {
      phase: "Phase 1 - Architecture cible",
      leadAgent: "Claude Opus 4.7 Thinking",
      goal: "Verrouiller les fondations SaaS Enterprise avant les développements lourds.",
      deliverables: [
        "ADR multi-tenant",
        "Matrice RBAC",
        "Modèle DDD cible",
        "Stratégie audit trail"
      ],
      dependency: "Débloque backend, sécurité et modules métier."
    },
    {
      phase: "Phase 2 - Backend MVP",
      leadAgent: "GPT 5.3 Codex Hackfast",
      goal: "Remplacer les données statiques par une API sécurisée et persistante.",
      deliverables: [
        "API REST /v1",
        "PostgreSQL multi-tenant",
        "Auth et permissions",
        "Tests d'isolation tenant"
      ],
      dependency: "Dépend des décisions d'architecture et alimente le front."
    },
    {
      phase: "Phase 3 - Application métier",
      leadAgent: "GPT 5.5 Hackfast",
      goal: "Créer les écrans et workflows réellement utilisables par les équipes terrain.",
      deliverables: [
        "Routing applicatif",
        "CRUD articles et fournisseurs",
        "Flux rupture -> achat -> réception",
        "Tableaux filtrables par site et entrepôt"
      ],
      dependency: "Dépend des contrats API et du modèle métier."
    },
    {
      phase: "Phase 4 - Industrialisation",
      leadAgent: "Coordination multi-agents",
      goal: "Rendre la plateforme fiable pour démonstration client et déploiement continu.",
      deliverables: [
        "CI build et tests",
        "Observabilité",
        "Documentation exploitation",
        "Préparation Vercel et environnements"
      ],
      dependency: "Suit les trois premiers lots pour stabiliser la livraison."
    }
  ]
};
