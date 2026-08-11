#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const args = new Set(process.argv.slice(2));
const summaryOnly = args.has('--summary');
const limitArg = process.argv.slice(2).find(v => v.startsWith('--limit='));
const printLimit = limitArg ? Math.max(1, Number(limitArg.split('=')[1]) || 80) : 80;

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

const scriptErrors = [];
const origins = new Map();

function runDataFile(rel) {
  const before = new Set(context.QUESTIONS.map(q => q?.id).filter(Boolean));
  try {
    vm.runInContext(read(rel), context, { filename: rel });
    for (const q of context.QUESTIONS) {
      if (q?.id && !before.has(q.id) && !origins.has(q.id)) origins.set(q.id, rel);
    }
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
    } catch (error) {
      scriptErrors.push(`${rel}: ${error.name}: ${error.message}`);
    }
    continue;
  }
  if (dataScript(rel)) runDataFile(rel);
}

function subjectOf(id = '') {
  if (id.startsWith('sujebi-2026-sw-design-')) return '1과목';
  if (id.startsWith('sujebi-2026-sw-dev-')) return '2과목';
  if (id.startsWith('sujebi-2026-db-build-')) return '3과목';
  if (id.startsWith('sujebi-2026-prog-lang-')) return '4과목';
  if (id.startsWith('sujebi-2026-system-mgmt-') || id.startsWith('sujebi-2026-system-build-')) return '5과목';
  return '미분류';
}

const RULES = [
  {
    key: 'code', label: '코드 실행', weight: 5,
    re: /#include|printf\s*\(|scanf\s*\(|System\.out|public\s+static|\bclass\s+[A-Za-z_]|\bdef\s+[A-Za-z_]|print\s*\(|\bfor\s*\(|\bwhile\s*\(|\bswitch\s*\(|\bsizeof\b|\+\+|--|포인터|코드\s*(?:실행|결과)|프로그램\s*(?:실행|출력)|실행\s*결과|출력\s*결과/i
  },
  {
    key: 'sql', label: 'SQL 실행', weight: 5,
    re: /\bSELECT\b|\bFROM\b|\bWHERE\b|\bJOIN\b|GROUP\s+BY|\bHAVING\b|\bUNION\b|\bINTERSECT\b|\bMINUS\b|ALTER\s+TABLE|CREATE\s+VIEW|DROP\s+VIEW|서브쿼리|SQL\s*(?:문|구문|실행|결과)/i
  },
  {
    key: 'network_calc', label: '네트워크 계산', weight: 5,
    re: /CIDR|\/\d{1,2}(?:\D|$)|서브넷\s*마스크|서브넷으로|브로드캐스트\s*주소|Broadcast\s*주소|사용\s*가능(?:한)?\s*IP|네트워크\s*주소|Subnet-Zero|FLSM|VLSM/i
  },
  {
    key: 'algorithm_calc', label: '계산/알고리즘', weight: 4,
    re: /페이지\s*교체|\bLRU\b|\bLFU\b|\bNUR\b|\bSJF\b|\bHRN\b|Round\s*Robin|라운드\s*로빈|대기\s*시간|반환\s*시간|Turnaround|Waiting\s*Time|COCOMO|기능\s*점수|Function\s*Point|\bCPM\b|\bPERT\b|임계\s*경로|메모리\s*할당|Best\s*Fit|Worst\s*Fit|First\s*Fit|Degree.*Cardinality|Cardinality.*Degree/i
  },
  {
    key: 'crypto', label: '암호/보안', weight: 3,
    re: /\bRSA\b|\bAES\b|\bDES\b|\b3DES\b|\bSHA(?:-?\d+)?\b|\bMD5\b|Salt|Key\s*Stretching|공개키|개인키|대칭키|비대칭키|암호화|복호화|해시\s*(?:함수|알고리즘)/i
  }
];

function combinedText(q) {
  return [q.questionText, ...(Array.isArray(q.choices) ? q.choices : []), q.sourceExplanation, q.finalKey]
    .filter(Boolean).join(' ');
}

