# ADR 0003 - Authentification JWT et autorisation RBAC + ABAC

## Statut

Accepté

## Contexte

L'API multi-tenant doit authentifier les utilisateurs et limiter finement les
actions par rôle et attributs métier (tenant, ressource, contexte).

## Décision

- Authentification via JWT avec claim `tid` (tenant), `sub` (user) et `roles`.
- RBAC pour la matrice de permissions par rôle.
- ABAC en garde-fou systématique : un utilisateur ne peut accéder qu'à son `tid`.
- En bootstrap, mode `mock/dev` autorisé via headers pour accélérer le delivery.
- Aucun provider OAuth/IdP complet n'est implémenté à ce stade.

## Conséquences

- Les routes protégées utilisent des middleware dédiés (`requireAuthenticated`,
  `requirePermission`) dès la première itération.
- Le passage en auth réelle demandera uniquement un adaptateur de vérification JWT.
- Les permissions deviennent explicites et testables route par route.
