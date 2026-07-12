-- Run once in the Supabase SQL editor.
-- Replaces gdrock.com's old 4-digit test PIN ("1111") with a strong,
-- randomly-generated access code, same format the (currently-dead, Paddle-only)
-- generateCode() helper in gdrock-worker.js already produces:
-- "GDR-" + 4 chars + "-" + 4 chars, drawn from a 32-char unambiguous alphabet
-- (excludes 0/O/1/I) -- 32^8 =~ 1.1 trillion combinations.
--
-- After running this, log into cdn.gdrock.com/customize with:
--   Site ID:      gdrock.com
--   Access code:  GDR-W2WZ-ZG2A
-- (update your own password manager / notes with the new code)

update sites
set access_code = 'GDR-W2WZ-ZG2A'
where site_id = 'gdrock.com';
