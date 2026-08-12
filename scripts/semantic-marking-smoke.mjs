#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

const url = process.env.QTIMER_URL || 'http://127.0.0.1:8080';
const executablePath = process.env.CHROME_BIN;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

if (!executablePath) throw new Error('CHROME_BIN is required.');

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
  if (/\.js(?:\?|$)/.test(request.url())) failedScripts.push(`${request.url()} :: ${request.failure()?.errorText || 'request failed'}`);
});
page.on('response', response => {
  if (response.status() >= 400 && /\.js(?:\?|$)/.test(response.url())) failedScripts.push(`${response.url()} :: HTTP ${response.status()}`);
});

try {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30_000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0', timeout: 30_000 });

  await page.waitForSelector('#studyTab', { timeout: 10_000 });
  await page.waitForFunction(() => globalThis.QTIMER_SEMANTIC_CHOICE_MARKING?.version === 1, { timeout: 10_000 });
  await page.click('#studyTab');
  await page.select('#modeSelect', 'dapchigi');
  await page.waitForFunction(() => state.mode === 'dapchigi' && document.querySelector('#dapchigiPanel')?.hidden === false);

  const fixture = await page.evaluate(() => {
    const api = globalThis.QTIMER_SEMANTIC_CHOICE_MARKING;
    const negative = QUESTIONS.find(q => {
      const type = api.classifyStem(q.questionText);
      return (type === 'negative-false' || type === 'negative-exclusion') && Array.isArray(q.choices) && q.choices.length >= 3;
    });
    const positive = QUESTIONS.find(q => api.classifyStem(q.questionText) === 'positive' && Array.isArray(q.choices) && q.choices.length >= 3);
    if (!negative || !positive) throw new Error('Semantic marking fixtures not found in question bank');
    return {
      negativeId: negative.id,
      positiveId: positive.id,
      negativeType: api.classifyStem(negative.questionText),
      negativeSnapshot: JSON.stringify({ id: negative.id, questionText: negative.questionText, choices: negative.choices, sourceAnswer: negative.sourceAnswer }),
      positiveSnapshot: JSON.stringify({ id: positive.id, questionText: positive.questionText, choices: positive.choices, sourceAnswer: positive.sourceAnswer }),
      regularAttempts: state.attempts.length,
      dapAttempts: state.dapchigiV1?.attempts?.length || 0
    };
  });

  // Reveal-only invariant: no semantic answer cue is allowed during recall/question stage.
  await page.evaluate(id => {
    state.currentRoundIds = [id];
    state.currentIndex = 0;
    state.dapchigiV1.step = 'question';
    saveState();
    renderQuestion();
  }, fixture.negativeId);
  await page.waitForFunction(() => state.dapchigiV1?.step === 'question');
  await new Promise(resolve => setTimeout(resolve, 50));
  const beforeReveal = await page.evaluate(() => ({
    target: document.querySelectorAll('#choices .qt-semantic-target').length,
    support: document.querySelectorAll('#choices .qt-semantic-support').length
  }));
  assert(beforeReveal.target === 0 && beforeReveal.support === 0, 'Semantic marking leaked before reveal stage');

  // Negative stem: answer target red; all other choices blue/support; never strikethrough.
  await page.evaluate(() => {
    state.dapchigiV1.step = 'reveal';
    saveState();
    renderQuestion();
  });
  await page.waitForFunction(() => document.querySelectorAll('#choices .qt-semantic-target').length === 1);
  await page.waitForFunction(() => document.querySelectorAll('#choices .qt-semantic-support').length >= 2);

  const negativeResult = await page.evaluate(() => {
    const q = currentQuestion();
    const answer = Number(effectiveAnswer(q));
    const choices = [...document.querySelectorAll('#choices .choice')];
    const target = document.querySelector('#choices .qt-semantic-target');
    const support = document.querySelector('#choices .qt-semantic-support');
    const targetText = target?.children?.[1];
    const supportText = support?.children?.[1];
    return {
      answer,
      targetAnswer: Number(target?.dataset.answer),
      targetCount: document.querySelectorAll('#choices .qt-semantic-target').length,
      supportCount: document.querySelectorAll('#choices .qt-semantic-support').length,
      choiceCount: choices.length,
      targetBadge: target?.querySelector('.qt-semantic-badge')?.textContent?.trim(),
      supportBadges: [...document.querySelectorAll('#choices .qt-semantic-support .qt-semantic-badge')].map(el => el.textContent.trim()),
      targetColor: targetText ? getComputedStyle(targetText).color : '',
      supportColor: supportText ? getComputedStyle(supportText).color : '',
      targetDecoration: targetText ? getComputedStyle(targetText).textDecorationLine : '',
      supportDecoration: supportText ? getComputedStyle(supportText).textDecorationLine : '',
      stemType: document.querySelector('#choices')?.dataset.semanticStem
    };
  });

  assert(negativeResult.targetCount === 1, `Expected one negative-stem target, got ${negativeResult.targetCount}`);
  assert(negativeResult.targetAnswer === negativeResult.answer, 'Red semantic target is not the effective answer');
  assert(negativeResult.supportCount === negativeResult.choiceCount - 1, 'Negative-stem non-answer choices were not all marked as support');
  assert(negativeResult.targetBadge === '● 선택', `Target badge mismatch: ${negativeResult.targetBadge}`);
  assert(negativeResult.supportBadges.every(label => label === '✓ 부합'), 'Support badge mismatch');
  assert(negativeResult.targetColor && negativeResult.supportColor && negativeResult.targetColor !== negativeResult.supportColor, 'Semantic target/support colors are not distinct');
  assert(negativeResult.targetDecoration === 'none', `Target unexpectedly has text decoration: ${negativeResult.targetDecoration}`);
  assert(negativeResult.supportDecoration === 'none', `Support unexpectedly has text decoration: ${negativeResult.supportDecoration}`);
  assert(['negative-false', 'negative-exclusion'].includes(negativeResult.stemType), `Negative stem type missing: ${negativeResult.stemType}`);

  // Positive/default question: only the answer target is red; no blue support choices.
  await page.evaluate(id => {
    state.currentRoundIds = [id];
    state.currentIndex = 0;
    state.dapchigiV1.step = 'reveal';
    saveState();
    renderQuestion();
  }, fixture.positiveId);
  await page.waitForFunction(() => document.querySelectorAll('#choices .qt-semantic-target').length === 1);
  await new Promise(resolve => setTimeout(resolve, 50));

  const positiveResult = await page.evaluate(() => {
    const q = currentQuestion();
    const target = document.querySelector('#choices .qt-semantic-target');
    return {
      answer: Number(effectiveAnswer(q)),
      targetAnswer: Number(target?.dataset.answer),
      targetCount: document.querySelectorAll('#choices .qt-semantic-target').length,
      supportCount: document.querySelectorAll('#choices .qt-semantic-support').length,
      targetBadge: target?.querySelector('.qt-semantic-badge')?.textContent?.trim(),
      stemType: document.querySelector('#choices')?.dataset.semanticStem,
      decoration: target?.children?.[1] ? getComputedStyle(target.children[1]).textDecorationLine : ''
    };
  });
  assert(positiveResult.targetCount === 1 && positiveResult.targetAnswer === positiveResult.answer, 'Positive question did not mark exactly the effective answer');
  assert(positiveResult.supportCount === 0, `Positive question should have no blue support choices, got ${positiveResult.supportCount}`);
  assert(positiveResult.targetBadge === '● 선택', 'Positive target badge mismatch');
  assert(positiveResult.stemType === 'positive', `Positive stem type mismatch: ${positiveResult.stemType}`);
  assert(positiveResult.decoration === 'none', 'Positive answer unexpectedly has strikethrough/decoration');

  const integrity = await page.evaluate(({ negativeId, positiveId }) => {
    const negative = QUESTIONS.find(q => q.id === negativeId);
    const positive = QUESTIONS.find(q => q.id === positiveId);
    return {
      negativeSnapshot: JSON.stringify({ id: negative.id, questionText: negative.questionText, choices: negative.choices, sourceAnswer: negative.sourceAnswer }),
      positiveSnapshot: JSON.stringify({ id: positive.id, questionText: positive.questionText, choices: positive.choices, sourceAnswer: positive.sourceAnswer }),
      regularAttempts: state.attempts.length,
      dapAttempts: state.dapchigiV1?.attempts?.length || 0
    };
  }, fixture);

  assert(integrity.negativeSnapshot === fixture.negativeSnapshot, 'Semantic marking mutated the negative SOURCE BANK record');
  assert(integrity.positiveSnapshot === fixture.positiveSnapshot, 'Semantic marking mutated the positive SOURCE BANK record');
  assert(integrity.regularAttempts === fixture.regularAttempts, 'Semantic marking changed regular attempts');
  assert(integrity.dapAttempts === fixture.dapAttempts, 'Semantic marking changed Dapchigi O/A/X attempts');

  assert(pageErrors.length === 0, `Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedScripts.length === 0, `JavaScript load failures: ${failedScripts.join(' | ')}`);

  console.log('# QTimer semantic choice marking smoke');
  console.log(`Negative fixture: ${fixture.negativeId} (${fixture.negativeType})`);
  console.log(`Positive fixture: ${fixture.positiveId}`);
  console.log('PASS: reveal-only / red target / blue support / badges / no strikethrough / data-neutral');
} finally {
  await browser.close();
}