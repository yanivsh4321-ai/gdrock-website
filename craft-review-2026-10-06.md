# GDRock homepage: craft review, 6 October 2026

Reviewed `index.html` + `assets/gdrock.css` as served at gdrock.com, desktop and 375px, with the 14 Emil Kowalski skills installed tonight (emil-design-eng, review-animations, find-animation-opportunities, apple-design, mobile-native, break-ui). The demo with every fix applied is `demo-craft.html` + `assets/craft/craft.css`; the live page is untouched.

## Rating

| Area | Score | One line |
| --- | --- | --- |
| Visual design and typography | 8.5 / 10 | Geist, one accent, one light band, tabular numbers on fines. It reads as a tool, not a template. |
| Copy and clarity | 8 / 10 | Specific, honest, no slop. The hero headline is the one line that still sounds like a slogan. |
| Motion craft (Emil's bar) | 7 / 10 | Right instincts: custom curves, 180 to 220ms, GPU transforms, reduced motion. Missing the basics people feel: press feedback, gated hover, a drawer and FAQ that snap. |
| Mobile feel | 6 / 10 | No overflow, thumb-high scan field. But tap flash, 15px inputs that zoom iOS, sticky bar that pops, no theme colour, no safe area. |
| Performance | 8 / 10 | Fonts self-hosted and preloaded, GSAP lazy, static-first. One console error on every load (CSP vs Cloudflare Insights). |
| **Overall** | **7.6 / 10** | A strong page with an unfinished last 10 percent. All of it is cheap to fix and none of it needs a redesign. |

What's already right, so nobody "fixes" it: the scan band as the only light surface; the report rendered from the scanner's own result with a 45ms stagger; the ledger cross-light that carries information; the typed install tag; the fail states that never dress up as success; `--ease` at `.16,1,.3,1`; reduced motion handled everywhere GSAP runs.

## Findings (review-animations format)

| Before | After | Why |
| --- | --- | --- |
| `.btn-1:active{transform:translateY(0)}` (gdrock.css:112), same on `.btn-scan` (214). No press on `.btn-2`, burger, presets, report rows. | `transform:scale(.97)` on `:active`, 160ms `--ease-out`; tone change on full-width rows | Native buttons answer on touch-down. These answered on release, which reads as lag even at 0ms. |
| `.btn-1:hover{transform:translateY(-1px)}` (111), `.btn-3:hover` (116), `.btn-scan:hover` (213), `.mk-pre:hover{scale(1.08)}` (422), `.hero-down:hover` (162), arrow nudges (123, 217): all ungated | Same rules inside `@media (hover:hover) and (pointer:fine)` | On a phone the first tap applies `:hover` and leaves it. A lifted button stays lifted. |
| `#drawer{display:none}` / `#drawer.open{display:block}` (147 to 148) | Always rendered; `opacity + translateY(-6px) scale(.98)` from `transform-origin: top`, 200ms in, 150ms out, links staggered 25ms | A menu teleported in with no origin. It now comes from the burger's edge and can be interrupted. |
| FAQ `<details>` opens instantly; only `.chev` rotates (454) | `::details-content{height:0}` to `height:auto` in 200ms with `interpolate-size:allow-keywords` | The one place height is tolerated. Browsers without support keep today's instant open. |
| `#sticky.on{display:flex}` (497) | `translateY(100%)` to `0`, 250ms in, 200ms out, `visibility` gated | A bar that lives on the bottom edge should arrive from it and leave through it. |
| `.pulse` animates `box-shadow` 2.2s infinite (183) | `::after` ring on `transform + opacity` | Same idea, no paint per frame. (Kept: it says "the scanner is live".) |
| `.consent input::before{transform:scale(0)}` (279) | `scale(.6) + opacity:0` to `scale(1)` | Nothing in the real world appears from nothing. |
| `#mk-logo-svg{transition:width,height .15s}` (440), `.mk-banner{transition:border-radius}` (433) on slider-driven values | `transition:none` on anything a slider drives | Direct manipulation is 1:1. A 150ms lag between thumb and preview makes the customizer feel laggy. Preset clicks keep 150ms. |
| `.bar i{transition:transform .5s var(--ease)}` (234) | `transform 1s linear` | Progress is a measurement; it shouldn't ease. Steps tick every 1.1s, so the bar now never stops. |
| `header.nav{transition:border-color .25s,background .25s}` (132), built-in `ease` | `--ease-out` | Built-in curves are too weak for a deliberate change. |
| `--ease-out:cubic-bezier(.22,1,.36,1)` (43) | `cubic-bezier(.23,1,.32,1)` | Stronger punch; reused by every hover, focus and reveal. |
| `prefers-reduced-motion` collapses every transition to .01ms (507) | Opacity and colour keep 150ms; only transforms go | Reduced motion means gentler, not zero. Fades still bridge state changes. |
| No `:active` on the chat launcher; `transition:transform .2s` built-in ease (gdrock-chat.js:9) | `scale(.96)` press, `--ease-out` | Same rule as every other pressable. |

## Mobile-native table

| Symptom | Cause | Fix in craft.css |
| --- | --- | --- |
| Grey flash on every tap (iOS, Android) | No `-webkit-tap-highlight-color` reset | `html{-webkit-tap-highlight-color:transparent}` + the press states above |
| iOS zooms into the email fields and never zooms back | `.inp` 15.5px, scanbar 15px, chat input 13.5px | `16px` at `(pointer:coarse)` |
| First tap on a button feels slow | No `touch-action` | `touch-action:manipulation` on every control |
| Long-press selects button labels | No `user-select` on controls | `user-select:none` on controls only, never on text |
| Browser chrome stays white around a black page | No `theme-color` | `<meta name="theme-color" content="#08090c">` + `color-scheme: dark` |
| Sticky bar sits on the home indicator | No safe-area padding, no `viewport-fit=cover` | Both added |
| Footer links and install steps are 22px tall | Line-height only | 8px vertical padding at coarse pointer |

Verified from code and the desktop app's browser: no horizontal overflow at 375px, no element wider than the viewport, scan field and button 58px tall on phones. Needs a real phone before anyone calls it done: tap flash, sticky hover, keyboard behaviour, safe area.

## Worst-case data (break-ui)

Held up: a 52-character domain in the report header wraps cleanly at 375px; a 90-character finding title wraps without pushing the badge off the row; evidence code blocks use `overflow-wrap:anywhere`; fine amounts use tabular figures; counts pluralise (`plural()`). Nothing broke. The sample report is the real gdrock.com result, so there is no fake data to drift from.

Fragile: the report email and deep-check email are the only places a visitor types; both validate before sending. Fine.

## Animation opportunities (gated, most rejected)

| # | Where | Purpose | Verdict |
| --- | --- | --- | --- |
| 1 | Hero h1, lede, arrow on first paint | Delight, first-time only | **Added**: 10px rise, 500ms, 70ms apart, CSS animation so it stays smooth during load |
| 2 | Pricing card hover | Decoration, tens/day | Rejected. The hairline border is enough. |
| 3 | Section reveals on scroll | Decoration | Rejected. The page already has two authored moments (ledger, install) and they carry information. A third would dilute them. |
| 4 | Count-up on the pricing numbers | Decoration on data | Rejected. Prices are read, not watched. |
| 5 | Report rows re-animating on scan again | Already there | Kept as is. |

The interface needs less motion than it could have, and that is correct for a tool people compare prices on.

## Bugs outside motion

1. **CSP blocks Cloudflare Web Analytics on every load.** Console: `static.cloudflareinsights.com/beacon.min.js violates script-src`. Either add `https://static.cloudflareinsights.com` to `script-src` in `vercel.json`, or switch Web Analytics off in the Cloudflare dashboard. Right now it's an error on every visit and no analytics. Not changed in the demo because `vercel.json` is production config.
2. "Six presets to start" in the Fix section; the customizer has ten. Understatement, your call.
3. `gdrock-chat.js` animates its panel with built-in `ease` and lifts on hover ungated. Same two fixes, separate file.

## The demo

Open `demo-craft.html` from the repo root (it needs the site served, not opened as a file, because asset paths are absolute). Locally:

```bash
python -m http.server 8787 --bind 127.0.0.1
```

then http://127.0.0.1:8787/demo-craft.html. Everything that changed is in `assets/craft/craft.css` (15 numbered blocks, each with its reason) plus four `<meta>` lines in the head. The page carries a small "Craft demo" tag bottom-left so a screenshot can't be mistaken for production.

To ship: add the same `<link rel="stylesheet" href="/assets/craft/craft.css">` under the gdrock.css link in `index.html`, copy the four meta lines, re-sync `live site/index.html`. Or fold the rules into gdrock.css once you've looked at it. Nothing else moves.

Not changed on purpose: copy, layout, colours, the GSAP moments, the banner script, the chat widget's own file, `vercel.json`.
