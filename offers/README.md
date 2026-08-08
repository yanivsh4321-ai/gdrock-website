# GDRock — offer catalog

Internal source of truth for what GDRock sells, to whom, at what price, and what
is *not* included. Written 2026-08-07. If a price changes on the site, change it
here in the same session.

## The four things you sell

| # | Offer | Price | Billing | Buyer | File |
|---|---|---|---|---|---|
| 1 | **Core Pack** | €29 | one-time | Solo store owner who will paste code themselves | [01-core-pack.md](01-core-pack.md) |
| 2 | **Care** | €15/mo | monthly | Store owner who wants it hosted and maintained | [02-care.md](02-care.md) |
| 3 | **Done-For-You** | €249 / €599 / €1,500 | one-time | SMB or SaaS that will not touch a file | [03-done-for-you.md](03-done-for-you.md) |
| 4 | **Agency Portfolio** | €299 / €499 / €799 per month | monthly | Agency with 10+ client sites | [04-agency-portfolio.md](04-agency-portfolio.md) |

Plus the free entry point that feeds all four: [00-free-scanner.md](00-free-scanner.md).

## Why this ladder, in one paragraph

Each offer answers a different question, so they don't compete with each other.
Core Pack answers *"give me the documents."* Care answers *"keep it correct
without me."* Done-For-You answers *"do it for me."* Agency Portfolio answers
*"do it across all my clients without charging me per domain."* The old ladder
broke this rule: Core Pack promised "lifetime updates" while Care sold
"auto-updates," so the €29 one-time product was strictly better value than the
€39/month one and a rational buyer always picked it. That is fixed — Core Pack is
now explicitly documents-only, no hosting and no updates.

## Pricing rationale

See [pricing-analysis.md](pricing-analysis.md) for the competitor data and the
reasoning behind every number.

Short version:

- **Recurring got cheaper (€39 → €15).** At €39 GDRock was more expensive than
  Cookiebot's post-increase €30 and 4–7× iubenda/CookieYes. A brand with no case
  study cannot charge a premium over the category leader.
- **Services got more expensive (€199/€499/€999 → €249/€599/€1,500).** That price
  buys founder hours, volume is low, and the buyer is not comparison-shopping
  against a €9 plugin.
- **Pro (€79/mo) was deleted.** "Up to 2 stores" for €79 was worse value per site
  than the agency tier. Multi-site is now an add-on: €9/mo per extra site.
- **Agency is the real business** and now sits in the pricing grid instead of a
  footnote.

## What is genuinely not built yet

Be straight about these on calls. They are the honest gaps as of 2026-08-07:

- **No multi-tenant agency back end.** The console takes `?site=` and keeps a
  local list per browser. It is a real console over real data, but there is no
  agency login that owns 25 client accounts server-side.
- **No case study.** First Founding Partner pilot is in progress. Do not imply
  otherwise.
- **Company registration pending.** This matters now that checkout charges VAT.
- **Consent-log retention/export beyond the console view** is not documented.
- **Automated policy regeneration on law change** is a Care promise that
  currently depends on you doing it. Keep the promise small until it is automated.
