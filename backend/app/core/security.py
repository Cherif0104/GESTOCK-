from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, status


@dataclass(frozen=True, slots=True)
class AuthUser:
    user_id: str
    name: str
    role: str
    permissions: frozenset[str]


_TOKEN_DIRECTORY: dict[str, AuthUser] = {
    "superadmin-demo-token": AuthUser(
        user_id="u-admin",
        name="Admin Plateforme",
        role="superadmin",
        permissions=frozenset(
            {
                "organizations:manage",
                "catalog:write",
                "catalog:read",
                "warehouses:write",
                "warehouses:read",
                "inventory:write",
                "inventory:read",
                "procurement:write",
                "procurement:read",
                "reporting:read",
            }
        ),
    ),
    "operator-demo-token": AuthUser(
        user_id="u-operator",
        name="Opérateur Logistique",
        role="operator",
        permissions=frozenset(
            {
                "catalog:read",
                "warehouses:read",
                "inventory:read",
                "inventory:write",
                "procurement:read",
                "reporting:read",
            }
        ),
    ),
}


def get_current_user(authorization: str = Header(default="")) -> AuthUser:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton Bearer requis dans l'en-tête Authorization.",
        )
    token = authorization.removeprefix("Bearer ").strip()
    user = _TOKEN_DIRECTORY.get(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton invalide.",
        )
    return user


def require_permission(permission: str):
    def permission_dependency(
        user: AuthUser = Depends(get_current_user),
    ) -> AuthUser:
        if permission not in user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission manquante: {permission}",
            )
        return user

    return permission_dependency
