#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');

const SUBJECTS = {
  s1: { name: '1과목 소프트웨어 설계', number: 1, prefixes: ['sujebi-2026-sw-design-'], chapters: { 1:70, 2:15, 3:107, 4:22, 5:7 } },
  s2: { name: '2과목 소프트웨어 개발', number: 2, prefixes: ['sujebi-2026-sw-dev-'], chapters: { 1:24, 2:19, 3:36, 4:64, 5:12, 6:3 } },
  s3: { name: '3과목 데이터베이스 구축', number: 3, prefixes: ['sujebi-2026-db-build-'], chapters: { 1:33, 2:52, 3:73, 4:30, 5:3 } },
  s4: { name: '4과목 프로그래밍 언어 활용', number: 4, prefixes: ['sujebi-2026-prog-lang-'], chapters: { 1:6, 2:83, 3:115, 4:7 } },
  s5: { name: '5과목 정보시스템 구축관리', number: 5, prefixes: ['sujebi-2026-system-mgmt-', 'sujebi-2026-system-build-'], chapters: { 1:58, 2:41, 3:35, 4:44, 5:14 } }
};

// These pairs share the exact normalized question stem in the source book but are
// intentionally separate source questions. Most use different choices and/or occur
// on different source pages. The Subject 2 Pareto pair was additionally checked
// against both source images and is an actual verbatim reprint in two chapters.
const VERIFIED_REPEATED_STEM_PAIRS = new Set([
  'sujebi-2026-sw-design-ch03-06|sujebi-2026-sw-design-ch03-13',
  'sujebi-2026-sw-design-ch03-24|sujebi-2026-sw-design-ch03-28',
  'sujebi-2026-sw-design-ch03-50|sujebi-2026-sw-design-ch03-65',
  'sujebi-2026-sw-dev-ch03-21|sujebi-2026-sw-dev-ch04-02',
  'sujebi-2026-db-build-ch02-32|sujebi-2026-db-build-ch02-39',
  'sujebi-2026-db-build-ch02-32|sujebi-2026-db-build-ch02-40',
  'sujebi-2026-db-build-ch02-32|sujebi-2026-db-build-ch02-47',
  'sujebi-2026-db-build-ch03-21|sujebi-2026-db-build-ch03-22',
  'sujebi-2026-db-build-ch03-26|sujebi-2026-db-build-ch03-28',
  'sujebi-2026-db-build-ch03-26|sujebi-2026-db-build-ch03-29',
  'sujebi-2026-db-build-ch03-13|sujebi-2026-db-build-ch03-35',
  'sujebi-2026-db-build-ch04-01|sujebi-2026-db-build-ch04-05',
  'sujebi-2026-prog-lang-ch03-71|sujebi-2026-prog-lang-ch03-72',
  'sujebi-2026-prog-lang-ch03-82|sujebi-2026-prog-lang-ch03-83'
]);

