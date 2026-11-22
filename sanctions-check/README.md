# Sanctions Check: OFAC screening for crypto wallets and names

Screen **crypto wallet addresses** and **names** (people, companies, vessels, aircraft) against the US Treasury's OFAC SDN and Consolidated sanctions lists.

## What you get
- **Wallets:** whether the address appears on an OFAC list, with the listed entity, list and sanctions programs. Covers Bitcoin, Ethereum and EVM chains, USDT, USDC, Tron, Litecoin, Monero, Solana and more (1,000+ listed addresses).
- **Names:** fuzzy matching that handles word order, aliases, spelling variants and company suffixes, with a plain verdict: `no_match`, `potential_match` or `strong_potential_match`, and why.
- **Fresh data:** lists refresh from Treasury every 12 hours; every answer says when.

## Ongoing monitoring
To re-check the same wallets and names on a schedule and get alerted only when something changes, use **Sanctions Watchlist Monitor** from the same publisher.

## Input
- **Wallets:** one address per line.
- **Names:** one name per line, with an optional type filter.
- **Full match detail:** every candidate match with scores, identifiers and programs.

## Pricing
Pay per wallet checked or name screened. Invalid inputs are free.

## Use from AI agents
Available to Claude, ChatGPT and other MCP clients through Apify's MCP server, and from Zapier, Make and n8n.

*Screening aid only, not legal or compliance advice. Confirm any potential match against official OFAC sources.*
