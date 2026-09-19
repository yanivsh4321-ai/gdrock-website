#!/usr/bin/env node
/**
 * Builds the blocker the worker serves.
 *
 *   node tools/build-blocker.js          check ES5, minify, write gdrock-blocker.min.js,
 *                                        and regenerate GDROCK_BLOCKER_JS in gdrock-worker.js
 *   node tools/build-blocker.js --check  exit 1 if the worker's embedded copy is not the current build
 *
 * The blocker has no runtime dependencies. This build uses terser and acorn only as tools: from
 * node_modules if installed, otherwise from the local npx cache (npx terser / npx acorn put them there).
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "gdrock-blocker.js");
const MIN = path.join(ROOT, "gdrock-blocker.min.js");
const WORKER = path.join(ROOT, "gdrock-worker.js");

function load(name) {
  try { return require(name); } catch (e) { /* fall through to the npx cache */ }
  const cache = path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".npm"), "npm-cache", "_npx");
  const alt = path.join(os.homedir(), ".npm", "_npx");
  for (const dir of [cache, alt]) {
    if (!fs.existsSync(dir)) continue;
    for (const d of fs.readdirSync(dir)) {
      const p = path.join(dir, d, "node_modules", name);
      if (fs.existsSync(path.join(p, "package.json"))) return require(p);
    }
  }
  throw new Error(name + " not found: run `npx " + name + " --version` once, or npm i -D " + name);
}

// Plain ES5 is a promise to every merchant's oldest visitor: prove it on the source and the output.
function assertES5(code, label) {
  const acorn = load("acorn");
  try { acorn.parse(code, { ecmaVersion: 5, sourceType: "script" }); }
  catch (e) { throw new Error(label + " is not ES5: " + e.message); }
}

const EMBED_RE = /^const GDROCK_BLOCKER_JS = .*;$/m;

async function build() {
  const src = fs.readFileSync(SRC, "utf8");
  assertES5(src, "gdrock-blocker.js");
  const { minify } = load("terser");
  const out = await minify(src, {
    ecma: 5,
    compress: { passes: 2 },
    mangle: true,
    format: { comments: false, ascii_only: true },
  });
  // The full header (install notes, the limitations list) stays in the source; visitors get one line.
  const version = (/var VERSION = "([^"]+)"/.exec(src) || [])[1] || "?";
  const min = "/*! GDRock Consent Blocker v" + version + " | cdn.gdrock.com | source and limits: gdrock-blocker.js */\n" + out.code;
  assertES5(min, "gdrock-blocker.min.js");
  if (min.indexOf("\n;\n") !== -1) throw new Error("the build contains the worker's engine/banner separator");
  return { src, min };
}

function sizes(label, code) {
  const gz = zlib.gzipSync(Buffer.from(code), { level: 9 }).length;
  return label + ": " + (Buffer.byteLength(code) / 1024).toFixed(1) + " KB, gzipped " + (gz / 1024).toFixed(1) + " KB";
}

(async () => {
  const { src, min } = await build();
  const line = "const GDROCK_BLOCKER_JS = " + JSON.stringify(min) + ";";
  const worker = fs.readFileSync(WORKER, "utf8");
  if (!EMBED_RE.test(worker)) throw new Error("GDROCK_BLOCKER_JS line not found in gdrock-worker.js");
  if (process.argv[2] === "--check") {
    const ok = worker.match(EMBED_RE)[0] === line;
    console.log(ok ? "worker embeds the current blocker build" : "worker's GDROCK_BLOCKER_JS is OUT OF DATE — run node tools/build-blocker.js");
    process.exit(ok ? 0 : 1);
  }
  fs.writeFileSync(MIN, min + "\n");
  fs.writeFileSync(WORKER, worker.replace(EMBED_RE, () => line));
  console.log(sizes("source   ", src));
  console.log(sizes("minified ", min));
  console.log("wrote gdrock-blocker.min.js and regenerated GDROCK_BLOCKER_JS in gdrock-worker.js");
})().catch((e) => { console.error(e.message); process.exit(1); });
