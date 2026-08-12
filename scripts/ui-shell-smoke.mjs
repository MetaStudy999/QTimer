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
    && globalThis.QTIMER_FOCUS_QUICK_SETTINGS?.version===1
    && document.querySelector('#qtStudyContext')
    && document.querySelector('#qtActionDock')
    && document.querySelector('#qtDapExplanation')
    && document.querySelector('#qtFocusQuickPanel')
  ),{timeout:10_000});

  const foundation = await page.evaluate(()=>({
    designLink:Boolean(document.querySelector('link[data-qtimer-design="v1"]')),
    shellVersion:globalThis.QTIMER_STUDY_SHELL.version,
    focusReadingVersion:globalThis.QTIMER_DAP_FOCUS_READING.version,
    quickVersion:globalThis.QTIMER_FOCUS_QUICK_SETTINGS.version,
    quickKey:globalThis.QTIMER_FOCUS_QUICK_SETTINGS.key,
    initialFocus:document.body.classList.contains('qt-focus-mode'),
    explanationHidden:document.querySelector('#qtDapExplanation').hidden,
    quickHidden:document.querySelector('#qtFocusQuickPanel').hidden
  }));
  assert(foundation.designLink,'QTimer Design System v1 CSS was not loaded');
  assert(foundation.shellVersion===1 && foundation.focusReadingVersion===2 && foundation.quickVersion===1,'Study/Focus Reading/Quick Settings API version mismatch');
  assert(foundation.quickKey==='qtimer-focus-quick-settings-v1','Focus Quick Settings storage key mismatch');
  assert(!foundation.initialFocus && foundation.explanationHidden && foundation.quickHidden,'Focus Reading UI should be hidden outside Dapchigi');

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
      touchTargets:[...dock.querySelectorAll('button')].map(button=>button.getBoundingClientRect().height),
      quickButton:Boolean(document.querySelector('#qtFocusQuickBtn')),
      quickHidden:document.querySelector('#qtFocusQuickPanel').hidden
    };
  });
  assert(focus.focus,'Dapchigi did not activate Focus Reading Mode');
  assert(focus.scope.includes('3과목 데이터베이스 구축') && focus.position==='1 / 52' && focus.stage==='답 보기','Study Context values are incorrect');
  assert(focus.headerDisplay==='none' && focus.controlDisplay==='none' && focus.summaryDisplay==='none' && focus.dapPanelDisplay==='none','Focus Reading did not hide global/config menus after scope apply');
  assert(!focus.explanationHidden && focus.explanationText.includes('해설') && !focus.explanationText.includes('문제집 해설'),'Explanation panel should reserve space but remain locked before reveal');
  assert(focus.workspaceDisplay==='grid','Desktop Focus Reading should use a two-column grid');
  assert(!focus.spaceDisabled && focus.ratingDisabled,'Preview Action Dock state is incorrect');
  assert(focus.touchTargets.every(height=>height>=44),`Action Dock has a touch target under 44px: ${focus.touchTargets.join(', ')}`);
  assert(focus.quickButton && focus.quickHidden,'Focus Quick Settings button/panel initial state is incorrect');

  // Range controls remain independent from quick presentation settings.
  await page.click('#qtFocusConfigBtn');
  await page.waitForFunction(()=>document.body.classList.contains('qt-focus-config-open'));
  assert((await page.$eval('#dapchigiPanel',el=>getComputedStyle(el).display))==='grid','Range overlay did not open');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.body.classList.contains('qt-focus-config-open'));

  // Quick Settings: three targets, live shared Settings v3 updates, and one-step restore to panel-open state.
  const originalQuestionFont = await page.evaluate(()=>globalThis.QTIMER_SETTINGS.get().dapchigi.question.fontFamily);
  const quickPaneDisplays = async()=>page.evaluate(()=>Object.fromEntries(
    [...document.querySelectorAll('[data-qt-focus-quick-pane]')].map(pane=>[pane.dataset.qtFocusQuickPane,getComputedStyle(pane).display])
  ));
  await page.click('#qtFocusQuickBtn');
  await page.waitForFunction(()=>document.querySelector('#qtFocusQuickPanel')?.hidden===false);
  const quickOpen = await page.evaluate(()=>({
    tabs:document.querySelectorAll('[data-qt-focus-quick-tab]').length,
    selected:document.querySelector('[data-qt-focus-quick-tab][aria-selected="true"]')?.dataset.qtFocusQuickTab,
    undoDisabled:document.querySelector('#qtFocusQuickUndo')?.disabled,
    questionChecksDisplay:getComputedStyle(document.querySelector('[data-qt-focus-quick-pane="question"] .qt-focus-quick-checks')).display,
    configOpen:document.body.classList.contains('qt-focus-config-open')
  }));
  assert(quickOpen.tabs===3 && quickOpen.selected==='question','Quick Settings must expose problem/answer/keyword tabs');
  assert(quickOpen.undoDisabled,'Quick Settings undo should start disabled');
  assert(quickOpen.questionChecksDisplay==='none','Problem Focus invariant controls should not expose bold/highlighter-off toggles');
  assert(!quickOpen.configOpen,'Range overlay and Quick Settings must not remain open together');
  let visiblePanes=await quickPaneDisplays();
  assert(visiblePanes.question==='grid' && visiblePanes.answer==='none' && visiblePanes.keyword==='none',`Question tab pane visibility is incorrect: ${JSON.stringify(visiblePanes)}`);

  await page.select('#qtFocusQuickQuestionFont','serif');
  await page.waitForFunction(()=>globalThis.QTIMER_SETTINGS.get().dapchigi.question.fontFamily==='serif');
  assert(!(await page.$eval('#qtFocusQuickUndo',el=>el.disabled)),'Quick Settings undo did not enable after a change');
  await page.click('#qtFocusQuickUndo');
  await page.waitForFunction(font=>globalThis.QTIMER_SETTINGS.get().dapchigi.question.fontFamily===font,{},originalQuestionFont);
  assert(await page.$eval('#qtFocusQuickUndo',el=>el.disabled),'Undo should disable after restoring panel-open state');

  // Final question settings used for rendering checks.
  await page.select('#qtFocusQuickQuestionFont','serif');
  await page.select('#qtFocusQuickQuestionSize','24');
  await page.$eval('#qtFocusQuickQuestionColor',el=>{el.value='#243047';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.$eval('#qtFocusQuickQuestionHighlightColor',el=>{el.value='#fff1a8';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>{
    const q=globalThis.QTIMER_SETTINGS.get().dapchigi.question;
    return q.fontFamily==='serif' && q.fontSize==='24' && q.fontColor==='#243047' && q.highlightColor==='#fff1a8' && q.theme==='custom';
  });

  await page.click('[data-qt-focus-quick-tab="answer"]');
  await page.waitForFunction(()=>document.querySelector('[data-qt-focus-quick-tab="answer"]')?.getAttribute('aria-selected')==='true');
  visiblePanes=await quickPaneDisplays();
  assert(visiblePanes.question==='none' && visiblePanes.answer==='grid' && visiblePanes.keyword==='none',`Answer tab pane visibility is incorrect: ${JSON.stringify(visiblePanes)}`);
  await page.select('#qtFocusQuickAnswerFont','gothic');
  await page.select('#qtFocusQuickAnswerSize','22');
  await page.$eval('#qtFocusQuickAnswerColor',el=>{el.value='#14532d';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.$eval('#qtFocusQuickAnswerHighlightColor',el=>{el.value='#dcfce7';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.$eval('#qtFocusQuickAnswerBold',el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.$eval('#qtFocusQuickAnswerHighlight',el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForFunction(()=>{
    const a=globalThis.QTIMER_SETTINGS.get().dapchigi.answer;
    return a.fontFamily==='gothic' && a.fontSize==='22' && a.fontColor==='#14532d' && a.highlightColor==='#dcfce7' && a.bold && a.highlight && a.theme==='custom';
  });

  await page.click('[data-qt-focus-quick-tab="keyword"]');
  await page.waitForFunction(()=>document.querySelector('[data-qt-focus-quick-tab="keyword"]')?.getAttribute('aria-selected')==='true');
  visiblePanes=await quickPaneDisplays();
  assert(visiblePanes.question==='none' && visiblePanes.answer==='none' && visiblePanes.keyword==='grid',`Keyword tab pane visibility is incorrect: ${JSON.stringify(visiblePanes)}`);
  await page.$eval('#qtFocusKeywordFollow',el=>{el.checked=false;el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.select('#qtFocusKeywordFont','mono');
  await page.select('#qtFocusKeywordSize','20');
  await page.$eval('#qtFocusKeywordColor',el=>{el.value='#ffffff';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.select('#qtFocusKeywordHighlightMode','custom');
  await page.$eval('#qtFocusKeywordHighlightColor',el=>{el.value='#6d28d9';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.$eval('#qtFocusKeywordBold',el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForFunction(()=>{
    const k=globalThis.QTIMER_FOCUS_QUICK_SETTINGS.get().keyword;
    return !k.inheritQuestionFont && k.fontFamily==='mono' && k.fontSize==='20' && k.fontColor==='#ffffff' && k.highlightMode==='custom' && k.highlightColor==='#6d28d9' && k.bold;
  });

  const storedQuick = await page.evaluate(()=>JSON.parse(localStorage.getItem('qtimer-focus-quick-settings-v1')));
  assert(storedQuick?.keyword?.highlightColor==='#6d28d9','Keyword Quick Settings were not persisted');

  // Esc closes only the Quick Settings drawer; it must not exit Focus Reading.
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.querySelector('#qtFocusQuickPanel')?.hidden===true);
  assert(await page.evaluate(()=>document.body.classList.contains('qt-focus-reading-v2')),'Esc from Quick Settings exited Focus Reading instead of closing the drawer');

  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='question' && document.querySelector('#qtContextStage')?.textContent==='문제 회상');

  const stem = await page.evaluate(()=>{
    const mark=document.querySelector('#questionText .qt-focus-stem-mark');
    const keywords=[...document.querySelectorAll('#questionText .qt-focus-keyword')];
    const first=keywords[0];
    const questionStyle=getComputedStyle(document.querySelector('#questionText'));
    const markStyle=mark ? getComputedStyle(mark) : null;
    const keywordStyle=first ? getComputedStyle(first) : null;
    return {
      hasMark:Boolean(mark),
      keywordCount:keywords.length,
      questionSize:questionStyle.fontSize,
      questionColor:questionStyle.color,
      markBackground:markStyle?.backgroundColor || '',
      markWeight:Number.parseInt(markStyle?.fontWeight || '0',10),
      keywordBackground:keywordStyle?.backgroundColor || '',
      keywordColor:keywordStyle?.color || '',
      keywordSize:keywordStyle?.fontSize || '',
      keywordWeight:Number.parseInt(keywordStyle?.fontWeight || '0',10),
      keywordFont:keywordStyle?.fontFamily || '',
      text:document.querySelector('#questionText').textContent,
      explanationText:document.querySelector('#qtDapExplanation').textContent
    };
  });
  assert(stem.hasMark,'Question stem does not have the full light-highlight layer');
  assert(stem.keywordCount>0 && stem.keywordCount<=6,`Expected 1-6 focus keywords, got ${stem.keywordCount}`);
  assert(stem.questionSize==='24px' && stem.questionColor==='rgb(36, 48, 71)',`Problem Quick Settings did not apply: ${stem.questionSize} / ${stem.questionColor}`);
  assert(stem.markBackground==='rgb(255, 241, 168)' && stem.markWeight>=700,`Problem focus highlight invariant mismatch: ${stem.markBackground} / ${stem.markWeight}`);
  assert(stem.keywordColor==='rgb(255, 255, 255)' && stem.keywordBackground==='rgb(109, 40, 217)',`Keyword custom colors did not apply: ${stem.keywordColor} / ${stem.keywordBackground}`);
  assert(stem.keywordSize==='20px' && stem.keywordWeight>=700 && /D2Coding|Cascadia|Consolas|monospace/i.test(stem.keywordFont),`Keyword font controls did not apply: ${stem.keywordFont} / ${stem.keywordSize} / ${stem.keywordWeight}`);
  assert(stem.explanationText.includes('정답 확인') && !stem.explanationText.includes('문제집 해설'),'Recall stage leaked explanation content');

  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='mark');
  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='reveal' && document.querySelector('#qtContextStage')?.textContent==='정답 확인');

  const reveal = await page.evaluate(()=>{
    const q=currentQuestion();
    const explanation=document.querySelector('#qtDapExplanation');
    const dock=document.querySelector('#qtActionDock');
    const answerValue=document.querySelector('#dapAnswerValue');
    const answerMark=answerValue?.querySelector('mark.dap-highlight-answer');
    const explainAnswer=document.querySelector('.qt-explain-answer');
    const answerStyle=answerValue ? getComputedStyle(answerValue) : null;
    const answerMarkStyle=answerMark ? getComputedStyle(answerMark) : null;
    const explainStyle=explainAnswer ? getComputedStyle(explainAnswer) : null;
    return {
      sourceExplanation:q.sourceExplanation,
      finalKey:q.finalKey,
      explanationText:explanation.textContent,
      spaceDisabled:dock.querySelector('[data-action="space"]').disabled,
      ratingsEnabled:['o','a','x'].every(key=>!dock.querySelector(`[data-action="${key}"]`).disabled),
      answerSize:answerStyle?.fontSize || '',
      answerColor:answerStyle?.color || '',
      answerHighlight:answerMarkStyle?.backgroundColor || '',
      explainAnswerSize:explainStyle?.fontSize || '',
      explainAnswerColor:explainStyle?.color || '',
      explainAnswerBackground:explainStyle?.backgroundColor || ''
    };
  });
  assert(reveal.explanationText.includes(reveal.finalKey),'Reveal panel did not show finalKey');
  assert(reveal.explanationText.includes(reveal.sourceExplanation),'Reveal panel did not show sourceExplanation');
  assert(reveal.spaceDisabled && reveal.ratingsEnabled,'Reveal Action Dock state is incorrect');
  assert(reveal.answerSize==='22px' && reveal.answerColor==='rgb(20, 83, 45)' && reveal.answerHighlight==='rgb(220, 252, 231)',`Answer Quick Settings did not apply: ${reveal.answerSize} / ${reveal.answerColor} / ${reveal.answerHighlight}`);
  assert(reveal.explainAnswerSize==='22px' && reveal.explainAnswerColor==='rgb(20, 83, 45)' && reveal.explainAnswerBackground==='rgb(220, 252, 231)',`Explanation answer did not follow Answer Quick Settings: ${reveal.explainAnswerSize} / ${reveal.explainAnswerColor} / ${reveal.explainAnswerBackground}`);

  await page.click('#qtActionDock [data-action="a"]');
  await page.waitForFunction(()=>state.dapchigiV1?.attempts?.length===1 && state.dapchigiV1?.step==='preview' && document.querySelector('#qtContextPosition')?.textContent==='2 / 52');

  await page.click('#qtFocusExitBtn');
  await page.waitForFunction(()=>document.querySelector('#dashboardView')?.hidden===false && !document.body.classList.contains('qt-focus-mode'));
  const dashboardReturn = await page.evaluate(()=>({
    focus:document.body.classList.contains('qt-focus-reading-v2'),
    headerDisplay:getComputedStyle(document.querySelector('.app-header')).display,
    explanationHidden:document.querySelector('#qtDapExplanation').hidden,
    quickHidden:document.querySelector('#qtFocusQuickPanel').hidden
  }));
  assert(!dashboardReturn.focus && dashboardReturn.headerDisplay!=='none' && dashboardReturn.explanationHidden && dashboardReturn.quickHidden,'Focus Reading/Quick Settings styles leaked into Dashboard');

  assert(pageErrors.length===0,`Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedAssets.length===0,`Design JS/CSS load failures: ${failedAssets.join(' | ')}`);

  console.log('# QTimer Focus Reading v2 + Quick Settings v1 smoke');
  console.log('PASS: hidden global menus / independent range overlay / problem+explanation grid');
  console.log('PASS: Quick Settings visibly switches Question -> Answer -> Keyword with one pane at a time');
  console.log('PASS: problem-answer-keyword Quick Settings / immediate save / panel-open undo / Esc close');
  console.log('PASS: problem focus invariant / custom keyword font+highlight / answer explanation sync');
  console.log('PASS: reveal finalKey+sourceExplanation / O-A-X dock / Dashboard cleanup');
} finally {
  await browser.close();
}
