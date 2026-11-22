# Agent Data Store on Apify

Four Apify Actors that sell the Agent Data Store's data to Apify users (people, companies and AI agents via Apify's MCP server). Each Actor calls the live API through a private partner key; Apify bills the user per result and pays out 80%.

| Folder | Store listing | Event to price (Monetization → Pay per event) | Suggested price |
|---|---|---|---|
| `public-domain-check` | Public Domain Check: US Copyright Status | `work-checked` / `work-checked-full` | $0.01 / $0.02 |
| `sanctions-check` | Sanctions Check: OFAC Wallet & Name Screening | `wallet-checked`, `name-screened`, `name-screened-full` | $0.002, $0.003, $0.005 |
| `property-risk-report` | Property Risk Report: US Natural Hazards | `report` / `report-full` | $0.03 / $0.05 |
| `sanctions-watchlist-monitor` | Sanctions Watchlist Monitor: OFAC Alerts | `item-checked` | $0.002 |

Each Actor needs two environment variables (Source → Environment variables):
- `PARTNER_KEY` (mark as Secret): the key after `apify:` in the server's `PARTNER_KEYS` variable.
- `API_BASE` (optional): defaults to https://public-domain-check-production.up.railway.app

Users are charged only for results that came back; invalid inputs and unanswerable lookups are free.
