# Black Friday 2026: "Get your banner right before Black Friday"

Black Friday is **Friday 27 November 2026**. The hook runs **1 to 27 November**. Copy only: no discount, no countdown, no "last chance". Ads stay inside the €180 test cap.

The one real deadline: **installs booked by 20 November are finished before the day.** Only say it while it's true (switch the line off if the install queue is full).

## It switches itself (no action needed)

All three places turn on by date, **1 to 27 November 2026 (UTC)**, and off again on 28 November. The "book by 20 November" install promise drops by itself on 21 November.

| Place | What shows | Override |
|---|---|---|
| Homepage (`index.html`, band `#bf` under the hero) | Eyebrow, headline, one paragraph, two buttons | The dates sit in the small script right under the band |
| Core Pack page (`pack.html`) | The "Stuck?" box and the free-plan bar change | `BF_ON` / `BF_BOOK` in `products/core-pack-v4-src/portal/pack.src.html` (rebuild with `python products/core-pack-v4-src/policy.py && python products/core-pack-v4-src/portal/build_portal.py`) |
| Deep-check email (leaking results only) | One line under the €249 offer | Worker var `BF_ON`: `1` forces on, `0` forces off (`npx wrangler secret put BF_ON`), no deploy needed |

If the install queue fills up before 20 November, turn the promise off early: delete the `bf-book` span on the homepage and set `BF_BOOK = false` in pack.src.html.

## The copy

**Homepage band**
- Eyebrow: BEFORE BLACK FRIDAY · 27 NOVEMBER
- Headline: Get your banner right before Black Friday.
- Body: Your busiest week is when your ad tags fire most. If they send data before a visitor chooses, that happens on every visit. Check your store now. Book an install by 20 November and we finish it before the day.
- Buttons: Check my store free (→ #scan) · We install it, from €249 (→ dfy.html)

**Core Pack page**
- Stuck box: **Black Friday is 27 November.** Get the banner in before your busiest week. Stuck? We install it, from €249: book by 20 November and it's done before the day. [We install it, from €249]
- Free-plan bar: **Before Black Friday.** Start here and the policy builder are free. Unlock the blocker, every guide and the forms in one go. [Unlock everything for €29]

**Deep-check email (score under 90)**
- **Black Friday is 27 November.** Every tag above fires for every visitor that week. Book by 20 November and we fix <domain> before then.

**Ad lines, if a hook test runs (inside the €180 cap)**
- Meta primary (≤125): Your busiest week is when your ad tags fire most. See what your store sends before anyone clicks Accept. Free check.
- Meta headline (≤40): Your banner, right before Black Friday (38)
- Google headline (≤30): Fix Your Banner Before BFCM
- Google description (≤90): A real browser in Germany checks what fires before consent. Free, results by email.

## Never
- No "compliant", "guaranteed", fines or "avoid a fine".
- No fake urgency: no timers, no "spots left", no price that "goes up".
- Don't claim "before Black Friday" for an install booked after 20 November.
