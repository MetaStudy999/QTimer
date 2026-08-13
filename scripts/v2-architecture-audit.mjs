import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const V2_ROOT = path.join(ROOT, "src", "v2");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else result.push(full);
  }
  return result;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, "/");
}

function count(pattern, text) {
  return [...text.matchAll(pattern)].length;
}

const allRuntimeFiles = walk(ROOT).filter(file => /\.(?:js|mjs)$/.test(file));
const legacyFiles = allRuntimeFiles.filter(file => !rel(file).startsWith("src/v2/") && !rel(file).startsWith("scripts/"));
const v2Files = allRuntimeFiles.filter(file => rel(file).startsWith("src/v2/"));

const debtPatterns = {
  innerHTMLWrites: /\.innerHTML\s*=/g,
  localStorageAccess: /\blocalStorage\b/g,
  dynamicScriptCreation: /createElement\s*\(\s*["']script["']\s*\)/g,
  globalThisAccess: /\bglobalThis\b/g,
  documentAccess: /\bdocument\b/g,
  windowAccess: /\bwindow\b/g
};

const legacyDebt = Object.fromEntries(Object.keys(debtPatterns).map(key => [key, 0]));
for (const file of legacyFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const [key, pattern] of Object.entries(debtPatterns)) legacyDebt[key] += count(pattern, source);
}

const violations = [];
function forbid(file, source, pattern, message) {
  if (pattern.test(source)) violations.push(`${rel(file)}: ${message}`);
  pattern.lastIndex = 0;
}

for (const file of v2Files) {
  const source = fs.readFileSync(file, "utf8");
  const relative = rel(file);

  forbid(file, source, /\.innerHTML\s*=/g, "V2 source must not write innerHTML directly");
  forbid(file, source, /createElement\s*\(\s*["']script["']\s*\)/g, "V2 source must not inject feature scripts dynamically");
  forbid(file, source, /\beval\s*\(/g, "eval is forbidden");
  forbid(file, source, /\bnew\s+Function\s*\(/g, "Function constructor is forbidden");

  if (relative.startsWith("src/v2/domain/")) {
    forbid(file, source, /\b(?:document|window|localStorage|sessionStorage)\b/g, "V2 Domain must be browser/DOM/storage independent");
  }
  if (relative.startsWith("src/v2/data/") && !relative.includes("browser-")) {
    forbid(file, source, /\b(?:document|window|localStorage|sessionStorage)\b/g, "V2 pure Data contracts must not access browser globals directly");
  }
}

console.log("# QTimer V2 architecture audit");
console.log(`Legacy runtime files measured: ${legacyFiles.length}`);
for (const [key, value] of Object.entries(legacyDebt)) console.log(`Legacy debt ${key}: ${value}`);
console.log(`V2 source files checked: ${v2Files.length}`);

if (violations.length) {
  console.error("\nV2 architecture violations:");
  violations.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log("PASS: V2 architecture boundaries contain no forbidden DOM/storage/script/eval coupling");