function pairKey(a, b) {
  return [String(a), String(b)].sort().join('|');
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function dataScript(rel) {
  return /^(chapter\d|subject\d{2}-ch).+\.js$/.test(rel);
}

const auditState = { currentRoundIds: [], currentIndex: 0, mode: 'rapid' };
const context = vm.createContext({
  console,
  QUESTIONS: [],
  state: auditState,
  saveState: () => {},
  renderDashboardV01: () => {}
});

const origins = new Map();
const scriptErrors = [];
const loadedFiles = [];

function recordNewOrigins(beforeIds, rel) {
  for (const q of context.QUESTIONS) {
    if (q?.id && !beforeIds.has(q.id) && !origins.has(q.id)) origins.set(q.id, rel);
  }
}

function runDataFile(rel) {
  const beforeIds = new Set(context.QUESTIONS.map(q => q?.id).filter(Boolean));
  try {
    vm.runInContext(read(rel), context, { filename: rel });
    recordNewOrigins(beforeIds, rel);
    loadedFiles.push(rel);
  } catch (error) {
    scriptErrors.push(`${rel}: ${error.name}: ${error.message}`);
  }
}

try {
  const app = read('app.js');
  const match = app.match(/const QUESTIONS\s*=\s*(\[[\s\S]*?\n\]);\s*\n\s*const STORAGE_KEY/);
  if (!match) throw new Error('Could not locate initial QUESTIONS array in app.js');
  vm.runInContext(`QUESTIONS = ${match[1]};`, context, { filename: 'app.js#QUESTIONS' });
  context.state.currentRoundIds = context.QUESTIONS.map(q => q.id);
  for (const q of context.QUESTIONS) if (q?.id) origins.set(q.id, 'app.js#QUESTIONS');
  loadedFiles.push('app.js#QUESTIONS');
} catch (error) {
  scriptErrors.push(`app.js: ${error.name}: ${error.message}`);
}

const index = read('index.html');
const scriptRefs = [...index.matchAll(/<script\s+src=["']\.\/([^"']+\.js)["'][^>]*><\/script>/g)].map(m => m[1]);
for (const rel of scriptRefs) {
  if (rel === 'app.js') continue;
  if (rel === 'subject05-loader.js') {
    try {
      const loader = read(rel);
      const nested = [...loader.matchAll(/src=\\?['"]\.\/([^'"\\]+\.js)/g)].map(m => m[1]);
      if (!nested.length) throw new Error('No Subject 5 data files found in loader');
      for (const nestedRel of nested) runDataFile(nestedRel);
      loadedFiles.push(rel);
    } catch (error) {
      scriptErrors.push(`${rel}: ${error.name}: ${error.message}`);
    }
    continue;
  }
  if (dataScript(rel)) runDataFile(rel);
}

function parseLocation(q) {
  const id = String(q?.id || '');
  for (const [key, spec] of Object.entries(SUBJECTS)) {
    for (const prefix of spec.prefixes) {
      if (!id.startsWith(prefix)) continue;
      const suffix = id.slice(prefix.length);
      const canonical = suffix.match(/^ch(\d{2})-(\d{2,3})$/);
      if (canonical) return { key, spec, chapter:Number(canonical[1]), number:Number(canonical[2]), legacy:false };
      if (key === 's1' && /^\d{1,3}$/.test(suffix)) {
        const number = Number(suffix);
        if (number >= 13 && number <= 22) return { key, spec, chapter:4, number, legacy:true };
      }
      return { key, spec, chapter:null, number:null, malformed:true, suffix };
    }
  }
  return null;
}

function normalizedText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function driveUrlLooksValid(url) {
  return /^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z0-9_-]+\/view(?:\?.*)?$/.test(String(url || ''));
}

const critical = [];
const reviews = [];
const warnings = [];
const chapterSeen = Object.fromEntries(Object.keys(SUBJECTS).map(key => [key, new Map()]));
const textMap = new Map();
let sourceVsDetected = 0;
let sourceVsReasoned = 0;
let detectedVsReasoned = 0;
let autoMatchedContradictions = 0;
let legacyIds = 0;
let exactStemDuplicatePairs = 0;
let verifiedRepeatedStemPairs = 0;

for (const q of context.QUESTIONS) {
  const origin = origins.get(q?.id) || 'unknown';
  const loc = parseLocation(q);
  if (!loc) {
    critical.push(`${q?.id || '(missing id)'}: subject/id prefix not recognized [${origin}]`);
    continue;
  }
  if (loc.malformed) {
    critical.push(`${q.id}: malformed canonical ID suffix '${loc.suffix}' [${origin}]`);
    continue;
  }
  if (loc.legacy) legacyIds += 1;

  const expectedMax = loc.spec.chapters[loc.chapter];
  if (!expectedMax) critical.push(`${q.id}: unexpected chapter ${loc.chapter} [${origin}]`);
  else if (loc.number < 1 || loc.number > expectedMax) critical.push(`${q.id}: Q${loc.number} outside Ch${loc.chapter} 1~${expectedMax} [${origin}]`);

  if (Number(q.sourceQuestionNo) !== loc.number) {
    critical.push(`${q.id}: sourceQuestionNo=${q.sourceQuestionNo}, ID says ${loc.number} [${origin}]`);
  }

  const page = String(q.sourcePage || '');
  if (!/^\d+-\d+$/.test(page)) warnings.push(`${q.id}: unusual sourcePage '${page}' [${origin}]`);
  else if (!page.startsWith(`${loc.spec.number}-`)) critical.push(`${q.id}: sourcePage '${page}' does not match subject ${loc.spec.number} [${origin}]`);

  if (!driveUrlLooksValid(q.sourceImageUrl)) critical.push(`${q.id}: malformed/missing Drive source URL [${origin}]`);
  if (!q.sourceExplanation) warnings.push(`${q.id}: missing sourceExplanation [${origin}]`);
  if (!q.finalKey) warnings.push(`${q.id}: missing finalKey [${origin}]`);

  const logicalKey = `${loc.chapter}-${loc.number}`;
  const prior = chapterSeen[loc.key].get(logicalKey);
  if (prior) critical.push(`${q.id}: logical duplicate of ${prior} at Ch${loc.chapter} Q${loc.number}`);
  else chapterSeen[loc.key].set(logicalKey, q.id);

  const textKey = normalizedText(q.questionText);
  if (textKey) {
    const priorText = textMap.get(textKey);
    if (priorText && priorText !== q.id) {
      exactStemDuplicatePairs += 1;
      const key = pairKey(priorText, q.id);
      if (VERIFIED_REPEATED_STEM_PAIRS.has(key)) {
        verifiedRepeatedStemPairs += 1;
      } else {
        reviews.push(`unverified exact question-stem duplicate: ${priorText} ↔ ${q.id}`);
      }
    } else {
      textMap.set(textKey, q.id);
    }
  }

  const source = Number(q.sourceAnswer);
  const detected = q.aiDetectedAnswer == null ? null : Number(q.aiDetectedAnswer);
  const reasoned = q.aiReasonedAnswer == null ? null : Number(q.aiReasonedAnswer);
  if (detected != null && detected !== source) {
    sourceVsDetected += 1;
    reviews.push(`${q.id}: source=${source}, aiDetected=${detected} [${origin}]`);
  }
  if (reasoned != null && reasoned !== source) {
    sourceVsReasoned += 1;
    reviews.push(`${q.id}: source=${source}, aiReasoned=${reasoned} [${origin}]`);
  }
  if (detected != null && reasoned != null && detected !== reasoned) detectedVsReasoned += 1;

  if (q.verificationStatus === 'auto_matched' && ((detected != null && detected !== source) || (reasoned != null && reasoned !== source))) {
    autoMatchedContradictions += 1;
    critical.push(`${q.id}: verificationStatus=auto_matched but answer sources disagree [${origin}]`);
  }
}

const chapterSummary = [];
for (const [key, spec] of Object.entries(SUBJECTS)) {
  for (const [chapterText, expectedMax] of Object.entries(spec.chapters)) {
    const chapter = Number(chapterText);
    const seen = chapterSeen[key];
    const missing = [];
    for (let n = 1; n <= expectedMax; n += 1) if (!seen.has(`${chapter}-${n}`)) missing.push(n);
    const actual = expectedMax - missing.length;
    chapterSummary.push({ key, subject:spec.name, chapter, actual, expected:expectedMax, missing });
    if (missing.length) critical.push(`${spec.name} Ch${String(chapter).padStart(2,'0')}: missing Q${missing.join(', Q')}`);
  }
}

console.log('\n# QTimer deep question-bank QA\n');
for (const [key, spec] of Object.entries(SUBJECTS)) {
  console.log(spec.name);
  for (const row of chapterSummary.filter(r => r.key === key)) {
    console.log(`  ${row.actual === row.expected ? 'OK  ' : 'FAIL'} Ch${String(row.chapter).padStart(2,'0')} ${row.actual} / ${row.expected}`);
  }
}
console.log('\n[Answer provenance]');
console.log(`source ≠ aiDetected : ${sourceVsDetected}`);
console.log(`source ≠ aiReasoned : ${sourceVsReasoned}`);
console.log(`aiDetected ≠ aiReasoned : ${detectedVsReasoned}`);
console.log(`auto_matched contradictions : ${autoMatchedContradictions}`);
console.log(`legacy Subject 1 Ch04 IDs retained : ${legacyIds}`);
console.log(`exact repeated question-stem pairs : ${exactStemDuplicatePairs}`);
console.log(`verified source-book repeated stems : ${verifiedRepeatedStemPairs}`);
console.log(`unverified repeated stems : ${exactStemDuplicatePairs - verifiedRepeatedStemPairs}`);
console.log(`critical structural issues : ${critical.length}`);
console.log(`review queue items : ${reviews.length}`);
console.log(`warnings : ${warnings.length}`);
console.log(`script/load errors : ${scriptErrors.length}`);

if (critical.length) {
  console.error('\n[Critical structural issues]');
  for (const item of critical) console.error(`- ${item}`);
}
if (scriptErrors.length) {
  console.error('\n[Script/load errors]');
  for (const item of scriptErrors) console.error(`- ${item}`);
}
if (reviews.length) {
  console.log('\n[Manual review queue]');
  for (const item of reviews.slice(0, 100)) console.log(`- ${item}`);
  if (reviews.length > 100) console.log(`... ${reviews.length - 100} more`);
}
if (warnings.length) {
  console.log('\n[Warnings]');
  for (const item of warnings.slice(0, 100)) console.log(`- ${item}`);
  if (warnings.length > 100) console.log(`... ${warnings.length - 100} more`);
}

if (critical.length || scriptErrors.length) {
  process.exitCode = 1;
} else {
  console.log('\nPASS: structural QA passed. Only newly unverified review items require manual source checking.');
}
