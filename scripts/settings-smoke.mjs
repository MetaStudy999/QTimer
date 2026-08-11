#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

const url = process.env.QTIMER_URL || 'http://127.0.0.1:8080';
const executablePath = process.env.CHROME_BIN;

function assert(condition,message){ if (!condition) throw new Error(message); }
if (!executablePath) throw new Error('CHROME_BIN is required.');

const browser = await puppeteer.launch({
  executablePath,
  headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage']
});
const page = await browser.newPage();
const pageErrors = [];
const failedScripts = [];
page.on('pageerror',error => pageErrors.push(error.message));
page.on('requestfailed',request => {
  if (/\.js(?:\?|$)/.test(request.url())) failedScripts.push(`${request.url()} :: ${request.failure()?.errorText || 'request failed'}`);
});
page.on('response',response => {
  if (response.status() >= 400 && /\.js(?:\?|$)/.test(response.url())) failedScripts.push(`${response.url()} :: HTTP ${response.status()}`);
});

try {
  await page.goto(url,{waitUntil:'networkidle0',timeout:30_000});
  await page.evaluate(() => localStorage.clear());
  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(() => Boolean(globalThis.QTIMER_SETTINGS && document.querySelector('#settingsTab')),{timeout:10_000});

  assert(await page.$eval('#settingsTab',el => el.textContent) === '환경설정','Settings top navigation label is missing');
  await page.click('#settingsTab');
  await page.waitForFunction(() => document.querySelector('#settingsView')?.hidden === false);

  const initial = await page.evaluate(() => ({
    settingsVisible:!document.querySelector('#settingsView').hidden,
    dashboardHidden:document.querySelector('#dashboardView').hidden,
    studyHidden:document.querySelector('#studyView').hidden,
    redChecked:document.querySelector('#qtSetAnswerKeywordRed').checked,
    saved:globalThis.QTIMER_SETTINGS.get()
  }));
  assert(initial.settingsVisible && initial.dashboardHidden && initial.studyHidden,'Settings view did not isolate dashboard/study views');
  assert(initial.redChecked === true && initial.saved.dapchigi.answerKeywordRed === true,'Answer keyword red should default to enabled');

  await page.click('#qtSetQuestionAllHighlight');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('qtimer-settings-v1'))?.dapchigi?.questionStyle === 'all-highlight');
  const questionGroup = await page.evaluate(() => ({
    allHighlight:document.querySelector('#qtSetQuestionAllHighlight').checked,
    allBold:document.querySelector('#qtSetQuestionAllBold').checked,
    keywordBold:document.querySelector('#qtSetQuestionKeywordBold').checked,
    keywordHighlight:document.querySelector('#qtSetQuestionKeywordHighlight').checked,
    legacySelect:document.querySelector('#dapQuestionStyle').value
  }));
  assert(questionGroup.allHighlight,'Full question highlight checkbox was not selected');
  assert(!questionGroup.allBold && !questionGroup.keywordBold && !questionGroup.keywordHighlight,'Question style checkboxes are not mutually exclusive');
  assert(questionGroup.legacySelect === 'all-highlight','Settings did not synchronize legacy Dapchigi question style');

  await page.click('#qtSetAnswerMark');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('qtimer-settings-v1'))?.dapchigi?.answerStyle === 'mark');
  assert(await page.$eval('#dapAnswerStyle',el => el.value) === 'mark','Answer marking setting did not synchronize Dapchigi');

  await page.click('#dapchigiTab');
  await page.waitForFunction(() => state.mode === 'dapchigi' && document.querySelector('#dapchigiPanel')?.hidden === false);
  await page.evaluate(() => {
    const id = 'sujebi-2026-sw-design-16';
    if (!QUESTIONS.some(q => q.id === id)) throw new Error('Known red-keyword test question is missing');
    state.currentRoundIds = [id];
    state.currentIndex = 0;
    state.dapchigiV1.step = 'preview';
    saveState();
    renderQuestion();
  });
  await page.waitForFunction(() => document.querySelector('#dapAnswerValue .qt-answer-keyword-red'));
  const redKeyword = await page.evaluate(() => {
    const span = document.querySelector('#dapAnswerValue .qt-answer-keyword-red');
    const mark = document.querySelector('#dapAnswerValue mark.dap-highlight-answer');
    return {
      text:span?.textContent || '',
      color:span ? getComputedStyle(span).color : '',
      weight:span ? Number.parseInt(getComputedStyle(span).fontWeight,10) : 0,
      markWeight:mark ? Number.parseInt(getComputedStyle(mark).fontWeight,10) : 0,
      marked:Boolean(mark)
    };
  });
  assert(redKeyword.text.includes('미들웨어'),`Expected answer keyword 미들웨어 in red, got: ${redKeyword.text}`);
  assert(redKeyword.color === 'rgb(217, 45, 32)',`Answer keyword red color mismatch: ${redKeyword.color}`);
  assert(redKeyword.weight >= 700,'Answer keyword red is not bold');
  assert(redKeyword.marked && redKeyword.markWeight >= 700,'Answer marking + bold did not coexist with red keyword');

  await page.click('#settingsTab');
  await page.click('#qtSetAnswerKeywordRed');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('qtimer-settings-v1'))?.dapchigi?.answerKeywordRed === false);
  await page.click('#dapchigiTab');
  await page.evaluate(() => {
    state.dapchigiV1.step = 'preview';
    renderQuestion();
  });
  await page.waitForFunction(() => !document.querySelector('#dapAnswerValue .qt-answer-keyword-red'));

  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(() => Boolean(globalThis.QTIMER_SETTINGS && document.querySelector('#settingsTab')),{timeout:10_000});
  const persisted = await page.evaluate(() => ({
    stored:globalThis.QTIMER_SETTINGS.get(),
    local:JSON.parse(localStorage.getItem('qtimer-settings-v1')),
    exportPayload:globalThis.QTIMER_SETTINGS.exportPayload()
  }));
  assert(persisted.stored.dapchigi.questionStyle === 'all-highlight','Question display preference was not restored after reload');
  assert(persisted.stored.dapchigi.answerStyle === 'mark','Answer marking preference was not restored after reload');
  assert(persisted.stored.dapchigi.answerKeywordRed === false,'Answer keyword red toggle was not restored after reload');
  assert(persisted.exportPayload.format === 'qtimer-settings' && persisted.exportPayload.version === 1,'Settings export payload schema is invalid');

  await page.evaluate(() => globalThis.QTIMER_SETTINGS.replace({
    version:1,
    dapchigi:{questionStyle:'keyword-highlight',answerStyle:'all-highlight',answerKeywordRed:true}
  },{persist:true,render:false,message:'smoke import'}));
  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(() => globalThis.QTIMER_SETTINGS?.get()?.dapchigi?.questionStyle === 'keyword-highlight');
  const imported = await page.evaluate(() => globalThis.QTIMER_SETTINGS.get());
  assert(imported.dapchigi.answerStyle === 'all-highlight' && imported.dapchigi.answerKeywordRed === true,'Settings replace/import path did not persist');

  assert(pageErrors.length === 0,`Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedScripts.length === 0,`JavaScript load failures: ${failedScripts.join(' | ')}`);

  console.log('# QTimer settings smoke');
  console.log('PASS: settings tab / checkbox exclusivity / auto-save / reload persistence');
  console.log('PASS: answer keyword red + bold / answer marking + bold coexistence');
  console.log('PASS: settings export schema / replace-import persistence');
} finally {
  await browser.close();
}
