import type { GestockSnapshot, RiskLevel, Warehouse } from "../domain/models";

const riskScore: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Faible",
  medium: "Modéré",
  high: "Élevé",
  critical: "Critique"
};

export interface WarehouseOverview extends Warehouse {
  siteName: string;
  country: string;
}

export interface GestockViewModel extends GestockSnapshot {
  activeModuleCount: number;
  enabledCapabilityCount: number;
  warehouseOverview: WarehouseOverview[];
  highestRiskLabel: string;
  tenantSummary: string;
  platformPillars: string[];
}

export function buildGestockViewModel(snapshot: GestockSnapshot): GestockViewModel {
  const activeModules = snapshot.modules.filter((module) => module.status === "active");
  const warehouseOverview = snapshot.organization.sites.flatMap((site) =>
    site.warehouses.map((warehouse) => ({
      ...warehouse,
      siteName: site.name,
      country: site.country
    }))
  );

  const highestRisk = snapshot.alerts.reduce<RiskLevel>(
    (current, alert) => (riskScore[alert.level] > riskScore[current] ? alert.level : current),
    "low"
  );

  return {
    ...snapshot,
    activeModuleCount: activeModules.length,
    enabledCapabilityCount: activeModules.reduce(
      (total, module) => total + module.capabilities.length,
      0
    ),
    warehouseOverview,
    highestRiskLabel: riskLabels[highestRisk],
    tenantSummary: `${snapshot.organization.sites.length} sites, ${warehouseOverview.length} entrepôts, ${snapshot.organization.currency}`,
    platformPillars: [
      "DDD par domaines métier",
      "Multi-tenant et multi-sociétés",
      "API-first et intégrations",
      "Audit trail et RBAC",
      "Mobile-first responsive",
      "Fondations IA et BI"
    ]
  };
}
