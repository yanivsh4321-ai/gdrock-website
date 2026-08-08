# 02 · Care

**Price:** €15/month · **Extra sites:** €9/month each · **Billing:** monthly, cancel anytime
**Checkout:** `checkout.html?plan=care`

## Who it is for

The store owner who does not want to think about this again. They will paste one
script tag and then expect GDRock to keep it correct.

Typical profile: same store as Core Pack, but values not-having-to-maintain-it over
saving €15/month. Often someone who already had a compliance scare.

## What they get

Everything in Core Pack, plus the part that matters:

| Deliverable | Detail |
|---|---|
| Hosted cookie banner | One script tag, served from `cdn.gdrock.com` |
| Auto-updates | When EU law changes, the hosted banner changes — no action from them |
| Pre-consent blocking | Non-essential trackers blocked until the visitor opts in |
| Timestamped consent logs | Every accept/reject recorded, viewable in the console |
| Console access | `app.html` — overview, consent logs, banner config, policy, data requests |
| Extra sites | €9/month each, same dashboard |

## The one-line install

```html
<script async src="https://cdn.gdrock.com/gdrock.js" data-site-id="theirstore.com"></script>
```

## Positioning against the market

| Competitor | Their price | The line to use |
|---|---|---|
| Cookiebot | €30/domain/mo — **doubled in Aug 2025** | "Half the price, and I install it for you." |
| CookieYes | $8.33–$25/mo | "Similar money, but you get the scanner, the documents and a human." |
| iubenda | $5.99/mo | "Cheaper than us. It also doesn't block trackers pre-consent by default or install itself." |
| Termly | $14/mo | "Same price. We host, block, log and update." |

Do not pretend to be the cheapest. iubenda is cheaper. Compete on *installed and
maintained*, not on price.

## What it explicitly does NOT include

- **Not an install service.** They still paste one tag. If they won't, that's
  Done-For-You.
- **No legal review.** No lawyer looks at their setup.
- **Not multi-tenant.** Extra sites are theirs, not clients'. Reselling to clients
  is the Agency Portfolio.

## Economics

€15/mo against near-zero marginal serving cost. The cost centre is the promise of
auto-updates: that is your ongoing obligation, and right now it depends on you
noticing a law change and shipping it. **Keep the promise narrow until it's
automated.** Say "we update the hosted banner," not "we keep you compliant."

## Guarantee

14-day money-back. Cancel any time, no notice period.
