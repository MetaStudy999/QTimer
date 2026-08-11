// QTimer settings v2 — independent question/answer typography, emphasis and UI scale.
// SOURCE BANK and learning attempts remain separate from presentation preferences.
(function initQTimerSettingsV2(){
  const SETTINGS_KEY = "qtimer-settings-v2";
  const LEGACY_SETTINGS_KEY = "qtimer-settings-v1";
  const SETTINGS_FORMAT = "qtimer-settings";
  const SETTINGS_VERSION = 2;
  const FONT_VALUES = new Set(["default","gothic","serif","mono"]);
  const SIZE_VALUES = new Set(["default","16","18","20","22","24","28","32"]);
  const SCOPE_VALUES = new Set(["all","keyword"]);
  const SCALE_VALUES = new Set(["small","normal","large"]);
  const LEGACY_STYLE_VALUES = new Set(["normal","all-bold","keyword-bold","all-highlight","keyword-highlight","mark"]);
  const STOPWORDS = new Set(["대한","설명","것은","있는","없는","가장","다음","해당","의미","사용","경우","위한","으로","에서","하고","하는","한다","아니다","정답","문제"]);
  const FONT_STACKS = {
    default:"inherit",
    gothic:'"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif',
    serif:'"Noto Serif KR","Nanum Myeongjo","Batang",serif',
    mono:'"D2Coding","Cascadia Mono","Consolas",monospace'
  };
  const SCALE_MAP = {small:.90,normal:1,large:1.10};

  const DEFAULT_PRESENTATION = Object.freeze({
    fontFamily:"default",
    fontSize:"default",
    fontColor:"#101828",
    bold:false,
    highlight:false,
    emphasisScope:"all"
  });
  const DEFAULT_SETTINGS = Object.freeze({
    version:SETTINGS_VERSION,
    dapchigi:{
      question:{...DEFAULT_PRESENTATION,highlightColor:"#bfdbfe"},
      answer:{...DEFAULT_PRESENTATION,highlightColor:"#fecaca",answerMark:false,keywordRed:true}
    },
    display:{scale:"normal"}
  });

  let settings = null;
  let statusTimer = null;

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function validObject(value){ return value && typeof value === "object" && !Array.isArray(value); }
  function validHex(value,fallback){ return /^#[0-9a-f]{6}$/i.test(String(value||"")) ? String(value).toLowerCase() : fallback; }
  function escapeRegExp(value){ return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

  function normalizePresentation(raw,kind){
    const source = validObject(raw) ? raw : {};
    const fallbackHighlight = kind === "question" ? "#bfdbfe" : "#fecaca";
    const base = {
      fontFamily:FONT_VALUES.has(source.fontFamily) ? source.fontFamily : "default",
      fontSize:SIZE_VALUES.has(String(source.fontSize)) ? String(source.fontSize) : "default",
      fontColor:validHex(source.fontColor,"#101828"),
      bold:Boolean(source.bold),
      highlight:Boolean(source.highlight),
      highlightColor:validHex(source.highlightColor,fallbackHighlight),
      emphasisScope:SCOPE_VALUES.has(source.emphasisScope) ? source.emphasisScope : "all"
    };
    if (kind === "answer") {
      base.answerMark = Boolean(source.answerMark);
      base.keywordRed = source.keywordRed !== false;
    }
    return base;
  }

  function migrateLegacyStyle(style,kind){
    const normalized = LEGACY_STYLE_VALUES.has(style) ? style : "normal";
    const answerMark = kind === "answer" && normalized === "mark";
    return {
      bold:["all-bold","keyword-bold","all-highlight","keyword-highlight","mark"].includes(normalized),
      highlight:["all-highlight","keyword-highlight","mark"].includes(normalized),
      emphasisScope:normalized.startsWith("keyword-") ? "keyword" : "all",
      ...(kind === "answer" ? {answerMark} : {})
    };
  }

  function normalizeSettings(raw){
    const source = validObject(raw) ? raw : {};
    const dap = validObject(source.dapchigi) ? source.dapchigi : {};
    const display = validObject(source.display) ? source.display : {};
    const qLegacy = migrateLegacyStyle(dap.questionStyle,"question");
    const aLegacy = migrateLegacyStyle(dap.answerStyle,"answer");
    const qRaw = validObject(dap.question) ? dap.question : qLegacy;
    const aRaw = validObject(dap.answer) ? dap.answer : {...aLegacy,keywordRed:dap.answerKeywordRed !== false};
    return {
      version:SETTINGS_VERSION,
      dapchigi:{question:normalizePresentation(qRaw,"question"),answer:normalizePresentation(aRaw,"answer")},
      display:{scale:SCALE_VALUES.has(display.scale) ? display.scale : "normal"},
      updatedAt:typeof source.updatedAt === "string" ? source.updatedAt : null
    };
  }

  function settingsFromCurrentDapchigi(){
    const current = state?.dapchigiV1 || {};
    return normalizeSettings({dapchigi:{questionStyle:current.questionStyle || "normal",answerStyle:current.answerStyle || "normal",answerKeywordRed:true}});
  }

  function loadSettings(){
    for (const key of [SETTINGS_KEY,LEGACY_SETTINGS_KEY]) {
      try {
        const raw = JSON.parse(localStorage.getItem(key));
        if (validObject(raw)) return normalizeSettings(raw);
      } catch (error) {
        console.warn(`[QTimer] invalid settings at ${key}; continuing migration`,error);
      }
    }
    return settingsFromCurrentDapchigi();
  }

  function setStatus(message){
    const node = document.querySelector("#qtimerSettingsStatus");
    if (!node) return;
    node.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { if (node) node.textContent = "변경 즉시 자동 저장됩니다."; },2400);
  }

  function persistSettings(message="자동 저장됨"){
    settings.updatedAt = new Date().toISOString();
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
    setStatus(message);
  }

  function derivedStyle(presentation){
    if (presentation.highlight) return presentation.emphasisScope === "keyword" ? "keyword-highlight" : "all-highlight";
    if (presentation.bold) return presentation.emphasisScope === "keyword" ? "keyword-bold" : "all-bold";
    return "normal";
  }

  function syncDapchigiState(){
    if (!state.dapchigiV1) state.dapchigiV1 = {};
    const questionStyle = derivedStyle(settings.dapchigi.question);
    const answerStyle = derivedStyle(settings.dapchigi.answer);
    state.dapchigiV1.questionStyle = questionStyle;
    state.dapchigiV1.answerStyle = answerStyle;
    const qSelect = document.querySelector("#dapQuestionStyle");
    const aSelect = document.querySelector("#dapAnswerStyle");
    if (qSelect && [...qSelect.options].some(option => option.value === questionStyle)) qSelect.value = questionStyle;
    if (aSelect && [...aSelect.options].some(option => option.value === answerStyle)) aSelect.value = answerStyle;
    if (typeof saveState === "function") saveState();
  }

  function cssFont(value){ return FONT_STACKS[value] || "inherit"; }
  function cssSize(value){ return value === "default" ? "inherit" : `${value}px`; }

  function applyPresentationClasses(){
    const body = document.body;
    const q = settings.dapchigi.question;
    const a = settings.dapchigi.answer;
    body.classList.toggle("qt-q-bold-on",q.bold);
    body.classList.toggle("qt-a-bold-on",a.bold);
    body.classList.toggle("qt-q-highlight-on",q.highlight);
    body.classList.toggle("qt-a-highlight-on",a.highlight);
    body.classList.toggle("qt-answer-mark-on",a.answerMark);
    body.classList.toggle("qt-answer-mark-off",!a.answerMark);
    body.style.setProperty("--qt-q-font",cssFont(q.fontFamily));
    body.style.setProperty("--qt-a-font",cssFont(a.fontFamily));
    body.style.setProperty("--qt-q-size",cssSize(q.fontSize));
    body.style.setProperty("--qt-a-size",cssSize(a.fontSize));
    body.style.setProperty("--qt-q-color",q.fontColor);
    body.style.setProperty("--qt-a-color",a.fontColor);
    body.style.setProperty("--qt-q-highlight",q.highlightColor);
    body.style.setProperty("--qt-a-highlight",a.highlightColor);
  }

  function applyScreenScale(){
    const scale = settings.display.scale;
    const numeric = SCALE_MAP[scale] || 1;
    document.body.dataset.qtimerScale = scale;
    if ("zoom" in document.body.style) {
      document.body.style.zoom = String(numeric);
      document.body.style.transform = "";
      document.body.style.transformOrigin = "";
      document.body.style.width = "";
    } else {
      document.body.style.zoom = "";
      document.body.style.transform = `scale(${numeric})`;
      document.body.style.transformOrigin = "top left";
      document.body.style.width = `${100/numeric}%`;
    }
  }

  function answerKeywordTerms(q,choiceText){
    const source = String(choiceText || "");
    if (!source) return [];
    const tokens = String(q?.finalKey || "").match(/[A-Za-z][A-Za-z0-9+.#_-]{1,}|[가-힣]{2,}/g) || [];
    return [...new Set(tokens.filter(token => !STOPWORDS.has(token)).filter(token => source.toLowerCase().includes(token.toLowerCase())))]
      .sort((x,y) => y.length-x.length).slice(0,10);
  }

  function unwrapKeywordSpans(container){
    if (!container) return;
    for (const span of [...container.querySelectorAll(".qt-answer-keyword-red")]) span.replaceWith(document.createTextNode(span.textContent || ""));
    container.normalize();
  }

  function wrapKeywordText(container,terms){
    if (!container || !terms.length || container.querySelector(".qt-answer-keyword-red")) return;
    const re = new RegExp(`(${terms.map(escapeRegExp).join("|")})`,"gi");
    const walker = document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const value=node.nodeValue || "";
      re.lastIndex=0;
      if (!re.test(value)) continue;
      re.lastIndex=0;
      const frag=document.createDocumentFragment();
      let cursor=0;
      for (const match of value.matchAll(re)) {
        const index=match.index ?? 0;
        if (index>cursor) frag.append(document.createTextNode(value.slice(cursor,index)));
        const span=document.createElement("span");
        span.className="qt-answer-keyword-red";
        span.textContent=match[0];
        frag.append(span);
        cursor=index+match[0].length;
      }
      if (cursor<value.length) frag.append(document.createTextNode(value.slice(cursor)));
      node.replaceWith(frag);
    }
  }

  function applyAnswerKeywordColor(){
    const containers=[document.querySelector("#dapAnswerValue"),document.querySelector(".choice.dap-answer-choice span:last-child")].filter(Boolean);
    if (!containers.length) return;
    if (!settings.dapchigi.answer.keywordRed || state.mode !== "dapchigi") {
      containers.forEach(unwrapKeywordSpans);
      return;
    }
    const q=typeof currentQuestion === "function" ? currentQuestion() : null;
    if (!q) return;
    const answer=typeof effectiveAnswer === "function" ? effectiveAnswer(q) : Number(q.sourceAnswer);
    const choice=q.choices?.[answer-1] || "";
    const terms=answerKeywordTerms(q,choice);
    containers.forEach(container => wrapKeywordText(container,terms));
  }

  function renderCurrentDapchigi(){
    applyPresentationClasses();
    applyScreenScale();
    if (state.mode === "dapchigi" && typeof renderQuestion === "function") renderQuestion();
    requestAnimationFrame(applyAnswerKeywordColor);
  }

  function resetSection(kind){
    if (kind === "question") settings.dapchigi.question=normalizePresentation({...DEFAULT_PRESENTATION,highlightColor:"#bfdbfe"},"question");
    else settings.dapchigi.answer=normalizePresentation({...DEFAULT_PRESENTATION,highlightColor:"#fecaca",answerMark:false,keywordRed:true},"answer");
    syncDapchigiState(); syncControls(); persistSettings(`${kind === "question" ? "문제" : "답"} 표시 기본값 복원`); renderCurrentDapchigi();
  }

  function applySettings(next,{persist=true,render=true,message="자동 저장됨"}={}){
    settings=normalizeSettings(next);
    syncDapchigiState(); syncControls(); applyPresentationClasses(); applyScreenScale();
    if (persist) persistSettings(message);
    if (render) renderCurrentDapchigi();
    return clone(settings);
  }

  function exportPayload(){ return {format:SETTINGS_FORMAT,version:SETTINGS_VERSION,exportedAt:new Date().toISOString(),settings:clone(settings)}; }
  function validateSettingsPayload(payload){
    if (!validObject(payload) || payload.format !== SETTINGS_FORMAT || ![1,2].includes(Number(payload.version)) || !validObject(payload.settings)) throw new Error("QTimer 환경설정 파일 형식이 아닙니다.");
    return normalizeSettings(payload.settings);
  }

  function downloadJson(payload,prefix="qtimer-settings"){
    const stamp=new Date().toISOString().replace(/[:.]/g,"-");
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement("a");
    anchor.href=url; anchor.download=`${prefix}-${stamp}.json`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }

  function presentationFields(kind,label){
    const prefix=kind === "question" ? "Question" : "Answer";
    const answerExtras=kind === "answer" ? `
      <div class="qt-extra-options">
        <label class="qt-toggle"><input id="qtSetAnswerMark" type="checkbox"><span><strong>답 마킹</strong><small>정답 선택지의 위치를 테두리로 강하게 표시</small></span></label>
        <label class="qt-toggle"><input id="qtSetAnswerKeywordRed" type="checkbox"><span><strong class="qt-settings-danger">답 핵심어 빨간색 + 볼드</strong><small>정답 핵심 개념만 빨간색으로 추가 강조</small></span></label>
      </div>` : "";
    return `
      <section class="qt-settings-card" data-settings-kind="${kind}">
        <div class="qt-card-title"><div><h3>${label}</h3><p class="qt-settings-note">폰트·크기·색상·볼드·형광펜을 독립적으로 조합합니다.</p></div><button id="qtReset${prefix}" type="button">기본</button></div>
        <div class="qt-field-grid">
          <label class="qt-field">폰트<select id="qt${prefix}Font"><option value="default">기본</option><option value="gothic">고딕</option><option value="serif">명조</option><option value="mono">모노스페이스</option></select></label>
          <label class="qt-field">폰트 크기<select id="qt${prefix}Size"><option value="default">기본</option>${[16,18,20,22,24,28,32].map(n=>`<option value="${n}">${n}px</option>`).join("")}</select></label>
          <label class="qt-field">폰트 색상<div class="qt-color-row"><input id="qt${prefix}Color" type="color"><output id="qt${prefix}ColorCode"></output></div></label>
          <label class="qt-field">강조 범위<select id="qt${prefix}Scope"><option value="all">전체</option><option value="keyword">핵심어</option></select></label>
          <label class="qt-toggle"><input id="qt${prefix}Bold" type="checkbox"><span><strong>볼드</strong><small>선택 범위를 굵게 표시</small></span></label>
          <label class="qt-toggle"><input id="qt${prefix}Highlight" type="checkbox"><span><strong>형광펜</strong><small>선택 범위에 배경 강조 적용</small></span></label>
          <label class="qt-field">형광펜 색상<div class="qt-color-row"><input id="qt${prefix}HighlightColor" type="color"><output id="qt${prefix}HighlightCode"></output></div></label>
        </div>
        ${answerExtras}
        <div class="qt-preview-wrap"><span>실시간 미리보기</span><div id="qt${prefix}Preview" class="qt-preview">${kind === "question" ? '문제 미리보기: 다음 중 <b data-preview-keyword>옳지 않은 것</b>은?' : '정답 미리보기: <b data-preview-keyword>미들웨어</b>'}</div></div>
      </section>`;
  }

  function installStyles(){
    if (document.querySelector("#qtimerSettingsV2Styles")) return;
    const style=document.createElement("style");
    style.id="qtimerSettingsV2Styles";
    style.textContent=`
      .qt-settings-view{padding:20px 24px 32px;background:#f7f9fc;min-height:calc(100vh - 90px)}
      .qt-settings-shell{max-width:1180px;margin:0 auto;display:grid;gap:14px}
      .qt-settings-hero,.qt-settings-card{background:var(--panel,#fff);border:1px solid var(--border,#d8dee9);border-radius:14px;padding:20px}
      .qt-settings-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.qt-settings-hero h2{margin:3px 0 6px}.qt-settings-hero p{margin:0;color:var(--muted,#667085)}
      .qt-settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.qt-card-title{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.qt-settings-card h3{margin:0 0 6px}.qt-settings-note{margin:0;color:var(--muted,#667085);font-size:.9rem}
      .qt-field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:15px}.qt-field{display:grid;gap:6px;font-size:.86rem;font-weight:750}.qt-field select,.qt-field input[type=color]{min-height:38px}.qt-color-row{display:flex;gap:8px;align-items:center}.qt-color-row input[type=color]{width:56px;padding:2px}.qt-color-row output{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.78rem;color:var(--muted,#667085)}
      .qt-toggle{display:flex;gap:10px;align-items:flex-start;padding:10px 11px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:#fff;cursor:pointer}.qt-toggle input{margin-top:3px;width:17px;height:17px}.qt-toggle span{display:grid;gap:2px}.qt-toggle small{color:var(--muted,#667085)}.qt-extra-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
      .qt-preview-wrap{margin-top:14px;padding:12px;border:1px dashed var(--border,#d8dee9);border-radius:10px;background:#fafbfc}.qt-preview-wrap>span{display:block;color:var(--muted,#667085);font-size:.76rem;margin-bottom:8px}.qt-preview{display:inline;line-height:1.65;padding:.08em .15em;border-radius:.2em}.qt-preview b{font-weight:inherit}
      .qt-screen-control{display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap;margin-top:14px}.qt-screen-control button{min-width:72px;min-height:40px}.qt-screen-control .qt-step{min-width:42px;font-size:1.2rem}.qt-screen-control button.active{background:var(--text,#101828);color:#fff;border-color:var(--text,#101828)}
      .qt-settings-actions{display:flex;gap:8px;flex-wrap:wrap}.qt-settings-actions button{min-height:40px}.qt-settings-status{font-size:.9rem;color:var(--muted,#667085);font-weight:700}.qt-settings-danger{color:#b42318}
      .qt-answer-keyword-red{color:#d92d20!important;font-weight:900!important}
      body.dapchigi-active #questionText,body.dapchigi-active #choices .choice span:last-child{font-family:var(--qt-q-font,inherit);font-size:var(--qt-q-size,inherit);color:var(--qt-q-color,#101828)}
      body.dapchigi-active #dapAnswerValue,body.dapchigi-active #choices .choice.dap-answer-choice span:last-child{font-family:var(--qt-a-font,inherit);font-size:var(--qt-a-size,inherit);color:var(--qt-a-color,#101828)}
      body.dapchigi-active mark.dap-highlight-question{background:var(--qt-q-highlight,#bfdbfe)!important;font-weight:400!important}
      body.dapchigi-active mark.dap-highlight-answer{background:var(--qt-a-highlight,#fecaca)!important;font-weight:400!important}
      body.dapchigi-active.qt-q-bold-on mark.dap-highlight-question{font-weight:900!important}
      body.dapchigi-active.qt-a-bold-on mark.dap-highlight-answer{font-weight:900!important}
      body.dapchigi-active.qt-answer-mark-off .choice.dap-answer-choice{outline:none!important}
      body.dapchigi-active.qt-answer-mark-on .choice.dap-answer-choice{outline:3px solid #ef4444!important;outline-offset:-3px}
      @media(max-width:760px){.qt-settings-view{padding:12px}.qt-settings-grid{grid-template-columns:1fr}.qt-field-grid{grid-template-columns:1fr}.qt-extra-options{grid-template-columns:1fr}.qt-settings-hero{flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function previewStyle(kind){
    const p=settings.dapchigi[kind];
    const preview=document.querySelector(`#qt${kind === "question" ? "Question" : "Answer"}Preview`);
    if (!preview) return;
    preview.style.fontFamily=cssFont(p.fontFamily);
    preview.style.fontSize=p.fontSize === "default" ? "" : `${p.fontSize}px`;
    preview.style.color=p.fontColor;
    preview.style.fontWeight=p.bold && p.emphasisScope === "all" ? "900" : "400";
    preview.style.background=p.highlight && p.emphasisScope === "all" ? p.highlightColor : "transparent";
    const keyword=preview.querySelector("[data-preview-keyword]");
    if (keyword) {
      keyword.style.fontWeight=p.bold && p.emphasisScope === "keyword" ? "900" : "inherit";
      keyword.style.background=p.highlight && p.emphasisScope === "keyword" ? p.highlightColor : "transparent";
      keyword.style.color=kind === "answer" && p.keywordRed ? "#d92d20" : "inherit";
    }
  }

  function syncControls(){
    for (const [kind,prefix] of [["question","Question"],["answer","Answer"]]) {
      const p=settings.dapchigi[kind];
      const set=(id,value,prop="value")=>{ const el=document.querySelector(id); if(el) el[prop]=value; };
      set(`#qt${prefix}Font`,p.fontFamily); set(`#qt${prefix}Size`,p.fontSize); set(`#qt${prefix}Color`,p.fontColor);
      set(`#qt${prefix}Scope`,p.emphasisScope); set(`#qt${prefix}Bold`,p.bold,"checked"); set(`#qt${prefix}Highlight`,p.highlight,"checked"); set(`#qt${prefix}HighlightColor`,p.highlightColor);
      const code=document.querySelector(`#qt${prefix}ColorCode`); if(code) code.textContent=p.fontColor;
      const hcode=document.querySelector(`#qt${prefix}HighlightCode`); if(hcode) hcode.textContent=p.highlightColor;
      previewStyle(kind);
    }
    const mark=document.querySelector("#qtSetAnswerMark"); if(mark) mark.checked=settings.dapchigi.answer.answerMark;
    const red=document.querySelector("#qtSetAnswerKeywordRed"); if(red) red.checked=settings.dapchigi.answer.keywordRed;
    for (const button of document.querySelectorAll("[data-qt-scale]")) button.classList.toggle("active",button.dataset.qtScale===settings.display.scale);
  }

  function installSettingsView(){
    if (document.querySelector("#settingsView")) return;
    const tabs=document.querySelector(".view-tabs");
    const studyTab=document.querySelector("#studyTab");
    const dapchigiTab=document.querySelector("#dapchigiTab");
    if (!tabs || !studyTab) return;
    const settingsTab=document.createElement("button"); settingsTab.id="settingsTab"; settingsTab.type="button"; settingsTab.textContent="환경설정";
    (dapchigiTab || studyTab).insertAdjacentElement("afterend",settingsTab);
    const settingsView=document.createElement("main"); settingsView.id="settingsView"; settingsView.className="qt-settings-view"; settingsView.hidden=true;
    settingsView.innerHTML=`
      <div class="qt-settings-shell">
        <section class="qt-settings-hero"><div><p class="eyebrow">QTimer Preferences v2</p><h2>환경설정</h2><p>문제와 답의 표시를 각각 조절합니다. 변경 내용은 즉시 자동 저장됩니다.</p></div><span id="qtimerSettingsStatus" class="qt-settings-status">변경 즉시 자동 저장됩니다.</span></section>
        <div class="qt-settings-grid">${presentationFields("question","문제 표시")}${presentationFields("answer","답 표시")}</div>
        <section class="qt-settings-card"><h3>화면 크기 조절</h3><p class="qt-settings-note">전체 QTimer 화면을 3단계로 확대·축소합니다.</p><div class="qt-screen-control"><button id="qtScaleDown" class="qt-step" type="button">&lt;</button><button data-qt-scale="small" type="button">작게</button><button data-qt-scale="normal" type="button">기본</button><button data-qt-scale="large" type="button">크게</button><button id="qtScaleUp" class="qt-step" type="button">&gt;</button></div></section>
        <section class="qt-settings-card"><h3>설정 저장 · 불러오기</h3><p class="qt-settings-note">자동 저장 외에 설정만 JSON 파일로 별도 보관·이동할 수 있습니다.</p><div class="qt-settings-actions"><button id="qtSettingsExport" type="button">설정 파일 저장</button><button id="qtSettingsImport" type="button">설정 파일 불러오기</button><button id="qtSettingsReset" type="button">전체 기본값 복원</button><input id="qtSettingsFile" type="file" accept="application/json,.json" hidden></div></section>
      </div>`;
    const dashboardView=document.querySelector("#dashboardView"); const studyView=document.querySelector("#studyView");
    (dashboardView || studyView || document.body.lastElementChild)?.insertAdjacentElement("afterend",settingsView);

    function clearSettings(){ settingsView.hidden=true; settingsTab.classList.remove("active"); }
    function showSettings(){
      if (typeof stopTimer === "function") stopTimer();
      if (dashboardView) dashboardView.hidden=true; if(studyView) studyView.hidden=true;
      settingsView.hidden=false;
      ["#dashboardTab","#studyTab","#dapchigiTab"].forEach(id=>document.querySelector(id)?.classList.remove("active"));
      settingsTab.classList.add("active"); syncControls();
    }
    settingsTab.addEventListener("click",showSettings);
    ["#dashboardTab","#studyTab","#dapchigiTab"].forEach(id=>document.querySelector(id)?.addEventListener("click",clearSettings));

    function bindPresentation(kind,prefix){
      const p=()=>settings.dapchigi[kind];
      const bind=(id,event,handler)=>settingsView.querySelector(id)?.addEventListener(event,()=>{handler(); syncDapchigiState(); persistSettings(); syncControls(); renderCurrentDapchigi();});
      bind(`#qt${prefix}Font`,"change",()=>p().fontFamily=settingsView.querySelector(`#qt${prefix}Font`).value);
      bind(`#qt${prefix}Size`,"change",()=>p().fontSize=settingsView.querySelector(`#qt${prefix}Size`).value);
      bind(`#qt${prefix}Color`,"input",()=>p().fontColor=settingsView.querySelector(`#qt${prefix}Color`).value.toLowerCase());
      bind(`#qt${prefix}Scope`,"change",()=>p().emphasisScope=settingsView.querySelector(`#qt${prefix}Scope`).value);
      bind(`#qt${prefix}Bold`,"change",()=>p().bold=settingsView.querySelector(`#qt${prefix}Bold`).checked);
      bind(`#qt${prefix}Highlight`,"change",()=>p().highlight=settingsView.querySelector(`#qt${prefix}Highlight`).checked);
      bind(`#qt${prefix}HighlightColor`,"input",()=>p().highlightColor=settingsView.querySelector(`#qt${prefix}HighlightColor`).value.toLowerCase());
      settingsView.querySelector(`#qtReset${prefix}`)?.addEventListener("click",()=>resetSection(kind));
    }
    bindPresentation("question","Question"); bindPresentation("answer","Answer");
    settingsView.querySelector("#qtSetAnswerMark")?.addEventListener("change",event=>{settings.dapchigi.answer.answerMark=Boolean(event.target.checked);persistSettings();syncControls();renderCurrentDapchigi();});
    settingsView.querySelector("#qtSetAnswerKeywordRed")?.addEventListener("change",event=>{settings.dapchigi.answer.keywordRed=Boolean(event.target.checked);persistSettings();syncControls();renderCurrentDapchigi();});

    const order=["small","normal","large"];
    function setScale(next){ settings.display.scale=next; persistSettings("화면 크기 저장됨"); syncControls(); applyScreenScale(); }
    for (const button of settingsView.querySelectorAll("[data-qt-scale]")) button.addEventListener("click",()=>setScale(button.dataset.qtScale));
    settingsView.querySelector("#qtScaleDown")?.addEventListener("click",()=>setScale(order[Math.max(0,order.indexOf(settings.display.scale)-1)]));
    settingsView.querySelector("#qtScaleUp")?.addEventListener("click",()=>setScale(order[Math.min(order.length-1,order.indexOf(settings.display.scale)+1)]));

    settingsView.querySelector("#qtSettingsExport")?.addEventListener("click",()=>downloadJson(exportPayload()));
    const fileInput=settingsView.querySelector("#qtSettingsFile");
    settingsView.querySelector("#qtSettingsImport")?.addEventListener("click",()=>fileInput?.click());
    fileInput?.addEventListener("change",async()=>{
      const file=fileInput.files?.[0]; fileInput.value=""; if(!file)return;
      try { const incoming=validateSettingsPayload(JSON.parse(await file.text())); if(!window.confirm("현재 환경설정을 가져온 설정으로 교체하시겠습니까?"))return; applySettings(incoming,{persist:true,render:true,message:"설정 불러오기 완료"}); }
      catch(error){ window.alert(`환경설정 불러오기 실패: ${error.message || error}`); }
    });
    settingsView.querySelector("#qtSettingsReset")?.addEventListener("click",()=>{if(!window.confirm("QTimer 환경설정을 전체 기본값으로 복원하시겠습니까? 학습기록은 삭제되지 않습니다."))return;applySettings(clone(DEFAULT_SETTINGS),{persist:true,render:true,message:"전체 기본값으로 복원됨"});});
    syncControls();
  }

  function installDapchigiSync(){
    const qSelect=document.querySelector("#dapQuestionStyle"); const aSelect=document.querySelector("#dapAnswerStyle");
    function importQuickPreset(kind,value){
      const p=settings.dapchigi[kind]; const migrated=migrateLegacyStyle(value,kind);
      p.bold=migrated.bold; p.highlight=migrated.highlight; p.emphasisScope=migrated.emphasisScope;
      if(kind === "answer" && value === "mark") p.answerMark=true;
      syncDapchigiState(); persistSettings("답치기 빠른 설정 동기화"); syncControls(); renderCurrentDapchigi();
    }
    qSelect?.addEventListener("change",()=>importQuickPreset("question",qSelect.value));
    aSelect?.addEventListener("change",()=>importQuickPreset("answer",aSelect.value));
    const observer=new MutationObserver(()=>requestAnimationFrame(()=>{applyPresentationClasses();applyAnswerKeywordColor();}));
    const answerValue=document.querySelector("#dapAnswerValue"); const choices=document.querySelector("#choices");
    if(answerValue) observer.observe(answerValue,{subtree:true,childList:true,characterData:true});
    if(choices) observer.observe(choices,{subtree:true,childList:true,characterData:true});
  }

  function boot(){
    const ready=document.querySelector(".view-tabs") && document.querySelector("#dapQuestionStyle") && document.querySelector("#dapAnswerStyle") && document.querySelector("#dapAnswerValue");
    if(!ready){setTimeout(boot,30);return;}
    settings=loadSettings();
    installStyles(); installSettingsView(); syncDapchigiState(); installDapchigiSync(); applyPresentationClasses(); applyScreenScale();
    persistSettings("환경설정 v2 준비 완료"); requestAnimationFrame(applyAnswerKeywordColor);
    globalThis.QTIMER_SETTINGS={key:SETTINGS_KEY,legacyKey:LEGACY_SETTINGS_KEY,format:SETTINGS_FORMAT,version:SETTINGS_VERSION,get:()=>clone(settings),replace:(next,options={})=>applySettings(next,options),exportPayload,validatePayload:validateSettingsPayload,applyAnswerKeywordColor,applyScreenScale};
  }
  boot();
})();