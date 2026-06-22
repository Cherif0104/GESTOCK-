import { useEffect, useMemo, useState } from "react";
import type { GestockViewModel, WarehouseOverview } from "../application/buildGestockViewModel";
import type {
  BusinessModule,
  MockUser,
  ModuleStatus,
  OperationalAlert,
  PurchasePipelineItem,
  RiskLevel
} from "../domain/models";

interface AppProps {
  model: GestockViewModel;
}

type AppScreen = "loading" | "login" | "erp";
type WorkspaceView = "dashboard" | "stocks" | "achats" | "entrepots" | "reporting" | "admin";

const statusLabel: Record<ModuleStatus, string> = {
  active: "Actif",
  available: "À activer",
  planned: "Roadmap"
};

const riskLabel: Record<RiskLevel, string> = {
  low: "Faible",
  medium: "Modéré",
  high: "Élevé",
  critical: "Critique"
};

const navigationItems: Array<{ id: WorkspaceView; label: string; icon: string }> = [
  { id: "dashboard", label: "Pilotage", icon: "⌁" },
  { id: "stocks", label: "Stocks", icon: "▦" },
  { id: "achats", label: "Achats", icon: "◈" },
  { id: "entrepots", label: "Entrepôts", icon: "▤" },
  { id: "reporting", label: "Reporting", icon: "◎" }
];

const inventoryRows = [
  {
    sku: "LAB-REACT-009",
    name: "Réactifs laboratoire",
    site: "Hub Dakar",
    stock: 420,
    coverage: "9 jours",
    status: "Critique"
  },
  {
    sku: "PKG-BOX-120",
    name: "Emballages carton renforcé",
    site: "Plateforme Abidjan",
    stock: 12400,
    coverage: "46 jours",
    status: "Stable"
  },
  {
    sku: "AGR-SEED-044",
    name: "Intrants agricoles premium",
    site: "Antenne Cotonou",
    stock: 1880,
    coverage: "18 jours",
    status: "À surveiller"
  },
  {
    sku: "SPARE-MEC-231",
    name: "Pièces détachées mécaniques",
    site: "Hub Dakar",
    stock: 312,
    coverage: "27 jours",
    status: "Inventaire"
  }
];

export function App({ model }: AppProps) {
  const [screen, setScreen] = useState<AppScreen>("loading");
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [activeView, setActiveView] = useState<WorkspaceView>("dashboard");

  const selectedUser = useMemo(() => model.mockUsers[0]!, [model.mockUsers]);

  const startLogin = () => {
    window.setTimeout(() => setScreen("login"), 650);
  };

  if (screen === "loading") {
    return <LoadingScreen onReady={startLogin} />;
  }

  if (screen === "login" || !currentUser) {
    return (
      <LoginScreen
        model={model}
        onLogin={() => {
          setCurrentUser(selectedUser);
          setScreen("erp");
        }}
      />
    );
  }

  return (
    <ErpWorkspace
      model={model}
      user={currentUser}
      activeView={activeView}
      onChangeView={setActiveView}
      onLogout={() => {
        setCurrentUser(null);
        setScreen("login");
        setActiveView("dashboard");
      }}
    />
  );
}

function LoadingScreen({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <main className="loading-screen">
      <div className="loading-card">
        <span className="brand-orb">G</span>
        <div>
          <p>Initialisation de l'espace ERP</p>
          <h1>GESTOCK</h1>
        </div>
        <div className="loading-bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </main>
  );
}

