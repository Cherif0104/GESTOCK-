import type { GestockViewModel, WarehouseOverview } from "../application/buildGestockViewModel";
import type {
  AgentResponsibility,
  BusinessModule,
  DeliveryWorkstream,
  ModuleStatus,
  OperationalAlert,
  RiskLevel
} from "../domain/models";

interface AppProps {
  model: GestockViewModel;
}

const statusLabel: Record<ModuleStatus, string> = {
  active: "Activé",
  available: "Disponible",
  planned: "Prévu"
};

const riskLabel: Record<RiskLevel, string> = {
  low: "Faible",
  medium: "Modéré",
  high: "Élevé",
  critical: "Critique"
};

const agentStatusLabel: Record<AgentResponsibility["status"], string> = {
  assigned: "Assigné",
  "in-progress": "En cours",
  "ready-for-review": "À revoir"
};

export function App({ model }: AppProps) {
  const navigationItems = [
    { label: "Pilotage", href: "#pilotage" },
    { label: "Stocks", href: "#stocks" },
    { label: "Achats", href: "#achats" },
    { label: "Entrepôts", href: "#stocks" },
    { label: "Reporting", href: "#reporting" },
    { label: "Sécurité", href: "#securite" },
    { label: "Intégrations", href: "#integrations" },
    { label: "Exécution IA", href: "#execution" }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navigation principale">
        <div className="brand">
          <span className="brand-mark">G</span>
          <div>
            <strong>GESTOCK</strong>
            <small>Supply Chain Cloud</small>
          </div>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="tenant-card">
          <span>Tenant actif</span>
          <strong>{model.organization.name}</strong>
          <small>{model.tenantSummary}</small>
        </div>
      </aside>

      <main>
        <section className="hero" id="pilotage">
          <div className="hero-copy">
            <span className="eyebrow">SaaS Enterprise multi-tenant</span>
            <h1>La tour de contrôle Cloud pour stocks, achats et supply chain.</h1>
            <p>
              GESTOCK centralise les opérations logistiques, les entrepôts, les fournisseurs,
              les inventaires et les performances dans une expérience moderne pensée pour les
              organisations africaines.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#modules">
                Explorer les modules
              </a>
              <a className="button secondary" href="#architecture">
                Voir l'architecture
              </a>
            </div>
          </div>

          <div className="command-center" aria-label="Résumé opérationnel">
            <div className="command-header">
              <div>
                <span>Risque opérationnel</span>
                <strong>{model.highestRiskLabel}</strong>
              </div>
              <span className="live-pill">Temps réel</span>
            </div>
            <div className="command-grid">
              {model.kpis.map((kpi) => (
                <article className={`kpi-card ${kpi.sentiment}`} key={kpi.label}>
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.trend}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section two-columns" id="stocks">
          <div>
            <span className="eyebrow">Vision opérationnelle</span>
            <h2>Stocks multi-sites et entrepôts supervisés en continu.</h2>
            <p>
              Les décideurs visualisent la couverture, la capacité, les ruptures, les transferts
              et les mouvements sensibles par organisation, société, site et entrepôt.
            </p>
          </div>
          <div className="warehouse-grid">
            {model.warehouseOverview.map((warehouse) => (
              <WarehouseCard key={warehouse.id} warehouse={warehouse} />
            ))}
          </div>
        </section>

        <section className="section" id="modules">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Architecture modulaire</span>
              <h2>Modules activables selon la maturité de chaque client.</h2>
            </div>
            <div className="metric-chip">
              <strong>{model.activeModuleCount}</strong>
              <span>modules actifs</span>
            </div>
            <div className="metric-chip">
              <strong>{model.enabledCapabilityCount}</strong>
              <span>capacités en production</span>
            </div>
          </div>

          <div className="module-grid">
            {model.modules.map((businessModule) => (
              <ModuleCard key={businessModule.id} businessModule={businessModule} />
            ))}
          </div>
        </section>

        <section className="section two-columns" id="achats">
          <div>
            <span className="eyebrow">Approvisionnement intelligent</span>
            <h2>Pipeline achats connecté aux besoins réels du stock.</h2>
            <p>
              Les workflows relient prévision, demande d'achat, validation, commande fournisseur,
              réception et litiges avec une traçabilité complète.
            </p>
            <div className="flow-list">
              {model.flows.map((flow) => (
                <article key={flow.step}>
                  <strong>{flow.step}</strong>
                  <span>{flow.description}</span>
                  <small>{flow.automation}</small>
                </article>
              ))}
            </div>
          </div>

          <div className="table-card">
            <div className="table-title">
              <strong>Commandes fournisseurs</strong>
              <span>Vue consolidée</span>
            </div>
            {model.purchasePipeline.map((purchase) => (
              <div className="table-row" key={`${purchase.supplier}-${purchase.category}`}>
                <div>
                  <strong>{purchase.supplier}</strong>
                  <small>{purchase.category}</small>
                </div>
                <span>{purchase.amount}</span>
                <span>{purchase.eta}</span>
                <em>{purchase.status}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="section two-columns" id="reporting">
          <div className="report-panel">
            <span className="eyebrow">Reporting & BI</span>
            <h2>Tableaux de bord configurables pour la prise de décision.</h2>
            <div className="report-grid">
              {model.reports.map((report) => (
                <article key={report.title}>
                  <span>{report.title}</span>
                  <strong>{report.metric}</strong>
                  <p>{report.insight}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="ai-card">
            <span>Fondations IA</span>
            <h3>Prévisions, recommandations et détection d'anomalies.</h3>
            <p>
              Le modèle applicatif isole les événements métier pour permettre demain du forecast,
              du scoring rupture et des recommandations d'achat sans refondre les domaines.
            </p>
          </div>
        </section>

        <section className="section" id="securite">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Sécurité Enterprise</span>
              <h2>Contrôles conçus pour gouvernance, audit et conformité.</h2>
            </div>
          </div>
          <div className="security-grid">
            {model.securityControls.map((control) => (
              <article key={control.title}>
                <strong>{control.title}</strong>
                <p>{control.description}</p>
                <span>{control.coverage}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section two-columns" id="integrations">
          <div>
            <span className="eyebrow">API-first</span>
            <h2>Connecteurs pour ERP, finance, CRM, douane et terrain.</h2>
            <p>
              GESTOCK prépare une couche d'intégration robuste pour synchroniser données de base,
              commandes, écritures, documents et événements logistiques.
            </p>
            <div className="integration-list">
              {model.integrations.map((integration) => (
                <article key={integration.system}>
                  <strong>{integration.system}</strong>
                  <span>{integration.mode}</span>
                  <p>{integration.purpose}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mobile-card">
            <span className="eyebrow">Mobile first</span>
            <h2>Opérations terrain sur smartphone et tablette.</h2>
            {model.mobile.map((capability) => (
              <article key={capability.title}>
                <strong>{capability.title}</strong>
                <p>{capability.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section architecture" id="architecture">
          <span className="eyebrow">Socle technique</span>
          <h2>Architecture DDD prête pour une plateforme Cloud Native.</h2>
          <div className="pillar-grid">
            {model.platformPillars.map((pillar) => (
              <span key={pillar}>{pillar}</span>
            ))}
          </div>
        </section>

        <section className="section execution" id="execution">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Orchestration multi-agents</span>
              <h2>Responsabilités assignées pour industrialiser GESTOCK.</h2>
              <p>
                Chaque agent IA porte un périmètre clair afin d'accélérer le backend, les règles
                métier et l'expérience produit sans mélanger les responsabilités.
              </p>
            </div>
            <div className="metric-chip">
              <strong>{model.assignedAgentCount}</strong>
              <span>agents mobilisés</span>
            </div>
            <div className="metric-chip">
              <strong>{model.deliveryPhaseCount}</strong>
              <span>phases pilotées</span>
            </div>
          </div>

          <div className="agent-grid">
            {model.agentResponsibilities.map((agent) => (
              <AgentCard key={agent.agent} agent={agent} />
            ))}
          </div>

          <div className="workstream-grid">
            {model.deliveryWorkstreams.map((workstream) => (
              <WorkstreamCard key={workstream.phase} workstream={workstream} />
            ))}
          </div>
        </section>

        <section className="section alerts" aria-label="Alertes opérationnelles">
          <div>
            <span className="eyebrow">Alertes prioritaires</span>
            <h2>Les opérations sensibles restent visibles et actionnables.</h2>
          </div>
          <div className="alert-grid">
            {model.alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function WarehouseCard({ warehouse }: { warehouse: WarehouseOverview }) {
  return (
    <article className="warehouse-card">
      <div>
        <strong>{warehouse.name}</strong>
        <span>
          {warehouse.siteName} - {warehouse.country}
        </span>
      </div>
      <div className="capacity">
        <span>Capacité utilisée</span>
        <strong>{warehouse.capacityRate}%</strong>
        <progress value={warehouse.capacityRate} max="100" />
      </div>
      <div className="service-level">
        <span>Service</span>
        <strong>{warehouse.serviceLevel}%</strong>
      </div>
    </article>
  );
}

function ModuleCard({ businessModule }: { businessModule: BusinessModule }) {
  return (
    <article className={`module-card ${businessModule.status}`}>
      <div className="module-topline">
        <span>{businessModule.domain}</span>
        <em>{statusLabel[businessModule.status]}</em>
      </div>
      <h3>{businessModule.name}</h3>
      <p>{businessModule.tagline}</p>
      <ul>
        {businessModule.capabilities.map((capability) => (
          <li key={capability}>{capability}</li>
        ))}
      </ul>
    </article>
  );
}

function AlertCard({ alert }: { alert: OperationalAlert }) {
  return (
    <article className={`alert-card ${alert.level}`}>
      <span>{riskLabel[alert.level]}</span>
      <h3>{alert.title}</h3>
      <p>{alert.detail}</p>
      <footer>
        <strong>{alert.owner}</strong>
        <em>{alert.dueIn}</em>
      </footer>
    </article>
  );
}

function AgentCard({ agent }: { agent: AgentResponsibility }) {
  return (
    <article className={`agent-card ${agent.status}`}>
      <div className="agent-card-header">
        <span>{agentStatusLabel[agent.status]}</span>
        <strong>{agent.agent}</strong>
      </div>
      <h3>{agent.role}</h3>
      <p>{agent.mission}</p>
      <div>
        <small>Responsabilités</small>
        <ul>
          {agent.ownership.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <small>Livrables immédiats</small>
        <ul>
          {agent.immediateDeliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function WorkstreamCard({ workstream }: { workstream: DeliveryWorkstream }) {
  return (
    <article className="workstream-card">
      <span>{workstream.leadAgent}</span>
      <h3>{workstream.phase}</h3>
      <p>{workstream.goal}</p>
      <ul>
        {workstream.deliverables.map((deliverable) => (
          <li key={deliverable}>{deliverable}</li>
        ))}
      </ul>
      <em>{workstream.dependency}</em>
    </article>
  );
}
