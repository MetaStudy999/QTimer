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
page.on('requestfailed',request=>{if(/\.(?:js|css)(?:\?|$)/.test(request.url()))failedAssets.push(`${request.url()} :: ${request.failure()?.errorText||'request failed'}`);});
page.on('response',response=>{if(response.status()>=400&&/\.(?:js|css)(?:\?|$)/.test(response.url()))failedAssets.push(`${response.url()} :: HTTP ${response.status()}`);});

try{
  await page.goto(url,{waitUntil:'networkidle0',timeout:30_000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'networkidle0',timeout:30_000});
  await page.waitForFunction(()=>Boolean(globalThis.QTIMER_DAP_FORMATS?.version===1&&document.querySelector('#qtFormatEditorBtn')&&document.querySelector('#qtFormatEditor')),{timeout:12_000});

  const foundation=await page.evaluate(()=>({
    key:globalThis.QTIMER_DAP_FORMATS.key,
    count:globalThis.QTIMER_DAP_FORMATS.get().formats.length,
    names:globalThis.QTIMER_DAP_FORMATS.get().formats.map(item=>item.name)
  }));
  assert(foundation.key==='qtimer-dapchigi-formats-v1','Format Editor storage key mismatch');
  assert(foundation.count===5,'Format Editor should provide five default formats');
  for(const name of ['문제','답','문제/답','문제/답/해설','빈칸문제']) assert(foundation.names.includes(name),`Missing default format: ${name}`);

  await page.click('#dapchigiTab');
  await page.waitForFunction(()=>state.mode==='dapchigi'&&document.body.classList.contains('qt-focus-reading-v2'));
  await page.select('#dapSubject','s3');
  await page.select('#dapChapter','ch02');
  await page.click('#dapApplyScope');
  await page.waitForFunction(()=>state.currentRoundIds.length===52&&!document.body.classList.contains('qt-focus-config-open'));

  const before=await page.evaluate(()=>({index:state.currentIndex,attempts:state.dapchigiV1?.attempts?.length||0,questionId:currentQuestion()?.id}));
  await page.click('#qtFormatEditorBtn');
  await page.waitForFunction(()=>document.querySelector('#qtFormatEditor')?.hidden===false&&document.body.classList.contains('qt-format-editor-open'));
  assert(await page.$eval('#qtFormatPreviewCanvas',el=>el.textContent.trim().length>30),'Live Preview did not render real question content');

  // Answer-only format.
  await page.select('#qtFormatSelect','fmt-answer');
  await page.waitForFunction(()=>document.querySelector('#qtFormatPreviewCanvas')?.dataset.type==='answer');
  let zones=await page.evaluate(()=>({q:!!document.querySelector('#qtFormatPreviewCanvas .qt-format-question'),a:!!document.querySelector('#qtFormatPreviewCanvas .qt-format-answer'),e:!!document.querySelector('#qtFormatPreviewCanvas .qt-format-explanation')}));
  assert(!zones.q&&zones.a&&!zones.e,'Answer-only preview zones are incorrect');

  // Question/answer split layout and live ratio/choice edits.
  await page.select('#qtFormatSelect','fmt-question-answer');
  await page.select('#qtFormatLayout','split');
  await page.$eval('#qtFormatRatio',el=>{el.value='70';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.$eval('#qtFormatChoices',el=>{el.checked=false;el.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForFunction(()=>document.querySelector('#qtFormatPreviewCanvas')?.dataset.layout==='split'&&getComputedStyle(document.querySelector('#qtFormatPreviewCanvas')).getPropertyValue('--qt-format-ratio').trim()==='70%');
  zones=await page.evaluate(()=>({q:!!document.querySelector('#qtFormatPreviewCanvas .qt-format-question'),a:!!document.querySelector('#qtFormatPreviewCanvas .qt-format-answer'),choices:!!document.querySelector('#qtFormatPreviewCanvas .qt-format-choices')}));
  assert(zones.q&&zones.a&&!zones.choices,'Live split/choice edit was not reflected in preview');

  // Explanation format must show real source explanation.
  await page.select('#qtFormatSelect','fmt-qae');
  await page.select('#qtFormatExplanation','full');
  await page.waitForFunction(()=>Boolean(document.querySelector('#qtFormatPreviewCanvas .qt-format-explanation')));
  const explanation=await page.$eval('#qtFormatPreviewCanvas .qt-format-explanation',el=>el.textContent);
  assert(explanation.trim().length>20,'Full explanation preview is empty');

  // Blank format should transform the preview only.
  await page.select('#qtFormatSelect','fmt-blank');
  await page.select('#qtFormatBlankCount','2');
  await page.waitForFunction(()=>document.querySelector('#qtFormatPreviewCanvas .qt-format-question')?.textContent.includes('________'));

  // Responsive design preview without changing the real browser viewport.
  await page.click('[data-qt-format-device="mobile"]');
  await page.waitForFunction(()=>document.querySelector('#qtFormatPreviewCanvas')?.classList.contains('device-mobile'));
  const mobileWidth=await page.$eval('#qtFormatPreviewCanvas',el=>el.getBoundingClientRect().width);
  assert(mobileWidth<=391,`Mobile preview width is too large: ${mobileWidth}`);

  // Clone/rename and persistence.
  await page.click('#qtFormatClone');
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_FORMATS.get().formats.length===6);
  await page.$eval('#qtFormatName',el=>{el.value='내 실전 양식';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>globalThis.QTIMER_DAP_FORMATS.selected().name==='내 실전 양식');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('qtimer-dapchigi-formats-v1')));
  assert(stored.formats.length===6&&stored.formats.some(item=>item.name==='내 실전 양식'),'Edited format was not persisted');

  // Editor actions must be data-neutral.
  const after=await page.evaluate(()=>({index:state.currentIndex,attempts:state.dapchigiV1?.attempts?.length||0,questionId:currentQuestion()?.id}));
  assert(JSON.stringify(before)===JSON.stringify(after),'Live Format Editor changed study position or Dapchigi attempts');

  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.querySelector('#qtFormatEditor')?.hidden===true&&!document.body.classList.contains('qt-format-editor-open'));
  assert(pageErrors.length===0,`Browser page errors: ${pageErrors.join(' | ')}`);
  assert(failedAssets.length===0,`Format Editor JS/CSS load failures: ${failedAssets.join(' | ')}`);

  console.log('# QTimer Dapchigi Live Format Editor v1 smoke');
  console.log('PASS: five default formats + real-question WYSIWYG preview');
  console.log('PASS: split ratio / choices / explanation / blank edits update immediately');
  console.log('PASS: Desktop-Tablet-Mobile preview + clone/rename persistence');
  console.log('PASS: preview editing is data-neutral for position and Dapchigi attempts');
}finally{
  await browser.close();
}
