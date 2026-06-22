from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(slots=True, frozen=True)
class Organization:
    organization_id: str
    name: str
    country_code: str
    default_currency: str
    default_timezone: str

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass(slots=True, frozen=True)
class TenantUser:
    user_id: str
    organization_id: str
    full_name: str
    email: str
    role: str

    def to_dict(self) -> dict:
        return asdict(self)
