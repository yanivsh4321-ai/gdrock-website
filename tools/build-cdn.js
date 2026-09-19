#!/usr/bin/env node
/**
 * Builds the two scripts cdn.gdrock.com serves as /gdrock.js (blocker first, banner second) and embeds
 * them in the worker.
 *
 *   node tools/build-cdn.js          check ES5, minify, write gdrock-blocker.min.js / gdrock-banner.min.js,
 *                                    regenerate GDROCK_BLOCKER_JS and GDROCK_JS in gdrock-worker.js
 *   node tools/build-cdn.js --check  exit 1 if the worker's embedded copies are not the current builds
 *
 * Neither script has runtime dependencies. This build uses terser and acorn only as tools: from
 * node_modules if installed, otherwise from the local npx cache (npx terser / npx acorn put them there).
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const WORKER = path.join(ROOT, "gdrock-worker.js");
const PARTS = [
  { name: "GDRock Consent Blocker", src: "gdrock-blocker.js", min: "gdrock-blocker.min.js", constName: "GDROCK_BLOCKER_JS" },
  { name: "GDRock Cookie Banner", src: "gdrock-banner.js", min: "gdrock-banner.min.js", constName: "GDROCK_JS" },
];

function load(name) {
  try { return require(name); } catch (e) { /* fall through to the npx cache */ }
  const dirs = [path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), ".npm"), "npm-cache", "_npx"), path.join(os.homedir(), ".npm", "_npx")];
  for (const dir of dirs) {
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
  try { load("acorn").parse(code, { ecmaVersion: 5, sourceType: "script" }); }
  catch (e) { throw new Error(label + " is not ES5: " + e.message); }
}

async function buildPart(part) {
  const src = fs.readFileSync(path.join(ROOT, part.src), "utf8");
  assertES5(src, part.src);
  const out = await load("terser").minify(src, {
    ecma: 5,
    compress: { passes: 2 },
    mangle: true,
    // ASCII only: the translations travel as \u escapes, so no editor or proxy can mangle them.
    format: { comments: false, ascii_only: true },
  });
  // The full header (install notes, limits) stays in the source; visitors get one line.
  const version = (/(?:var VERSION = "|v)(\d+\.\d+\.\d+)/.exec(src) || [])[1] || "?";
  const min = "/*! " + part.name + " v" + version + " | cdn.gdrock.com | source: " + part.src + " */\n" + out.code;
  assertES5(min, part.min);
  if (min.indexOf("\n;\n") !== -1) throw new Error(part.min + " contains the worker's engine/banner separator");
  return { src, min };
}

const lineRe = (constName) => new RegExp("^const " + constName + " = .*;$", "m");
const sizes = (label, code) => label + ": " + (Buffer.byteLength(code) / 1024).toFixed(1) + " KB, gzipped " +
  (zlib.gzipSync(Buffer.from(code), { level: 9 }).length / 1024).toFixed(1) + " KB";

(async () => {
  let worker = fs.readFileSync(WORKER, "utf8");
  let stale = [];
  const built = [];
  for (const part of PARTS) {
    const { src, min } = await buildPart(part);
    const re = lineRe(part.constName), line = "const " + part.constName + " = " + JSON.stringify(min) + ";";
    if (!re.test(worker)) throw new Error(part.constName + " line not found in gdrock-worker.js");
    if (worker.match(re)[0] !== line) stale.push(part.constName);
    worker = worker.replace(re, () => line);
    built.push({ part, src, min });
  }
  if (process.argv[2] === "--check") {
    console.log(stale.length ? "OUT OF DATE in gdrock-worker.js: " + stale.join(", ") + " (run node tools/build-cdn.js)" : "worker embeds the current builds");
    process.exit(stale.length ? 1 : 0);
  }
  for (const b of built) {
    fs.writeFileSync(path.join(ROOT, b.part.min), b.min + "\n");
    console.log(sizes(b.part.src.padEnd(18) + " source  ", b.src));
    console.log(sizes(b.part.src.padEnd(18) + " minified", b.min));
  }
  console.log(sizes("/gdrock.js (both, as served)       ", built[0].min + "\n;\n" + built[1].min));
  fs.writeFileSync(WORKER, worker);
  console.log("regenerated GDROCK_BLOCKER_JS and GDROCK_JS in gdrock-worker.js");
})().catch((e) => { console.error(e.message); process.exit(1); });
