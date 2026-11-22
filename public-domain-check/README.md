# Public Domain Check: US copyright status for books, films, songs and art

Find out whether a work is in the **US public domain**, the date it enters it, and why. Built for publishers, rights and clearance teams, AI-training data teams and anyone who needs a citable answer before quoting, reprinting, adapting or selling a work.

## Why this is different
- **Real records, not guesses:** 2.38 million US Copyright Office registrations (1923–1977) and 434,000 renewal records, linked together. For 1929–1963 works, status depends on whether the copyright was renewed; this Actor looks it up.
- **A second opinion:** HathiTrust's human copyright reviewers have examined 413,000+ US books; their verdict is included when it exists. Our answers agree with theirs about 89.5% of the time ([see the live benchmark](https://public-domain-check-production.up.railway.app/v1/pd-accuracy)).
- **Other countries in the same call:** UK, EU, Canada, Australia, Japan, China and India, including countries that lengthened terms without reviving expired works.
- **Free copies:** a link to a full-view scan when the work is public domain.

## Input
- **Works:** a list of `{ "title": "...", "author": "...", "year": 1939 }`. A title alone is usually enough for 1923–1977 books.
- **Countries (optional):** `uk,eu,canada` or `all`.
- **Answer detail:** brief (status, date, confidence, one-line reason) or full (complete reasoning and the matching records).

## Output (brief)
```json
{
  "title": "The Big Sleep",
  "status": "in_copyright",
  "public_domain_date": "2035-01-01",
  "confidence": "high",
  "why": "Published 1939 and renewed 1966 (R399023); protected 95 years, through 2034.",
  "matched": "Big sleep / Chandler, Raymond (1939)",
  "renewed_by": "Helga Greene (executor)",
  "evidence": ["A125939", "R399023"]
}
```

## Pricing
You pay per work checked, only when an answer comes back. Works the service can't answer (for example a 2005 novel with no year) are free.

## Use from AI agents
Run it from Claude, ChatGPT or any MCP client through Apify's MCP server, or call it from Zapier, Make or n8n.

*Informational only, not legal advice.*
