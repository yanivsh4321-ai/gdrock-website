#!/usr/bin/env node
/**
 * Prints a Core Pack download link for one buyer, the same link the Worker emails after a purchase.
 * Use it to resend the Core Pack by hand (a refund-free fix for "I lost the email").
 *
 *   node tools/corepack-link.js buyer@example.com
 *
 * Reads DOWNLOAD_SECRET from %USERPROFILE%\.gdrock\download-secret.txt (outside the repo; the same value
 * is the Worker secret DOWNLOAD_SECRET). The link only works for that email address.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const email = String(process.argv[2] || "").trim().toLowerCase();
if (!email.includes("@")) { console.error("Usage: node tools/corepack-link.js buyer@example.com"); process.exit(1); }
const secret = fs.readFileSync(path.join(os.homedir(), ".gdrock", "download-secret.txt"), "utf8").trim();
const token = crypto.createHmac("sha256", secret).update("corepack:" + email).digest("base64")
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 32);
console.log(`https://cdn.gdrock.com/dl/core-pack?e=${encodeURIComponent(email)}&t=${token}`);
