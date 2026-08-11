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
  await page.waitForFunction(()=>Boolean(globalThis.QTIMER_STUDY_SHELL?.version===1 && document.querySelector('#qtStudyContext') && document.querySelector('#qtActionDock')),{timeout:10_000});

  const foundation = await page.evaluate(()=>({
    designLink:Boolean(document.querySelector('link[data-qtimer-design="v1"]')),
    shellVersion:globalThis.QTIMER_STUDY_SHELL.version,
    initialFocus:document.body.classList.contains('qt-focus-mode'),
    contextHidden:document.querySelector('#qtStudyContext').hidden,
    dockHidden:document.querySelector('#qtActionDock').hidden
  }));
  assert(foundation.designLink,'QTimer Design System v1 CSS was not loaded');
  assert(foundation.shellVersion===1,'Study Shell API version mismatch');
  assert(!foundation.initialFocus && foundation.contextHidden && foundation.dockHidden,'Focus UI should be hidden outside Dapchigi');

  await page.click('#dapchigiTab');
  await page.waitForFunction(()=>state.mode==='dapchigi' && document.body.classList.contains('qt-focus-mode') && document.querySelector('#qtStudyContext')?.hidden===false && document.querySelector('#qtActionDock')?.hidden===false);

  await page.select('#dapSubject','s3');
  await page.select('#dapChapter','ch02');
  await page.click('#dapApplyScope');
  await page.waitForFunction(()=>state.currentRoundIds.length===52 && state.dapchigiV1?.step==='preview' && document.querySelector('#qtContextPosition')?.textContent==='1 / 52');

  const focus = await page.evaluate(()=>{
    const pane=document.querySelector('.question-pane');
    const control=document.querySelector('#studyView > .control-bar');
    const summary=document.querySelector('#studyView > .session-summary');
    const dock=document.querySelector('#qtActionDock');
    const buttons=[...dock.querySelectorAll('button')];
    return {
      focus:document.body.classList.contains('qt-focus-mode'),
      scope:document.querySelector('#qtContextScope').textContent,
      mode:document.querySelector('#qtContextMode').textContent,
      round:document.querySelector('#qtContextRound').textContent,
      position:document.querySelector('#qtContextPosition').textContent,
      stage:document.querySelector('#qtContextStage').textContent,
      controlDisplay:getComputedStyle(control).display,
      summaryDisplay:getComputedStyle(summary).display,
      paneMaxWidth:getComputedStyle(pane).maxWidth,
      paneWidth:pane.getBoundingClientRect().width,
      spaceDisabled:dock.querySelector('[data-action="space"]').disabled,
      ratingDisabled:['o','a','x'].every(key=>dock.querySelector(`[data-action="${key}"]`).disabled),
      touchTargets:buttons.map(button=>button.getBoundingClientRect().height)
    };
  });
  assert(focus.focus,'Dapchigi did not activate Focus Mode');
  assert(focus.scope.includes('3과목 데이터베이스 구축') && focus.scope.includes('Ch02'),`Context scope mismatch: ${focus.scope}`);
  assert(focus.mode==='답치기' && focus.round==='1회독' && focus.position==='1 / 52' && focus.stage==='답 보기','Study Context Bar values are incorrect');
  assert(focus.controlDisplay==='none' && focus.summaryDisplay==='none','Focus Mode did not remove secondary global study controls');
  assert(focus.paneWidth<=922,`Focus reading width is too wide: ${focus.paneWidth}`);
  assert(!focus.spaceDisabled && focus.ratingDisabled,'Preview stage Action Dock state is incorrect');
  assert(focus.touchTargets.every(height=>height>=44),`Action Dock has a touch target under 44px: ${focus.touchTargets.join(', ')}`);

  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='question' && document.querySelector('#qtContextStage')?.textContent==='문제 회상');
  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='mark' && document.querySelector('#qtContextStage')?.textContent==='빈칸 마킹');
  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='reveal' && document.querySelector('#qtContextStage')?.textContent==='정답 확인');

  const revealDock = await page.evaluate(()=>({
    spaceDisabled:document.querySelector('#qtActionDock [data-action="space"]').disabled,
    oDisabled:document.querySelector('#qtActionDock [data-action="o"]').disabled,
    aDisabled:document.querySelector('#qtActionDock [data-action="a"]').disabled,
    xDisabled:document.querySelector('#qtActionDock [data-action="x"]').disabled
  }));
  assert(revealDock.spaceDisabled && !revealDock.oDisabled && !revealDock.aDisabled && !revealDock.xDisabled,'Reveal stage Action Dock state is incorrect');

  await page.click('#qtActionDock [data-action="a"]');
  await page.waitForFunction(()=>state.dapchigiV1?.attempts?.length===1 && state.dapchigiV1?.step==='preview' && document.querySelector('#qtContextPosition')?.textContent==='2 / 52');
  const recorded = await page.evaluate(()=>({
    rating:state.dapchigiV1.attempts.at(-1)?.rating,
    position:document.querySelector('#qtContextPosition').textContent,
    stage:document.querySelector('#qtContextStage').textContent
  }));
  assert(recorded.rating==='a' && recorded.position==='2 / 52' && recorded.stage==='답 보기','Action Dock A rating did not advance/sync Focus context');

  await page.click('#dashboardTab');
  await page.waitForFunction(()=>document.querySelector('#dashboardView')?.hidden===false && !document.body.classList.contains('qt-focus-mode'));
  const dashboardReturn = await page.evaluate(()=>({
    focus:document.body.classList.contains('qt-focus-mode'),
    contextHidden:document.querySelector('#qtStudyContext').hidden,
    dockHidden:document.querySelector('#qtActionDock').hidden
  }));
  assert(!dashboardReturn.focus && dashboardReturn.contextHidden && dashboardReturn.dockHidden,'Focus shell leaked into Dashboard');

  assert(pageErrors.length===0,`Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedAssets.length===0,`Design JS/CSS load failures: ${failedAssets.join(' | ')}`);

  console.log('# QTimer UI shell smoke');
  console.log('PASS: Design Tokens CSS / Study Context Bar / Dapchigi Focus Mode');
  console.log('PASS: read width / hidden secondary controls / 44px action targets');
  console.log('PASS: Space -> question -> mark -> reveal / O-A-X dock state / Dashboard cleanup');
} finally {
  await browser.close();
}
