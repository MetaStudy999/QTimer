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

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function dataScript(rel) { return /^(chapter\d|subject\d{2}-ch).+\.js$/.test(rel); }

const auditState = { currentRoundIds: [], currentIndex: 0, mode: 'rapid' };
const context = vm.createContext({ console, QUESTIONS: [], state: auditState, saveState: () => {}, renderDashboardV01: () => {} });
const scriptErrors = [];
const origins = new Map();

function runDataFile(rel) {
  const before = new Set(context.QUESTIONS.map(q => q?.id).filter(Boolean));
  try {
    vm.runInContext(read(rel), context, { filename: rel });
    for (const q of context.QUESTIONS) if (q?.id && !before.has(q.id) && !origins.has(q.id)) origins.set(q.id, rel);
  } catch (error) { scriptErrors.push(`${rel}: ${error.name}: ${error.message}`); }
}

try {
  const app = read('app.js');
  const match = app.match(/const QUESTIONS\s*=\s*(\[[\s\S]*?\n\]);\s*\n\s*const STORAGE_KEY/);
  if (!match) throw new Error('Could not locate initial QUESTIONS array in app.js');
  vm.runInContext(`QUESTIONS = ${match[1]};`, context, { filename: 'app.js#QUESTIONS' });
  context.state.currentRoundIds = context.QUESTIONS.map(q => q.id);
  for (const q of context.QUESTIONS) if (q?.id) origins.set(q.id, 'app.js#QUESTIONS');
} catch (error) { scriptErrors.push(`app.js: ${error.name}: ${error.message}`); }

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
    } catch (error) { scriptErrors.push(`${rel}: ${error.name}: ${error.message}`); }
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
function questionText(q) { return String(q?.questionText || '').replace(/\s+/g, ' ').trim(); }
function choiceText(q) { return Array.isArray(q?.choices) ? q.choices.map(v => String(v)).join(' ') : ''; }

function isCodeExecution(q) {
  const qt = questionText(q), body = `${qt} ${choiceText(q)}`;
  return /(?:다음\s+)?(?:C|C언어|JAVA|Java|Python|파이썬)\s*(?:프로그램|코드|에서)|프로그램의\s*(?:실행|출력)\s*결과|코드의\s*(?:실행|출력)\s*결과/i.test(qt)
    || /#include|printf\s*\(|scanf\s*\(|System\.out|public\s+static\s+void|\bdef\s+[A-Za-z_]\w*\s*\(|print\s*\(|\bfor\s*\([^)]*;[^)]*;[^)]*\)|\bwhile\s*\([^)]*\)|\bswitch\s*\(|\bsizeof\s*\(|\bint\s+[A-Za-z_]\w*\s*=|\bchar\s+[A-Za-z_]\w*\s*=|\+\+|--|\*\s*[A-Za-z_]\w*\s*=\s*&/i.test(body);
}
function isSqlExecution(q) {
  const qt = questionText(q);
  return /\bSELECT\b[\s\S]*\bFROM\b/i.test(qt) || /SQL\s*(?:문|구문|질의|실행|결과)|서브쿼리|CREATE\s+VIEW|DROP\s+VIEW|ALTER\s+TABLE|\bUNION(?:\s+ALL)?\b|\bINTERSECT\b|\bMINUS\b/i.test(qt);
}
function isNetworkCalculation(q) {
  const qt = questionText(q);
  return /(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}/.test(qt) || /CIDR|서브넷\s*마스크|서브넷으로|브로드캐스트\s*주소|Broadcast\s*주소|사용\s*가능(?:한)?\s*IP|Subnet-Zero|FLSM|VLSM|네트워크\s*주소를\s*구/i.test(qt);
}
function isAlgorithmCalculation(q) {
  return /FCFS|FIFO\s*스케줄링|\bSJF\b|\bHRN\b|Round\s*Robin|라운드\s*로빈|평균\s*(?:대기|반환)시간|반환시간|Turnaround|Waiting\s*Time|페이지\s*교체|페이지\s*부재|\bLRU\b|\bLFU\b|\bNUR\b|메모리\s*할당|Best\s*Fit|Worst\s*Fit|First\s*Fit|COCOMO|기능\s*점수|Function\s*Point|\bCPM\b|\bPERT\b|임계\s*경로/i.test(questionText(q));
}
function isCryptoRisk(q) {
  return /\bRSA\b|\bAES\b|\bDES\b|\b3DES\b|\bSHA(?:-?\d+)?\b|\bMD5\b|Salt|Key\s*Stretching|공개키|개인키|대칭키|비대칭키|비밀키\s*암호|암호화\s*키|복호화\s*키|해시\s*(?:함수|알고리즘)/i.test(questionText(q));
}

