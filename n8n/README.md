# GDRock — n8n Cloud reply-to-close workflow

`gdrock-reply-to-close.json` is the Phase-4 automation: it watches the cold-outreach
mailbox, and on every genuine human reply it marks the lead **REPLIED** in Supabase,
fires a **Telegram** alert within seconds, and on positive replies pushes the audit +
**cal.com** booking link for you to review and send.

It replaces `reply_watch.py` (same logic, visual instead of code). Pick one or the
other — don't run both against the same inbox or you'll get duplicate alerts.

```
Cold inbox (IMAP) ──▶ Classify reply ──┬──▶ Supabase: mark REPLIED
                                        └──▶ Telegram: reply alert ──▶ Positive? ──▶ Telegram: send audit + cal link
```

---

## Dependency (read first)
This watches the **new cold-sending domain mailbox** (Phase 1, e.g.
`outreach@getgdrock.com`) — **not** `gdrock.com`/Zoho. Until that mailbox exists you
can still import the workflow and wire Supabase + Telegram; just add the IMAP
credential and flip it Active once the mailbox is live.

---

## 1. Create the n8n Cloud account
1. Go to **n8n.io → Get started → Cloud** (free tier). Sign in (Google = `yanivroyele@gmail.com`).
2. New workflow → **⋯ menu → Import from File** → pick `gdrock-reply-to-close.json`.

## 2. Add three credentials (stored encrypted in n8n — never in this repo)
Open each node with a red "credential" warning and create:

| Node | Credential type | What to enter |
|---|---|---|
| **Cold inbox (IMAP)** | *IMAP* | Host `imap.gmail.com` (Google Workspace) or your mailbox host · Port `993` · SSL on · User `outreach@getgdrock.com` · Password = **app password** (not the login password) |
| **Supabase: mark REPLIED** | *Supabase API* | Host = your `SUPABASE_URL` · Service Role key (same one in your local `SUPABASE_SERVICE_KEY`) |
| **Telegram: reply alert** + **send audit + cal link** | *Telegram API* | Bot token (the CF Worker secret `TELEGRAM_BOT_TOKEN`). Use the **same** credential for both Telegram nodes |

## 3. Fill the two placeholders
- **Supabase node → URL:** replace `https://YOUR-PROJECT-REF.supabase.co` with your real project URL (keep the `/rest/v1/outreach?...` part).
- **Both Telegram nodes → Chat ID:** replace `PASTE_YOUR_TELEGRAM_CHAT_ID` with your `TELEGRAM_CHAT_ID` (the CF Worker secret).

## 4. cal.com link (one edit, after step "Cal.com" below)
In **Classify reply** (Code node) change `const CAL_LINK = 'https://cal.com/gdrock/15min'`
to your real link. (Also set the env var `GDROCK_CAL_LINK` so the Python `reply_watch.py`
audit uses the same link — keep them identical.)

## 5. Test, then activate
- Send a test email **to the cold mailbox** with body `yes send the audit` → click **Execute Workflow** → confirm a Telegram alert + a `REPLIED` row in Supabase.
- Then toggle the workflow **Active** (top-right). The IMAP trigger now runs 24/7 on n8n Cloud.

Notes:
- Matching is by sender **email** against the `outreach` table. If a prospect replies from a different address than we mailed, the Supabase update no-ops (the Telegram alert still fires). Acceptable for v1.
- The positive branch **alerts only** (per the "human approval before any send" rule). To auto-reply later, add an *Email Send (SMTP)* node after **Positive?** using the same mailbox creds.

---

## Cal.com — 60-second setup (your step; everything else is already wired)
1. **cal.com → Sign up** (Google = `office@gdrock.com` or `yanivroyele@gmail.com`).
2. **Event Types → + New** → Title **"GDRock — 15-min Compliance Call"**, duration **15 min**, set your availability.
3. Copy the public link (looks like `https://cal.com/<username>/15min`).
4. Paste it into **three** spots so the close is plumbed end-to-end:
   - `gdrock_master.md` → `## CAL_LINK` (source of truth),
   - this workflow's **Classify reply** node (`CAL_LINK`),
   - the env var `GDROCK_CAL_LINK` (so `reply_watch.py`'s audit appends the same link).

The audit text + the positive-reply Telegram message already reference the link — no
other edits needed once it's pasted.
