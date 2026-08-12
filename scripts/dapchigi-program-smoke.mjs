#!/usr/bin/env node
import puppeteer from 'puppeteer-core';

const url=process.env.QTIMER_URL || 'http://127.0.0.1:8080';
const executablePath=process.env.CHROME_BIN;
function assert(condition,message){ if(!condition) throw new Error(message); }
if(!executablePath) throw new Error('CHROME_BIN is required.');

const browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();
await page.setViewport({width:1440,height:1000});
const pageErrors=[];
const failedAssets=[];
page.on('pageerror',error=>pageErrors.push(error.message));
page.on('requestfailed',request=>{ if(/\.(?:js|css)(?:\?|$)/.test(request.url())) failedAssets.push(`${request.url()} :: ${request.failure()?.errorText || 'request failed'}`); });
page.on('response',response=>{ if(response.status()>=400 && /\.(?:js|css)(?:\?|$)/.test(response.url())) failedAssets.push(`${response.url()} :: HTTP ${response.status()}`); });
page.on('dialog',async dialog=>{ await dialog.accept(); });

try {
  await page.goto(url,{waitUntil:'networkidle0',timeout:30_000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(()=>Boolean(
    globalThis.QTIMER_DAP_PROGRAMS?.version===1
    && globalThis.QTIMER_DAP_FOCUS_READING?.version===2
    && document.querySelector('#qtDapProgramBtn')
    && document.querySelector('#qtDapProgramPanel')
  ),{timeout:12_000});

  const foundation=await page.evaluate(()=>({
    version:globalThis.QTIMER_DAP_PROGRAMS.version,
    key:globalThis.QTIMER_DAP_PROGRAMS.key,
    programs:globalThis.QTIMER_DAP_PROGRAMS.get().programs.length,
    enabled:globalThis.QTIMER_DAP_PROGRAMS.get().enabled,
    panelHidden:document.querySelector('#qtDapProgramPanel').hidden
  }));
  assert(foundation.version===1 && foundation.key==='qtimer-dapchigi-programs-v1','Dapchigi Program API/storage key mismatch');
  assert(foundation.programs===1 && foundation.enabled===false && foundation.panelHidden,'Fresh Dapchigi Program state is incorrect');

  await page.click('#dapchigiTab');
  await page.waitForFunction(()=>state.mode==='dapchigi' && document.body.classList.contains('qt-focus-reading-v2'));
  await page.select('#dapSubject','s3');
  await page.select('#dapChapter','ch02');
  await page.click('#dapApplyScope');
  await page.waitForFunction(()=>state.currentRoundIds.length===52 && !document.body.classList.contains('qt-focus-config-open'));

  await page.click('#qtDapProgramBtn');
  await page.waitForFunction(()=>document.querySelector('#qtDapProgramPanel')?.hidden===false);
  assert(await page.evaluate(()=>document.querySelectorAll('#qtDapProgramBlockList [data-qt-program-block]').length===5),'Default program should contain 5 blocks');

  // New-program button and editable visual list.
  await page.click('#qtDapProgramNew');
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.get().programs.length===2);
  await page.$eval('#qtDapProgramName',el=>{el.value='반복 회상 프로그램';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.selected().name==='반복 회상 프로그램');

  // Reinforced template: preview + repeat( question, reveal ) x2 + rate.
  await page.click('[data-qt-program-template="reinforced"]');
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.selected().blocks.length===6);
  let compiled=await page.evaluate(()=>globalThis.QTIMER_DAP_PROGRAMS.compile().map(item=>item.type));
  assert(JSON.stringify(compiled)===JSON.stringify(['preview','question','reveal','question','reveal','rate']),`Repeat compile x2 mismatch: ${compiled.join(' > ')}`);

  // Native drag contract: swap question/reveal inside the repeat region and persist DOM order.
  const beforeDrag=await page.evaluate(()=>globalThis.QTIMER_DAP_PROGRAMS.selected().blocks.map(item=>({id:item.id,type:item.type})));
  const questionId=beforeDrag.find(item=>item.type==='question').id;
  const revealId=beforeDrag.find(item=>item.type==='reveal').id;
  await page.evaluate(({questionId,revealId})=>{
    const list=document.querySelector('#qtDapProgramBlockList');
    const source=list.querySelector(`[data-qt-program-block="${CSS.escape(questionId)}"]`);
    const target=list.querySelector(`[data-qt-program-block="${CSS.escape(revealId)}"]`);
    const dataTransfer=new DataTransfer();
    source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer}));
    const rect=target.getBoundingClientRect();
    target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer,clientY:rect.bottom-1}));
    target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer,clientY:rect.bottom-1}));
    source.dispatchEvent(new DragEvent('dragend',{bubbles:true,cancelable:true,dataTransfer}));
  },{questionId,revealId});
  await page.waitForFunction(()=>{
    const types=globalThis.QTIMER_DAP_PROGRAMS.selected().blocks.map(item=>item.type);
    return types[2]==='reveal' && types[3]==='question';
  });
  const afterDrag=await page.evaluate(()=>globalThis.QTIMER_DAP_PROGRAMS.selected().blocks.map(item=>item.type));
  assert(afterDrag[2]==='reveal' && afterDrag[3]==='question','Mouse drag did not reorder program blocks');

  // Restore template, then verify repeat count changes the compiled program length.
  await page.click('[data-qt-program-template="reinforced"]');
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.compile().length===6);
  const repeatId=await page.evaluate(()=>globalThis.QTIMER_DAP_PROGRAMS.selected().blocks.find(item=>item.type==='repeat-start').id);
  await page.$eval(`[data-qt-program-count="${repeatId}"]`,el=>{el.value='3';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.compile().length===8);
  compiled=await page.evaluate(()=>globalThis.QTIMER_DAP_PROGRAMS.compile().map(item=>item.type));
  assert(compiled.filter(type=>type==='question').length===3 && compiled.filter(type=>type==='reveal').length===3,'Repeat count x3 was not compiled correctly');
  await page.$eval(`[data-qt-program-count="${repeatId}"]`,el=>{el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.compile().length===6);

  // Invalid repeat structure is editable but must be blocked from execution.
  const repeatEndId=await page.evaluate(()=>globalThis.QTIMER_DAP_PROGRAMS.selected().blocks.find(item=>item.type==='repeat-end').id);
  await page.click(`[data-qt-program-remove="${repeatEndId}"]`);
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.validate().valid===false && document.querySelector('#qtDapProgramStart').disabled===true);
  const invalidText=await page.$eval('#qtDapProgramValidation',el=>el.textContent);
  assert(/반복 끝/.test(invalidText),'Invalid repeat structure did not show an understandable error');
  await page.click('[data-qt-program-add="repeat-end"]');
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.validate().valid===true && document.querySelector('#qtDapProgramStart').disabled===false);

  // Runtime: repeat question/reveal twice on the same question, then wait for O/A/X.
  await page.click('#qtDapProgramStart');
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.get().enabled===true && globalThis.QTIMER_DAP_PROGRAMS.runtime()?.index===0 && state.dapchigiV1?.step==='preview');
  await page.click('#qtDapProgramClose');

  const expectRuntime=async(index,step)=>{
    await page.waitForFunction((index,step)=>globalThis.QTIMER_DAP_PROGRAMS.runtime()?.index===index && state.dapchigiV1?.step===step,{},index,step);
  };
  await page.click('#qtActionDock [data-action="space"]'); await expectRuntime(1,'question');
  await page.click('#qtActionDock [data-action="space"]'); await expectRuntime(2,'reveal');
  await page.click('#qtActionDock [data-action="space"]'); await expectRuntime(3,'question');
  await page.click('#qtActionDock [data-action="space"]'); await expectRuntime(4,'reveal');
  await page.click('#qtActionDock [data-action="space"]'); await expectRuntime(5,'reveal');

  const ratingStage=await page.evaluate(()=>({
    type:globalThis.QTIMER_DAP_PROGRAMS.runtime()?.compiled?.[globalThis.QTIMER_DAP_PROGRAMS.runtime()?.index]?.type,
    spaceDisabled:document.querySelector('#qtActionDock [data-action="space"]').disabled,
    ratingsEnabled:['o','a','x'].every(key=>!document.querySelector(`#qtActionDock [data-action="${key}"]`).disabled),
    explanation:document.querySelector('#qtDapExplanation').textContent
  }));
  assert(ratingStage.type==='rate' && ratingStage.spaceDisabled && ratingStage.ratingsEnabled,'Program O/A/X wait stage is incorrect');
  assert(ratingStage.explanation.includes('문제집 해설'),'Program rating stage must reveal the answer explanation');

  await page.click('#qtActionDock [data-action="a"]');
  await page.waitForFunction(()=>state.dapchigiV1?.attempts?.length===1 && state.currentIndex===1 && globalThis.QTIMER_DAP_PROGRAMS.runtime()?.index===0 && state.dapchigiV1?.step==='preview');
  const afterRating=await page.evaluate(()=>({
    rating:state.dapchigiV1.attempts.at(-1)?.rating,
    position:document.querySelector('#qtContextPosition').textContent,
    chip:document.querySelector('#qtDapProgramRuntimeChip').textContent,
    stored:JSON.parse(localStorage.getItem('qtimer-dapchigi-programs-v1'))
  }));
  assert(afterRating.rating==='a' && afterRating.position==='2 / 52','Program rating did not advance to the next question correctly');
  assert(afterRating.chip.includes('반복 회상 프로그램'),'Program runtime chip does not identify the active program');
  assert(afterRating.stored?.programs?.length===2 && afterRating.stored?.enabled===true,'Dapchigi programs were not persisted');

  // Turning Program OFF must restore the untouched classic Dapchigi Space flow.
  await page.click('#qtDapProgramBtn');
  await page.waitForFunction(()=>document.querySelector('#qtDapProgramPanel')?.hidden===false);
  await page.$eval('#qtDapProgramEnabled',el=>{el.checked=false;el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_PROGRAMS.get().enabled===false);
  await page.click('#qtDapProgramClose');
  assert(await page.$eval('#qtDapProgramRuntimeChip',el=>el.hidden),'Program runtime chip should hide when Program mode is off');
  await page.click('#qtActionDock [data-action="space"]');
  await page.waitForFunction(()=>state.dapchigiV1?.step==='question');

  assert(pageErrors.length===0,`Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedAssets.length===0,`Program JS/CSS load failures: ${failedAssets.join(' | ')}`);

  console.log('# QTimer Dapchigi Program Builder v1 smoke');
  console.log('PASS: create/rename program + template + native drag order persistence');
  console.log('PASS: repeat-start/count/end compiler + invalid repeat execution guard');
  console.log('PASS: program Space runtime + repeated same-question recall + O/A/X next-question reset');
  console.log('PASS: persistent programs + Program OFF restores classic Dapchigi flow');
} finally {
  await browser.close();
}
