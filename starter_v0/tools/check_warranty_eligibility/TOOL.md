---
name: check_warranty_eligibility
track: bonus
kind: local_inventory
provider: fictional_local_assets
requires_env: []
inputs: [asset_id, issue_type]
outputs: [eligible, warranty_until, days_remaining, recommended_next_step]
side_effect: false
---
# check_warranty_eligibility

Reads only the fictional `helpdesk_data/assets.json` snapshot and evaluates an
asset's warranty against the snapshot reference date (2026-09-14). It never
uses web search, never sends identifiers externally, and never creates a
ticket. A repair ticket remains a separate confirmed action.