function riskFor(q) {
  const qt = questionText(q), reasons = [], categories = [];
  let score = 0;
  if (isCodeExecution(q)) { score += 5; categories.push('code'); reasons.push('코드 실행+5'); }
  if (isSqlExecution(q)) { score += 5; categories.push('sql'); reasons.push('SQL 실행+5'); }
  if (isNetworkCalculation(q)) { score += 5; categories.push('network_calc'); reasons.push('네트워크 계산+5'); }
  if (isAlgorithmCalculation(q)) { score += 4; categories.push('algorithm_calc'); reasons.push('계산/알고리즘+4'); }
  if (isCryptoRisk(q)) { score += 3; categories.push('crypto'); reasons.push('암호/보안+3'); }

  const visualDependency = /다음\s*(?:그림|표|도표)|제시된\s*(?:R|S|테이블|릴레이션|그림|표)|①의\s*결과|②의\s*결과|③의\s*결과|④의\s*결과|두\s*릴레이션.*결과|테이블.*실행\s*결과/i.test(qt);
  if (visualDependency) { score += 3; reasons.push('원본 도표/실행 의존+3'); }
  if (q.verificationStatus === 'auto_matched') { score += 1; reasons.push('auto_matched+1'); }
  if (q.extractionStatus === 'READY_PARAPHRASE') { score += 1; reasons.push('요약형 추출+1'); }
  if (String(q.sourceExplanation || '').trim().length < 30) { score += 1; reasons.push('짧은 해설+1'); }

  const genericChoiceCount = Array.isArray(q.choices) ? q.choices.filter(v => /^(?:①|②|③|④|⑤|⑥|⑦|⑧|⑨).*결과|^[1-9]번?의?\s*결과|^결과$/i.test(String(v).trim())).length : 0;
  if (genericChoiceCount >= 2) { score += 3; reasons.push('선택지 원본 의존+3'); }

  const source = Number(q.sourceAnswer);
  const detected = q.aiDetectedAnswer == null ? null : Number(q.aiDetectedAnswer);
  const reasoned = q.aiReasonedAnswer == null ? null : Number(q.aiReasonedAnswer);
  if ((detected != null && detected !== source) || (reasoned != null && reasoned !== source)) { score += 10; reasons.push('정답 출처 불일치+10'); }

  const priority = score >= 8 ? 'P0' : score >= 6 ? 'P1' : score >= 4 ? 'P2' : null;
  return { score, priority, reasons, categories };
}

function queueItem(q, risk) {
  return { id:q.id, subject:subjectOf(q.id), page:q.sourcePage, number:q.sourceQuestionNo, answer:q.sourceAnswer, origin:origins.get(q.id)||'unknown', text:questionText(q), ...risk };
}

const queue = [];
const independentlyVerified = [];
for (const q of context.QUESTIONS) {
  const risk = riskFor(q);
  if (!risk.priority) continue;
  const item = queueItem(q, risk);
  if (q.independentVerified === true) independentlyVerified.push(item);
  else queue.push(item);
}

const sorter = (a,b) => b.score-a.score || a.subject.localeCompare(b.subject,'ko') || String(a.page).localeCompare(String(b.page),undefined,{numeric:true});
queue.sort(sorter); independentlyVerified.sort(sorter);
const byPriority = Object.fromEntries(['P0','P1','P2'].map(p => [p, queue.filter(v=>v.priority===p).length]));
const verifiedByPriority = Object.fromEntries(['P0','P1','P2'].map(p => [p, independentlyVerified.filter(v=>v.priority===p).length]));
const bySubject = {}; for (const item of queue) bySubject[item.subject]=(bySubject[item.subject]||0)+1;
const byCategory = {}; for (const item of queue) for (const c of item.categories) byCategory[c]=(byCategory[c]||0)+1;

console.log('\n# QTimer answer-risk audit\n');
console.log(`Loaded questions: ${context.QUESTIONS.length}`);
console.log(`Script/load errors: ${scriptErrors.length}`);
console.log(`Unresolved risk review candidates: ${queue.length}`);
console.log(`P0: ${byPriority.P0} / P1: ${byPriority.P1} / P2: ${byPriority.P2}`);
console.log(`Independently verified risk items: ${independentlyVerified.length} (P0 ${verifiedByPriority.P0} / P1 ${verifiedByPriority.P1} / P2 ${verifiedByPriority.P2})`);
console.log('\n[Unresolved by subject]');
for (const subject of ['1과목','2과목','3과목','4과목','5과목']) console.log(`${subject}: ${bySubject[subject]||0}`);
console.log('\n[Unresolved by category]');
for (const [key,label] of [['code','코드 실행'],['sql','SQL 실행'],['network_calc','네트워크 계산'],['algorithm_calc','계산/알고리즘'],['crypto','암호/보안']]) console.log(`${label}: ${byCategory[key]||0}`);

if (scriptErrors.length) { console.error('\n[Script/load errors]'); for (const item of scriptErrors) console.error(`- ${item}`); process.exitCode=1; }
if (!summaryOnly) {
  console.log(`\n[Unresolved priority review queue: top ${Math.min(printLimit,queue.length)}]`);
  for (const item of queue.slice(0,printLimit)) {
    const shortText=item.text.length>110?`${item.text.slice(0,107)}...`:item.text;
    console.log(`- ${item.priority} score=${item.score} ${item.id} p.${item.page} Q${item.number} ans=${item.answer}`);
    console.log(`  ${item.reasons.join(', ')}`); console.log(`  ${shortText}`);
  }
  if (queue.length>printLimit) console.log(`... ${queue.length-printLimit} more (use --limit=N)`);
}
if (!scriptErrors.length) console.log('\nPASS: unresolved answer-risk queue generated. Verify remaining P0 first; independently verified items are excluded from unresolved counts.');
