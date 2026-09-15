from __future__ import annotations

import json
from datetime import date
from typing import Any

from tools._shared import ROOT, err


ASSET_FILE = ROOT / "helpdesk_data" / "assets.json"
REFERENCE_DATE = date(2026, 9, 14)
VALID_ISSUE_TYPES = {"hardware", "battery", "display", "keyboard", "other"}


def check_warranty_eligibility(asset_id: str = "", issue_type: str = "hardware") -> dict[str, Any]:
    """Return deterministic warranty eligibility from fictional local asset data."""
    try:
        wanted_id = (asset_id or "").strip().upper()
        wanted_issue = (issue_type or "hardware").strip().lower()
        if not wanted_id:
            return {"tool": "check_warranty_eligibility", "error": "missing_asset_id"}
        if wanted_issue not in VALID_ISSUE_TYPES:
            return {"tool": "check_warranty_eligibility", "asset_id": wanted_id, "error": "invalid_issue_type"}

        data = json.loads(ASSET_FILE.read_text(encoding="utf-8"))
        asset = next((item for item in data["assets"] if item["asset_id"] == wanted_id), None)
        if asset is None:
            return {"tool": "check_warranty_eligibility", "asset_id": wanted_id, "error": "asset_not_found"}

        warranty_until = date.fromisoformat(asset["warranty_until"])
        days_remaining = (warranty_until - REFERENCE_DATE).days
        eligible = days_remaining >= 0
        recommended_next_step = (
            "Collect diagnostics, then ask for explicit confirmation before creating a vendor-repair ticket."
            if eligible
            else "Warranty has expired; provide the support option and ask before creating any out-of-warranty ticket."
        )
        return {
            "tool": "check_warranty_eligibility",
            "asset_id": wanted_id,
            "issue_type": wanted_issue,
            "reference_date": REFERENCE_DATE.isoformat(),
            "warranty_until": warranty_until.isoformat(),
            "days_remaining": days_remaining,
            "eligible": eligible,
            "recommended_next_step": recommended_next_step,
            "data_source": "fictional_local_assets",
        }
    except Exception as exc:
        return err("check_warranty_eligibility", exc)
