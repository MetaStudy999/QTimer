#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');

const EXPECTED = {
  s1: { name: '1과목 소프트웨어 설계', prefix: 'sujebi-2026-sw-design-', count: 221 },
  s2: { name: '2과목 소프트웨어 개발', prefix: 'sujebi-2026-sw-dev-', count: 158 },
  s3: { name: '3과목 데이터베이스 구축', prefix: 'sujebi-2026-db-build-', count: 191 },
  s4: { name: '4과목 프로그래밍 언어 활용', prefix: 'sujebi-2026-prog-lang-', count: 211 },
  s5: { name: '5과목 정보시스템 구축관리', prefix: 'sujebi-2026-system-mgmt-', count: 192 }
};
const EXPECTED_TOTAL = 973;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function dataScript(rel) {
  return /^(chapter\d|subject\d{2}-ch).+\.js$/.test(rel);
}

const context = vm.createContext({ console, QUESTIONS: [] });
const loadedFiles = [];
const errors = [];

function runDataFile(rel) {
  try {
    const code = read(rel);
    vm.runInContext(code, context, { filename: rel });
    loadedFiles.push(rel);
  } catch (error) {
    errors.push(`${rel}: ${error.name}: ${error.message}`);
  }
}

// app.js owns the initial Subject 1 seed questions. Execute only that array,
// avoiding DOM-dependent application code.
try {
  const app = read('app.js');
  const match = app.match(/const QUESTIONS\s*=\s*(\[[\s\S]*?\n\]);\s*\n\s*const STORAGE_KEY/);
  if (!match) throw new Error('Could not locate initial QUESTIONS array in app.js');
  vm.runInContext(`QUESTIONS = ${match[1]};`, context, { filename: 'app.js#QUESTIONS' });
  loadedFiles.push('app.js#QUESTIONS');
} catch (error) {
  errors.push(`app.js: ${error.name}: ${error.message}`);
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
      errors.push(`${rel}: ${error.name}: ${error.message}`);
    }
    continue;
  }
  if (dataScript(rel)) runDataFile(rel);
}

const questions = context.QUESTIONS;
const idCounts = new Map();
for (const q of questions) idCounts.set(q?.id, (idCounts.get(q?.id) || 0) + 1);
const duplicateIds = [...idCounts.entries()].filter(([id, count]) => id && count > 1);

const counts = {};
for (const [key, spec] of Object.entries(EXPECTED)) {
  counts[key] = questions.filter(q => typeof q?.id === 'string' && q.id.startsWith(spec.prefix)).length;
}

const invalid = [];
for (const [index, q] of questions.entries()) {
  if (!q || typeof q !== 'object') {
    invalid.push(`#${index + 1}: question is not an object`);
    continue;
  }
  if (!q.id) invalid.push(`#${index + 1}: missing id`);
  if (!q.questionText) invalid.push(`${q.id || `#${index + 1}`}: missing questionText`);
  if (!Array.isArray(q.choices) || q.choices.length < 2) invalid.push(`${q.id}: invalid choices`);
  const answer = Number(q.sourceAnswer);
  if (!Number.isInteger(answer) || !Array.isArray(q.choices) || answer < 1 || answer > q.choices.length) {
    invalid.push(`${q.id}: sourceAnswer ${q.sourceAnswer} outside choices`);
  }
  if (!q.sourceImageUrl) invalid.push(`${q.id}: missing sourceImageUrl`);
}

console.log('\nQTimer question-bank audit');
console.log('='.repeat(64));
for (const [key, spec] of Object.entries(EXPECTED)) {
  const actual = counts[key];
  const mark = actual === spec.count ? 'OK' : 'FAIL';
  console.log(`${mark.padEnd(4)} ${spec.name.padEnd(22)} ${String(actual).padStart(4)} / ${spec.count}`);
}
console.log('-'.repeat(64));
console.log(`${questions.length === EXPECTED_TOTAL ? 'OK  ' : 'FAIL'} 전체 문제 ${questions.length} / ${EXPECTED_TOTAL}`);
console.log(`Loaded data scripts: ${loadedFiles.length}`);
console.log(`Duplicate IDs: ${duplicateIds.length}`);
console.log(`Invalid question records: ${invalid.length}`);
console.log(`Script/load errors: ${errors.length}`);

if (duplicateIds.length) {
  console.error('\n[Duplicate IDs]');
  for (const [id, count] of duplicateIds) console.error(`- ${id}: ${count}`);
}
if (invalid.length) {
  console.error('\n[Invalid records]');
  for (const item of invalid) console.error(`- ${item}`);
}
if (errors.length) {
  console.error('\n[Script/load errors]');
  for (const item of errors) console.error(`- ${item}`);
}

const countMismatch = Object.entries(EXPECTED).some(([key, spec]) => counts[key] !== spec.count);
if (questions.length !== EXPECTED_TOTAL || countMismatch || duplicateIds.length || invalid.length || errors.length) {
  process.exitCode = 1;
} else {
  console.log('\nPASS: verified QTimer baseline = 973 questions');
}
