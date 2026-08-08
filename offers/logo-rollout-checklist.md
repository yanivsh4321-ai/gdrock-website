# Logo rollout checklist

New mark: `gdrock2.0.png`, prepared into these files:

| Asset | Path | Use |
|---|---|---|
| Light mark (transparent) | `assets/gdrock-mark-light.png` | on dark backgrounds — the site, the app |
| Dark mark (transparent) | `assets/gdrock-mark-dark.png` | on light backgrounds — light cookie banners, invoices, letterhead |
| Square avatar | `assets/avatar-400.png` | 400×400, profile pictures |
| Social card | `assets/og-card.png` | 1200×630, link previews |
| LinkedIn banner | `assets/linkedin-banner-1128x191.png` | 1128×191 company/profile banner |
| PWA icons | `assets/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | installed console app icon |

Use the **transparent** versions wherever the background is already dark or light
and known. Use `avatar-400.png` wherever a platform crops to a square or circle —
it has safe-zone padding so the mark doesn't get clipped.

---

## Done in the repo

| # | Where | Status |
|---|---|---|
| 1 | Nav logo on all 12 HTML pages | done — 18 instances replaced |
| 2 | Footer logo | done |
| 3 | Favicons on every page | done — was an inline SVG data URI |
| 4 | Cookie banner inside `gdrock-worker.js` | done — **now theme-aware**, picks light or dark based on the banner's resolved surface so it can't vanish on a light client site |
| 5 | Banner customizer (`gdrock-banner/public/customize.html` and the nested copy) | done — absolute URLs, since it's served from another origin |
| 6 | PWA / apple-touch icons + `manifest.webmanifest` targets | done — regenerated from the new mark on `#08090c` |
| 7 | `og:image` / `twitter:image` | done — now `assets/og-card.png` (was `risk-bg.png`) |
| 8 | JSON-LD `Organization.logo` | done |
| 9 | `live site/` mirror | done |

Old shield SVG remaining anywhere in the repo: **zero**.

---

## You need to do these by hand

I can't reach these — they're outside the repo.

### Priority: anything a prospect sees on a call

| # | Where | What to upload | Notes |
|---|---|---|---|
| 1 | **Email signature** (`office@gdrock.com`) | `avatar-400.png`, or the dark mark on white | Zoho Mail → Settings → Signature. Most-seen surface you own. |
| 2 | **LinkedIn — personal profile photo** | `avatar-400.png` | If you're the face of GDRock, consider keeping your own photo and putting the mark on the company page instead. |
| 3 | **LinkedIn — personal banner** | `linkedin-banner-1128x191.png` | Personal banner is 1584×396 — I made the 1128×191 company size. Say the word and I'll generate the personal one too. |
| 4 | **LinkedIn — company page logo + banner** | `avatar-400.png` + banner | Company logo displays at 300×300. |
| 5 | **Zoho Invoice / Books branding** | dark mark on white | Invoices are usually printed or PDF'd on white — use `gdrock-mark-dark.png`. |
| 6 | **Zoho payment pages** | `avatar-400.png` | Checkout hands off to Zoho, so a stale logo there breaks the flow right at payment. |

### Secondary

| # | Where | What |
|---|---|---|
| 7 | Google Business Profile, if you have one | avatar |
| 8 | X / Twitter profile + header | avatar + a 1500×500 header (ask and I'll cut it) |
| 9 | Any directory listings (Product Hunt, SaaS directories, AlternativeTo) | avatar |
| 10 | Loom profile picture | avatar — your outreach videos show it |
| 11 | Calendar booking page (Cal.com / Calendly) | avatar |
| 12 | GitHub org or profile, if public | avatar |
| 13 | Slack / Discord workspaces you sell in | avatar |
| 14 | Outreach email templates in `nudge_drafts/` and `make_emails.py` | check for an inline logo or old image URL |
| 15 | The `free-starter-pack.zip` contents | the PDFs inside likely carry the old mark |
| 16 | `gdrock-enterprise-pricing-guidelines.pdf` | carries old branding |

### Worth checking

- **Cloudflare / CDN cache.** After deploying, purge `cdn.gdrock.com` so the banner
  logo actually changes for existing sites. Without this, live client banners keep
  serving the old base64 mark from cache.
- **Apple touch icon on already-installed consoles.** Anyone who added the console
  to a home screen keeps the old icon until they re-add it.
- **Email clients cache images hard.** Your signature may look stale to existing
  threads for a while.

---

## Vector assets (added 2026-08-07)

Both were produced by **contour-tracing `gdrock2.0.png`** with OpenCV, not drawn
by eye. The mark is polygonal, so the trace recovered it almost exactly: seven
outer vertices (a regular heptagon) plus the bolt as an interior hole.

| Asset | What it is | Use it for |
|---|---|---|
| `assets/favicon.svg` | Simplified silhouette on a rounded `#08090c` tile | Browser tabs. Wired into all 13 pages, with the PNG as `alternate icon` fallback. |
| `assets/gdrock-mark.svg` | Flat silhouette, `fill="currentColor"` | Anywhere the mark must inherit text colour or scale sharply — buttons, inline icons, print. |

**Important limitation:** both SVGs are **flat single-colour**. The original mark
has faceted grey shading that reads as a 3D gem; a traced silhouette cannot carry
that, and at favicon sizes it shouldn't try. So:

- **Nav and social keep the raster PNGs** — they preserve the faceted artwork as
  supplied. I did not silently flatten your logo.
- **The favicon uses the SVG** — a simplified mark is the correct choice at 16px,
  and it now reads cleanly on both light and dark tab chrome (verified at 16/32/64px).

**Still worth getting the true vector.** If whoever designed the logo has the
source (`.ai`, `.fig`, `.svg`), that file would carry the facets *and* scale
perfectly, and it should replace `gdrock-mark.svg`. My trace is a good working
substitute, not the master artwork.
