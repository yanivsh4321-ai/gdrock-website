# Pricing analysis — why each number is what it is

Researched 2026-08-07. Re-check the competitor column at least twice a year;
Cookiebot moved once already and Estonia/Finland/Romania/Slovakia all moved VAT
rates recently.

## The market

| Vendor | Entry price | Model | Note |
|---|---|---|---|
| iubenda | **$5.99/mo** | per site | cheapest credible option |
| CookieYes | **$8.33–$25/mo** | per domain | strongest for single-site SMB |
| Termly | **$14/mo** | per domain | policy generation focus |
| Cookiebot | **€30/domain/mo** | per domain | **doubled from ~€15 in Aug 2025** |
| Generic entry vendors | **€9/mo** (€99/yr) | per domain | floor of the market |
| **What agencies bill clients** | **~€45/site** | markup | resell margin ~30%, some vendors give up to 50% off |

Sources: [Cookiebot alternatives, tested](https://www.enzuzo.com/blog/best-cookiebot-alternatives) ·
[CookieYes pricing](https://toolradar.com/tools/cookieyes/pricing) ·
[Best CMP for agencies](https://consently.net/blog/best-cmp-for-agencies) ·
[White-label agency guide](https://elementor.com/blog/white-label/) ·
[Cookie consent software compared](https://www.enzuzo.com/blog/best-cookie-consent-software)

## Where GDRock was wrong

**Care at €39/mo was the single worst number in the business.** It was above
Cookiebot's increased price and 4–7× the cheap end, from a company with no
customers and no case study. Every competitive comparison ended with "and it's
more expensive."

**Core Pack cannibalised Care.** Core Pack (€29 once) said *"Lifetime updates."*
Care (€39/mo) said *"auto-updates on law changes."* Same benefit, one-time vs
recurring. Any buyer who read both pages correctly chose €29. The bundle was the
bug — not the price.

**Done-For-You was underpriced.** €199 for a hands-on install by the person who
built the product, in a market where agencies bill €45/site/month, is leaving
money on the table. This is the only offer where you sell hours, and hours are
the thing you have least of.

**Pro was incoherent.** €79/mo for "up to 2 stores" = €39.50/site, worse than the
agency tier's €12/site, from the same vendor. It punished the customer for
growing.

## The new numbers

### Care: €15/mo

Sits deliberately between CookieYes ($8.33) and Cookiebot (€30). Close enough to
the cheap end to survive a spreadsheet comparison, high enough to be a real
business at volume, and it lets you say the thing that matters right now:
**Cookiebot doubled its price; we're half of it and we install it for you.**

Extra sites at €9/mo each. That is the market floor per domain and it means
growth is cheap for the customer instead of punishing.

### Core Pack: €29 one-time, documents only

Unchanged price, changed promise. No hosting, no updates, no renewal. It is now a
genuinely different product from Care rather than a cheaper version of it. Keep it
because €29 one-time against €99/yr competitors is a strong, honest entry point
and it converts scanner traffic that will never subscribe.

### Done-For-You: €249 / €599 / €1,500

| Tier | Was | Now | Reasoning |
|---|---|---|---|
| Basic setup | €199 | **€249** | still an easy yes for a store doing real revenue |
| Shopify full setup | €499 | **€599** | includes theme work; €599 reads as considered, €499 as arbitrary |
| SaaS compliance | €999 | **€1,500** | DPAs, processor mapping and retention design for a SaaS is a multi-day job and €999 was a discount nobody asked for |

### Agency Portfolio: €299 / €499 / €799

| Sites | Price | Your price per site | Agency bills ~€45/site | Agency gross margin |
|---|---|---|---|---|
| 25 | €299/mo | €11.96 | €1,125/mo | **€826/mo · 73%** |
| 50 | €499/mo | €9.98 | €2,250/mo | **€1,751/mo · 78%** |
| 100 | €799/mo | €7.99 | €4,500/mo | **€3,701/mo · 82%** |

This is the whole pitch and it is arithmetic, not a claim. Per-domain pricing is
the thing that punishes agencies hardest at scale, and every major competitor
charges that way. Portfolio pricing is the actual wedge — lead with it.

## Revenue shape this creates

At the same unit volume, the restructure trades a little self-serve ARPU for a
much better conversion rate and a far higher services line:

- Self-serve recurring: **−62% per subscriber** (€39 → €15), but competing at a
  price a buyer will actually accept, and multi-site now expands instead of capping.
- Services: **+25% to +50% per job.**
- Agency: unchanged headline, but now visible in the pricing grid and supported by
  margin maths a buyer can check.

The fastest path to revenue is not the €15 plans. It is **agency portfolios and
Done-For-You** — few deals, high value, and both are sold on a call rather than
self-serve. Price the self-serve tiers to be credible and unblock the funnel;
spend your actual selling time on the two offers at the top.

## Things to decide later

- Annual billing on Care (2 months free is the standard lever) — not built.
- Whether Core Pack should become a €0 lead magnet once Care converts reliably.
- **VAT is currently not charged at all.** GDRock Ltd is not VAT-registered yet, so
  `checkout.html` adds nothing and says so on the page. The full rate table,
  reverse-charge rule and per-country logic are built and tested — they are gated
  behind one constant:

  ```js
  var GDROCK_VAT_NUMBER = null;   // set to e.g. 'GB123456789' when registered
  ```

  Setting that turns VAT on everywhere at once. Verified in both states: with it
  `null`, a German buyer pays €15; with it set, €17.85 (19%), a Hungarian €19.05
  (27%), and an EU business with a valid VAT ID gets reverse charge at €15.

- Prices are quoted **VAT-exclusive**, which is normal B2B. If you ever sell to
  consumers, EU consumer law expects VAT-inclusive display — that is a copy change
  on the pricing section plus a `money()` change in checkout, not a rebuild.
