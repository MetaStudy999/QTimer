#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

const url = process.env.QTIMER_URL || 'http://127.0.0.1:8080';
const executablePath = process.env.CHROME_BIN;
function assert(condition,message){ if (!condition) throw new Error(message); }
if (!executablePath) throw new Error('CHROME_BIN is required.');

const browser = await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page = await browser.newPage();
const pageErrors=[]; const failedScripts=[];
page.on('pageerror',error=>pageErrors.push(error.message));
page.on('requestfailed',request=>{if(/\.js(?:\?|$)/.test(request.url()))failedScripts.push(`${request.url()} :: ${request.failure()?.errorText || 'request failed'}`);});
page.on('response',response=>{if(response.status()>=400 && /\.js(?:\?|$)/.test(response.url()))failedScripts.push(`${response.url()} :: HTTP ${response.status()}`);});

try {
  await page.goto(url,{waitUntil:'networkidle0',timeout:30_000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(()=>globalThis.QTIMER_SETTINGS?.version===2 && document.querySelector('#settingsTab'),{timeout:10_000});
  await page.click('#settingsTab');
  await page.waitForFunction(()=>document.querySelector('#settingsView')?.hidden===false);

  const controls = await page.evaluate(() => ({
    version:globalThis.QTIMER_SETTINGS.version,
    key:globalThis.QTIMER_SETTINGS.key,
    questionFont:Boolean(document.querySelector('#qtQuestionFont')),
    questionSize:Boolean(document.querySelector('#qtQuestionSize')),
    questionColor:Boolean(document.querySelector('#qtQuestionColor')),
    questionBold:Boolean(document.querySelector('#qtQuestionBold')),
    questionHighlight:Boolean(document.querySelector('#qtQuestionHighlight')),
    questionHighlightColor:Boolean(document.querySelector('#qtQuestionHighlightColor')),
    answerFont:Boolean(document.querySelector('#qtAnswerFont')),
    answerSize:Boolean(document.querySelector('#qtAnswerSize')),
    answerColor:Boolean(document.querySelector('#qtAnswerColor')),
    answerBold:Boolean(document.querySelector('#qtAnswerBold')),
    answerHighlight:Boolean(document.querySelector('#qtAnswerHighlight')),
    answerHighlightColor:Boolean(document.querySelector('#qtAnswerHighlightColor')),
    screenButtons:document.querySelectorAll('[data-qt-scale]').length
  }));
  assert(controls.version===2 && controls.key==='qtimer-settings-v2','Settings v2 API/key mismatch');
  assert(Object.entries(controls).filter(([key])=>!['version','key','screenButtons'].includes(key)).every(([,value])=>value),'Required question/answer presentation controls are missing');
  assert(controls.screenButtons===3,'Screen scale should have small/normal/large buttons');

  await page.select('#qtQuestionFont','gothic');
  await page.select('#qtQuestionSize','24');
  await page.$eval('#qtQuestionColor',el=>{el.value='#123456';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.select('#qtQuestionScope','keyword');
  await page.click('#qtQuestionBold');
  await page.click('#qtQuestionHighlight');
  await page.$eval('#qtQuestionHighlightColor',el=>{el.value='#abc123';el.dispatchEvent(new Event('input',{bubbles:true}));});

  await page.select('#qtAnswerFont','serif');
  await page.select('#qtAnswerSize','20');
  await page.$eval('#qtAnswerColor',el=>{el.value='#654321';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.select('#qtAnswerScope','all');
  await page.click('#qtAnswerBold');
  await page.click('#qtAnswerHighlight');
  await page.$eval('#qtAnswerHighlightColor',el=>{el.value='#fedcba';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.click('#qtSetAnswerMark');

  await page.click('[data-qt-scale="large"]');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('qtimer-settings-v2'))?.display?.scale==='large');

  const stored = await page.evaluate(()=>JSON.parse(localStorage.getItem('qtimer-settings-v2')));
  assert(stored.version===2,'Stored settings schema should be v2');
  assert(stored.dapchigi.question.fontFamily==='gothic' && stored.dapchigi.question.fontSize==='24','Question font settings were not saved');
  assert(stored.dapchigi.question.fontColor==='#123456' && stored.dapchigi.question.highlightColor==='#abc123','Question color settings were not saved');
  assert(stored.dapchigi.question.bold && stored.dapchigi.question.highlight && stored.dapchigi.question.emphasisScope==='keyword','Question emphasis settings were not saved');
  assert(stored.dapchigi.answer.fontFamily==='serif' && stored.dapchigi.answer.fontSize==='20','Answer font settings were not saved');
  assert(stored.dapchigi.answer.fontColor==='#654321' && stored.dapchigi.answer.highlightColor==='#fedcba','Answer color settings were not saved');
  assert(stored.dapchigi.answer.bold && stored.dapchigi.answer.highlight && stored.dapchigi.answer.answerMark && stored.dapchigi.answer.keywordRed,'Answer emphasis settings were not saved');

  await page.click('#dapchigiTab');
  await page.waitForFunction(()=>state.mode==='dapchigi' && document.querySelector('#dapchigiPanel')?.hidden===false);
  await page.evaluate(()=>{
    const id='sujebi-2026-sw-design-16';
    state.currentRoundIds=[id]; state.currentIndex=0; state.dapchigiV1.step='question'; saveState(); renderQuestion();
  });
  await page.waitForFunction(()=>document.querySelector('#questionText')?.textContent?.length>0);
  const qStyle = await page.evaluate(()=>{
    const stem=getComputedStyle(document.querySelector('#questionText'));
    const mark=document.querySelector('#questionText mark.dap-highlight-question');
    const markStyle=mark ? getComputedStyle(mark) : null;
    return {fontFamily:stem.fontFamily,fontSize:stem.fontSize,color:stem.color,mark:Boolean(mark),markBg:markStyle?.backgroundColor||'',markWeight:markStyle?.fontWeight||''};
  });
  assert(qStyle.fontSize==='24px',`Question font size mismatch: ${qStyle.fontSize}`);
  assert(qStyle.color==='rgb(18, 52, 86)',`Question font color mismatch: ${qStyle.color}`);
  assert(qStyle.mark && qStyle.markBg==='rgb(171, 193, 35)',`Question keyword highlight mismatch: ${qStyle.markBg}`);
  assert(Number.parseInt(qStyle.markWeight,10)>=700,'Question keyword highlight should also be bold');

  await page.evaluate(()=>{state.dapchigiV1.step='preview';renderQuestion();});
  await page.waitForFunction(()=>document.querySelector('#dapAnswerValue .qt-answer-keyword-red'));
  const aStyle = await page.evaluate(()=>{
    const value=document.querySelector('#dapAnswerValue');
    const valueStyle=getComputedStyle(value);
    const mark=value.querySelector('mark.dap-highlight-answer');
    const markStyle=mark ? getComputedStyle(mark) : null;
    const red=value.querySelector('.qt-answer-keyword-red');
    const redStyle=red ? getComputedStyle(red) : null;
    return {fontFamily:valueStyle.fontFamily,fontSize:valueStyle.fontSize,color:valueStyle.color,mark:Boolean(mark),markBg:markStyle?.backgroundColor||'',markWeight:markStyle?.fontWeight||'',red:red?.textContent||'',redColor:redStyle?.color||'',redWeight:redStyle?.fontWeight||'',scale:document.body.dataset.qtimerScale,zoom:document.body.style.zoom};
  });
  assert(aStyle.fontSize==='20px',`Answer font size mismatch: ${aStyle.fontSize}`);
  assert(aStyle.color==='rgb(101, 67, 33)',`Answer font color mismatch: ${aStyle.color}`);
  assert(aStyle.mark && aStyle.markBg==='rgb(254, 220, 186)',`Answer highlight mismatch: ${aStyle.markBg}`);
  assert(Number.parseInt(aStyle.markWeight,10)>=700,'Answer highlight should also be bold');
  assert(aStyle.red.includes('미들웨어') && aStyle.redColor==='rgb(217, 45, 32)' && Number.parseInt(aStyle.redWeight,10)>=700,'Answer keyword red + bold did not render');
  assert(aStyle.scale==='large','Screen scale data attribute mismatch');

  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(()=>globalThis.QTIMER_SETTINGS?.version===2,{timeout:10_000});
  const persisted=await page.evaluate(()=>({settings:globalThis.QTIMER_SETTINGS.get(),payload:globalThis.QTIMER_SETTINGS.exportPayload(),scale:document.body.dataset.qtimerScale}));
  assert(persisted.settings.dapchigi.question.fontSize==='24' && persisted.settings.dapchigi.answer.fontSize==='20','Typography did not persist after reload');
  assert(persisted.settings.display.scale==='large' && persisted.scale==='large','Screen scale did not persist after reload');
  assert(persisted.payload.format==='qtimer-settings' && persisted.payload.version===2,'Settings v2 export payload invalid');

  const migrated = await page.evaluate(()=>globalThis.QTIMER_SETTINGS.validatePayload({format:'qtimer-settings',version:1,settings:{version:1,dapchigi:{questionStyle:'keyword-highlight',answerStyle:'mark',answerKeywordRed:false}}}));
  assert(migrated.version===2 && migrated.dapchigi.question.highlight && migrated.dapchigi.question.emphasisScope==='keyword','v1 question style migration failed');
  assert(migrated.dapchigi.answer.answerMark && migrated.dapchigi.answer.keywordRed===false,'v1 answer style migration failed');

  assert(pageErrors.length===0,`Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedScripts.length===0,`JavaScript load failures: ${failedScripts.join(' | ')}`);
  console.log('# QTimer settings v2 smoke');
  console.log('PASS: typography / font colors / bold / highlight colors / emphasis scope');
  console.log('PASS: answer mark + answer keyword red / screen scale / live persistence');
  console.log('PASS: export v2 / import compatibility with v1 settings');
} finally { await browser.close(); }
