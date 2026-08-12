// QTimer Dapchigi Live Format Editor v1 — WYSIWYG format design with real question data.
// Presentation preference only: never mutates SOURCE BANK, normal attempts, or Dapchigi ratings.
(function initQTimerDapchigiLiveFormatEditorV1(){
  const VERSION=1;
  const STORAGE_KEY="qtimer-dapchigi-formats-v1";
  const TYPES=new Set(["question","answer","question-answer","question-answer-explanation","blank"]);
  const LAYOUTS=new Set(["stack","split"]);
  const DEVICES=new Set(["desktop","tablet","mobile"]);
  const EXPLANATIONS=new Set(["hidden","key","full"]);
  const ANSWER_MODES=new Set(["number","choice","both"]);
  const clone=value=>JSON.parse(JSON.stringify(value));
  const uid=(prefix="format")=>globalThis.crypto?.randomUUID?.()||`${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||min));
  const now=()=>new Date().toISOString();

  function preset(id,name,type,extra={}){
    return {id,name,type,layout:"stack",ratio:65,showChoices:true,explanation:"hidden",answerMode:"both",blankCount:1,createdAt:now(),updatedAt:now(),...extra};
  }
  function defaultStore(){
    const formats=[
      preset("fmt-question","문제","question",{showChoices:true}),
      preset("fmt-answer","답","answer",{showChoices:false,answerMode:"both"}),
      preset("fmt-question-answer","문제/답","question-answer",{layout:"split",ratio:68,showChoices:true}),
      preset("fmt-qae","문제/답/해설","question-answer-explanation",{layout:"split",ratio:62,showChoices:true,explanation:"full"}),
      preset("fmt-blank","빈칸문제","blank",{showChoices:true,blankCount:2})
    ];
    return {version:VERSION,selectedFormatId:formats[0].id,previewDevice:"desktop",formats,updatedAt:now()};
  }
  function normalizeFormat(raw,index){
    const fallback=preset(uid(),`양식 ${index+1}`,"question");
    const type=TYPES.has(raw?.type)?raw.type:fallback.type;
    return {
      id:String(raw?.id||fallback.id),
      name:String(raw?.name||fallback.name).trim().slice(0,40)||fallback.name,
      type,
      layout:LAYOUTS.has(raw?.layout)?raw.layout:"stack",
      ratio:clamp(raw?.ratio??65,35,80),
      showChoices:raw?.showChoices!==false,
      explanation:EXPLANATIONS.has(raw?.explanation)?raw.explanation:(type==="question-answer-explanation"?"full":"hidden"),
      answerMode:ANSWER_MODES.has(raw?.answerMode)?raw.answerMode:"both",
      blankCount:clamp(raw?.blankCount??1,1,4),
      createdAt:raw?.createdAt||now(),updatedAt:raw?.updatedAt||now()
    };
  }
  function normalizeStore(raw){
    const fallback=defaultStore();
    if(!raw||typeof raw!=="object"||Array.isArray(raw)) return fallback;
    let formats=Array.isArray(raw.formats)?raw.formats.slice(0,30).map(normalizeFormat):fallback.formats;
    if(!formats.length) formats=fallback.formats;
    const selected=formats.some(item=>item.id===raw.selectedFormatId)?raw.selectedFormatId:formats[0].id;
    return {version:VERSION,selectedFormatId:selected,previewDevice:DEVICES.has(raw.previewDevice)?raw.previewDevice:"desktop",formats,updatedAt:raw.updatedAt||now()};
  }
  function load(){try{return normalizeStore(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{return defaultStore();}}
  let store=load();
  let booted=false;

  function selected(){return store.formats.find(item=>item.id===store.selectedFormatId)||store.formats[0];}
  function save(message="자동 저장됨"){
    store.updatedAt=now();
    localStorage.setItem(STORAGE_KEY,JSON.stringify(store));
    renderControls();
    renderPreview();
    const status=document.querySelector("#qtFormatEditorStatus");
    if(status) status.textContent=message;
  }
  function updateSelected(patch,message="변경 즉시 저장됨"){
    const format=selected(); if(!format) return;
    Object.assign(format,patch,{updatedAt:now()});
    save(message);
  }

  function currentPreviewQuestion(){
    try{const q=typeof currentQuestion==="function"?currentQuestion():null;if(q)return q;}catch{}
    return {questionText:"다음 중 소프트웨어 설계 원리에 대한 설명으로 옳은 것은?",choices:["결합도는 높을수록 좋다.","응집도는 높을수록 좋다.","모듈은 서로 강하게 의존해야 한다.","정보 은닉은 모듈화를 방해한다."],sourceAnswer:2,finalKey:"응집도는 높을수록 좋고 결합도는 낮을수록 좋다.",sourceExplanation:"모듈 내부 요소의 관련성인 응집도는 높이고, 모듈 간 의존성인 결합도는 낮추는 것이 바람직하다."};
  }
  function answerNumber(q){
    try{if(typeof effectiveAnswer==="function")return Number(effectiveAnswer(q));}catch{}
    return Number(q?.userVerifiedAnswer||q?.sourceAnswer||q?.answer||1)||1;
  }
  function keywordTerms(text){
    const source=String(text||"");
    const preferred=["옳지 않은","틀린","아닌 것","해당하지 않는","포함되지 않는","거리가 먼"].filter(x=>source.includes(x));
    const technical=[...(source.match(/[A-Za-z][A-Za-z0-9+.#_-]{1,}|[가-힣]{3,}/g)||[])].filter(x=>!/^(다음|설명으로|설명|대한|것은|가장|관련|경우)$/.test(x));
    return [...new Set([...preferred,...technical])].sort((a,b)=>b.length-a.length).slice(0,5);
  }
  function questionMarkup(text,blankCount=0){
    let source=String(text||"");
    const terms=keywordTerms(source);
    if(blankCount>0){
      terms.slice(0,blankCount).forEach(term=>{source=source.replace(term,"________");});
    }
    const active=terms.filter(term=>source.includes(term));
    if(!active.length)return `<mark class="qt-format-q-mark">${esc(source)}</mark>`;
    const escaped=active.map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
    const re=new RegExp(`(${escaped.join("|")})`,`g`);
    return `<mark class="qt-format-q-mark">${source.split(re).map(part=>active.includes(part)?`<span class="qt-format-keyword">${esc(part)}</span>`:esc(part)).join("")}</mark>`;
  }
  function answerMarkup(q,format){
    const n=answerNumber(q),choice=q?.choices?.[n-1]||"";
    if(format.answerMode==="number")return `<strong>${n}번</strong>`;
    if(format.answerMode==="choice")return `<strong>${esc(choice)}</strong>`;
    return `<strong>${n}번</strong><span>${esc(choice)}</span>`;
  }
  function zone(title,kind,body){return `<section class="qt-format-zone qt-format-${kind}"><span class="qt-format-zone-label">${esc(title)}</span>${body}</section>`;}

  function renderPreview(){
    const canvas=document.querySelector("#qtFormatPreviewCanvas"); if(!canvas)return;
    const format=selected(),q=currentPreviewQuestion(); if(!format||!q)return;
    const isBlank=format.type==="blank";
    const showQuestion=["question","question-answer","question-answer-explanation","blank"].includes(format.type);
    const showAnswer=["answer","question-answer","question-answer-explanation"].includes(format.type);
    const showExplanation=format.type==="question-answer-explanation"&&format.explanation!=="hidden";
    const parts=[];
    if(showQuestion){
      const choices=format.showChoices?`<div class="qt-format-choices">${(q.choices||[]).map((choice,index)=>`<div><span>${index+1}</span>${esc(choice)}</div>`).join("")}</div>`:"";
      parts.push(zone(isBlank?"빈칸문제":"문제","question",`<h3>${questionMarkup(q.questionText,isBlank?format.blankCount:0)}</h3>${choices}`));
    }
    if(showAnswer)parts.push(zone("답","answer",`<div class="qt-format-answer-line">${answerMarkup(q,format)}</div>`));
    if(showExplanation){
      const body=format.explanation==="key"?`<p>${esc(q.finalKey||"핵심 요약 없음")}</p>`:`<strong>${esc(q.finalKey||"핵심 요약 없음")}</strong><p>${esc(q.sourceExplanation||"등록된 문제집 해설이 없습니다.")}</p>`;
      parts.push(zone("해설","explanation",body));
    }
    canvas.dataset.layout=format.layout;
    canvas.dataset.type=format.type;
    canvas.style.setProperty("--qt-format-ratio",`${format.ratio}%`);
    canvas.className=`qt-format-preview-canvas device-${store.previewDevice}`;
    canvas.innerHTML=`<div class="qt-format-preview-sheet">${parts.join("")}</div>`;
    document.querySelectorAll("[data-qt-format-device]").forEach(btn=>btn.classList.toggle("active",btn.dataset.qtFormatDevice===store.previewDevice));
    const meta=document.querySelector("#qtFormatPreviewMeta");
    if(meta)meta.textContent=`실제 현재 문제 · ${format.name} · ${store.previewDevice}`;
  }

  function installStyles(){
    if(document.querySelector("#qtLiveFormatEditorStyles"))return;
    const style=document.createElement("style"); style.id="qtLiveFormatEditorStyles";
    style.textContent=`
      .qt-format-editor[hidden]{display:none!important}.qt-format-editor{position:fixed;z-index:170;inset:12px;display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:12px;padding:12px;border:1px solid #d0d5dd;border-radius:18px;background:#f2f4f7;box-shadow:0 28px 90px rgba(16,24,40,.28)}
      .qt-format-preview-shell{display:grid;grid-template-rows:auto 1fr auto;min-width:0;min-height:0;border:1px solid #d0d5dd;border-radius:14px;background:#fff;overflow:hidden}.qt-format-preview-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid #eaecf0}.qt-format-preview-head h2{margin:0;font-size:16px}.qt-format-preview-head small{color:#667085}.qt-format-device-bar{display:flex;gap:5px}.qt-format-device-bar button{min-height:32px;padding:4px 8px;border:1px solid #d0d5dd;border-radius:8px;background:#fff;font-size:11px;font-weight:800}.qt-format-device-bar button.active{background:#172033;color:#fff;border-color:#172033}
      .qt-format-preview-stage{display:grid;place-items:start center;overflow:auto;padding:20px;background:#e9edf3}.qt-format-preview-canvas{width:min(100%,1180px);transition:width .16s ease}.qt-format-preview-canvas.device-tablet{width:min(100%,820px)}.qt-format-preview-canvas.device-mobile{width:min(100%,390px)}.qt-format-preview-sheet{display:grid;gap:12px;padding:18px;border-radius:14px;background:#fff;box-shadow:0 10px 32px rgba(16,24,40,.10);min-height:420px}.qt-format-preview-canvas[data-layout=split] .qt-format-preview-sheet{grid-template-columns:minmax(0,var(--qt-format-ratio,65%)) minmax(0,1fr);align-content:start}.qt-format-preview-canvas[data-layout=split][data-type=question-answer-explanation] .qt-format-explanation{grid-column:1/-1}
      .qt-format-zone{position:relative;min-width:0;padding:18px;border:1px solid #e4e7ec;border-radius:13px;background:#fff}.qt-format-zone-label{display:inline-block;margin-bottom:10px;font-size:11px;font-weight:900;letter-spacing:.05em;color:#667085}.qt-format-question h3{margin:0 0 14px;font-family:var(--qt-q-font,inherit);font-size:var(--qt-q-size,22px);color:var(--qt-q-color,#101828);line-height:1.65}.qt-format-q-mark{display:block;padding:13px 15px;border-radius:10px;background:var(--qt-q-highlight,#dceeff);color:inherit;font-weight:900}.qt-format-keyword{display:inline;padding:.08em .28em;border-radius:.34em;background:var(--qt-focus-keyword-bg,color-mix(in srgb,var(--qt-q-highlight,#dceeff) 38%,#111827 62%));color:var(--qt-focus-keyword-color,#fff);font-family:var(--qt-focus-keyword-font,var(--qt-q-font,inherit));font-size:var(--qt-focus-keyword-size,inherit);font-weight:var(--qt-focus-keyword-weight,900)}.qt-format-choices{display:grid;gap:8px}.qt-format-choices>div{display:grid;grid-template-columns:24px 1fr;gap:6px;line-height:1.55;color:#344054}.qt-format-answer-line{display:flex;gap:8px;align-items:flex-start;padding:13px 14px;border-radius:11px;background:var(--qt-a-highlight,#fee2e2);color:var(--qt-a-color,#991b1b);font-family:var(--qt-a-font,inherit);font-size:var(--qt-a-size,20px);font-weight:850}.qt-format-explanation strong,.qt-format-explanation p{line-height:1.7}.qt-format-explanation p{margin:8px 0 0;color:#475467}
      .qt-format-preview-foot{padding:8px 14px;border-top:1px solid #eaecf0;color:#667085;font-size:11px}.qt-format-controls{overflow:auto;padding:14px;border:1px solid #d0d5dd;border-radius:14px;background:#fff}.qt-format-controls-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.qt-format-controls-head h2{margin:0 0 3px;font-size:16px}.qt-format-controls-head p{margin:0;color:#667085;font-size:11px;line-height:1.5}.qt-format-controls-head button{min-width:34px;min-height:34px;border:1px solid #d0d5dd;border-radius:8px;background:#fff}.qt-format-toolbar{display:grid;grid-template-columns:1fr auto auto;gap:5px;margin:12px 0}.qt-format-toolbar select,.qt-format-toolbar button,.qt-format-controls input,.qt-format-controls select{min-height:36px;border:1px solid #d0d5dd;border-radius:8px;background:#fff;padding:5px 8px}.qt-format-toolbar button{font-weight:800}.qt-format-field{display:grid;gap:5px;margin:9px 0;font-size:12px;font-weight:800}.qt-format-check{display:flex;align-items:center;gap:7px;margin:9px 0;padding:9px;border:1px solid #e4e7ec;border-radius:9px;font-size:12px;font-weight:800}.qt-format-range{display:grid;grid-template-columns:1fr 44px;gap:8px;align-items:center}.qt-format-note{margin-top:12px;padding:10px;border-radius:10px;background:#f8fafc;color:#667085;font-size:11px;line-height:1.55}.qt-format-status{display:flex;justify-content:space-between;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid #eaecf0;color:#667085;font-size:11px}
      body.qt-format-editor-open{overflow:hidden}body.qt-format-editor-open #qtFocusQuickPanel,body.qt-format-editor-open #qtDapProgramPanel{display:none!important}
      @media(max-width:980px){.qt-format-editor{grid-template-columns:1fr;grid-template-rows:minmax(360px,1fr) minmax(260px,.75fr);inset:6px}.qt-format-controls{min-height:0}.qt-format-preview-stage{padding:10px}}
      @media(max-width:520px){.qt-format-preview-head{align-items:flex-start;flex-direction:column}.qt-format-preview-canvas[data-layout=split] .qt-format-preview-sheet{grid-template-columns:1fr}.qt-format-preview-canvas[data-layout=split][data-type=question-answer-explanation] .qt-format-explanation{grid-column:auto}.qt-format-preview-sheet{padding:10px}.qt-format-zone{padding:12px}}
      @media(prefers-reduced-motion:reduce){.qt-format-preview-canvas{transition:none}}
    `; document.head.appendChild(style);
  }

  function installUI(){
    if(document.querySelector("#qtFormatEditor"))return;
    const actions=document.querySelector(".qt-focus-context-actions"); if(!actions)return;
    const button=document.createElement("button"); button.id="qtFormatEditorBtn"; button.type="button"; button.innerHTML="<span>양식</span> ◫"; button.title="실제 문제를 보며 답치기 양식 디자인";
    const program=document.querySelector("#qtDapProgramBtn"); actions.insertBefore(button,program||actions.firstChild);
    const editor=document.createElement("section"); editor.id="qtFormatEditor"; editor.className="qt-format-editor"; editor.hidden=true; editor.setAttribute("aria-label","답치기 실시간 양식 편집기");
    editor.innerHTML=`
      <section class="qt-format-preview-shell">
        <header class="qt-format-preview-head"><div><h2>Live Preview</h2><small id="qtFormatPreviewMeta">실제 현재 문제</small></div><div class="qt-format-device-bar"><button type="button" data-qt-format-device="desktop">Desktop</button><button type="button" data-qt-format-device="tablet">Tablet</button><button type="button" data-qt-format-device="mobile">Mobile</button></div></header>
        <div class="qt-format-preview-stage"><div id="qtFormatPreviewCanvas" class="qt-format-preview-canvas device-desktop"></div></div>
        <footer class="qt-format-preview-foot">미리보기 조작은 실제 문제 위치·회독·O/A/X 기록을 변경하지 않습니다.</footer>
      </section>
      <aside class="qt-format-controls">
        <header class="qt-format-controls-head"><div><h2>양식 편집</h2><p>설정을 바꾸는 즉시 왼쪽 실제 문제 미리보기에 반영됩니다.</p></div><button id="qtFormatEditorClose" type="button" aria-label="양식 편집 닫기">✕</button></header>
        <div class="qt-format-toolbar"><select id="qtFormatSelect" aria-label="양식 선택"></select><button id="qtFormatClone" type="button">복제</button><button id="qtFormatReset" type="button">기본값</button></div>
        <label class="qt-format-field">양식 이름<input id="qtFormatName" type="text" maxlength="40" autocomplete="off"></label>
        <label class="qt-format-field">기본 구성<select id="qtFormatType"><option value="question">문제</option><option value="answer">답</option><option value="question-answer">문제/답</option><option value="question-answer-explanation">문제/답/해설</option><option value="blank">빈칸문제</option></select></label>
        <label class="qt-format-field">배치<select id="qtFormatLayout"><option value="stack">위아래</option><option value="split">좌우</option></select></label>
        <label class="qt-format-field">첫 영역 비율<div class="qt-format-range"><input id="qtFormatRatio" type="range" min="35" max="80" step="5"><output id="qtFormatRatioOut"></output></div></label>
        <label class="qt-format-check"><input id="qtFormatChoices" type="checkbox"> 선택지 표시</label>
        <label class="qt-format-field">답 표시<select id="qtFormatAnswerMode"><option value="number">번호만</option><option value="choice">정답 내용만</option><option value="both">번호 + 정답</option></select></label>
        <label class="qt-format-field">해설 표시<select id="qtFormatExplanation"><option value="hidden">숨김</option><option value="key">핵심만</option><option value="full">핵심 + 문제집 해설</option></select></label>
        <label class="qt-format-field">빈칸 수<select id="qtFormatBlankCount"><option value="1">1개</option><option value="2">2개</option><option value="3">3개</option><option value="4">4개</option></select></label>
        <div class="qt-format-note"><strong>표시 디자인 연동</strong><br>문제·답·핵심어의 폰트/크기/형광펜은 기존 <b>표시 Aa</b> 설정을 그대로 사용합니다. 따라서 양식 편집기는 구조를, 표시 Aa는 글꼴·색상을 담당해 설정이 중복되지 않습니다.</div>
        <div class="qt-format-status"><span id="qtFormatEditorStatus">자동 저장됨</span><span><kbd>Esc</kbd> 닫기</span></div>
      </aside>`;
    document.body.appendChild(editor);
  }

  function renderControls(){
    if(!booted)return; const format=selected(); if(!format)return;
    const select=document.querySelector("#qtFormatSelect");
    select.innerHTML=store.formats.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}</option>`).join(""); select.value=format.id;
    document.querySelector("#qtFormatName").value=format.name;
    document.querySelector("#qtFormatType").value=format.type;
    document.querySelector("#qtFormatLayout").value=format.layout;
    document.querySelector("#qtFormatRatio").value=String(format.ratio); document.querySelector("#qtFormatRatioOut").textContent=`${format.ratio}%`;
    document.querySelector("#qtFormatChoices").checked=format.showChoices;
    document.querySelector("#qtFormatAnswerMode").value=format.answerMode;
    document.querySelector("#qtFormatExplanation").value=format.explanation;
    document.querySelector("#qtFormatBlankCount").value=String(format.blankCount);
    const combined=["question-answer","question-answer-explanation"].includes(format.type);
    document.querySelector("#qtFormatLayout").disabled=!combined;
    document.querySelector("#qtFormatRatio").disabled=!combined||format.layout!=="split";
    document.querySelector("#qtFormatAnswerMode").disabled==false;
    document.querySelector("#qtFormatExplanation").disabled=format.type!=="question-answer-explanation";
    document.querySelector("#qtFormatBlankCount").disabled=format.type!=="blank";
  }

  function resetSelected(){
    const format=selected(); if(!format)return;
    const defaults=defaultStore().formats.find(item=>item.type===format.type)||defaultStore().formats[0];
    const preserved={id:format.id,name:format.name,createdAt:format.createdAt};
    Object.assign(format,clone(defaults),preserved,{updatedAt:now()}); save("현재 구성 기본값 복원");
  }
  function cloneSelected(){
    if(store.formats.length>=30)return;
    const source=clone(selected()); source.id=uid(); source.name=`${source.name} 복사본`.slice(0,40); source.createdAt=now(); source.updatedAt=now(); store.formats.push(source); store.selectedFormatId=source.id; save("양식 복제됨");
  }
  function open(){
    const editor=document.querySelector("#qtFormatEditor"); if(!editor)return;
    document.querySelector("#qtFocusQuickPanel")?.setAttribute("hidden","");
    document.querySelector("#qtDapProgramPanel")?.setAttribute("hidden","");
    editor.hidden=false; document.body.classList.add("qt-format-editor-open"); renderControls(); renderPreview();
  }
  function close(){const editor=document.querySelector("#qtFormatEditor");if(editor)editor.hidden=true;document.body.classList.remove("qt-format-editor-open");}

  function bind(){
    document.querySelector("#qtFormatEditorBtn")?.addEventListener("click",open);
    document.querySelector("#qtFormatEditorClose")?.addEventListener("click",close);
    document.querySelector("#qtFormatSelect")?.addEventListener("change",e=>{store.selectedFormatId=e.target.value;save("양식 선택됨");});
    document.querySelector("#qtFormatClone")?.addEventListener("click",cloneSelected);
    document.querySelector("#qtFormatReset")?.addEventListener("click",resetSelected);
    document.querySelector("#qtFormatName")?.addEventListener("input",e=>updateSelected({name:String(e.target.value).slice(0,40)||"이름 없는 양식"},"이름 저장됨"));
    document.querySelector("#qtFormatType")?.addEventListener("change",e=>{
      const type=e.target.value; const patch={type};
      if(type==="question-answer-explanation")patch.explanation="full";
      if(type==="answer")patch.showChoices=false;
      updateSelected(patch,"구성 변경됨");
    });
    document.querySelector("#qtFormatLayout")?.addEventListener("change",e=>updateSelected({layout:e.target.value}));
    document.querySelector("#qtFormatRatio")?.addEventListener("input",e=>updateSelected({ratio:clamp(e.target.value,35,80)}));
    document.querySelector("#qtFormatChoices")?.addEventListener("change",e=>updateSelected({showChoices:Boolean(e.target.checked)}));
    document.querySelector("#qtFormatAnswerMode")?.addEventListener("change",e=>updateSelected({answerMode:e.target.value}));
    document.querySelector("#qtFormatExplanation")?.addEventListener("change",e=>updateSelected({explanation:e.target.value}));
    document.querySelector("#qtFormatBlankCount")?.addEventListener("change",e=>updateSelected({blankCount:clamp(e.target.value,1,4)}));
    document.querySelectorAll("[data-qt-format-device]").forEach(button=>button.addEventListener("click",()=>{store.previewDevice=button.dataset.qtFormatDevice;save("미리보기 화면 변경됨");}));
    window.addEventListener("keydown",event=>{if(event.key!=="Escape"||document.querySelector("#qtFormatEditor")?.hidden)return;event.preventDefault();event.stopImmediatePropagation();close();},true);
    document.querySelector("#dashboardTab")?.addEventListener("click",close); document.querySelector("#studyTab")?.addEventListener("click",close);
  }

  function boot(){
    if(!globalThis.QTIMER_DAP_FOCUS_READING||!globalThis.QTIMER_FOCUS_QUICK_SETTINGS||!document.querySelector(".qt-focus-context-actions")){setTimeout(boot,60);return;}
    if(document.querySelector("#qtFormatEditor"))return;
    installStyles(); installUI(); booted=true; renderControls(); renderPreview(); bind();
    globalThis.QTIMER_DAP_FORMATS=Object.freeze({version:VERSION,key:STORAGE_KEY,get:()=>clone(store),selected:()=>clone(selected()),replace:next=>{store=normalizeStore(next);save("양식 설정 교체됨");return clone(store);},renderPreview});
  }
  boot();
})();