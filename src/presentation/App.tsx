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

const dashboardKpis = [
  {
    label: "Valeur totale du stock",
    value: "1 248 540 000",
    trend: "+ 12,5% vs mois précédent",
    icon: "▤",
    tone: "positive"
  },
  {
    label: "Taux de disponibilité",
    value: "92,4%",
    trend: "+ 4,2% vs mois précédent",
    icon: "⌁",
    tone: "positive"
  },
  {
    label: "Ruptures de stock",
    value: "56",
    trend: "- 8,3% vs mois précédent",
    icon: "△",
    tone: "danger"
  },
  {
    label: "Commandes ouvertes",
    value: "32",
    trend: "12,5M FCFA",
    icon: "□",
    tone: "neutral"
  },
  {
    label: "Articles actifs",
    value: "2 356",
    trend: "+ 5,7% vs mois précédent",
    icon: "◇",
    tone: "positive"
  }
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
          <button type="button">☰</button>
          <label>
            <span>⌕</span>
            <input placeholder="Rechercher (articles, commandes, fournisseurs...)" />
          </label>
          <div className="topbar-actions">
            <button onClick={() => onAction("Notifications : 12 alertes critiques à traiter.")} type="button">♧<em>12</em></button>
            <button onClick={() => onAction("Messagerie : 5 messages fournisseurs.")} type="button">✉<em>5</em></button>
            <button onClick={() => onAction("Aide contextuelle du dashboard.")} type="button">?</button>
            <button className="user-menu" onClick={onLogout} type="button">
              <span />
              <b>{user.name}</b>
              <small>{user.role}</small>
              ⌄
            </button>
          </div>
        </header>

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
                <DashboardContent model={model} />
              ) : (
                <ModulePlaceholder moduleName={activeNav} organization={organization} />
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function DashboardContent({ model }: { model: GestockViewModel }) {
  return (
    <>
      <section className="kpi-grid">
        {dashboardKpis.map((kpi) => (
          <article className="kpi-card" key={kpi.label}>
            <small>{kpi.label}</small>
            <strong>{kpi.value}</strong>
            <span className={kpi.tone}>{kpi.trend}</span>
            <i>{kpi.icon}</i>
          </article>
        ))}
      </section>

      <section className="analytics-grid">
        <article className="chart-card wide">
          <header>
            <strong>Évolution de la valeur du stock</strong>
            <button type="button">30 derniers jours ⌄</button>
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
        </article>

        <article className="chart-card donut-card">
          <strong>Répartition du stock par catégorie</strong>
          <div className="donut-row">
            <div className="donut" />
            <ul>
              {["Matières premières 32%", "Produits finis 28%", "Consommables 20%", "Pièces de rechange 12%", "Autres 8%"].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <small>Total : 1 248 540 000 FCFA</small>
        </article>

        <article className="chart-card alerts-card">
          <strong>Alertes critiques</strong>
          {model.alerts.slice(0, 4).map((alert, index) => (
            <p key={alert.id}>
              <span>{["△", "⚠", "◇", "↻"][index]}</span>
              {alert.title}
              <b>{[12, 28, 9, 7][index]}</b>
            </p>
          ))}
          <button type="button">Voir toutes les alertes</button>
        </article>
      </section>

      <section className="tables-grid">
        <DataTable
          className="large"
          columns={["Date", "Type", "Référence", "Article", "Entrepôt", "Quantité", "Utilisateur"]}
          rows={recentMovements}
          title="Mouvements récents"
        />
        <DataTable columns={["Entrepôt", "Valeur (FCFA)", "Disponibilité"]} rows={warehouseStock} title="Stock par entrepôt" />
        <DataTable columns={["Article", "Valeur (FCFA)", "% Total"]} rows={topArticles} title="Top 5 articles par valeur" />
      </section>

      <section className="indicator-strip">
        {[
          ["Rotation des stocks", "4,2", "fois"],
          ["Délai moyen d'approvisionnement", "6,4", "jours"],
          ["Taux de service", "96,8%", ""],
          ["Taux d'occupation", "78,3%", ""],
          ["Coût de possession", "4,8%", "de la valeur du stock"]
        ].map(([label, value, suffix]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
            <span>{suffix}</span>
            <em>+ 0,6 vs mois précédent</em>
          </article>
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
          <p>Gérez l'ensemble de vos articles et produits.</p>
        </div>
        <div>
          <button onClick={() => onAction("Import d'articles ouvert : CSV, Excel et modèles de colonnes prêts en mock.")} type="button">
            ⇩ Importer des articles
          </button>
          <button className="primary" onClick={() => onAction("Formulaire Nouvel article préparé : informations, codes-barres, stock initial et documents.")} type="button">
            + Nouvel article
          </button>
        </div>
      </header>

      <section className="article-kpis">
        {[
          ["2 356", "Articles actifs", "◇", "green"],
          ["156", "Sous stock", "△", "orange"],
          ["28", "Rupture de stock", "△", "red"],
          ["142", "Prochains à péremption", "□", "purple"],
          ["98,6%", "Couverture moyenne", "♢", "green"]
        ].map(([value, label, icon, tone]) => (
          <article key={label}>
            <strong>{value}</strong>
            <small>{label}</small>
            <span className={tone}>{icon}</span>
          </article>
        ))}
      </section>

      <section className="article-list-card">
        <div className="article-filters">
          <label>
            <span>⌕</span>
            <input placeholder="Rechercher un article..." />
          </label>
          {["Catégorie", "Famille", "Statut", "Entrepôt", "Plus de filtres"].map((filter) => (
            <button key={filter} onClick={() => onAction(`Filtre ${filter} activé en mode mock.`)} type="button">
              {filter} ⌄
            </button>
          ))}
          <button onClick={() => onAction("Filtres réinitialisés.")} type="button">↻ Réinitialiser</button>
          <div>
            <button className="active" type="button">▦</button>
            <button type="button">☷</button>
            <button onClick={() => onAction("Paramètres de colonnes ouverts.")} type="button">⚙</button>
          </div>
        </div>

        <table className="articles-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
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
            {articleItems.map((item) => (
              <tr key={item.reference}>
                <td><input type="checkbox" /></td>
                <td>
                  <button className="article-reference" onClick={() => onOpenArticle(item)} type="button">
                    <span>{item.icon}</span>
                    <b>{item.reference}</b>
                  </button>
                </td>
                <td>{item.designation}</td>
                <td>{item.category}</td>
                <td>{item.unit}</td>
                <td>{item.averagePrice}</td>
                <td>{item.stock}</td>
                <td><em className={`status-pill ${statusClass(item.status)}`}>{item.status}</em></td>
                <td>
                  <div className="row-actions">
                    <button aria-label="Voir" onClick={() => onOpenArticle(item)} type="button">⊙</button>
                    <button aria-label="Modifier" onClick={() => onAction(`Édition de ${item.reference} ouverte en mock.`)} type="button">✎</button>
                    <button aria-label="Plus" onClick={() => onAction(`Menu actions de ${item.reference} : dupliquer, archiver, QR, lots.`)} type="button">…</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="article-pagination">
          <span>Affichage de 1 à 10 sur 2.356 articles</span>
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

function ArticleDetail({
  article,
  onAction,
  onBack
}: {
  article: ArticleRecord;
  onAction: (message: string | null) => void;
  onBack: () => void;
}) {
  return (
    <section className="article-detail-page">
      <div className="article-breadcrumb">
        <button onClick={onBack} type="button">Articles</button>
        <span>›</span>
        <strong>Détail de l'article</strong>
      </div>

      <header className="article-detail-header">
        <ProductVisual label={article.icon} />
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
              <dd>{article.barcode}</dd>
            </div>
            <div>
              <dt>Catégorie</dt>
              <dd>{article.category}</dd>
            </div>
            <div>
              <dt>Unité de vente</dt>
              <dd><button type="button">{article.unit} (20) ⌄</button></dd>
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
            {["Informations générales", "Stocks & Emplacements", "Lots & Séries", "Tarification", "Fournisseurs", "Documents", "Historique"].map((tab, index) => (
              <button className={index === 0 ? "active" : ""} key={tab} onClick={() => onAction(`Onglet ${tab} prêt à être détaillé.`)} type="button">
                {tab}
              </button>
            ))}
          </nav>

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
                  ["Unité de base", "Boîte"],
                  ["Contenu de l'unité", "20 comprimés"],
                  ["Unité de vente", "Boîte (20)"],
                  ["Unité d'achat", "Carton (50 boîtes)"],
                  ["Poids net", "0,050 kg"],
                  ["Volume", "0,00012 m³"],
                  ["Conditionnement", "Boîte en carton"],
                  ["Durée de vie (mois)", "36"],
                  ["Température de conservation", "Ambiante"],
                  ["Code douanier", "30049000"],
                  ["Pays d'origine", "France"]
                ]}
              />
            </section>

            <section>
              <h2>Codes & Identifiants</h2>
              <InfoRows
                rows={[
                  ["Code-barres (EAN13)", article.barcode],
                  ["Code-barres (EAN14)", "6161101234564"],
                  ["Code interne", "ART-2024-001256"],
                  ["Référence fabricant", "PARA500-BIO"],
                  ["SKU", "PARA500-BOX20"]
                ]}
              />
              <h2>Images</h2>
              <div className="article-images">
                <ProductVisual label="PARA" />
                <ProductVisual label="TAB" />
                <ProductVisual label="BOX" />
                <button onClick={() => onAction("Ajout d'image produit ouvert.")} type="button">＋</button>
              </div>
              <h2>Documents associés</h2>
              <div className="document-list">
                {["Fiche technique.pdf", "Certificat d'analyse.pdf", "Notice utilisation.pdf", "Autorisation mise sur marché.pdf"].map((document, index) => (
                  <button key={document} onClick={() => onAction(`${document} prêt pour téléchargement mock.`)} type="button">
                    <span>▣ {document}</span>
                    <small>{[245, 320, 512, 780][index]} KB</small>
                    <small>12/01/2024</small>
                    <b>⇩</b>
                  </button>
                ))}
              </div>
            </section>
          </div>
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
            <p>Dernière mise à jour : 31/05/2024 14:32 <button type="button">↻ Actualiser</button></p>
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

function ProductVisual({ label }: { label: string }) {
  return (
    <div className="product-visual">
      <span>{label}</span>
      <small>500mg</small>
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

function ModulePlaceholder({
  moduleName,
  organization
}: {
  moduleName: string;
  organization: MockOrganizationAccess;
}) {
  return (
    <section className="module-placeholder">
      <span>▧</span>
      <h2>{moduleName}</h2>
      <p>
        Le module {moduleName.toLowerCase()} est déjà relié au contexte mock de {organization.name}.
        Les sous-modules, formulaires, listes et permissions seront ajoutés écran par écran.
      </p>
      <div>
        <button type="button">Créer une opération</button>
        <button type="button">Importer des données</button>
        <button type="button">Voir les paramètres</button>
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
