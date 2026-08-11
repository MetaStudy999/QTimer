#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

const url = process.env.QTIMER_URL || 'http://127.0.0.1:8080';
const executablePath = process.env.CHROME_BIN;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

if (!executablePath) {
  throw new Error('CHROME_BIN is required (for example: /usr/bin/google-chrome).');
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const page = await browser.newPage();
const pageErrors = [];
const failedScripts = [];

page.on('pageerror', error => pageErrors.push(error.message));
page.on('requestfailed', request => {
  if (/\.js(?:\?|$)/.test(request.url())) {
    failedScripts.push(`${request.url()} :: ${request.failure()?.errorText || 'request failed'}`);
  }
});
page.on('response', response => {
  if (response.status() >= 400 && /\.js(?:\?|$)/.test(response.url())) {
    failedScripts.push(`${response.url()} :: HTTP ${response.status()}`);
  }
});

try {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0', timeout: 30_000 });

  await page.waitForSelector('#studyTab', { timeout: 10_000 });

  const questionCount = await page.evaluate(() => QUESTIONS.length);
  assert(questionCount === 973, `Expected 973 questions, got ${questionCount}`);

  await page.click('#studyTab');
  await page.waitForSelector('#questionText', { visible: true, timeout: 10_000 });

  const subject5Id = await page.evaluate(() => {
    const q = QUESTIONS.find(item => item.id === 'sujebi-2026-system-mgmt-ch01-01')
      || QUESTIONS.find(item => item.id.startsWith('sujebi-2026-system-mgmt-'));
    if (!q) throw new Error('Subject 5 test question not found');
    return q.id;
  });

  await page.evaluate(id => {
    state.mode = 'rapid';
    state.timerPolicy = 'none';
    state.timeLimitSec = 20;
    state.autoDelayMs = 500;
    state.attempts = [];
    state.overrides = {};
    state.flags = {};
    state.currentRoundIds = [id];
    state.currentIndex = 0;
    saveState();
    renderSettings();
    renderQuestion();
  }, subject5Id);

  const subjectMeta = await page.$eval('#sourceMeta', element => element.textContent);
  assert(subjectMeta.includes('정보시스템 구축관리'), `Subject 5 label mismatch: ${subjectMeta}`);

  await page.click('#pauseBtn');
  assert((await page.$eval('#timerState', element => element.textContent)) === 'PAUSE', 'Pause state was not applied');
  await page.click('#pauseBtn');
  assert((await page.$eval('#timerState', element => element.textContent)) === 'RUN', 'Timer did not resume');

  await page.click('.choice[data-answer="1"]');
  await page.click('#submitBtn');
  await page.waitForFunction(() => document.querySelector('#resultContent')?.hidden === false);

  const submitted = await page.evaluate(() => ({
    attempts: state.attempts.length,
    isCorrect: state.attempts.at(-1)?.isCorrect,
    submitDisabled: els.submitBtn.disabled,
    nextDisabled: els.nextBtn.disabled
  }));
  assert(submitted.attempts === 1, `Expected one attempt after submit, got ${submitted.attempts}`);
  assert(submitted.isCorrect === true, 'Known Subject 5 answer should be correct');
  assert(submitted.submitDisabled === true && submitted.nextDisabled === false, 'Submitted button state is inconsistent');

  await page.click('#undoBtn');
  await page.waitForFunction(() => state.attempts.length === 0 && document.querySelector('#resultContent')?.hidden === true);

  const undone = await page.evaluate(() => ({
    attempts: state.attempts.length,
    currentId: currentQuestion().id,
    submitDisabled: els.submitBtn.disabled,
    nextDisabled: els.nextBtn.disabled
  }));
  assert(undone.attempts === 0, 'Undo did not remove the last attempt');
  assert(undone.currentId === subject5Id, 'Undo did not restore the attempted question');
  assert(undone.submitDisabled === false && undone.nextDisabled === true, 'Undo did not restore editable question UI');

  await page.click('.choice[data-answer="2"]');
  await page.click('#ambiguousBtn');
  await page.click('#submitBtn');
  await page.waitForFunction(() => state.attempts.length === 1);

  const wrongAttempt = await page.evaluate(() => state.attempts.at(-1));
  assert(wrongAttempt.isCorrect === false, 'Expected deliberate wrong answer to be incorrect');
  assert(wrongAttempt.ambiguous === true, 'Ambiguous confidence was not recorded');

  await page.select('#modeSelect', 'weak');
  await page.waitForFunction(id => state.mode === 'weak' && state.currentRoundIds.includes(id), {}, subject5Id);

  const weakState = await page.evaluate(id => ({
    mode: state.mode,
    includesQuestion: state.currentRoundIds.includes(id),
    roundSize: state.currentRoundIds.length
  }), subject5Id);
  assert(weakState.mode === 'weak' && weakState.includesQuestion, 'Weak mode did not include the wrong/ambiguous question');

  const attemptsBeforeReload = await page.evaluate(() => state.attempts.length);
  await page.reload({ waitUntil: 'networkidle0', timeout: 30_000 });
  const persisted = await page.evaluate(() => ({ attempts: state.attempts.length, mode: state.mode }));
  assert(persisted.attempts === attemptsBeforeReload, 'Attempts were not restored from localStorage');
  assert(persisted.mode === 'weak', 'Study mode was not restored from localStorage');

  await page.evaluate(id => {
    state.mode = 'rapid';
    state.timerPolicy = 'hard';
    state.timeLimitSec = 0.15;
    state.autoDelayMs = 1000;
    state.currentRoundIds = [id];
    state.currentIndex = 0;
    saveState();
    renderSettings();
    renderQuestion();
  }, subject5Id);

  await new Promise(resolve => setTimeout(resolve, 350));
  const timeoutAttempt = await page.evaluate(() => state.attempts.at(-1));
  assert(timeoutAttempt?.timedOut === true, 'Hard timer did not record a timeout attempt');
  assert(timeoutAttempt?.withinLimit === false, 'Timed-out attempt should be outside the limit');

  assert(pageErrors.length === 0, `Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedScripts.length === 0, `JavaScript load failures: ${failedScripts.join(' | ')}`);

  console.log('# QTimer browser smoke');
  console.log(`Questions: ${questionCount}`);
  console.log(`Subject 5 label: ${subjectMeta}`);
  console.log('PASS: submit / undo / weak mode / persistence / pause / hard timeout');
} finally {
  await browser.close();
}
