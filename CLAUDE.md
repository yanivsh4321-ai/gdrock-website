# GDRock — Claude Code project config

## Second brain (shared memory)
At the start of every session, also read the central brain vault so you have full cross-project context:
- `C:\Users\Janiv_sh\Desktop\Brain\CLAUDE.md` — boot config + rules that can't lapse.
- `C:\Users\Janiv_sh\Desktop\Brain\VAULT-INDEX.md` — profile, full rules, system map.
- `C:\Users\Janiv_sh\Desktop\Brain\gdrock_master.md` — rolling GDRock strategy/overview (the master file). Read it.
- `C:\Users\Janiv_sh\Desktop\Brain\02 - GDRock\GDRock.md` — this project's index.
- `C:\Users\Janiv_sh\Desktop\Brain\Active Priorities.md` — what's currently open.

When something changes that a future session needs, persist it to its place in the brain vault (and today's daily note), not only here.

## Auto-sync the brain (always, no asking)
Whenever anything about GDRock changes in a session — site, worker, pricing, billing, outreach, infra, offers, stack, or strategy — **automatically update the brain in the same session, before finishing**:
- Update `C:\Users\Janiv_sh\Desktop\Brain\gdrock_master.md` (append, never delete — correct by adding a dated note), and
- Update its proper detailed home (`Active Priorities.md`, `02 - GDRock\*`, today's daily note).
This is not optional and does not need a prompt. A Stop hook reminds you each turn, but you own the actual write.

## This repo
GDRock GDPR-compliance SaaS — static site deployed via Vercel from the repo root. `index.html` is live; **re-sync `live site/index.html` after every edit**. See the GDRock index note above for the full deploy/mirror/CDN rules and the [[Ship a GDRock Site Change]] Job.
