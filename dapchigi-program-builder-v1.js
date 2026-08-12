// QTimer Dapchigi Program Builder v1 — visual, user-defined answer-training workflows.
// Presentation/workflow layer only: SOURCE BANK and normal learning Attempt schema remain untouched.
(function initQTimerDapchigiProgramBuilderV1(){
  const VERSION = 1;
  const STORAGE_KEY = "qtimer-dapchigi-programs-v1";
  const MAX_BLOCKS = 40;
  const MAX_COMPILED_STEPS = 100;
  const MAX_REPEAT = 20;
  const STEP_TYPES = new Set(["preview","question","mark","reveal","rate","repeat-start","repeat-end"]);
  const EXEC_TYPES = new Set(["preview","question","mark","reveal","rate"]);
  const LABELS = {
    preview:"답 보기",
    question:"문제 회상",
    mark:"빈칸 마킹",
    reveal:"정답 확인 + 해설",
    rate:"O/A/X 평가",
    "repeat-start":"반복 시작",
    "repeat-end":"반복 끝"
  };
  const DESCRIPTIONS = {
    preview:"정답을 먼저 보여줍니다.",
    question:"정답을 가리고 문제를 회상합니다.",
    mark:"선택지의 회상용 빈칸을 표시합니다.",
    reveal:"정답과 오른쪽 해설을 공개합니다.",
    rate:"정답을 공개한 상태에서 O/A/X 입력을 기다립니다.",
    "repeat-start":"이 블록부터 반복 끝 사이를 지정 횟수만큼 실행합니다.",
    "repeat-end":"반복 구간을 닫습니다."
  };

  function uid(prefix="qt-program"){
    return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function now(){ return new Date().toISOString(); }
  function clamp(value,min,max){ return Math.max(min,Math.min(max,Number(value)||min)); }
  function escapeHtml(value){
    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
  function block(type,extra={}){
    return {
      id:uid("block"),
      type:STEP_TYPES.has(type) ? type : "question",
      ...(type === "repeat-start" ? {count:clamp(extra.count ?? 2,2,MAX_REPEAT)} : {})
    };
  }
  function basicBlocks(){
    return [block("preview"),block("question"),block("mark"),block("reveal"),block("rate")];
  }
  function reinforcedBlocks(){
    return [block("preview"),block("repeat-start",{count:2}),block("question"),block("reveal"),block("repeat-end"),block("rate")];
  }
  function questionFirstBlocks(){
    return [block("question"),block("mark"),block("reveal"),block("rate")];
  }
  function newProgram(name="새 프로그램",blocks=basicBlocks()){
    const stamp=now();
    return {id:uid("program"),name,blocks,createdAt:stamp,updatedAt:stamp};
  }
  function defaultStore(){
    const program=newProgram("기본 답치기",basicBlocks());
    return {version:VERSION,enabled:false,selectedProgramId:program.id,programs:[program],updatedAt:now()};
  }
  function normalizeBlock(raw){
    const type=STEP_TYPES.has(raw?.type) ? raw.type : "question";
    return {
      id:String(raw?.id || uid("block")),
      type,
      ...(type === "repeat-start" ? {count:clamp(raw?.count ?? 2,2,MAX_REPEAT)} : {})
    };
  }
  function normalizeProgram(raw,index=0){
    const blocks=Array.isArray(raw?.blocks) ? raw.blocks.slice(0,MAX_BLOCKS).map(normalizeBlock) : basicBlocks();
    return {
      id:String(raw?.id || uid("program")),
      name:String(raw?.name || `프로그램 ${index+1}`).trim().slice(0,40) || `프로그램 ${index+1}`,
      blocks:blocks.length ? blocks : basicBlocks(),
      createdAt:raw?.createdAt || now(),
      updatedAt:raw?.updatedAt || now()
    };
  }
  function normalizeStore(raw){
    const fallback=defaultStore();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fallback;
    let programs=Array.isArray(raw.programs) ? raw.programs.slice(0,20).map(normalizeProgram) : fallback.programs;
    if (!programs.length) programs=fallback.programs;
    const selected=programs.some(item=>item.id===raw.selectedProgramId) ? raw.selectedProgramId : programs[0].id;
    return {version:VERSION,enabled:Boolean(raw.enabled),selectedProgramId:selected,programs,updatedAt:raw.updatedAt || now()};
  }
  function loadStore(){
    try { return normalizeStore(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
    catch { return defaultStore(); }
  }

  let store=loadStore();
  let runtime=null;
  let dragId=null;
  let booted=false;

  function saveStore(message="자동 저장됨"){
    store.updatedAt=now();
    localStorage.setItem(STORAGE_KEY,JSON.stringify(store));
    renderEditor();
    renderRuntimeChip();
    setStatus(message);
  }
  function selectedProgram(){
    return store.programs.find(item=>item.id===store.selectedProgramId) || store.programs[0];
  }
  function touchProgram(program){ if(program) program.updatedAt=now(); }

  function validate(program){
    const errors=[];
    const warnings=[];
    if (!program || !Array.isArray(program.blocks)) return {valid:false,errors:["프로그램 데이터가 없습니다."],warnings,compiled:[]};
    if (!program.blocks.length) errors.push("실행 단계가 없습니다.");
    if (program.blocks.length>MAX_BLOCKS) errors.push(`블록은 최대 ${MAX_BLOCKS}개까지 사용할 수 있습니다.`);

    let open=null;
    let openBodyCount=0;
    let rateCount=0;
    program.blocks.forEach((item,index)=>{
      if (!STEP_TYPES.has(item.type)) errors.push(`${index+1}번 블록 종류가 올바르지 않습니다.`);
      if (item.type==="repeat-start") {
        if (open) errors.push(`${index+1}번: 반복 안에 반복을 넣을 수 없습니다.`);
        else { open={index,count:clamp(item.count,2,MAX_REPEAT)}; openBodyCount=0; }
      } else if (item.type==="repeat-end") {
        if (!open) errors.push(`${index+1}번: 짝이 되는 반복 시작이 없습니다.`);
        else {
          if (openBodyCount===0) errors.push(`${open.index+1}번 반복 구간이 비어 있습니다.`);
          open=null;
          openBodyCount=0;
        }
      } else {
        if (open) openBodyCount+=1;
        if (item.type==="rate") {
          rateCount+=1;
          if (open) errors.push(`${index+1}번: O/A/X 평가는 반복 구간 안에 넣을 수 없습니다.`);
        }
      }
    });
    if (open) errors.push(`${open.index+1}번 반복 시작에 반복 끝이 없습니다.`);
    if (rateCount!==1) errors.push(rateCount===0 ? "마지막에 O/A/X 평가 블록을 1개 추가해 주세요." : "O/A/X 평가 블록은 1개만 사용할 수 있습니다.");
    if (program.blocks.at(-1)?.type!=="rate") errors.push("O/A/X 평가는 프로그램의 마지막 블록이어야 합니다.");
    if (!program.blocks.some(item=>["preview","question","mark","reveal"].includes(item.type))) errors.push("평가 전에 최소 1개의 학습 단계가 필요합니다.");

    const compiled=errors.length ? [] : compileUnchecked(program);
    if (compiled.length>MAX_COMPILED_STEPS) errors.push(`반복을 펼친 실행 단계가 ${MAX_COMPILED_STEPS}개를 넘습니다. 반복 횟수나 블록 수를 줄여 주세요.`);
    if (!program.blocks.some(item=>item.type==="reveal")) warnings.push("정답 확인 블록이 없어도 O/A/X 평가 단계에서 정답과 해설은 자동 공개됩니다.");
    return {valid:errors.length===0,errors,warnings,compiled:errors.length ? [] : compiled};
  }

  function compileUnchecked(program){
    const out=[];
    let loop=null;
    for (let index=0; index<program.blocks.length; index+=1) {
      const item=program.blocks[index];
      if (item.type==="repeat-start") {
        loop={startIndex:index,count:clamp(item.count,2,MAX_REPEAT),items:[]};
        continue;
      }
      if (item.type==="repeat-end") {
        if (!loop) continue;
        for (let iteration=1; iteration<=loop.count; iteration+=1) {
          loop.items.forEach(entry=>out.push({...entry,repeatIteration:iteration,repeatCount:loop.count}));
        }
        loop=null;
        continue;
      }
      if (!EXEC_TYPES.has(item.type)) continue;
      const entry={type:item.type,sourceBlockId:item.id,sourceIndex:index,label:LABELS[item.type]};
      if (loop) loop.items.push(entry); else out.push(entry);
    }
    return out;
  }
  function compile(program=selectedProgram()){
    const result=validate(program);
    return result.valid ? result.compiled : [];
  }

  function focusActive(){
    return state?.mode==="dapchigi" && document.body.classList.contains("qt-focus-reading-v2");
  }
  function programActive(){ return Boolean(store.enabled && focusActive()); }
  function currentQuestionId(){
    try { return typeof currentQuestion==="function" ? currentQuestion()?.id || null : null; }
    catch { return null; }
  }
  function currentEntry(){ return runtime?.compiled?.[runtime.index] || null; }
  function setDapStep(step){
    if (!state?.dapchigiV1 || !["preview","question","mark","reveal"].includes(step)) return;
    state.dapchigiV1.step=step;
    saveState();
    renderQuestion();
    requestAnimationFrame(()=>{
      globalThis.QTIMER_STUDY_SHELL?.sync?.();
      globalThis.QTIMER_DAP_FOCUS_READING?.sync?.();
      renderRuntimeChip();
    });
  }
  function ensureRuntime(reset=false){
    if (!programActive()) return null;
    const program=selectedProgram();
    const check=validate(program);
    if (!check.valid) {
      runtime=null;
      renderRuntimeChip();
      return null;
    }
    const questionId=currentQuestionId();
    if (reset || !runtime || runtime.programId!==program.id || runtime.questionId!==questionId) {
      runtime={programId:program.id,questionId,compiled:check.compiled,index:0,startedAt:now()};
    }
    return runtime;
  }
  function applyRuntimeEntry(){
    if (!programActive()) return false;
    const run=ensureRuntime(false);
    const entry=currentEntry();
    if (!run || !entry) return false;
    if (entry.type==="rate") setDapStep("reveal");
    else setDapStep(entry.type);
    renderRuntimeChip();
    return true;
  }
  function startProgram(){
    const program=selectedProgram();
    const check=validate(program);
    if (!check.valid) {
      openPanel();
      renderEditor();
      setStatus("오류를 수정한 뒤 실행해 주세요.",true);
      return false;
    }
    store.enabled=true;
    localStorage.setItem(STORAGE_KEY,JSON.stringify({...store,updatedAt:now()}));
    runtime=null;
    ensureRuntime(true);
    applyRuntimeEntry();
    renderEditor();
    renderRuntimeChip();
    setStatus("프로그램을 처음부터 시작했습니다.");
    return true;
  }
  function stopProgram(){
    store.enabled=false;
    runtime=null;
    saveStore("프로그램 사용을 끄고 기본 답치기로 전환했습니다.");
    globalThis.QTIMER_STUDY_SHELL?.sync?.();
  }
  function advanceProgram(){
    if (!programActive()) return false;
    const run=ensureRuntime(false);
    const entry=currentEntry();
    if (!run || !entry) return false;
    if (entry.type==="rate") {
      setStatus("O / A / X 중 하나를 선택해 주세요.",true);
      return true;
    }
    if (run.index>=run.compiled.length-1) return true;
    run.index+=1;
    applyRuntimeEntry();
    return true;
  }
  function afterRating(){
    if (!store.enabled || !runtime || currentEntry()?.type!=="rate") return;
    runtime=null;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if (!programActive()) return;
      ensureRuntime(true);
      applyRuntimeEntry();
    }));
  }

  function setStatus(message,error=false){
    const node=document.querySelector("#qtDapProgramStatus");
    if (!node) return;
    node.textContent=message;
    node.classList.toggle("error",Boolean(error));
  }
  function renderRuntimeChip(){
    const chip=document.querySelector("#qtDapProgramRuntimeChip");
    const button=document.querySelector("#qtDapProgramBtn");
    if (!chip || !button) return;
    button.classList.toggle("active",Boolean(store.enabled));
    if (!programActive()) {
      chip.hidden=true;
      return;
    }
    const program=selectedProgram();
    const check=validate(program);
    chip.hidden=false;
    if (!check.valid) {
      chip.textContent="프로그램 오류";
      chip.title=check.errors.join("\n");
      return;
    }
    ensureRuntime(false);
    const entry=currentEntry();
    const position=runtime ? `${runtime.index+1}/${runtime.compiled.length}` : "-";
    const repeat=entry?.repeatCount ? ` · 반복 ${entry.repeatIteration}/${entry.repeatCount}` : "";
    chip.textContent=`프로그램 · ${program.name} · ${position}${repeat}`;
    chip.title=entry ? `${entry.label}${repeat}` : program.name;
  }

  function installStyles(){
    if (document.querySelector("#qtDapProgramStyles")) return;
    const style=document.createElement("style");
    style.id="qtDapProgramStyles";
    style.textContent=`
      #qtDapProgramRuntimeChip[hidden],.qt-dap-program-panel[hidden]{display:none!important}
      #qtDapProgramBtn.active{background:#ecfdf3;border-color:#86efac;color:#166534}
      .qt-dap-program-panel{position:fixed;z-index:155;top:56px;right:18px;width:min(600px,calc(100vw - 28px));max-height:calc(100vh - 78px);overflow:auto;padding:16px;border:1px solid var(--qt-border,#d8dee9);border-radius:16px;background:rgba(255,255,255,.99);box-shadow:0 24px 72px rgba(16,24,40,.22);backdrop-filter:blur(14px)}
      .qt-dap-program-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.qt-dap-program-head h2{margin:0 0 3px;font-size:17px}.qt-dap-program-head p{margin:0;color:#667085;font-size:12px;line-height:1.5}.qt-dap-program-close{min-width:34px;min-height:34px;border:1px solid #d0d5dd;border-radius:9px;background:#fff;font-weight:900}
      .qt-dap-program-toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:6px;margin:12px 0 8px}.qt-dap-program-toolbar select,.qt-dap-program-toolbar button,.qt-dap-program-name input{min-height:38px;border:1px solid #d0d5dd;border-radius:9px;background:#fff;padding:6px 9px}.qt-dap-program-toolbar button{font-weight:800}
      .qt-dap-program-name{display:grid;grid-template-columns:70px 1fr;align-items:center;gap:8px;font-size:12px;font-weight:850}.qt-dap-program-runbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin:10px 0;padding:10px;border:1px solid #e4e7ec;border-radius:11px;background:#f8fafc}.qt-dap-program-toggle{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:850}.qt-dap-program-runbar button{min-height:36px;padding:6px 10px;border:1px solid #315efb;border-radius:9px;background:#315efb;color:#fff;font-weight:850}
      .qt-dap-program-section{margin-top:14px}.qt-dap-program-section h3{margin:0 0 7px;font-size:13px}.qt-dap-program-add{display:flex;flex-wrap:wrap;gap:6px}.qt-dap-program-add button,.qt-dap-program-template button{min-height:34px;padding:5px 8px;border:1px solid #d0d5dd;border-radius:9px;background:#fff;font-size:12px;font-weight:800}.qt-dap-program-add button[data-qt-program-add^="repeat"]{background:#fff7ed;border-color:#fed7aa}
      .qt-dap-program-template{display:flex;gap:6px;flex-wrap:wrap}.qt-dap-program-template small{width:100%;color:#667085}
      .qt-dap-program-list{display:grid;gap:7px;margin-top:8px}.qt-dap-program-block{display:grid;grid-template-columns:30px 28px minmax(0,1fr) auto;align-items:center;gap:7px;padding:9px 9px 9px calc(9px + var(--qt-program-depth,0)*18px);border:1px solid #d0d5dd;border-radius:11px;background:#fff;transition:transform .12s ease,box-shadow .12s ease}.qt-dap-program-block.dragging{opacity:.55;box-shadow:0 8px 24px rgba(16,24,40,.16)}.qt-dap-program-block.repeat{background:#fffaf5;border-color:#fdba74}.qt-dap-program-handle{cursor:grab;border:0;background:transparent;color:#667085;font-size:18px}.qt-dap-program-index{font-size:11px;color:#98a2b3;text-align:center}.qt-dap-program-info{display:grid;gap:2px;min-width:0}.qt-dap-program-info strong{font-size:13px}.qt-dap-program-info small{font-size:11px;color:#667085;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.qt-dap-program-actions{display:flex;align-items:center;gap:4px}.qt-dap-program-actions button{width:30px;height:30px;padding:0;border:1px solid #d0d5dd;border-radius:8px;background:#fff}.qt-dap-repeat-count{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:800}.qt-dap-repeat-count input{width:58px;min-height:30px;border:1px solid #d0d5dd;border-radius:7px;padding:3px 5px}
      .qt-dap-program-validation{margin-top:10px;padding:10px 12px;border-radius:10px;background:#ecfdf3;color:#166534;font-size:12px;line-height:1.55}.qt-dap-program-validation.error{background:#fef2f2;color:#991b1b}.qt-dap-program-validation ul{margin:5px 0 0;padding-left:18px}.qt-dap-program-preview{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.qt-dap-program-preview span{display:inline-flex;align-items:center;min-height:28px;padding:3px 7px;border-radius:999px;background:#eef2ff;color:#344054;font-size:11px;font-weight:800}.qt-dap-program-preview span.rate{background:#fee2e2;color:#991b1b}
      .qt-dap-program-footer{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid #eaecf0}.qt-dap-program-footer small{color:#667085}.qt-dap-program-footer #qtDapProgramStatus.error{color:#b42318;font-weight:800}
      @media(max-width:760px){.qt-dap-program-panel{top:8px;right:8px;width:calc(100vw - 16px);max-height:calc(100vh - 16px);padding:12px}.qt-dap-program-toolbar{grid-template-columns:1fr 1fr}.qt-dap-program-toolbar select{grid-column:1/-1}.qt-dap-program-name{grid-template-columns:1fr}.qt-dap-program-block{grid-template-columns:28px 22px minmax(0,1fr);}.qt-dap-program-actions{grid-column:1/-1;justify-content:flex-end}.qt-dap-program-info small{white-space:normal}.qt-dap-program-runbar{align-items:flex-start}}
      @media(prefers-reduced-motion:reduce){.qt-dap-program-block{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function installUI(){
    if (document.querySelector("#qtDapProgramPanel")) return;
    const actions=document.querySelector(".qt-focus-context-actions");
    const meta=document.querySelector("#qtStudyContext .qt-study-context-meta");
    if (!actions || !meta) return;

    const chip=document.createElement("span");
    chip.id="qtDapProgramRuntimeChip";
    chip.className="qt-context-chip";
    chip.hidden=true;
    meta.insertBefore(chip,actions);

    const button=document.createElement("button");
    button.id="qtDapProgramBtn";
    button.type="button";
    button.setAttribute("aria-expanded","false");
    button.title="답치기 프로그램 만들기·실행";
    button.innerHTML="<span>프로그램</span> ▷";
    const quick=document.querySelector("#qtFocusQuickBtn");
    actions.insertBefore(button,quick || document.querySelector("#qtFocusExitBtn"));

    const panel=document.createElement("aside");
    panel.id="qtDapProgramPanel";
    panel.className="qt-dap-program-panel";
    panel.hidden=true;
    panel.setAttribute("aria-label","답치기 프로그램 편집기");
    panel.innerHTML=`
      <div class="qt-dap-program-head"><div><h2>답치기 프로그램</h2><p>단계를 추가하고 드래그해서 원하는 답치기 순서를 만듭니다.</p></div><button id="qtDapProgramClose" class="qt-dap-program-close" type="button" aria-label="답치기 프로그램 닫기">✕</button></div>
      <div class="qt-dap-program-toolbar">
        <select id="qtDapProgramSelect" aria-label="답치기 프로그램 선택"></select>
        <button id="qtDapProgramNew" type="button">+ 새 프로그램</button>
        <button id="qtDapProgramClone" type="button">복제</button>
        <button id="qtDapProgramDelete" type="button">삭제</button>
      </div>
      <label class="qt-dap-program-name">이름 <input id="qtDapProgramName" type="text" maxlength="40" autocomplete="off"></label>
      <div class="qt-dap-program-runbar"><label class="qt-dap-program-toggle"><input id="qtDapProgramEnabled" type="checkbox"> 이 프로그램으로 답치기</label><button id="qtDapProgramStart" type="button">처음부터 실행</button></div>
      <section class="qt-dap-program-section"><h3>단계 추가</h3><div class="qt-dap-program-add">
        <button type="button" data-qt-program-add="preview">+ 답 보기</button><button type="button" data-qt-program-add="question">+ 문제 회상</button><button type="button" data-qt-program-add="mark">+ 빈칸 마킹</button><button type="button" data-qt-program-add="reveal">+ 정답 확인</button><button type="button" data-qt-program-add="rate">+ O/A/X 평가</button><button type="button" data-qt-program-add="repeat-start">↻ 반복 시작</button><button type="button" data-qt-program-add="repeat-end">↺ 반복 끝</button>
      </div></section>
      <section class="qt-dap-program-section"><h3>빠른 템플릿</h3><div class="qt-dap-program-template"><button type="button" data-qt-program-template="basic">기본 답치기</button><button type="button" data-qt-program-template="reinforced">2회 강화</button><button type="button" data-qt-program-template="question-first">문제 중심</button><small>템플릿은 현재 프로그램의 단계 목록을 교체합니다.</small></div></section>
      <section class="qt-dap-program-section"><h3>프로그램 순서</h3><div id="qtDapProgramBlockList" class="qt-dap-program-list"></div></section>
      <div id="qtDapProgramValidation" class="qt-dap-program-validation"></div>
      <div id="qtDapProgramPreview" class="qt-dap-program-preview" aria-label="실행 순서 미리보기"></div>
      <footer class="qt-dap-program-footer"><small id="qtDapProgramStatus">자동 저장됨</small><small>드래그 또는 ↑ ↓ 로 순서 변경 · <kbd>Esc</kbd> 닫기</small></footer>`;
    document.body.appendChild(panel);
  }

  function blockDepths(blocks){
    let depth=0;
    return blocks.map(item=>{
      if (item.type==="repeat-end") depth=Math.max(0,depth-1);
      const current=depth;
      if (item.type==="repeat-start") depth+=1;
      return current;
    });
  }
  function renderEditor(){
    if (!booted) return;
    const program=selectedProgram();
    const select=document.querySelector("#qtDapProgramSelect");
    const name=document.querySelector("#qtDapProgramName");
    const enabled=document.querySelector("#qtDapProgramEnabled");
    const list=document.querySelector("#qtDapProgramBlockList");
    const validation=document.querySelector("#qtDapProgramValidation");
    const preview=document.querySelector("#qtDapProgramPreview");
    if (!program || !select || !list || !validation || !preview) return;

    select.innerHTML=store.programs.map(item=>`<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join("");
    select.value=program.id;
    name.value=program.name;
    enabled.checked=store.enabled;

    const depths=blockDepths(program.blocks);
    list.innerHTML=program.blocks.map((item,index)=>{
      const repeat=item.type==="repeat-start" ? `<label class="qt-dap-repeat-count">횟수 <input type="number" min="2" max="${MAX_REPEAT}" value="${clamp(item.count,2,MAX_REPEAT)}" data-qt-program-count="${escapeHtml(item.id)}"></label>` : "";
      const repeatClass=item.type.startsWith("repeat") ? " repeat" : "";
      return `<div class="qt-dap-program-block${repeatClass}" draggable="true" data-qt-program-block="${escapeHtml(item.id)}" style="--qt-program-depth:${depths[index]}">
        <button class="qt-dap-program-handle" type="button" tabindex="-1" title="마우스로 드래그">⋮⋮</button><span class="qt-dap-program-index">${index+1}</span><div class="qt-dap-program-info"><strong>${escapeHtml(LABELS[item.type])}</strong><small>${escapeHtml(DESCRIPTIONS[item.type])}</small>${repeat}</div><div class="qt-dap-program-actions"><button type="button" data-qt-program-move="up" data-id="${escapeHtml(item.id)}" title="위로">↑</button><button type="button" data-qt-program-move="down" data-id="${escapeHtml(item.id)}" title="아래로">↓</button><button type="button" data-qt-program-remove="${escapeHtml(item.id)}" title="삭제">×</button></div>
      </div>`;
    }).join("");

    const check=validate(program);
    validation.classList.toggle("error",!check.valid);
    if (!check.valid) validation.innerHTML=`<strong>실행할 수 없습니다.</strong><ul>${check.errors.map(message=>`<li>${escapeHtml(message)}</li>`).join("")}</ul>`;
    else {
      const warning=check.warnings.length ? `<ul>${check.warnings.map(message=>`<li>${escapeHtml(message)}</li>`).join("")}</ul>` : "";
      validation.innerHTML=`<strong>실행 준비 완료 · ${check.compiled.length}단계</strong>${warning}`;
    }
    preview.innerHTML=check.compiled.map((entry,index)=>`<span class="${entry.type==="rate" ? "rate" : ""}">${index+1}. ${escapeHtml(entry.label)}${entry.repeatCount ? ` · ${entry.repeatIteration}/${entry.repeatCount}` : ""}</span>`).join("");
    document.querySelector("#qtDapProgramStart").disabled=!check.valid;
    document.querySelector("#qtDapProgramDelete").disabled=store.programs.length<=1;
  }

  function openPanel(){
    if (!focusActive()) return;
    if (document.body.classList.contains("qt-focus-config-open")) document.querySelector("#qtFocusConfigBtn")?.click();
    if (!document.querySelector("#qtFocusQuickPanel")?.hidden) document.querySelector("#qtFocusQuickClose")?.click();
    const panel=document.querySelector("#qtDapProgramPanel");
    if (!panel) return;
    if (panel.hidden) panel.hidden=false;
    if (!document.body.classList.contains("qt-dap-program-open")) document.body.classList.add("qt-dap-program-open");
    const button=document.querySelector("#qtDapProgramBtn");
    if (button?.getAttribute("aria-expanded")!=="true") button?.setAttribute("aria-expanded","true");
    renderEditor();
  }
  function closePanel(){
    const panel=document.querySelector("#qtDapProgramPanel");
    if (panel && !panel.hidden) panel.hidden=true;
    if (document.body.classList.contains("qt-dap-program-open")) document.body.classList.remove("qt-dap-program-open");
    const button=document.querySelector("#qtDapProgramBtn");
    if (button?.getAttribute("aria-expanded")!=="false") button?.setAttribute("aria-expanded","false");
  }
  function togglePanel(){
    const panel=document.querySelector("#qtDapProgramPanel");
    if (!panel || panel.hidden) openPanel(); else closePanel();
  }

  function selectProgram(id){
    if (!store.programs.some(item=>item.id===id)) return;
    store.selectedProgramId=id;
    runtime=null;
    saveStore("프로그램 선택 저장됨");
    if (store.enabled && focusActive()) startProgram();
  }
  function createProgram(){
    const program=newProgram(`새 프로그램 ${store.programs.length+1}`,basicBlocks());
    store.programs.push(program);
    store.selectedProgramId=program.id;
    runtime=null;
    saveStore("새 프로그램을 추가했습니다.");
  }
  function cloneProgram(){
    const source=selectedProgram();
    const copy=newProgram(`${source.name} 복사본`,source.blocks.map(item=>block(item.type,item)));
    store.programs.push(copy);
    store.selectedProgramId=copy.id;
    runtime=null;
    saveStore("프로그램을 복제했습니다.");
  }
  function deleteProgram(){
    if (store.programs.length<=1) return;
    const program=selectedProgram();
    if (!window.confirm(`‘${program.name}’ 프로그램을 삭제하시겠습니까?`)) return;
    store.programs=store.programs.filter(item=>item.id!==program.id);
    store.selectedProgramId=store.programs[0].id;
    runtime=null;
    saveStore("프로그램을 삭제했습니다.");
    if (store.enabled && focusActive()) startProgram();
  }
  function addBlock(type){
    const program=selectedProgram();
    if (!program || program.blocks.length>=MAX_BLOCKS || !STEP_TYPES.has(type)) {
      setStatus(`블록은 최대 ${MAX_BLOCKS}개까지 추가할 수 있습니다.`,true);
      return;
    }
    const item=block(type,{count:2});
    const rateIndex=program.blocks.findIndex(entry=>entry.type==="rate");
    if (type!=="rate" && rateIndex>=0) program.blocks.splice(rateIndex,0,item);
    else program.blocks.push(item);
    touchProgram(program);
    runtime=null;
    saveStore(`${LABELS[type]} 추가됨`);
  }
  function removeBlock(id){
    const program=selectedProgram();
    if (!program) return;
    program.blocks=program.blocks.filter(item=>item.id!==id);
    touchProgram(program);
    runtime=null;
    saveStore("단계를 삭제했습니다.");
  }
  function moveBlock(id,direction){
    const program=selectedProgram();
    const index=program?.blocks.findIndex(item=>item.id===id) ?? -1;
    if (index<0) return;
    const target=direction==="up" ? index-1 : index+1;
    if (target<0 || target>=program.blocks.length) return;
    [program.blocks[index],program.blocks[target]]=[program.blocks[target],program.blocks[index]];
    touchProgram(program);
    runtime=null;
    saveStore("순서를 변경했습니다.");
  }
  function applyTemplate(kind){
    const program=selectedProgram();
    if (!program) return;
    const templates={basic:basicBlocks,reinforced:reinforcedBlocks,"question-first":questionFirstBlocks};
    if (!templates[kind]) return;
    if (!window.confirm("현재 단계 목록을 선택한 템플릿으로 바꾸시겠습니까?")) return;
    program.blocks=templates[kind]();
    touchProgram(program);
    runtime=null;
    saveStore("템플릿을 적용했습니다.");
  }
  function persistDomOrder(){
    const program=selectedProgram();
    const ids=[...document.querySelectorAll("#qtDapProgramBlockList [data-qt-program-block]")].map(row=>row.dataset.qtProgramBlock);
    if (!program || ids.length!==program.blocks.length) return;
    const byId=new Map(program.blocks.map(item=>[item.id,item]));
    program.blocks=ids.map(id=>byId.get(id)).filter(Boolean);
    touchProgram(program);
    runtime=null;
    saveStore("드래그 순서를 저장했습니다.");
  }

  function bindUI(){
    document.querySelector("#qtDapProgramBtn")?.addEventListener("click",togglePanel);
    document.querySelector("#qtDapProgramClose")?.addEventListener("click",closePanel);
    document.querySelector("#qtDapProgramSelect")?.addEventListener("change",event=>selectProgram(event.target.value));
    document.querySelector("#qtDapProgramNew")?.addEventListener("click",createProgram);
    document.querySelector("#qtDapProgramClone")?.addEventListener("click",cloneProgram);
    document.querySelector("#qtDapProgramDelete")?.addEventListener("click",deleteProgram);
    document.querySelector("#qtDapProgramName")?.addEventListener("input",event=>{
      const program=selectedProgram();
      if (!program) return;
      program.name=String(event.target.value||"").slice(0,40);
      touchProgram(program);
      store.updatedAt=now();
      localStorage.setItem(STORAGE_KEY,JSON.stringify(store));
      const option=document.querySelector(`#qtDapProgramSelect option[value="${CSS.escape(program.id)}"]`);
      if (option) option.textContent=program.name || "이름 없음";
      renderRuntimeChip();
      setStatus("이름 자동 저장됨");
    });
    document.querySelector("#qtDapProgramName")?.addEventListener("change",()=>{
      const program=selectedProgram();
      if (!program) return;
      program.name=program.name.trim() || "이름 없는 프로그램";
      saveStore("이름 저장됨");
    });
    document.querySelector("#qtDapProgramEnabled")?.addEventListener("change",event=>{
      if (event.target.checked) startProgram(); else stopProgram();
    });
    document.querySelector("#qtDapProgramStart")?.addEventListener("click",startProgram);

    document.querySelector("#qtDapProgramPanel")?.addEventListener("click",event=>{
      const add=event.target.closest("[data-qt-program-add]");
      if (add) return addBlock(add.dataset.qtProgramAdd);
      const remove=event.target.closest("[data-qt-program-remove]");
      if (remove) return removeBlock(remove.dataset.qtProgramRemove);
      const move=event.target.closest("[data-qt-program-move]");
      if (move) return moveBlock(move.dataset.id,move.dataset.qtProgramMove);
      const template=event.target.closest("[data-qt-program-template]");
      if (template) return applyTemplate(template.dataset.qtProgramTemplate);
    });
    document.querySelector("#qtDapProgramPanel")?.addEventListener("input",event=>{
      const id=event.target?.dataset?.qtProgramCount;
      if (!id) return;
      const program=selectedProgram();
      const item=program?.blocks.find(blockItem=>blockItem.id===id);
      if (!item || item.type!=="repeat-start") return;
      item.count=clamp(event.target.value,2,MAX_REPEAT);
      event.target.value=item.count;
      touchProgram(program);
      runtime=null;
      saveStore("반복 횟수 저장됨");
    });

    const list=document.querySelector("#qtDapProgramBlockList");
    list?.addEventListener("dragstart",event=>{
      const row=event.target.closest("[data-qt-program-block]");
      if (!row) return;
      dragId=row.dataset.qtProgramBlock;
      row.classList.add("dragging");
      event.dataTransfer.effectAllowed="move";
      event.dataTransfer.setData("text/plain",dragId);
    });
    list?.addEventListener("dragover",event=>{
      if (!dragId) return;
      event.preventDefault();
      const dragging=list.querySelector(`[data-qt-program-block="${CSS.escape(dragId)}"]`);
      const target=event.target.closest("[data-qt-program-block]");
      if (!dragging || !target || dragging===target) return;
      const rect=target.getBoundingClientRect();
      const after=event.clientY>rect.top+rect.height/2;
      list.insertBefore(dragging,after ? target.nextSibling : target);
    });
    list?.addEventListener("drop",event=>{
      if (!dragId) return;
      event.preventDefault();
      persistDomOrder();
    });
    list?.addEventListener("dragend",()=>{
      list.querySelectorAll(".dragging").forEach(row=>row.classList.remove("dragging"));
      if (dragId) persistDomOrder();
      dragId=null;
    });

    // Program Space has priority over the classic Dapchigi Space path only while enabled.
    const dock=document.querySelector("#qtActionDock");
    dock?.addEventListener("click",event=>{
      if (!programActive()) return;
      const button=event.target.closest("button[data-action]");
      if (!button || button.dataset.action!=="space") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      advanceProgram();
    },true);

    // Existing Dapchigi records the rating first; this listener then resets the program for the next question.
    document.querySelector("#dapEvalRow")?.addEventListener("click",event=>{
      if (!programActive() || !event.target.closest("button[data-rating]")) return;
      requestAnimationFrame(afterRating);
    });

    window.addEventListener("keydown",event=>{
      if (event.key==="Escape" && !document.querySelector("#qtDapProgramPanel")?.hidden) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closePanel();
        return;
      }
      if (!programActive() || !document.querySelector("#qtDapProgramPanel")?.hidden) return;
      const tag=event.target?.tagName?.toLowerCase();
      if (["input","select","textarea","button"].includes(tag)) return;
      const key=event.key.toLowerCase();
      if (event.key===" ") {
        event.preventDefault();
        event.stopImmediatePropagation();
        advanceProgram();
        return;
      }
      if (["o","a","x"].includes(key)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (currentEntry()?.type!=="rate") {
          setStatus("현재 단계에서는 O/A/X를 입력하지 않습니다.",true);
          return;
        }
        document.querySelector(`#dapEvalRow button[data-rating="${key}"]`)?.click();
      }
    },true);

    document.querySelector("#qtFocusQuickBtn")?.addEventListener("click",()=>{ if(!document.querySelector("#qtDapProgramPanel")?.hidden) closePanel(); },true);
    document.querySelector("#qtFocusConfigBtn")?.addEventListener("click",()=>{ if(!document.querySelector("#qtDapProgramPanel")?.hidden) closePanel(); },true);
    document.querySelector("#qtFocusExitBtn")?.addEventListener("click",closePanel);
    document.querySelector("#dashboardTab")?.addEventListener("click",closePanel);
    document.querySelector("#studyTab")?.addEventListener("click",closePanel);
    document.querySelector("#dapApplyScope")?.addEventListener("click",()=>{
      runtime=null;
      requestAnimationFrame(()=>{ if (store.enabled && focusActive()) startProgram(); });
    });

    let lastFocusActive=focusActive();
    new MutationObserver(()=>{
      const isFocusActive=focusActive();
      if (isFocusActive!==lastFocusActive) {
        lastFocusActive=isFocusActive;
        if (!isFocusActive) {
          const panel=document.querySelector("#qtDapProgramPanel");
          if ((panel && !panel.hidden) || document.body.classList.contains("qt-dap-program-open")) closePanel();
          runtime=null;
        } else if (store.enabled && !runtime) {
          requestAnimationFrame(()=>{ if(programActive() && !runtime) startProgram(); });
        }
      }
      renderRuntimeChip();
    }).observe(document.body,{attributes:true,attributeFilter:["class"]});
  }

  function replaceStore(next){
    store=normalizeStore(next);
    runtime=null;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(store));
    renderEditor();
    renderRuntimeChip();
    if (store.enabled && focusActive()) requestAnimationFrame(startProgram);
    return clone(store);
  }

  function boot(){
    if (!globalThis.QTIMER_DAP_FOCUS_READING?.version || !document.querySelector(".qt-focus-context-actions") || !document.querySelector("#qtActionDock") || !document.querySelector("#dapEvalRow")) {
      setTimeout(boot,60);
      return;
    }
    if (document.querySelector("#qtDapProgramPanel")) return;
    installStyles();
    installUI();
    booted=true;
    renderEditor();
    bindUI();
    renderRuntimeChip();

    globalThis.QTIMER_DAP_PROGRAMS=Object.freeze({
      version:VERSION,
      key:STORAGE_KEY,
      get:()=>clone(store),
      replace:replaceStore,
      validate:program=>clone(validate(program || selectedProgram())),
      compile:program=>clone(compile(program || selectedProgram())),
      start:startProgram,
      stop:stopProgram,
      advance:advanceProgram,
      open:openPanel,
      close:closePanel,
      selected:()=>clone(selectedProgram()),
      runtime:()=>clone(runtime)
    });

    // A stored enabled program becomes active only after the user enters Dapchigi Focus Mode.
    if (store.enabled && focusActive()) startProgram();
  }

  boot();
})();