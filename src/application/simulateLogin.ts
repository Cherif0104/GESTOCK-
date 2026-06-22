import type { MockOrganizationAccess, MockUser, PostLoginDestination } from "../domain/models";

export type LoginSimulationResult =
  | {
      ok: true;
      user: MockUser;
      destination: PostLoginDestination;
      organization?: MockOrganizationAccess;
      organizations: MockOrganizationAccess[];
      reason: string;
    }
  | {
      ok: false;
      code: "INVALID_CREDENTIALS" | "NO_ACTIVE_ORGANIZATION";
      message: string;
    };

export function simulateLogin(
  users: MockUser[],
  email: string,
  password: string
): LoginSimulationResult {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);

  if (!user || user.password !== password) {
    return {
      ok: false,
      code: "INVALID_CREDENTIALS",
      message: "Identifiants invalides pour la session de démonstration."
    };
  }

  const activeOrganizations = user.organizations.filter(
    (organization) => organization.status === "active"
  );

  if (activeOrganizations.length === 0) {
    return {
      ok: false,
      code: "NO_ACTIVE_ORGANIZATION",
      message: "Aucune organisation active n'est rattachée à ce compte."
    };
  }

  if (user.firstLogin) {
    return {
      ok: true,
      user,
      destination: "first-login",
      organizations: activeOrganizations,
      reason: "L'utilisateur doit finaliser sa première connexion avant d'accéder à GESTOCK."
    };
  }

  if (user.mfaRequired) {
    return {
      ok: true,
      user,
      destination: "mfa",
      organizations: activeOrganizations,
      reason: "Le rôle ou le profil impose une vérification MFA."
    };
  }

  const defaultOrganization = activeOrganizations.find(
    (organization) => organization.id === user.defaultOrganizationId || organization.isDefault
  );

  if (defaultOrganization) {
    return {
      ok: true,
      user,
      organization: defaultOrganization,
      organizations: activeOrganizations,
      destination: "dashboard",
      reason: "Une organisation par défaut est configurée, l'utilisateur arrive directement au dashboard."
    };
  }

  if (activeOrganizations.length === 1) {
    return {
      ok: true,
      user,
      organization: activeOrganizations[0],
      organizations: activeOrganizations,
      destination: "dashboard",
      reason: "Le compte appartient à une seule organisation active."
    };
  }

  return {
    ok: true,
    user,
    organizations: activeOrganizations,
    destination: "organization-selection",
    reason: "Le compte couvre plusieurs organisations sans organisation par défaut."
  };
}
