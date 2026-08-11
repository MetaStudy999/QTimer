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
  assert((await page.$eval('#timerState', element => element.textContent)) === 'RESUME', 'Timer did not resume');

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

  // Cancel any pending auto-advance from the hard-timeout test before Dapchigi starts.
  await page.reload({ waitUntil: 'networkidle0', timeout: 30_000 });
  await page.waitForSelector('#dapchigiPanel', { timeout: 10_000 });
  await page.waitForSelector('#dapchigiBoldHighlightStyles', { timeout: 10_000 });
  await page.click('#studyTab');
  await page.waitForSelector('.question-pane', { visible: true, timeout: 10_000 });
  const regularAttemptsBeforeDapchigi = await page.evaluate(() => state.attempts.length);

  await page.select('#modeSelect', 'dapchigi');
  await page.waitForFunction(() => state.mode === 'dapchigi' && document.querySelector('#dapchigiPanel')?.hidden === false);

  await page.select('#dapSubject', 's3');
  await page.select('#dapChapter', 'ch02');
  await page.click('#dapApplyScope');
  await page.waitForFunction(() => state.currentRoundIds.length === 52 && state.dapchigiV1?.step === 'preview');

  const styleLabels = await page.evaluate(() => ({
    questionAll: [...document.querySelector('#dapQuestionStyle').options].find(option => option.value === 'all-highlight')?.textContent,
    questionKeyword: [...document.querySelector('#dapQuestionStyle').options].find(option => option.value === 'keyword-highlight')?.textContent,
    answerAll: [...document.querySelector('#dapAnswerStyle').options].find(option => option.value === 'all-highlight')?.textContent,
    answerKeyword: [...document.querySelector('#dapAnswerStyle').options].find(option => option.value === 'keyword-highlight')?.textContent,
    answerMark: [...document.querySelector('#dapAnswerStyle').options].find(option => option.value === 'mark')?.textContent
  }));
  assert(styleLabels.questionAll === '전체 형광펜 + 볼드', 'Question full-highlight label was not upgraded');
  assert(styleLabels.questionKeyword === '핵심어 형광펜 + 볼드', 'Question keyword-highlight label was not upgraded');
  assert(styleLabels.answerAll === '전체 형광펜 + 볼드', 'Answer full-highlight label was not upgraded');
  assert(styleLabels.answerKeyword === '핵심어 형광펜 + 볼드', 'Answer keyword-highlight label was not upgraded');
  assert(styleLabels.answerMark === '답 마킹 + 볼드', 'Answer marking label was not upgraded');

  await page.select('#dapAnswerStyle', 'mark');
  await page.waitForFunction(() => document.querySelector('#dapAnswerValue mark.dap-highlight-answer'));
  const answerMarkWeight = await page.$eval('#dapAnswerValue mark.dap-highlight-answer', element => Number.parseInt(getComputedStyle(element).fontWeight, 10));
  assert(answerMarkWeight >= 700, `Dapchigi answer marking is not bold: ${answerMarkWeight}`);

  const dapScope = await page.evaluate(() => ({
    count: state.currentRoundIds.length,
    allSubject3Ch02: state.currentRoundIds.every(id => id.startsWith('sujebi-2026-db-build-ch02-')),
    step: state.dapchigiV1.step,
    answerVisible: !document.querySelector('#dapAnswerCard').hidden,
    questionHidden: document.querySelector('#questionText').closest('article').hidden
  }));
  assert(dapScope.count === 52 && dapScope.allSubject3Ch02, 'Dapchigi Subject 3 Ch02 range filter is incorrect');
  assert(dapScope.step === 'preview' && dapScope.answerVisible && dapScope.questionHidden, 'Dapchigi answer-preview stage is incorrect');

  await page.keyboard.press('Space');
  await page.waitForFunction(() => state.dapchigiV1?.step === 'question');
  const questionStage = await page.evaluate(() => ({
    answerHidden: document.querySelector('#dapAnswerCard').hidden,
    questionHidden: document.querySelector('#questionText').closest('article').hidden
  }));
  assert(questionStage.answerHidden && !questionStage.questionHidden, 'Dapchigi question-recall stage leaked the answer or hid the question');

  await page.select('#dapQuestionStyle', 'all-highlight');
  await page.waitForFunction(() => document.querySelector('#questionText mark.dap-highlight-question'));
  const allHighlightWeight = await page.$eval('#questionText mark.dap-highlight-question', element => Number.parseInt(getComputedStyle(element).fontWeight, 10));
  assert(allHighlightWeight >= 700, `Dapchigi full highlight is not bold: ${allHighlightWeight}`);

  await page.select('#dapQuestionStyle', 'keyword-highlight');
  await page.waitForFunction(() => document.querySelector('#questionText mark.dap-highlight-question'));
  const keywordHighlightWeight = await page.$eval('#questionText mark.dap-highlight-question', element => Number.parseInt(getComputedStyle(element).fontWeight, 10));
  assert(keywordHighlightWeight >= 700, `Dapchigi keyword highlight is not bold: ${keywordHighlightWeight}`);

  await page.keyboard.press('Space');
  await page.waitForFunction(() => state.dapchigiV1?.step === 'mark');
  const blankCount = await page.$$eval('.choice.dap-blank', elements => elements.length);
  assert(blankCount > 0, 'Dapchigi mark stage did not create a recall blank');

  await page.keyboard.press('Space');
  await page.waitForFunction(() => state.dapchigiV1?.step === 'reveal');
  const revealStage = await page.evaluate(() => ({
    answerVisible: !document.querySelector('#dapAnswerCard').hidden,
    evalVisible: !document.querySelector('#dapEvalRow').hidden
  }));
  assert(revealStage.answerVisible && revealStage.evalVisible, 'Dapchigi reveal/evaluation stage is incomplete');

  await page.keyboard.press('a');
  await page.waitForFunction(() => state.dapchigiV1?.attempts?.length === 1 && state.dapchigiV1?.step === 'preview');
  const dapRecorded = await page.evaluate(() => ({
    rating: state.dapchigiV1.attempts.at(-1)?.rating,
    attemptMode: state.dapchigiV1.attempts.at(-1)?.attemptMode,
    regularAttempts: state.attempts.length,
    index: state.currentIndex,
    roundSize: state.currentRoundIds.length
  }));
  assert(dapRecorded.rating === 'a' && dapRecorded.attemptMode === 'dapchigi', 'Dapchigi A self-evaluation was not recorded');
  assert(dapRecorded.regularAttempts === regularAttemptsBeforeDapchigi, 'Assisted Dapchigi evaluation polluted normal exam attempts');
  assert(dapRecorded.index === 1 && dapRecorded.roundSize === 52, 'Dapchigi did not advance within the selected range');

  await page.reload({ waitUntil: 'networkidle0', timeout: 30_000 });
  await page.waitForFunction(() => state.mode === 'dapchigi' && state.dapchigiV1?.attempts?.length === 1 && document.querySelector('#dapchigiPanel')?.hidden === false);
  const dapPersisted = await page.evaluate(() => ({
    mode: state.mode,
    count: state.currentRoundIds.length,
    rating: state.dapchigiV1.attempts.at(-1)?.rating,
    subject: state.dapchigiV1.subject,
    chapter: state.dapchigiV1.chapter
  }));
  assert(dapPersisted.mode === 'dapchigi', 'Dapchigi mode was not restored');
  assert(dapPersisted.count === 52 && dapPersisted.subject === 's3' && dapPersisted.chapter === 'ch02', 'Dapchigi scope was not restored');
  assert(dapPersisted.rating === 'a', 'Dapchigi self-evaluation history was not restored');

  assert(pageErrors.length === 0, `Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedScripts.length === 0, `JavaScript load failures: ${failedScripts.join(' | ')}`);

  console.log('# QTimer browser smoke');
  console.log(`Questions: ${questionCount}`);
  console.log(`Subject 5 label: ${subjectMeta}`);
  console.log('Dapchigi styles: full highlight + bold / keyword highlight + bold / answer marking + bold PASS');
  console.log('Dapchigi: S3 Ch02 52 questions / Space stages / A rating / persistence PASS');
  console.log('PASS: submit / undo / weak mode / persistence / pause / hard timeout / dapchigi');
} finally {
  await browser.close();
}
