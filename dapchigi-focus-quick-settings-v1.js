// QTimer Dapchigi Focus Quick Settings v1 — immediate, reversible presentation controls inside Focus Reading.
// Question/answer controls reuse Settings v3 as the single source of truth.
// Keyword controls are focus-only presentation preferences stored separately from learning state/SOURCE BANK.
(function initDapchigiFocusQuickSettingsV1(){
  const VERSION = 1;
  const STORAGE_KEY = "qtimer-focus-quick-settings-v1";
  const FONT_VALUES = new Set(["default","gothic","serif","mono"]);
  const SIZE_VALUES = new Set(["default","16","18","20","22","24","28","32"]);
  const HIGHLIGHT_MODES = new Set(["auto","custom"]);
  const FONT_STACKS = {
    default:"inherit",
    gothic:'"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif',
    serif:'"Noto Serif KR","Nanum Myeongjo","Batang",serif',
    mono:'"D2Coding","Cascadia Mono","Consolas",monospace'
  };
  const DEFAULT_KEYWORD = Object.freeze({
    inheritQuestionFont:true,
    fontFamily:"default",
    fontSize:"default",
    fontColor:"#ffffff",
    bold:true,
    highlightMode:"auto",
    highlightColor:"#344054"
  });

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function validObject(value){ return value && typeof value === "object" && !Array.isArray(value); }
  function validHex(value,fallback){ return /^#[0-9a-f]{6}$/i.test(String(value||"")) ? String(value).toLowerCase() : fallback; }
  function normalizeKeyword(raw){
    const source = validObject(raw) ? raw : {};
    return {
      inheritQuestionFont: source.inheritQuestionFont !== false,
      fontFamily: FONT_VALUES.has(source.fontFamily) ? source.fontFamily : DEFAULT_KEYWORD.fontFamily,
      fontSize: SIZE_VALUES.has(String(source.fontSize)) ? String(source.fontSize) : DEFAULT_KEYWORD.fontSize,
      fontColor: validHex(source.fontColor,DEFAULT_KEYWORD.fontColor),
      bold: source.bold == null ? DEFAULT_KEYWORD.bold : Boolean(source.bold),
      highlightMode: HIGHLIGHT_MODES.has(source.highlightMode) ? source.highlightMode : DEFAULT_KEYWORD.highlightMode,
      highlightColor: validHex(source.highlightColor,DEFAULT_KEYWORD.highlightColor)
    };
  }
  function normalize(raw){
    const source = validObject(raw) ? raw : {};
    return {version:VERSION,keyword:normalizeKeyword(source.keyword)};
  }
  function load(){
    try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY))); }
    catch { return normalize(null); }
  }

  let prefs = load();
  let panelOpenSnapshot = null;
  let dirtySinceOpen = false;
  let statusTimer = null;

  function active(){
    return document.body.classList.contains("qt-focus-reading-v2") && state?.mode === "dapchigi";
  }
  function qtimerSettings(){
    const api = globalThis.QTIMER_SETTINGS;
    return api?.version === 3 && typeof api.get === "function" && typeof api.replace === "function" ? api : null;
  }
  function persist(message="즉시 저장됨"){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(prefs));
    setStatus(message);
  }
  function setStatus(message){
    const status = document.querySelector("#qtFocusQuickStatus");
    if (!status) return;
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(()=>{ if (status) status.textContent = "변경 즉시 저장 · 적용"; },1800);
  }
  function keywordBackground(){
    if (prefs.keyword.highlightMode === "custom") return prefs.keyword.highlightColor;
    return "color-mix(in srgb,var(--qt-q-highlight,#bfdbfe) 38%,#111827 62%)";
  }
  function applyKeyword(){
    const keyword = prefs.keyword;
    const body = document.body;
    body.style.setProperty("--qt-focus-keyword-font",keyword.inheritQuestionFont ? "var(--qt-q-font,inherit)" : (FONT_STACKS[keyword.fontFamily] || "inherit"));
    body.style.setProperty("--qt-focus-keyword-size",keyword.inheritQuestionFont ? "var(--qt-q-size,inherit)" : (keyword.fontSize === "default" ? "inherit" : `${keyword.fontSize}px`));
    body.style.setProperty("--qt-focus-keyword-color",keyword.fontColor);
    body.style.setProperty("--qt-focus-keyword-weight",keyword.bold ? "900" : "600");
    body.style.setProperty("--qt-focus-keyword-bg",keywordBackground());
    body.dataset.qtFocusKeywordHighlightMode = keyword.highlightMode;
  }
  function markDirty(){
    dirtySinceOpen = true;
    const undo = document.querySelector("#qtFocusQuickUndo");
    if (undo) undo.disabled = false;
  }
  function captureOpenSnapshot(){
    const api = qtimerSettings();
    panelOpenSnapshot = {settings:api ? api.get() : null,prefs:clone(prefs)};
    dirtySinceOpen = false;
    const undo = document.querySelector("#qtFocusQuickUndo");
    if (undo) undo.disabled = true;
  }
  function updateGlobal(kind,patch){
    const api = qtimerSettings();
    if (!api) return;
    const next = api.get();
    const presentation = next?.dapchigi?.[kind];
    if (!presentation) return;
    Object.assign(presentation,patch);
    if (Object.prototype.hasOwnProperty.call(patch,"fontColor") || Object.prototype.hasOwnProperty.call(patch,"highlightColor")) presentation.theme = "custom";
    api.replace(next,{render:true,message:`집중모드 ${kind === "question" ? "문제" : "답"} 표시 저장됨`});
    markDirty();
    requestAnimationFrame(()=>{
      globalThis.QTIMER_DAP_FOCUS_READING?.sync?.();
      syncControls();
      setStatus("즉시 저장됨");
    });
  }
  function updateKeyword(patch,message="핵심어 표시 저장됨"){
    prefs.keyword = normalizeKeyword({...prefs.keyword,...patch});
    applyKeyword();
    persist(message);
    markDirty();
    syncControls();
  }
  function restoreOpenSnapshot(){
    if (!panelOpenSnapshot || !dirtySinceOpen) return;
    const api = qtimerSettings();
    if (api && panelOpenSnapshot.settings) api.replace(panelOpenSnapshot.settings,{render:true,message:"빠른 표시 설정 되돌림"});
    prefs = normalize(panelOpenSnapshot.prefs);
    applyKeyword();
    persist("열기 전 상태로 되돌림");
    dirtySinceOpen = false;
    const undo = document.querySelector("#qtFocusQuickUndo");
    if (undo) undo.disabled = true;
    requestAnimationFrame(()=>{ globalThis.QTIMER_DAP_FOCUS_READING?.sync?.(); syncControls(); });
  }

  function fontOptions(){
    return `<option value="default">기본</option><option value="gothic">고딕</option><option value="serif">명조</option><option value="mono">모노스페이스</option>`;
  }
  function sizeOptions(){
    return `<option value="default">기본</option>${[16,18,20,22,24,28,32].map(size=>`<option value="${size}">${size}px</option>`).join("")}`;
  }
  function presentationPane(kind,label,prefix){
    return `<section class="qt-focus-quick-pane" data-qt-focus-quick-pane="${kind}" ${kind === "question" ? "" : "hidden"}>
      <div class="qt-focus-quick-pane-head"><strong>${label}</strong><small>기존 환경설정과 같은 값을 사용합니다.</small></div>
      <div class="qt-focus-quick-grid">
        <label>폰트<select id="qtFocusQuick${prefix}Font">${fontOptions()}</select></label>
        <label>크기<select id="qtFocusQuick${prefix}Size">${sizeOptions()}</select></label>
        <label>글자색<span class="qt-focus-quick-color"><input id="qtFocusQuick${prefix}Color" type="color"><output id="qtFocusQuick${prefix}ColorCode"></output></span></label>
        <label>형광펜색<span class="qt-focus-quick-color"><input id="qtFocusQuick${prefix}HighlightColor" type="color"><output id="qtFocusQuick${prefix}HighlightCode"></output></span></label>
      </div>
      <div class="qt-focus-quick-checks">
        <label><input id="qtFocusQuick${prefix}Bold" type="checkbox"> 볼드</label>
        <label><input id="qtFocusQuick${prefix}Highlight" type="checkbox"> 형광펜</label>
      </div>
    </section>`;
  }
  function keywordPane(){
    return `<section class="qt-focus-quick-pane" data-qt-focus-quick-pane="keyword" hidden>
      <div class="qt-focus-quick-pane-head"><strong>핵심어</strong><small>기본은 문제 글꼴과 형광색 계층을 따라갑니다.</small></div>
      <label class="qt-focus-quick-follow"><input id="qtFocusKeywordFollow" type="checkbox"> 문제 글꼴·크기 따라가기</label>
      <div class="qt-focus-quick-grid">
        <label>폰트<select id="qtFocusKeywordFont">${fontOptions()}</select></label>
        <label>크기<select id="qtFocusKeywordSize">${sizeOptions()}</select></label>
        <label>글자색<span class="qt-focus-quick-color"><input id="qtFocusKeywordColor" type="color"><output id="qtFocusKeywordColorCode"></output></span></label>
        <label>형광펜<select id="qtFocusKeywordHighlightMode"><option value="auto">문제색에서 자동</option><option value="custom">사용자 지정</option></select></label>
        <label class="qt-focus-keyword-color-field">형광펜색<span class="qt-focus-quick-color"><input id="qtFocusKeywordHighlightColor" type="color"><output id="qtFocusKeywordHighlightCode"></output></span></label>
      </div>
      <div class="qt-focus-quick-checks">
        <label><input id="qtFocusKeywordBold" type="checkbox"> 볼드</label>
        <button id="qtFocusKeywordReset" type="button">핵심어 자동값</button>
      </div>
    </section>`;
  }

  function installStyles(){
    if (document.querySelector("#qtFocusQuickStyles")) return;
    const style = document.createElement("style");
    style.id = "qtFocusQuickStyles";
    style.textContent = `
      .qt-focus-quick-panel[hidden]{display:none!important}
      .qt-focus-quick-panel{position:fixed;z-index:145;top:56px;right:18px;width:min(410px,calc(100vw - 28px));max-height:calc(100vh - 78px);overflow:auto;padding:14px;border:1px solid var(--qt-border,#d8dee9);border-radius:16px;background:rgba(255,255,255,.98);box-shadow:0 22px 64px rgba(16,24,40,.20);backdrop-filter:blur(14px)}
      .qt-focus-quick-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.qt-focus-quick-head h2{font-size:16px;margin:0 0 3px}.qt-focus-quick-head p{margin:0;color:#667085;font-size:12px}.qt-focus-quick-head-actions{display:flex;gap:5px}.qt-focus-quick-head-actions button{min-height:32px;padding:4px 8px;border:1px solid #d0d5dd;border-radius:8px;background:#fff;font-size:12px;font-weight:800}.qt-focus-quick-head-actions button:disabled{opacity:.45}
      .qt-focus-quick-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:12px 0}.qt-focus-quick-tabs button{min-height:38px;border:1px solid #d0d5dd;border-radius:9px;background:#f8fafc;font-weight:850}.qt-focus-quick-tabs button[aria-selected=true]{background:#172033;color:#fff;border-color:#172033}
      .qt-focus-quick-pane{display:grid;gap:10px}.qt-focus-quick-pane-head{display:grid;gap:2px}.qt-focus-quick-pane-head small{color:#667085;font-size:11px}.qt-focus-quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.qt-focus-quick-grid>label{display:grid;gap:5px;font-size:12px;font-weight:800}.qt-focus-quick-grid select,.qt-focus-quick-grid input[type=color]{min-height:36px}.qt-focus-quick-color{display:grid;grid-template-columns:50px 1fr;align-items:center;gap:7px}.qt-focus-quick-color input[type=color]{width:50px;padding:2px}.qt-focus-quick-color output{font:11px ui-monospace,SFMono-Regular,Consolas,monospace;color:#667085}.qt-focus-quick-checks{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.qt-focus-quick-checks label,.qt-focus-quick-follow{display:flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid #d0d5dd;border-radius:9px;background:#fff;font-size:12px;font-weight:800}.qt-focus-quick-checks button{min-height:34px;padding:5px 9px;border:1px solid #d0d5dd;border-radius:9px;background:#fff;font-weight:800;font-size:12px}
      .qt-focus-quick-footer{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid #eaecf0}.qt-focus-quick-footer small{color:#667085}.qt-focus-quick-footer kbd{font-size:10px;padding:2px 5px;border:1px solid #d0d5dd;border-radius:5px;background:#f8fafc}
      body.qt-focus-reading-v2 #questionText .qt-focus-keyword{font-family:var(--qt-focus-keyword-font,var(--qt-q-font,inherit))!important;font-size:var(--qt-focus-keyword-size,var(--qt-q-size,inherit))!important;color:var(--qt-focus-keyword-color,#fff)!important;font-weight:var(--qt-focus-keyword-weight,900)!important;background:var(--qt-focus-keyword-bg,color-mix(in srgb,var(--qt-q-highlight,#bfdbfe) 38%,#111827 62%))!important}
      body.qt-focus-reading-v2:not(.qt-q-highlight-on) #questionText .qt-focus-stem-mark{background:transparent!important}
      body.qt-focus-reading-v2 .qt-explain-answer{font-family:var(--qt-a-font,inherit);font-size:var(--qt-a-size,inherit);color:var(--qt-a-color,#101828)}
      body.qt-focus-reading-v2.qt-a-highlight-on .qt-explain-answer{background:var(--qt-a-highlight,#fecaca)!important}
      body.qt-focus-reading-v2:not(.qt-a-highlight-on) .qt-explain-answer{background:#fff!important}
      @media(max-width:760px){.qt-focus-quick-panel{top:48px;right:8px;width:calc(100vw - 16px);max-height:calc(100vh - 60px);padding:12px}.qt-focus-quick-grid{grid-template-columns:1fr}.qt-focus-quick-tabs{position:sticky;top:-12px;z-index:1;background:#fff;padding-top:4px}}
    `;
    document.head.appendChild(style);
  }

  function installPanel(){
    if (document.querySelector("#qtFocusQuickPanel")) return;
    const panel = document.createElement("aside");
    panel.id = "qtFocusQuickPanel";
    panel.className = "qt-focus-quick-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label","답치기 집중모드 빠른 표시 설정");
    panel.innerHTML = `<div class="qt-focus-quick-head"><div><h2>빠른 표시 설정</h2><p>문제 · 답 · 핵심어만 즉시 조절합니다.</p></div><div class="qt-focus-quick-head-actions"><button id="qtFocusQuickUndo" type="button" disabled title="패널을 열기 전 상태로 되돌리기">↶ 되돌리기</button><button id="qtFocusQuickClose" type="button" aria-label="빠른 표시 설정 닫기">✕</button></div></div>
      <div class="qt-focus-quick-tabs" role="tablist" aria-label="빠른 표시 설정 대상"><button type="button" data-qt-focus-quick-tab="question" role="tab" aria-selected="true">문제</button><button type="button" data-qt-focus-quick-tab="answer" role="tab" aria-selected="false">답</button><button type="button" data-qt-focus-quick-tab="keyword" role="tab" aria-selected="false">핵심어</button></div>
      ${presentationPane("question","문제","Question")}${presentationPane("answer","답","Answer")}${keywordPane()}
      <footer class="qt-focus-quick-footer"><small id="qtFocusQuickStatus">변경 즉시 저장 · 적용</small><span><kbd>Esc</kbd> 닫기</span></footer>`;
    document.body.appendChild(panel);

    const actions = document.querySelector(".qt-focus-context-actions");
    const configBtn = document.querySelector("#qtFocusConfigBtn");
    if (configBtn) {
      const label = configBtn.querySelector("span");
      if (label) label.textContent = "범위";
      configBtn.title = "과목·단원 범위 설정";
    }
    if (actions && !document.querySelector("#qtFocusQuickBtn")) {
      const button = document.createElement("button");
      button.id = "qtFocusQuickBtn";
      button.type = "button";
      button.setAttribute("aria-expanded","false");
      button.title = "문제·답·핵심어 빠른 표시 설정";
      button.innerHTML = "<span>표시</span> Aa";
      actions.insertBefore(button,document.querySelector("#qtFocusExitBtn"));
    }
  }

  function setActiveTab(tab){
    for (const button of document.querySelectorAll("[data-qt-focus-quick-tab]")) button.setAttribute("aria-selected",String(button.dataset.qtFocusQuickTab === tab));
    for (const pane of document.querySelectorAll("[data-qt-focus-quick-pane]")) pane.hidden = pane.dataset.qtFocusQuickPane !== tab;
  }
  function syncControls(){
    const api = qtimerSettings();
    if (!api) return;
    const settings = api.get();
    const set = (selector,value,prop="value") => { const node=document.querySelector(selector); if(node) node[prop]=value; };
    for (const [kind,prefix] of [["question","Question"],["answer","Answer"]]) {
      const presentation = settings.dapchigi[kind];
      set(`#qtFocusQuick${prefix}Font`,presentation.fontFamily);
      set(`#qtFocusQuick${prefix}Size`,presentation.fontSize);
      set(`#qtFocusQuick${prefix}Color`,presentation.fontColor);
      set(`#qtFocusQuick${prefix}HighlightColor`,presentation.highlightColor);
      set(`#qtFocusQuick${prefix}Bold`,presentation.bold,"checked");
      set(`#qtFocusQuick${prefix}Highlight`,presentation.highlight,"checked");
      const colorCode=document.querySelector(`#qtFocusQuick${prefix}ColorCode`); if(colorCode)colorCode.textContent=presentation.fontColor;
      const hCode=document.querySelector(`#qtFocusQuick${prefix}HighlightCode`); if(hCode)hCode.textContent=presentation.highlightColor;
    }
    const keyword = prefs.keyword;
    set("#qtFocusKeywordFollow",keyword.inheritQuestionFont,"checked");
    set("#qtFocusKeywordFont",keyword.fontFamily);
    set("#qtFocusKeywordSize",keyword.fontSize);
    set("#qtFocusKeywordColor",keyword.fontColor);
    set("#qtFocusKeywordHighlightMode",keyword.highlightMode);
    set("#qtFocusKeywordHighlightColor",keyword.highlightColor);
    set("#qtFocusKeywordBold",keyword.bold,"checked");
    const font=document.querySelector("#qtFocusKeywordFont"); if(font)font.disabled=keyword.inheritQuestionFont;
    const size=document.querySelector("#qtFocusKeywordSize"); if(size)size.disabled=keyword.inheritQuestionFont;
    const highlight=document.querySelector("#qtFocusKeywordHighlightColor"); if(highlight)highlight.disabled=keyword.highlightMode!=="custom";
    const colorCode=document.querySelector("#qtFocusKeywordColorCode"); if(colorCode)colorCode.textContent=keyword.fontColor;
    const hCode=document.querySelector("#qtFocusKeywordHighlightCode"); if(hCode)hCode.textContent=keyword.highlightMode === "auto" ? "자동" : keyword.highlightColor;
  }

  function openPanel(){
    if (!active()) return;
    const panel=document.querySelector("#qtFocusQuickPanel");
    if (!panel) return;
    if (document.body.classList.contains("qt-focus-config-open")) document.querySelector("#qtFocusConfigBtn")?.click();
    panel.hidden=false;
    document.body.classList.add("qt-focus-quick-open");
    document.querySelector("#qtFocusQuickBtn")?.setAttribute("aria-expanded","true");
    setActiveTab("question");
    captureOpenSnapshot();
    syncControls();
  }
  function closePanel(){
    const panel=document.querySelector("#qtFocusQuickPanel");
    if(panel) panel.hidden=true;
    document.body.classList.remove("qt-focus-quick-open");
    document.querySelector("#qtFocusQuickBtn")?.setAttribute("aria-expanded","false");
    panelOpenSnapshot=null;
    dirtySinceOpen=false;
  }
  function togglePanel(){
    const panel=document.querySelector("#qtFocusQuickPanel");
    if (!panel || panel.hidden) openPanel(); else closePanel();
  }

  function bindPresentation(kind,prefix){
    const select = (id,key)=>document.querySelector(id)?.addEventListener("change",event=>updateGlobal(kind,{[key]:event.target.value}));
    const check = (id,key)=>document.querySelector(id)?.addEventListener("change",event=>updateGlobal(kind,{[key]:Boolean(event.target.checked)}));
    const color = (id,key)=>document.querySelector(id)?.addEventListener("input",event=>updateGlobal(kind,{[key]:event.target.value.toLowerCase()}));
    select(`#qtFocusQuick${prefix}Font`,"fontFamily");
    select(`#qtFocusQuick${prefix}Size`,"fontSize");
    color(`#qtFocusQuick${prefix}Color`,"fontColor");
    color(`#qtFocusQuick${prefix}HighlightColor`,"highlightColor");
    check(`#qtFocusQuick${prefix}Bold`,"bold");
    check(`#qtFocusQuick${prefix}Highlight`,"highlight");
  }
  function bindEvents(){
    document.querySelector("#qtFocusQuickBtn")?.addEventListener("click",togglePanel);
    document.querySelector("#qtFocusQuickClose")?.addEventListener("click",closePanel);
    document.querySelector("#qtFocusQuickUndo")?.addEventListener("click",restoreOpenSnapshot);
    document.querySelector("#qtFocusConfigBtn")?.addEventListener("click",()=>{ if(!document.querySelector("#qtFocusQuickPanel")?.hidden) closePanel(); });
    document.querySelector("#qtFocusExitBtn")?.addEventListener("click",closePanel);
    document.querySelector("#dashboardTab")?.addEventListener("click",closePanel);
    document.querySelector("#studyTab")?.addEventListener("click",closePanel);
    for (const button of document.querySelectorAll("[data-qt-focus-quick-tab]")) button.addEventListener("click",()=>setActiveTab(button.dataset.qtFocusQuickTab));
    bindPresentation("question","Question");
    bindPresentation("answer","Answer");
    document.querySelector("#qtFocusKeywordFollow")?.addEventListener("change",event=>updateKeyword({inheritQuestionFont:Boolean(event.target.checked)}));
    document.querySelector("#qtFocusKeywordFont")?.addEventListener("change",event=>updateKeyword({fontFamily:event.target.value}));
    document.querySelector("#qtFocusKeywordSize")?.addEventListener("change",event=>updateKeyword({fontSize:event.target.value}));
    document.querySelector("#qtFocusKeywordColor")?.addEventListener("input",event=>updateKeyword({fontColor:event.target.value.toLowerCase()}));
    document.querySelector("#qtFocusKeywordHighlightMode")?.addEventListener("change",event=>updateKeyword({highlightMode:event.target.value}));
    document.querySelector("#qtFocusKeywordHighlightColor")?.addEventListener("input",event=>updateKeyword({highlightColor:event.target.value.toLowerCase()}));
    document.querySelector("#qtFocusKeywordBold")?.addEventListener("change",event=>updateKeyword({bold:Boolean(event.target.checked)}));
    document.querySelector("#qtFocusKeywordReset")?.addEventListener("click",()=>{ prefs.keyword=clone(DEFAULT_KEYWORD); applyKeyword(); persist("핵심어 자동값 복원"); markDirty(); syncControls(); });

    // Window capture runs before Focus Reading's document-level Escape handler, so Esc closes this panel without leaving the study session.
    window.addEventListener("keydown",event=>{
      if (event.key !== "Escape" || document.querySelector("#qtFocusQuickPanel")?.hidden) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      closePanel();
    },true);

    new MutationObserver(()=>{
      if (!active() && !document.querySelector("#qtFocusQuickPanel")?.hidden) closePanel();
    }).observe(document.body,{attributes:true,attributeFilter:["class"]});
  }

  function boot(){
    if (!globalThis.QTIMER_DAP_FOCUS_READING || !qtimerSettings() || !document.querySelector(".qt-focus-context-actions")) {
      setTimeout(boot,60);
      return;
    }
    if (document.querySelector("#qtFocusQuickPanel")) return;
    installStyles();
    installPanel();
    applyKeyword();
    syncControls();
    bindEvents();
    globalThis.QTIMER_FOCUS_QUICK_SETTINGS = Object.freeze({
      version:VERSION,
      key:STORAGE_KEY,
      get:()=>clone(prefs),
      replace:(next)=>{ prefs=normalize(next); applyKeyword(); persist("집중모드 빠른 표시 설정 교체"); syncControls(); return clone(prefs); },
      resetKeyword:()=>{ prefs.keyword=clone(DEFAULT_KEYWORD); applyKeyword(); persist("핵심어 자동값 복원"); syncControls(); return clone(prefs); }
    });
  }

  boot();
})();