from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(slots=True, frozen=True)
class Warehouse:
    warehouse_id: str
    code: str
    name: str
    company_id: str
    site_id: str
    location: str

    def to_dict(self) -> dict:
        return asdict(self)
