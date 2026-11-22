# Sanctions Watchlist Monitor: ongoing OFAC screening with alerts

Screening a wallet or customer once isn't enough. OFAC adds names and crypto addresses several times a month, and compliance programs are expected to **re-screen on an ongoing basis**. This Actor does that for you.

## How it works
1. Add the **wallets** and **names** you want to watch, and give the list a name.
2. **Schedule** the Actor (Apify Schedules: daily is typical).
3. Each run re-screens every item against the latest OFAC SDN and Consolidated lists and compares with the previous run.
4. When something changes (a wallet becomes sanctioned, a name starts matching, or a match clears), you get an **alert** at your webhook: Slack, Zapier, Make, n8n or your own endpoint.

## Output
- One dataset row per item: `status`, `previous_status`, `changed`, `direction` (escalated or cleared) and the matching listed entity.
- A run summary in the `OUTPUT` record: items checked, changes and current matches.

## Pricing
Pay per item checked per run. A watchlist of 20 wallets checked daily is about 600 checks a month.

## Tips
- Use separate **watchlist names** for separate customer lists; each keeps its own history.
- The first run sets the baseline; alerts start from the second run.
- For one-off checks, use **Sanctions Check** from the same publisher.

*Screening aid only, not legal or compliance advice. Confirm any potential match against official OFAC sources.*