function LoginScreen({
  model,
  onLogin
}: {
  model: GestockViewModel;
  onLogin: () => void;
}) {
  return (
    <main className="login-screen">
      <section className="login-hero-panel" aria-label="Présentation GESTOCK">
        <div className="login-logo-lockup">
          <strong>
            <span>GES</span>TOCK
          </strong>
          <div className="logo-cube" aria-hidden="true">
            ◆
          </div>
          <small>PLATEFORME DE GESTION DES STOCKS ET APPROVISIONNEMENTS</small>
        </div>

        <div className="login-hero-copy">
          <h1>
            Maîtrisez <span>vos stocks.</span>
            <br />
            Optimisez votre chaîne d'approvisionnement.
          </h1>
        </div>

        <div className="login-benefits">
          {[
            {
              icon: "▧",
              title: "Visibilité en temps réel",
              text: "Suivez vos stocks et mouvements en direct."
            },
            {
              icon: "▥",
              title: "Performance opérationnelle",
              text: "Prenez les bonnes décisions, plus rapidement."
            },
            {
              icon: "◷",
              title: "Traçabilité complète",
              text: "Suivez chaque article, lot et mouvement."
            },
            {
              icon: "♢",
              title: "Alertes intelligentes",
              text: "Anticipez les ruptures et péremptions."
            }
          ].map((benefit) => (
            <article className="login-benefit-card" key={benefit.title}>
              <span>{benefit.icon}</span>
              <div>
                <strong>{benefit.title}</strong>
                <p>{benefit.text}</p>
              </div>
            </article>
          ))}
        </div>

        <small className="login-copyright">© 2024 GESTOCK. Tous droits réservés.</small>
      </section>

      <section className="login-auth-area" aria-label="Connexion">
        <button className="language-switch" type="button">
          ◎ Français⌄
        </button>
        <div className="dot-pattern" aria-hidden="true" />

        <div className="auth-card">
          <div>
            <h2>
              Connexion à <span>GESTOCK</span>
            </h2>
            <p>Accédez à votre espace de gestion</p>
          </div>

          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin();
            }}
          >
            <label>
              <span>Adresse e-mail</span>
              <div className="auth-input">
                <span aria-hidden="true">✉</span>
                <input placeholder="Entrez votre adresse e-mail" type="email" />
              </div>
            </label>

            <label>
              <span>Mot de passe</span>
              <div className="auth-input">
                <span aria-hidden="true">▣</span>
                <input placeholder="Entrez votre mot de passe" type="password" />
                <button aria-label="Afficher le mot de passe" type="button">
                  ◉
                </button>
              </div>
            </label>

            <div className="auth-row">
              <label className="remember-me">
                <input defaultChecked type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <button type="button">Mot de passe oublié ?</button>
            </div>

            <button className="auth-submit" type="submit">
              Se connecter
            </button>

            <div className="auth-divider">
              <span />
              <small>OU</small>
              <span />
            </div>

            <button className="sso-button" type="button" onClick={onLogin}>
              ▥ Se connecter avec SSO / Enterprise
            </button>
          </form>

          <footer className="first-login">
            <strong>Première connexion à GESTOCK ?</strong>
            <button type="button">Contacter votre administrateur</button>
          </footer>
        </div>

        <div className="login-trust-row">
          {[
            ["♢", "Sécurisé", "Données chiffrées"],
            ["☁", "Hébergé au Sénégal", "Haute disponibilité"],
            ["♙", "Multi-utilisateurs", "Accès par rôles"],
            ["◷", "Audit complet", "Traçabilité totale"]
          ].map(([icon, title, text]) => (
            <article key={title}>
              <span>{icon}</span>
              <div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function ErpWorkspace({
  model,
  user,
  activeView,
  onChangeView,
  onLogout
}: {
  model: GestockViewModel;
  user: MockUser;
  activeView: WorkspaceView;
  onChangeView: (view: WorkspaceView) => void;
  onLogout: () => void;
}) {
  return (
    <div className="erp-shell">
      <aside className="erp-sidebar">
        <div className="sidebar-brand">
          <span className="brand-orb">G</span>
          <div>
            <strong>GESTOCK</strong>
            <small>{model.organization.plan}</small>
          </div>
        </div>

        <nav className="erp-nav" aria-label="Navigation ERP">
          {navigationItems.map((item) => (
            <button
              className={activeView === item.id ? "active" : ""}
              key={item.id}
              onClick={() => onChangeView(item.id)}
              type="button"
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer-nav">
          <button
            className={activeView === "admin" ? "active" : ""}
            onClick={() => onChangeView("admin")}
            type="button"
          >
            <span>⚙</span>
            Paramètres
          </button>
        </div>

        <div className="sidebar-session">
          <small>Session</small>
          <strong>{user.name}</strong>
          <span>{user.role}</span>
          <button type="button" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="erp-main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">GESTOCK / {labelForView(activeView)}</span>
            <h1>{titleForView(activeView)}</h1>
          </div>
          <div className="topbar-actions">
            <span>{model.organization.language}</span>
            <span>{model.organization.currency}</span>
            <strong>{model.organization.timezone}</strong>
          </div>
        </header>

        <DashboardHeaderBar activeView={activeView} />

        {activeView === "dashboard" && <DashboardView model={model} user={user} />}
        {activeView === "stocks" && <StocksView model={model} />}
        {activeView === "achats" && <PurchasingView purchases={model.purchasePipeline} />}
        {activeView === "entrepots" && <WarehouseView warehouses={model.warehouseOverview} />}
        {activeView === "reporting" && <ReportingView model={model} />}
        {activeView === "admin" && <AdminView model={model} user={user} />}
      </main>
    </div>
  );
}

function DashboardHeaderBar({ activeView }: { activeView: WorkspaceView }) {
  const [search, setSearch] = useState("");

  return (
    <section className="dashboard-header-bar" aria-label="Recherche et filtres">
      <label className="search-box">
        <span>⌕</span>
        <input
          aria-label="Recherche globale"
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Rechercher dans ${titleForView(activeView).toLowerCase()}...`}
          type="search"
          value={search}
        />
      </label>
      <button className="filter-button" type="button">
        ◷ Filtrer période
      </button>
      <button className="secondary-button" type="button">
        Exporter
      </button>
    </section>
  );
}

function DashboardView({ model, user }: { model: GestockViewModel; user: MockUser }) {
  return (
    <div className="workspace-grid">
      <section className="panel hero-panel">
        <div>
          <span className="eyebrow">Tableau de bord ERP</span>
          <h2>Bienvenue, {user.name}</h2>
          <p>
            Votre périmètre : <strong>{user.scope}</strong>. Les indicateurs sont filtrés selon
            votre rôle simulé et votre organisation.
          </p>
        </div>
        <div className="risk-widget">
          <span>Risque opérationnel</span>
          <strong>{model.highestRiskLabel}</strong>
          <small>Basé sur {model.alerts.length} alertes actives</small>
        </div>
      </section>

      <section className="kpi-strip">
        {model.kpis.map((kpi) => (
          <article className={`kpi-tile ${kpi.sentiment}`} key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.trend}</small>
          </article>
        ))}
      </section>

      <section className="panel span-8">
        <PanelHeader title="Alertes prioritaires" action="Voir tout" />
        <div className="alert-list">
          {model.alerts.map((alert) => (
            <AlertRow alert={alert} key={alert.id} />
          ))}
        </div>
      </section>

      <section className="panel span-4">
        <PanelHeader title="Modules actifs" action={`${model.activeModuleCount} actifs`} />
        <div className="module-mini-list">
          {model.modules.slice(0, 6).map((module) => (
            <ModuleMini module={module} key={module.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StocksView({ model }: { model: GestockViewModel }) {
  return (
    <div className="workspace-grid">
      <section className="panel span-12">
        <PanelHeader title="Articles et disponibilité" action="Nouvel article" />
        <div className="data-table">
          <div className="data-row heading">
            <span>SKU</span>
            <span>Article</span>
            <span>Site</span>
            <span>Stock</span>
            <span>Couverture</span>
            <span>Statut</span>
          </div>
          {inventoryRows.map((row) => (
            <div className="data-row" key={row.sku}>
              <strong>{row.sku}</strong>
              <span>{row.name}</span>
              <span>{row.site}</span>
              <span>{row.stock.toLocaleString("fr-FR")}</span>
              <span>{row.coverage}</span>
              <em className={row.status === "Critique" ? "danger" : ""}>{row.status}</em>
            </div>
          ))}
        </div>
      </section>

      <section className="panel span-6">
        <PanelHeader title="Workflow rupture vers achat" action="Simulé" />
        <div className="timeline">
          {model.flows.map((flow) => (
            <article key={flow.step}>
              <strong>{flow.step}</strong>
              <span>{flow.description}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel span-6">
        <PanelHeader title="Entrepôts sous tension" action={`${model.warehouseOverview.length} sites`} />
        <div className="warehouse-list">
          {model.warehouseOverview.slice(0, 4).map((warehouse) => (
            <WarehouseCompact warehouse={warehouse} key={warehouse.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PurchasingView({ purchases }: { purchases: PurchasePipelineItem[] }) {
  return (
    <div className="workspace-grid">
      <section className="panel span-12">
        <PanelHeader title="Pipeline achats fournisseurs" action="Créer demande" />
        <div className="purchase-board">
          {purchases.map((purchase) => (
            <article key={`${purchase.supplier}-${purchase.category}`}>
              <span>{purchase.status}</span>
              <h3>{purchase.supplier}</h3>
              <p>{purchase.category}</p>
              <footer>
                <strong>{purchase.amount}</strong>
                <em>ETA {purchase.eta}</em>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function WarehouseView({ warehouses }: { warehouses: WarehouseOverview[] }) {
  return (
    <div className="workspace-grid">
      {warehouses.map((warehouse) => (
        <section className="panel warehouse-panel" key={warehouse.id}>
          <WarehouseCompact warehouse={warehouse} />
          <div className="warehouse-metrics">
            <span>Capacité {warehouse.capacityRate}%</span>
            <span>Service {warehouse.serviceLevel}%</span>
          </div>
        </section>
      ))}
    </div>
  );
}

function ReportingView({ model }: { model: GestockViewModel }) {
  return (
    <div className="workspace-grid">
      {model.reports.map((report) => (
        <section className="panel report-card" key={report.title}>
          <span>{report.title}</span>
          <strong>{report.metric}</strong>
          <p>{report.insight}</p>
        </section>
      ))}
      <section className="panel span-12">
        <PanelHeader title="Fondations IA et BI" action="Roadmap" />
        <p className="muted">
          Les événements métier du backend préparent les prévisions de rupture, recommandations
          d'achat, scoring fournisseur et analyses avancées.
        </p>
      </section>
    </div>
  );
}

function AdminView({ model, user }: { model: GestockViewModel; user: MockUser }) {
  return (
    <div className="workspace-grid">
      <section className="panel span-5">
        <PanelHeader title="Profil et permissions" action={user.role} />
        <h3>{user.name}</h3>
        <p className="muted">{user.description}</p>
        <div className="permission-list">
          {user.permissions.map((permission) => (
            <span key={permission}>{permission}</span>
          ))}
        </div>
      </section>
      <section className="panel span-7">
        <PanelHeader title="Sécurité Enterprise" action="RBAC" />
        <div className="security-list">
          {model.securityControls.map((control) => (
            <article key={control.title}>
              <strong>{control.title}</strong>
              <span>{control.coverage}</span>
              <p>{control.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PanelHeader({ title, action }: { title: string; action: string }) {
  return (
    <div className="panel-header">
      <h2>{title}</h2>
      <button type="button">{action}</button>
    </div>
  );
}

function AlertRow({ alert }: { alert: OperationalAlert }) {
  return (
    <article className={`alert-row ${alert.level}`}>
      <span>{riskLabel[alert.level]}</span>
      <div>
        <strong>{alert.title}</strong>
        <p>{alert.detail}</p>
      </div>
      <em>{alert.dueIn}</em>
    </article>
  );
}

function ModuleMini({ module }: { module: BusinessModule }) {
  return (
    <article className="module-mini">
      <div>
        <strong>{module.name}</strong>
        <span>{module.domain}</span>
      </div>
      <em>{statusLabel[module.status]}</em>
    </article>
  );
}

function WarehouseCompact({ warehouse }: { warehouse: WarehouseOverview }) {
  return (
    <article className="warehouse-compact">
      <div>
        <strong>{warehouse.name}</strong>
        <span>
          {warehouse.siteName} - {warehouse.country}
        </span>
      </div>
      <progress value={warehouse.capacityRate} max="100" />
    </article>
  );
}

function titleForView(view: WorkspaceView): string {
  const titles: Record<WorkspaceView, string> = {
    dashboard: "Centre de pilotage",
    stocks: "Stocks et articles",
    achats: "Achats et approvisionnements",
    entrepots: "Entrepôts et mouvements",
    reporting: "Reporting et BI",
    admin: "Administration et sécurité"
  };

  return titles[view];
}

function labelForView(view: WorkspaceView): string {
  const labels: Record<WorkspaceView, string> = {
    dashboard: "Tableau de bord",
    stocks: "Stocks",
    achats: "Achats",
    entrepots: "Entrepôts",
    reporting: "Reporting",
    admin: "Paramètres"
  };

  return labels[view];
}
