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
  await page.waitForFunction(()=>globalThis.QTIMER_SETTINGS?.version===3 && document.querySelector('#settingsTab'),{timeout:10_000});
  await page.click('#settingsTab');
  await page.waitForFunction(()=>document.querySelector('#settingsView')?.hidden===false);

  const controls = await page.evaluate(() => ({
    version:globalThis.QTIMER_SETTINGS.version,
    key:globalThis.QTIMER_SETTINGS.key,
    questionThemes:document.querySelectorAll('[data-qt-theme-kind="question"]').length,
    answerThemes:document.querySelectorAll('[data-qt-theme-kind="answer"]').length,
    apiQuestionThemes:globalThis.QTIMER_SETTINGS.themes.question.length,
    apiAnswerThemes:globalThis.QTIMER_SETTINGS.themes.answer.length,
    scaleMin:document.querySelector('#qtScaleRange')?.min,
    scaleMax:document.querySelector('#qtScaleRange')?.max,
    scaleSteps:globalThis.QTIMER_SETTINGS.scaleSteps.length,
    questionFont:Boolean(document.querySelector('#qtQuestionFont')),
    answerFont:Boolean(document.querySelector('#qtAnswerFont'))
  }));
  assert(controls.version===3 && controls.key==='qtimer-settings-v2','Settings v3 API/shared storage key mismatch');
  assert(controls.questionThemes===5 && controls.answerThemes===5 && controls.apiQuestionThemes===5 && controls.apiAnswerThemes===5,'Expected exactly five question and five answer themes');
  assert(controls.scaleMin==='1' && controls.scaleMax==='10' && controls.scaleSteps===10,'Screen scale must expose ten discrete steps');
  assert(controls.questionFont && controls.answerFont,'Existing typography controls disappeared in Settings v3');

  await page.click('[data-qt-theme-kind="question"][data-qt-theme="focus-blue"]');
  await page.click('[data-qt-theme-kind="answer"][data-qt-theme="stable-green"]');
  await page.waitForFunction(()=>{
    const s=JSON.parse(localStorage.getItem('qtimer-settings-v2'));
    return s?.version===3 && s?.dapchigi?.question?.theme==='focus-blue' && s?.dapchigi?.answer?.theme==='stable-green';
  });

  let stored = await page.evaluate(()=>JSON.parse(localStorage.getItem('qtimer-settings-v2')));
  assert(stored.dapchigi.question.fontColor==='#16324f' && stored.dapchigi.question.highlightColor==='#dceeff' && stored.dapchigi.question.highlight,'Question focus-blue theme did not save expected palette');
  assert(stored.dapchigi.answer.fontColor==='#14532d' && stored.dapchigi.answer.highlightColor==='#dcfce7' && stored.dapchigi.answer.highlight,'Answer stable-green theme did not save expected palette');

  await page.$eval('#qtQuestionColor',el=>{el.value='#123456';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('qtimer-settings-v2'))?.dapchigi?.question?.theme==='custom');
  assert(await page.$eval('#qtQuestionThemeState',el=>el.textContent)==='사용자 지정','Manual color edit should switch the question palette to custom');

  // Return to a named palette so named-theme persistence is tested as well.
  await page.click('[data-qt-theme-kind="question"][data-qt-theme="calm-mint"]');

  await page.$eval('#qtScaleRange',el=>{el.value='10';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('qtimer-settings-v2'))?.display?.scaleLevel===10);
  const scale10 = await page.evaluate(()=>({level:document.body.dataset.qtimerScaleLevel,percent:document.body.dataset.qtimerScalePercent,zoom:document.body.style.zoom,label:document.querySelector('#qtScaleValue')?.textContent}));
  assert(scale10.level==='10' && scale10.percent==='125','10th scale step should be 125%');
  assert(Math.abs(Number.parseFloat(scale10.zoom)-1.25)<0.001,`Expected zoom 1.25 at scale level 10, got ${scale10.zoom}`);
  assert(scale10.label.includes('10단계') && scale10.label.includes('125%'),'Scale label does not show level 10 / 125%');

  await page.click('#qtScaleDefault');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('qtimer-settings-v2'))?.display?.scaleLevel===5);
  assert(await page.$eval('#qtScaleValue',el=>el.textContent)==='5단계 · 100%','Default scale button should return to level 5 / 100%');

  // Use level 8 for persistence and Dapchigi rendering checks.
  await page.$eval('#qtScaleRange',el=>{el.value='8';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('qtimer-settings-v2'))?.display?.scaleLevel===8);

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
    return {color:stem.color,markBg:mark?getComputedStyle(mark).backgroundColor:'',level:document.body.dataset.qtimerScaleLevel,percent:document.body.dataset.qtimerScalePercent};
  });
  assert(qStyle.color==='rgb(20, 61, 54)',`Question calm-mint text color mismatch: ${qStyle.color}`);
  assert(qStyle.markBg==='rgb(221, 245, 236)',`Question calm-mint highlight mismatch: ${qStyle.markBg}`);
  assert(qStyle.level==='8' && qStyle.percent==='115','Dapchigi should retain scale level 8 / 115%');

  await page.evaluate(()=>{state.dapchigiV1.step='preview';renderQuestion();});
  await page.waitForFunction(()=>document.querySelector('#dapAnswerValue'));
  const aStyle = await page.evaluate(()=>{
    const value=document.querySelector('#dapAnswerValue');
    const mark=value.querySelector('mark.dap-highlight-answer');
    return {color:getComputedStyle(value).color,markBg:mark?getComputedStyle(mark).backgroundColor:''};
  });
  assert(aStyle.color==='rgb(20, 83, 45)',`Answer stable-green text color mismatch: ${aStyle.color}`);
  assert(aStyle.markBg==='rgb(220, 252, 231)',`Answer stable-green highlight mismatch: ${aStyle.markBg}`);

  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(()=>globalThis.QTIMER_SETTINGS?.version===3,{timeout:10_000});
  const persisted = await page.evaluate(()=>({settings:globalThis.QTIMER_SETTINGS.get(),payload:globalThis.QTIMER_SETTINGS.exportPayload(),level:document.body.dataset.qtimerScaleLevel,percent:document.body.dataset.qtimerScalePercent}));
  assert(persisted.settings.dapchigi.question.theme==='calm-mint' && persisted.settings.dapchigi.answer.theme==='stable-green','Named learning themes did not persist after reload');
  assert(persisted.settings.display.scaleLevel===8 && persisted.level==='8' && persisted.percent==='115','Ten-step scale did not persist after reload');
  assert(persisted.payload.format==='qtimer-settings' && persisted.payload.version===3,'Settings v3 export payload invalid');

  const migratedV2 = await page.evaluate(()=>globalThis.QTIMER_SETTINGS.validatePayload({format:'qtimer-settings',version:2,settings:{version:2,dapchigi:{question:{fontFamily:'default',fontSize:'default',fontColor:'#101828',bold:false,highlight:true,highlightColor:'#bfdbfe',emphasisScope:'all'},answer:{fontFamily:'default',fontSize:'default',fontColor:'#101828',bold:false,highlight:true,highlightColor:'#fecaca',emphasisScope:'all',answerMark:false,keywordRed:true}},display:{scale:'large'}}}));
  assert(migratedV2.version===3 && migratedV2.display.scaleLevel===7,'Settings v2 large scale migration should map to v3 level 7 / 110%');

  assert(pageErrors.length===0,`Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedScripts.length===0,`JavaScript load failures: ${failedScripts.join(' | ')}`);
  console.log('# QTimer settings v3 smoke');
  console.log('PASS: 5 question themes / 5 answer themes / custom override');
  console.log('PASS: ten-step 80-125% scaling / default 100% / reload persistence');
  console.log('PASS: Dapchigi theme rendering / export v3 / Settings v2 migration');
} finally { await browser.close(); }
