export type TenantPlan = "PME" | "Enterprise" | "Groupe";

export type ModuleStatus = "active" | "available" | "planned";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Organization {
  id: string;
  name: string;
  legalCountry: string;
  plan: TenantPlan;
  currency: string;
  language: string;
  timezone: string;
  sites: Site[];
}

export interface Site {
  id: string;
  name: string;
  city: string;
  country: string;
  warehouses: Warehouse[];
}

export interface Warehouse {
  id: string;
  name: string;
  type: "central" | "regional" | "cold-chain" | "retail" | "transit";
  capacityRate: number;
  serviceLevel: number;
}

export interface BusinessModule {
  id: string;
  name: string;
  tagline: string;
  domain: "Stock" | "Achat" | "Entrepôt" | "Finance" | "Pilotage" | "Plateforme";
  status: ModuleStatus;
  capabilities: string[];
}

export interface InventoryKpi {
  label: string;
  value: string;
  trend: string;
  sentiment: "positive" | "neutral" | "warning";
}

export interface OperationalAlert {
  id: string;
  title: string;
  detail: string;
  level: RiskLevel;
  owner: string;
  dueIn: string;
}

export interface SupplyChainFlow {
  step: string;
  description: string;
  automation: string;
}

export interface PurchasePipelineItem {
  supplier: string;
  category: string;
  amount: string;
  eta: string;
  status: "À valider" | "En transit" | "Réception partielle" | "Clôturé";
}

export interface SecurityControl {
  title: string;
  description: string;
  coverage: string;
}

export interface IntegrationEndpoint {
  system: string;
  mode: "API REST" | "Webhook" | "ETL" | "Connecteur";
  purpose: string;
}

export interface ReportingWidget {
  title: string;
  metric: string;
  insight: string;
}

export interface MobileCapability {
  title: string;
  description: string;
}

export interface AgentResponsibility {
  agent: string;
  role: string;
  mission: string;
  ownership: string[];
  immediateDeliverables: string[];
  status: "assigned" | "in-progress" | "ready-for-review";
}

export interface DeliveryWorkstream {
  phase: string;
  leadAgent: string;
  goal: string;
  deliverables: string[];
  dependency: string;
}

export interface GestockSnapshot {
  organization: Organization;
  kpis: InventoryKpi[];
  modules: BusinessModule[];
  alerts: OperationalAlert[];
  flows: SupplyChainFlow[];
  purchasePipeline: PurchasePipelineItem[];
  securityControls: SecurityControl[];
  integrations: IntegrationEndpoint[];
  reports: ReportingWidget[];
  mobile: MobileCapability[];
  agentResponsibilities: AgentResponsibility[];
  deliveryWorkstreams: DeliveryWorkstream[];
}
