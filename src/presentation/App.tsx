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

const navigationItems = [
  "Tableau de bord",
  "Articles",
  "Stocks",
  "Entrées",
  "Sorties",
  "Transferts",
  "Inventaires",
  "Approvisionnements",
  "Achats",
  "Fournisseurs",
  "Entrepôts",
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

  return <LoginScreen loginError={loginError} onAction={setScreen} onLogin={handleLogin} />;
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
  loginError,
  onAction,
  onLogin
}: {
  loginError: string | null;
  onAction: (screen: Screen) => void;
  onLogin: (formData: FormData) => void;
}) {
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
              <input name="email" placeholder="Entrez votre adresse e-mail" type="email" />
            </div>
          </label>

          <label className="field">
            <span>Mot de passe</span>
            <div className="input-shell">
              <i aria-hidden="true">▣</i>
              <input name="password" placeholder="Entrez votre mot de passe" type="password" />
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
              onClick={() => onNav(item)}
              type="button"
            >
              <span>{iconForNav(item)}</span>
              {item}
              {item === "Alertes" ? <em>12</em> : null}
            </button>
          ))}
        </nav>

        <section className="quick-actions">
          <strong>Réduction rapide</strong>
          <button onClick={() => onAction("Réception rapide ouverte en mode mock.")} type="button">⇩ Réception</button>
          <button onClick={() => onAction("Sortie rapide ouverte en mode mock.")} type="button">⇧ Sortie</button>
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

          {notice ? (
            <p className="workspace-notice">
              {notice}
              <button onClick={() => onAction(null)} type="button">×</button>
            </p>
          ) : null}

          {isDashboard ? (
            <DashboardContent model={model} />
          ) : (
            <ModulePlaceholder moduleName={activeNav} organization={organization} />
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
    Stocks: "▤",
    Entrées: "▥",
    Sorties: "⇄",
    Transferts: "⇆",
    Inventaires: "☑",
    Approvisionnements: "□",
    Achats: "▱",
    Fournisseurs: "♙",
    Entrepôts: "⌂",
    Rapports: "▥",
    Alertes: "♧",
    Paramètres: "⚙"
  };

  return icons[item] ?? "▧";
}
