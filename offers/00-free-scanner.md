# 00 · Free GDPR scanner — the entry point

**Price:** free · **Billing:** none · **Where:** the homepage hero

## What it is

A real scan of a real URL that returns a compliance score out of 100, a plain
description of the site, a summary, and the specific findings. It runs from a
single field — the domain. No account, no card, and no email needed to see the
result.

## Who it is for

Everyone. This is the top of the funnel and the only asset that gets a stranger to
hand over their domain within ten seconds of landing.

## What the visitor gets

| Step | What happens |
|---|---|
| 1 | Types their domain, presses **Scan my site** |
| 2 | ~20 seconds of real analysis across 14 compliance points |
| 3 | Score out of 100, colour-coded, with a one-line verdict |
| 4 | The actual findings list, plus what the site was identified as |
| 5 | *Then* the offer: leave an email and get the full report + free banner pack |

## Why the email comes second

Asking for an email before showing anything contradicted the page's own "no
account needed" promise, and it cost scans. The API returns the whole result from
the URL alone, so there is nothing to gate. The visitor sees value, *then* decides
whether the full report is worth an address. The email step is where the lead is
actually captured.

## What it does NOT do

- It is **not** a legal audit, not legal advice, and not a compliance guarantee.
  That disclaimer ships on the page and must stay.
- It does not fix anything. It is diagnosis only — the fix is Core Pack upward.
- If a domain cannot be verified as a live public site, it says so and shows a
  dash. It does not invent a score, and it does not offer to email a report it
  cannot produce.

## What it feeds

| Scan result | Natural next offer |
|---|---|
| Low score, solo store | Core Pack €29, or Care €15/mo |
| Low score, real revenue | Done-For-You €249+ |
| They mention "my clients" | Agency Portfolio — stop selling, book a call |

## Operating notes

- Endpoint: `POST cdn.gdrock.com/api/scan` with `{url}`. Email optional; include it
  and the API sends the full report.
- Leads land via `POST cdn.gdrock.com/api/lead` with source `scanner`.
- Failure modes are honest: unreachable site and timeout each get their own
  message, and neither claims an email was sent.