function riskFor(q) {
  const text = combinedText(q);
  const reasons = [];
  const categories = [];
  let score = 0;

  for (const rule of RULES) {
    if (rule.re.test(text)) {
      score += rule.weight;
      categories.push(rule.key);
      reasons.push(`${rule.label}+${rule.weight}`);
    }
  }

  const visualDependency = /다음\s*(?:그림|표|도표)|제시된\s*(?:R|S|테이블|릴레이션|그림|표)|①의\s*결과|②의\s*결과|③의\s*결과|④의\s*결과|실행\s*결과로\s*옳/i.test(text);
  if (visualDependency) {
    score += 3;
    reasons.push('원본 도표/실행 의존+3');
  }

  if (q.verificationStatus === 'auto_matched') {
    score += 1;
    reasons.push('auto_matched+1');
  }
  if (q.extractionStatus === 'READY_PARAPHRASE') {
    score += 1;
    reasons.push('요약형 추출+1');
  }
  if (String(q.sourceExplanation || '').trim().length < 30) {
    score += 1;
    reasons.push('짧은 해설+1');
  }

  const genericChoiceCount = Array.isArray(q.choices)
    ? q.choices.filter(v => /^[①②③④⑤⑥⑦⑧⑨]|^[1-9]번?의?\s*결과|결과$/i.test(String(v).trim())).length
    : 0;
  if (genericChoiceCount >= 2) {
    score += 3;
    reasons.push('선택지 원본 의존+3');
  }

  const source = Number(q.sourceAnswer);
  const detected = q.aiDetectedAnswer == null ? null : Number(q.aiDetectedAnswer);
  const reasoned = q.aiReasonedAnswer == null ? null : Number(q.aiReasonedAnswer);
  if ((detected != null && detected !== source) || (reasoned != null && reasoned !== source)) {
    score += 10;
    reasons.push('정답 출처 불일치+10');
  }

  const priority = score >= 8 ? 'P0' : score >= 6 ? 'P1' : score >= 4 ? 'P2' : null;
  return { score, priority, reasons, categories };
}

const queue = [];
for (const q of context.QUESTIONS) {
  const risk = riskFor(q);
  if (!risk.priority) continue;
  queue.push({
    id: q.id,
    subject: subjectOf(q.id),
    page: q.sourcePage,
    number: q.sourceQuestionNo,
    answer: q.sourceAnswer,
    origin: origins.get(q.id) || 'unknown',
    text: String(q.questionText || '').replace(/\s+/g, ' ').trim(),
    ...risk
  });
}

queue.sort((a, b) => b.score - a.score || a.subject.localeCompare(b.subject, 'ko') || String(a.page).localeCompare(String(b.page), undefined, { numeric:true }));

const byPriority = Object.fromEntries(['P0','P1','P2'].map(p => [p, queue.filter(v => v.priority === p).length]));
const bySubject = {};
for (const item of queue) bySubject[item.subject] = (bySubject[item.subject] || 0) + 1;
const byCategory = {};
for (const item of queue) for (const c of item.categories) byCategory[c] = (byCategory[c] || 0) + 1;

console.log('\n# QTimer answer-risk audit\n');
console.log(`Loaded questions: ${context.QUESTIONS.length}`);
console.log(`Script/load errors: ${scriptErrors.length}`);
console.log(`Risk review candidates: ${queue.length}`);
console.log(`P0: ${byPriority.P0} / P1: ${byPriority.P1} / P2: ${byPriority.P2}`);
console.log('\n[By subject]');
for (const subject of ['1과목','2과목','3과목','4과목','5과목']) console.log(`${subject}: ${bySubject[subject] || 0}`);
console.log('\n[By category]');
for (const [key, label] of [['code','코드 실행'],['sql','SQL 실행'],['network_calc','네트워크 계산'],['algorithm_calc','계산/알고리즘'],['crypto','암호/보안']]) {
  console.log(`${label}: ${byCategory[key] || 0}`);
}

if (scriptErrors.length) {
  console.error('\n[Script/load errors]');
  for (const item of scriptErrors) console.error(`- ${item}`);
  process.exitCode = 1;
}

if (!summaryOnly) {
  console.log(`\n[Priority review queue: top ${Math.min(printLimit, queue.length)}]`);
  for (const item of queue.slice(0, printLimit)) {
    const shortText = item.text.length > 110 ? `${item.text.slice(0, 107)}...` : item.text;
    console.log(`- ${item.priority} score=${item.score} ${item.id} p.${item.page} Q${item.number} ans=${item.answer}`);
    console.log(`  ${item.reasons.join(', ')}`);
    console.log(`  ${shortText}`);
  }
  if (queue.length > printLimit) console.log(`... ${queue.length - printLimit} more (use --limit=N)`);
}

if (!scriptErrors.length) {
  console.log('\nPASS: answer-risk queue generated. Candidate count is non-blocking; verify P0 first against source images and independent solving.');
}
