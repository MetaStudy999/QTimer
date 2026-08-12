#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

const url = process.env.QTIMER_URL || 'http://127.0.0.1:8080';
const executablePath = process.env.CHROME_BIN;
function assert(condition,message){ if(!condition) throw new Error(message); }
if(!executablePath) throw new Error('CHROME_BIN is required.');

const browser = await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page = await browser.newPage();
await page.setViewport({width:1440,height:1000});
const pageErrors=[];
const failedAssets=[];
page.on('pageerror',error=>pageErrors.push(error.message));
page.on('requestfailed',request=>{
  if(/\.(?:js|css)(?:\?|$)/.test(request.url())) failedAssets.push(`${request.url()} :: ${request.failure()?.errorText || 'request failed'}`);
});
page.on('response',response=>{
  if(response.status()>=400 && /\.(?:js|css)(?:\?|$)/.test(response.url())) failedAssets.push(`${response.url()} :: HTTP ${response.status()}`);
});

try {
  await page.goto(url,{waitUntil:'networkidle0',timeout:30_000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(()=>Boolean(
    globalThis.QTIMER_STUDY_SHELL?.version===1
    && globalThis.QTIMER_DAP_FOCUS_READING?.version===2
    && document.querySelector('#qtStudyContext')
    && document.querySelector('#qtActionDock')
    && document.querySelector('#qtDapExplanation')
  ),{timeout:10_000});

  const foundation = await page.evaluate(()=>({
    designLink:Boolean(document.querySelector('link[data-qtimer-design="v1"]')),
    shellVersion:globalThis.QTIMER_STUDY_SHELL.version,
    focusReadingVersion:globalThis.QTIMER_DAP_FOCUS_READING.version,
    initialFocus:document.body.classList.contains('qt-focus-mode'),
    explanationHidden:document.querySelector('#qtDapExplanation').hidden
  }));
  assert(foundation.designLink,'QTimer Design System v1 CSS was not loaded');
  assert(foundation.shellVersion===1 && foundation.focusReadingVersion===2,'Study/Focus Reading API version mismatch');
  assert(!foundation.initialFocus && foundation.explanationHidden,'Focus Reading UI should be hidden outside Dapchigi');

  await page.click('#dapchigiTab');
  await page.waitForFunction(()=>state.mode==='dapchigi' && document.body.classList.contains('qt-focus-mode') && document.body.classList.contains('qt-focus-reading-v2'));

  // A fresh profile starts with scope controls open; once applied, they must disappear from the focus surface.
  assert(await page.evaluate(()=>document.body.classList.contains('qt-focus-config-open')),'Fresh Dapchigi entry should expose scope controls once');
  await page.select('#dapSubject','s3');
  await page.select('#dapChapter','ch02');
  await page.click('#dapApplyScope');
  await page.waitForFunction(()=>state.currentRoundIds.length===52 && state.dapchigiV1?.step==='preview' && !document.body.classList.contains('qt-focus-config-open'));

  const focus = await page.evaluate(()=>{
    const pane=document.querySelector('.question-pane');
    const control=document.querySelector('#studyView > .control-bar');
    const summary=document.querySelector('#studyView > .session-summary');
    const dock=document.querySelector('#qtActionDock');
    const explanation=document.querySelector('#qtDapExplanation');
    const header=document.querySelector('.app-header');
    const dapPanel=document.querySelector('#dapchigiPanel');
    return {
      focus:document.body.classList.contains('qt-focus-mode') && document.body.classList.contains('qt-focus-reading-v2'),
      scope:document.querySelector('#qtContextScope').textContent,
      position:document.querySelector('#qtContextPosition').textContent,
      stage:document.querySelector('#qtContextStage').textContent,
      headerDisplay:getComputedStyle(header).display,
      controlDisplay:getComputedStyle(control).display,
      summaryDisplay:getComputedStyle(summary).display,
      dapPanelDisplay:getComputedStyle(dapPanel).display,
      explanationHidden:explanation.hidden,
      explanationText:explanation.textContent,
      paneWidth:pane.getBoundingClientRect().width,
      workspaceDisplay:getComputedStyle(document.querySelector('.workspace')).display,
      spaceDisabled:dock.querySelector('[data-action="space"]').disabled,
      ratingDisabled:['o','a','x'].every(key=>dock.querySelector(`[data-action="${key}"]`).disabled),
      touchTargets:[...dock.querySelectorAll('button')].map(button=>button.getBoundingClientRect().height)
    };
  });
  assert(focus.focus,'Dapchigi did not activate Focus Reading Mode');
  assert(focus.scope.includes('3과목 데이터베이스 구축') && focus.position==='1 / 52' && focus.stage==='답 보기','Study Context values are incorrect');
  assert(focus.headerDisplay==='none' && focus.controlDisplay==='none' && focus.summaryDisplay==='none' && focus.dapPanelDisplay==='none','Focus Reading did not hide global/config menus after scope apply');
  assert(!focus.explanationHidden && focus.explanationText.includes('해설') && !focus.explanationText.includes('문제집 해설'),'Explanation panel should reserve space but remain locked before reveal');
  assert(focus.workspaceDisplay==='grid','Desktop Focus Reading should use a two-column grid');
  assert(!focus.spaceDisabled && focus.ratingDisabled,'Preview Action Dock state is incorrect');
  assert(focus.touchTargets.every(height=>height>=44),`Action Dock has a touch target under 44px: ${focus.touchTargets.join(', ')}`);

  // Range/settings must be available on demand, then return to a clean focus surface.
  await page.click('#qtFocusConfigBtn');
  await page.waitForFunction(()=>document.body.classList.contains('qt-focus-config-open'));
  assert((await page.$eval('#dapchigiPanel',el=>getComputedStyle(el).display))==='grid','Range/settings overlay did not open');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('qt-focus-config-open'));

  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='question' && document.querySelector('#qtContextStage')?.textContent==='문제 회상');

  const stem = await page.evaluate(()=>{
    const mark=document.querySelector('#questionText .qt-focus-stem-mark');
    const keywords=[...document.querySelectorAll('#questionText .qt-focus-keyword')];
    const first=keywords[0];
    return {
      hasMark:Boolean(mark),
      keywordCount:keywords.length,
      markBackground:mark ? getComputedStyle(mark).backgroundColor : '',
      keywordBackground:first ? getComputedStyle(first).backgroundColor : '',
      keywordColor:first ? getComputedStyle(first).color : '',
      text:document.querySelector('#questionText').textContent,
      explanationText:document.querySelector('#qtDapExplanation').textContent
    };
  });
  assert(stem.hasMark,'Question stem does not have the full light-highlight layer');
  assert(stem.keywordCount>0 && stem.keywordCount<=6,`Expected 1-6 focus keywords, got ${stem.keywordCount}`);
  assert(stem.keywordColor==='rgb(255, 255, 255)',`Focus keyword text is not white: ${stem.keywordColor}`);
  assert(stem.explanationText.includes('정답 확인') && !stem.explanationText.includes('문제집 해설'),'Recall stage leaked explanation content');

  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='mark');
  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='reveal' && document.querySelector('#qtContextStage')?.textContent==='정답 확인');

  const reveal = await page.evaluate(()=>{
    const q=currentQuestion();
    const explanation=document.querySelector('#qtDapExplanation');
    const dock=document.querySelector('#qtActionDock');
    return {
      sourceExplanation:q.sourceExplanation,
      finalKey:q.finalKey,
      explanationText:explanation.textContent,
      spaceDisabled:dock.querySelector('[data-action="space"]').disabled,
      ratingsEnabled:['o','a','x'].every(key=>!dock.querySelector(`[data-action="${key}"]`).disabled)
    };
  });
  assert(reveal.explanationText.includes(reveal.finalKey),'Reveal panel did not show finalKey');
  assert(reveal.explanationText.includes(reveal.sourceExplanation),'Reveal panel did not show sourceExplanation');
  assert(reveal.spaceDisabled && reveal.ratingsEnabled,'Reveal Action Dock state is incorrect');

  await page.click('#qtActionDock [data-action="a"]');
  await page.waitForFunction(()=>state.dapchigiV1?.attempts?.length===1 && state.dapchigiV1?.step==='preview' && document.querySelector('#qtContextPosition')?.textContent==='2 / 52');

  await page.click('#qtFocusExitBtn');
  await page.waitForFunction(()=>document.querySelector('#dashboardView')?.hidden===false && !document.body.classList.contains('qt-focus-mode'));
  const dashboardReturn = await page.evaluate(()=>({
    focus:document.body.classList.contains('qt-focus-reading-v2'),
    headerDisplay:getComputedStyle(document.querySelector('.app-header')).display,
    explanationHidden:document.querySelector('#qtDapExplanation').hidden
  }));
  assert(!dashboardReturn.focus && dashboardReturn.headerDisplay!=='none' && dashboardReturn.explanationHidden,'Focus Reading styles leaked into Dashboard');

  assert(pageErrors.length===0,`Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedAssets.length===0,`Design JS/CSS load failures: ${failedAssets.join(' | ')}`);

  console.log('# QTimer Focus Reading v2 smoke');
  console.log('PASS: hidden global menus / on-demand scope overlay / problem+explanation grid');
  console.log('PASS: full light stem highlight / dark focus keywords + white text / no pre-reveal explanation leak');
  console.log('PASS: reveal finalKey+sourceExplanation / O-A-X dock / Dashboard cleanup');
} finally {
  await browser.close();
}
