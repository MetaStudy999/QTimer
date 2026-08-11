// QTimer Settings v3 — learning color themes + ten-step screen scale.
// This layer intentionally builds on Settings v2 so typography rendering stays stable.
(function initQTimerSettingsV3(){
  const base = globalThis.QTIMER_SETTINGS;
  if (!base || base.version !== 2) return;

  const SETTINGS_KEY = base.key || "qtimer-settings-v2";
  const SETTINGS_FORMAT = "qtimer-settings";
  const SETTINGS_VERSION = 3;
  const SCALE_STEPS = [0.80,0.85,0.90,0.95,1.00,1.05,1.10,1.15,1.20,1.25];
  const DEFAULT_SCALE_LEVEL = 5;

  const QUESTION_THEMES = Object.freeze([
    {id:"focus-blue",name:"집중 블루",description:"차분한 청색 대비",fontColor:"#16324f",highlightColor:"#dceeff"},
    {id:"calm-mint",name:"안정 민트",description:"장시간 읽기용 저자극",fontColor:"#143d36",highlightColor:"#ddf5ec"},
    {id:"memory-yellow",name:"기억 옐로우",description:"핵심 문장 재인 강화",fontColor:"#3a3218",highlightColor:"#fff1a8"},
    {id:"soft-lavender",name:"저자극 라벤더",description:"시각적 구역 구분",fontColor:"#332a55",highlightColor:"#eae4ff"},
    {id:"contrast-gray",name:"고대비 그레이",description:"명확한 문자 대비",fontColor:"#111827",highlightColor:"#e5e7eb"}
  ]);

  const ANSWER_THEMES = Object.freeze([
    {id:"answer-coral",name:"정답 코랄",description:"정답 영역을 부드럽게 분리",fontColor:"#7a241f",highlightColor:"#ffe0dc"},
    {id:"key-red",name:"핵심 레드",description:"정답 핵심의 빠른 인지",fontColor:"#991b1b",highlightColor:"#fee2e2"},
    {id:"confirm-amber",name:"확인 앰버",description:"검토·확인 단계 강조",fontColor:"#78350f",highlightColor:"#fef3c7"},
    {id:"stable-green",name:"안정 그린",description:"정답 확인의 안정적 대비",fontColor:"#14532d",highlightColor:"#dcfce7"},
    {id:"contrast-navy",name:"고대비 네이비",description:"강한 대비와 가독성",fontColor:"#172554",highlightColor:"#dbeafe"}
  ]);

  const THEME_IDS = new Set(["custom",...QUESTION_THEMES.map(x=>x.id),...ANSWER_THEMES.map(x=>x.id)]);
  const FONT_VALUES = new Set(["default","gothic","serif","mono"]);
  const SIZE_VALUES = new Set(["default","16","18","20","22","24","28","32"]);
  const SCOPE_VALUES = new Set(["all","keyword"]);
  const FONT_STACKS = {
    default:"inherit",
    gothic:'"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif',
    serif:'"Noto Serif KR","Nanum Myeongjo","Batang",serif',
    mono:'"D2Coding","Cascadia Mono","Consolas",monospace'
  };

  let settings = null;
  let statusTimer = null;

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function validObject(value){ return value && typeof value === "object" && !Array.isArray(value); }
  function validHex(value,fallback){ return /^#[0-9a-f]{6}$/i.test(String(value||"")) ? String(value).toLowerCase() : fallback; }
  function clampLevel(value){ return Math.max(1,Math.min(10,Number.parseInt(value,10)||DEFAULT_SCALE_LEVEL)); }
  function cssFont(value){ return FONT_STACKS[value] || "inherit"; }

  function inferTheme(kind,presentation){
    const themes = kind === "question" ? QUESTION_THEMES : ANSWER_THEMES;
    const hit = themes.find(theme => theme.fontColor === presentation.fontColor && theme.highlightColor === presentation.highlightColor);
    return hit?.id || "custom";
  }

  function normalizePresentation(raw,kind,fallback){
    const source=validObject(raw)?raw:{};
    const result={
      fontFamily:FONT_VALUES.has(source.fontFamily)?source.fontFamily:(fallback?.fontFamily||"default"),
      fontSize:SIZE_VALUES.has(String(source.fontSize))?String(source.fontSize):String(fallback?.fontSize||"default"),
      fontColor:validHex(source.fontColor,fallback?.fontColor || "#101828"),
      bold:source.bold == null ? Boolean(fallback?.bold) : Boolean(source.bold),
      highlight:source.highlight == null ? Boolean(fallback?.highlight) : Boolean(source.highlight),
      highlightColor:validHex(source.highlightColor,fallback?.highlightColor || (kind === "question" ? "#bfdbfe" : "#fecaca")),
      emphasisScope:SCOPE_VALUES.has(source.emphasisScope)?source.emphasisScope:(fallback?.emphasisScope||"all")
    };
    if(kind === "answer"){
      result.answerMark=source.answerMark == null ? Boolean(fallback?.answerMark) : Boolean(source.answerMark);
      result.keywordRed=source.keywordRed == null ? fallback?.keywordRed !== false : source.keywordRed !== false;
    }
    result.theme=THEME_IDS.has(source.theme)?source.theme:inferTheme(kind,result);
    return result;
  }

  function migrateBase(raw){
    let legacy=raw;
    if(validObject(raw) && Number(raw.version) <= 2){
      try{ legacy=base.validatePayload({format:SETTINGS_FORMAT,version:Number(raw.version)||2,settings:raw}); }
      catch{ legacy=base.get(); }
    }
    const baseSettings=validObject(legacy) ? legacy : base.get();
    const qBase=baseSettings?.dapchigi?.question || base.get().dapchigi.question;
    const aBase=baseSettings?.dapchigi?.answer || base.get().dapchigi.answer;
    const display=validObject(baseSettings?.display)?baseSettings.display:{};
    let level=DEFAULT_SCALE_LEVEL;
    if(Number.isInteger(Number(display.scaleLevel))) level=clampLevel(display.scaleLevel);
    else if(display.scale === "small") level=3;
    else if(display.scale === "large") level=7;
    return {
      version:SETTINGS_VERSION,
      dapchigi:{
        question:normalizePresentation(baseSettings?.dapchigi?.question,"question",qBase),
        answer:normalizePresentation(baseSettings?.dapchigi?.answer,"answer",aBase)
      },
      display:{scaleLevel:level},
      updatedAt:typeof baseSettings?.updatedAt === "string" ? baseSettings.updatedAt : null
    };
  }

  function normalizeSettings(raw){
    const source=validObject(raw)?raw:{};
    if(Number(source.version) < 3 || !validObject(source.dapchigi?.question) || !validObject(source.dapchigi?.answer)) return migrateBase(source);
    const currentBase=base.get();
    return {
      version:SETTINGS_VERSION,
      dapchigi:{
        question:normalizePresentation(source.dapchigi.question,"question",currentBase.dapchigi.question),
        answer:normalizePresentation(source.dapchigi.answer,"answer",currentBase.dapchigi.answer)
      },
      display:{scaleLevel:clampLevel(source.display?.scaleLevel)},
      updatedAt:typeof source.updatedAt === "string" ? source.updatedAt : null
    };
  }

  function loadSettings(){
    const bootstrap=globalThis.__QTIMER_SETTINGS_V3_BOOTSTRAP_RAW;
    if(typeof bootstrap === "string"){
      try{ const parsed=JSON.parse(bootstrap); if(validObject(parsed)) return normalizeSettings(parsed); }catch{}
    }
    try{ const parsed=JSON.parse(localStorage.getItem(SETTINGS_KEY)); if(validObject(parsed)) return normalizeSettings(parsed); }catch{}
    return migrateBase(base.get());
  }

  function toBaseSettings(){
    const q=clone(settings.dapchigi.question); const a=clone(settings.dapchigi.answer);
    delete q.theme; delete a.theme;
    return {version:2,dapchigi:{question:q,answer:a},display:{scale:"normal"},updatedAt:settings.updatedAt};
  }

  function setStatus(message){
    const node=document.querySelector("#qtimerSettingsStatus");
    if(!node)return;
    node.textContent=message;
    clearTimeout(statusTimer);
    statusTimer=setTimeout(()=>{if(node)node.textContent="변경 즉시 자동 저장됩니다.";},2400);
  }

  function persist(message="자동 저장됨"){
    settings.updatedAt=new Date().toISOString();
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));
    setStatus(message);
  }

  function applyScale(){
    const level=clampLevel(settings.display.scaleLevel);
    const numeric=SCALE_STEPS[level-1];
    document.body.dataset.qtimerScaleLevel=String(level);
    document.body.dataset.qtimerScalePercent=String(Math.round(numeric*100));
    if("zoom" in document.body.style){
      if(Math.abs((Number.parseFloat(document.body.style.zoom)||1)-numeric)>.001) document.body.style.zoom=String(numeric);
      document.body.style.transform=""; document.body.style.transformOrigin=""; document.body.style.width="";
    }else{
      document.body.style.zoom="";
      document.body.style.transform=`scale(${numeric})`; document.body.style.transformOrigin="top left"; document.body.style.width=`${100/numeric}%`;
    }
  }

  function applyToBase({render=true}={}){
    base.replace(toBaseSettings(),{persist:false,render});
    applyScale();
  }

  function themeList(kind){ return kind === "question" ? QUESTION_THEMES : ANSWER_THEMES; }

  function applyTheme(kind,themeId){
    const theme=themeList(kind).find(x=>x.id===themeId);
    if(!theme)return;
    const p=settings.dapchigi[kind];
    p.theme=theme.id; p.fontColor=theme.fontColor; p.highlightColor=theme.highlightColor; p.highlight=true;
    applyToBase(); syncControls(); persist(`${kind === "question" ? "문제" : "답"} 테마: ${theme.name}`);
  }

  function markCustom(kind){ settings.dapchigi[kind].theme=inferTheme(kind,settings.dapchigi[kind]); }

  function previewStyle(kind){
    const p=settings.dapchigi[kind];
    const prefix=kind === "question"?"Question":"Answer";
    const preview=document.querySelector(`#qt${prefix}Preview`);
    if(!preview)return;
    preview.style.fontFamily=cssFont(p.fontFamily);
    preview.style.fontSize=p.fontSize === "default" ? "" : `${p.fontSize}px`;
    preview.style.color=p.fontColor;
    preview.style.fontWeight=p.bold && p.emphasisScope === "all" ? "900" : "400";
    preview.style.background=p.highlight && p.emphasisScope === "all" ? p.highlightColor : "transparent";
    const keyword=preview.querySelector("[data-preview-keyword]");
    if(keyword){
      keyword.style.fontWeight=p.bold && p.emphasisScope === "keyword" ? "900" : "inherit";
      keyword.style.background=p.highlight && p.emphasisScope === "keyword" ? p.highlightColor : "transparent";
      keyword.style.color=kind === "answer" && p.keywordRed ? "#d92d20" : "inherit";
    }
  }

  function themeCards(kind){
    return themeList(kind).map(theme=>`<button type="button" class="qt-theme-card" data-qt-theme-kind="${kind}" data-qt-theme="${theme.id}" aria-pressed="false"><span class="qt-theme-swatches"><i style="background:${theme.fontColor}"></i><i style="background:${theme.highlightColor}"></i></span><span><strong>${theme.name}</strong><small>${theme.description}</small></span></button>`).join("");
  }

  function presentationFields(kind,label){
    const prefix=kind === "question"?"Question":"Answer";
    const extras=kind === "answer"?`<div class="qt-extra-options"><label class="qt-toggle"><input id="qtSetAnswerMark" type="checkbox"><span><strong>답 마킹</strong><small>정답 선택지 위치를 테두리로 표시</small></span></label><label class="qt-toggle"><input id="qtSetAnswerKeywordRed" type="checkbox"><span><strong class="qt-settings-danger">답 핵심어 빨간색 + 볼드</strong><small>정답 핵심개념만 빨간색으로 추가 강조</small></span></label></div>`:"";
    return `<section class="qt-settings-card" data-settings-kind="${kind}"><div class="qt-card-title"><div><h3>${label}</h3><p class="qt-settings-note">테마로 빠르게 선택한 뒤 아래에서 세부 조정할 수 있습니다.</p></div><button id="qtReset${prefix}" type="button">기본</button></div><div class="qt-theme-head"><strong>학습 색상 테마</strong><span id="qt${prefix}ThemeState">사용자 지정</span></div><div class="qt-theme-grid" role="group" aria-label="${label} 색상 테마">${themeCards(kind)}</div><div class="qt-field-grid"><label class="qt-field">폰트<select id="qt${prefix}Font"><option value="default">기본</option><option value="gothic">고딕</option><option value="serif">명조</option><option value="mono">모노스페이스</option></select></label><label class="qt-field">폰트 크기<select id="qt${prefix}Size"><option value="default">기본</option>${[16,18,20,22,24,28,32].map(n=>`<option value="${n}">${n}px</option>`).join("")}</select></label><label class="qt-field">폰트 색상<div class="qt-color-row"><input id="qt${prefix}Color" type="color"><output id="qt${prefix}ColorCode"></output></div></label><label class="qt-field">강조 범위<select id="qt${prefix}Scope"><option value="all">전체</option><option value="keyword">핵심어</option></select></label><label class="qt-toggle"><input id="qt${prefix}Bold" type="checkbox"><span><strong>볼드</strong><small>선택 범위를 굵게 표시</small></span></label><label class="qt-toggle"><input id="qt${prefix}Highlight" type="checkbox"><span><strong>형광펜</strong><small>선택 범위에 배경 강조</small></span></label><label class="qt-field">형광펜 색상<div class="qt-color-row"><input id="qt${prefix}HighlightColor" type="color"><output id="qt${prefix}HighlightCode"></output></div></label></div>${extras}<div class="qt-preview-wrap"><span>실시간 미리보기</span><div id="qt${prefix}Preview" class="qt-preview">${kind === "question"?'문제 미리보기: 다음 중 <b data-preview-keyword>옳지 않은 것</b>은?':'정답 미리보기: <b data-preview-keyword>미들웨어</b>'}</div></div></section>`;
  }

  function installStyles(){
    if(document.querySelector("#qtimerSettingsV3Styles"))return;
    const style=document.createElement("style"); style.id="qtimerSettingsV3Styles";
    style.textContent=`.qt-settings-view{padding:20px 24px 32px;background:#f7f9fc;min-height:calc(100vh - 90px)}.qt-settings-shell{max-width:1240px;margin:0 auto;display:grid;gap:14px}.qt-settings-hero,.qt-settings-card{background:var(--panel,#fff);border:1px solid var(--border,#d8dee9);border-radius:14px;padding:20px}.qt-settings-hero{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.qt-settings-hero h2{margin:3px 0 6px}.qt-settings-hero p{margin:0;color:var(--muted,#667085)}.qt-settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.qt-card-title{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.qt-settings-card h3{margin:0 0 6px}.qt-settings-note{margin:0;color:var(--muted,#667085);font-size:.9rem}.qt-theme-head{display:flex;justify-content:space-between;align-items:center;margin-top:15px;margin-bottom:8px}.qt-theme-head span{font-size:.78rem;color:var(--muted,#667085);font-weight:700}.qt-theme-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}.qt-theme-card{display:grid;gap:7px;text-align:left;padding:9px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:#fff;min-width:0}.qt-theme-card[aria-pressed=true]{outline:2px solid #344054;outline-offset:1px}.qt-theme-card span:last-child{display:grid;gap:2px}.qt-theme-card small{font-size:.69rem;color:var(--muted,#667085);line-height:1.25}.qt-theme-swatches{display:flex;height:8px;border-radius:999px;overflow:hidden}.qt-theme-swatches i{flex:1}.qt-field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:15px}.qt-field{display:grid;gap:6px;font-size:.86rem;font-weight:750}.qt-field select,.qt-field input[type=color]{min-height:38px}.qt-color-row{display:flex;gap:8px;align-items:center}.qt-color-row input[type=color]{width:56px;padding:2px}.qt-color-row output{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.78rem;color:var(--muted,#667085)}.qt-toggle{display:flex;gap:10px;align-items:flex-start;padding:10px 11px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:#fff;cursor:pointer}.qt-toggle input{margin-top:3px;width:17px;height:17px}.qt-toggle span{display:grid;gap:2px}.qt-toggle small{color:var(--muted,#667085)}.qt-extra-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.qt-preview-wrap{margin-top:14px;padding:12px;border:1px dashed var(--border,#d8dee9);border-radius:10px;background:#fafbfc}.qt-preview-wrap>span{display:block;color:var(--muted,#667085);font-size:.76rem;margin-bottom:8px}.qt-preview{display:inline;line-height:1.65;padding:.08em .15em;border-radius:.2em}.qt-preview b{font-weight:inherit}.qt-scale-shell{display:grid;gap:10px;margin-top:14px}.qt-scale-control{display:grid;grid-template-columns:44px 1fr 44px;gap:10px;align-items:center}.qt-scale-control button{min-height:42px;font-size:1.15rem}.qt-scale-control input[type=range]{width:100%}.qt-scale-meta{display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap}.qt-scale-value{font-weight:900;min-width:120px;text-align:center}.qt-scale-ticks{display:flex;justify-content:space-between;font-size:.7rem;color:var(--muted,#667085);padding:0 54px}.qt-settings-actions{display:flex;gap:8px;flex-wrap:wrap}.qt-settings-status{font-size:.9rem;color:var(--muted,#667085);font-weight:700}.qt-settings-danger{color:#b42318}@media(max-width:980px){.qt-theme-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.qt-settings-view{padding:12px}.qt-settings-grid{grid-template-columns:1fr}.qt-field-grid,.qt-extra-options{grid-template-columns:1fr}.qt-settings-hero{flex-direction:column}.qt-theme-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(style);
  }

  function removeV2View(){ document.querySelector("#settingsTab")?.remove(); document.querySelector("#settingsView")?.remove(); }

  function syncControls(){
    for(const [kind,prefix] of [["question","Question"],["answer","Answer"]]){
      const p=settings.dapchigi[kind]; const set=(id,value,prop="value")=>{const el=document.querySelector(id);if(el)el[prop]=value;};
      set(`#qt${prefix}Font`,p.fontFamily); set(`#qt${prefix}Size`,p.fontSize); set(`#qt${prefix}Color`,p.fontColor); set(`#qt${prefix}Scope`,p.emphasisScope); set(`#qt${prefix}Bold`,p.bold,"checked"); set(`#qt${prefix}Highlight`,p.highlight,"checked"); set(`#qt${prefix}HighlightColor`,p.highlightColor);
      const code=document.querySelector(`#qt${prefix}ColorCode`); if(code)code.textContent=p.fontColor; const hcode=document.querySelector(`#qt${prefix}HighlightCode`); if(hcode)hcode.textContent=p.highlightColor;
      const themeState=document.querySelector(`#qt${prefix}ThemeState`); const theme=themeList(kind).find(x=>x.id===p.theme); if(themeState)themeState.textContent=theme?.name || "사용자 지정";
      for(const button of document.querySelectorAll(`[data-qt-theme-kind="${kind}"]`)) button.setAttribute("aria-pressed",String(button.dataset.qtTheme===p.theme));
      previewStyle(kind);
    }
    const mark=document.querySelector("#qtSetAnswerMark"); if(mark)mark.checked=settings.dapchigi.answer.answerMark; const red=document.querySelector("#qtSetAnswerKeywordRed"); if(red)red.checked=settings.dapchigi.answer.keywordRed;
    const slider=document.querySelector("#qtScaleRange"); if(slider)slider.value=String(settings.display.scaleLevel); const percent=Math.round(SCALE_STEPS[settings.display.scaleLevel-1]*100); const label=document.querySelector("#qtScaleValue"); if(label)label.textContent=`${settings.display.scaleLevel}단계 · ${percent}%`;
  }

  function resetSection(kind){
    const baseDefaults=base.validatePayload({format:SETTINGS_FORMAT,version:2,settings:{version:2,dapchigi:{question:{fontFamily:"default",fontSize:"default",fontColor:"#101828",bold:false,highlight:false,highlightColor:"#bfdbfe",emphasisScope:"all"},answer:{fontFamily:"default",fontSize:"default",fontColor:"#101828",bold:false,highlight:false,highlightColor:"#fecaca",emphasisScope:"all",answerMark:false,keywordRed:true}},display:{scale:"normal"}}});
    settings.dapchigi[kind]=normalizePresentation(baseDefaults.dapchigi[kind],kind,baseDefaults.dapchigi[kind]); settings.dapchigi[kind].theme="custom";
    applyToBase(); syncControls(); persist(`${kind === "question" ? "문제" : "답"} 표시 기본값 복원`);
  }

  function installView(){
    removeV2View();
    const tabs=document.querySelector(".view-tabs"); const studyTab=document.querySelector("#studyTab"); const dapchigiTab=document.querySelector("#dapchigiTab"); if(!tabs||!studyTab)return;
    const settingsTab=document.createElement("button"); settingsTab.id="settingsTab"; settingsTab.type="button"; settingsTab.textContent="환경설정"; (dapchigiTab||studyTab).insertAdjacentElement("afterend",settingsTab);
    const view=document.createElement("main"); view.id="settingsView"; view.className="qt-settings-view"; view.hidden=true;
    view.innerHTML=`<div class="qt-settings-shell"><section class="qt-settings-hero"><div><p class="eyebrow">QTimer Preferences v3</p><h2>환경설정</h2><p>학습 색상 테마와 세부 표시 설정을 조합합니다. 변경 내용은 즉시 자동 저장됩니다.</p></div><span id="qtimerSettingsStatus" class="qt-settings-status">변경 즉시 자동 저장됩니다.</span></section><div class="qt-settings-grid">${presentationFields("question","문제 표시")}${presentationFields("answer","답 표시")}</div><section class="qt-settings-card"><h3>화면 크기 조절 · 10단계</h3><p class="qt-settings-note">80%부터 125%까지 5% 간격으로 조절합니다. 5단계가 기본 100%입니다.</p><div class="qt-scale-shell"><div class="qt-scale-control"><button id="qtScaleDown" type="button" aria-label="한 단계 작게">&lt;</button><input id="qtScaleRange" type="range" min="1" max="10" step="1" value="5" aria-label="화면 크기 10단계"><button id="qtScaleUp" type="button" aria-label="한 단계 크게">&gt;</button></div><div class="qt-scale-ticks"><span>1 · 80%</span><span>5 · 100%</span><span>10 · 125%</span></div><div class="qt-scale-meta"><span id="qtScaleValue" class="qt-scale-value">5단계 · 100%</span><button id="qtScaleDefault" type="button">기본 100%</button></div></div></section><section class="qt-settings-card"><h3>설정 저장 · 불러오기</h3><p class="qt-settings-note">자동 저장 외에 설정만 JSON 파일로 보관·이동할 수 있습니다.</p><div class="qt-settings-actions"><button id="qtSettingsExport" type="button">설정 파일 저장</button><button id="qtSettingsImport" type="button">설정 파일 불러오기</button><button id="qtSettingsReset" type="button">전체 기본값 복원</button><input id="qtSettingsFile" type="file" accept="application/json,.json" hidden></div></section></div>`;
    const dashboardView=document.querySelector("#dashboardView"); const studyView=document.querySelector("#studyView"); (dashboardView||studyView||document.body.lastElementChild)?.insertAdjacentElement("afterend",view);
    function clear(){view.hidden=true;settingsTab.classList.remove("active");} function show(){if(typeof stopTimer==="function")stopTimer();if(dashboardView)dashboardView.hidden=true;if(studyView)studyView.hidden=true;view.hidden=false;["#dashboardTab","#studyTab","#dapchigiTab"].forEach(id=>document.querySelector(id)?.classList.remove("active"));settingsTab.classList.add("active");syncControls();}
    settingsTab.addEventListener("click",show); ["#dashboardTab","#studyTab","#dapchigiTab"].forEach(id=>document.querySelector(id)?.addEventListener("click",clear));

    for(const button of view.querySelectorAll("[data-qt-theme]")) button.addEventListener("click",()=>applyTheme(button.dataset.qtThemeKind,button.dataset.qtTheme));
    function bind(kind,prefix){
      const p=()=>settings.dapchigi[kind]; const wire=(selector,event,fn,{themeSensitive=false}={})=>view.querySelector(selector)?.addEventListener(event,()=>{fn();if(themeSensitive)markCustom(kind);applyToBase();syncControls();persist();});
      wire(`#qt${prefix}Font`,"change",()=>p().fontFamily=view.querySelector(`#qt${prefix}Font`).value); wire(`#qt${prefix}Size`,"change",()=>p().fontSize=view.querySelector(`#qt${prefix}Size`).value);
      wire(`#qt${prefix}Color`,"input",()=>p().fontColor=view.querySelector(`#qt${prefix}Color`).value.toLowerCase(),{themeSensitive:true}); wire(`#qt${prefix}Scope`,"change",()=>p().emphasisScope=view.querySelector(`#qt${prefix}Scope`).value); wire(`#qt${prefix}Bold`,"change",()=>p().bold=view.querySelector(`#qt${prefix}Bold`).checked); wire(`#qt${prefix}Highlight`,"change",()=>p().highlight=view.querySelector(`#qt${prefix}Highlight`).checked); wire(`#qt${prefix}HighlightColor`,"input",()=>p().highlightColor=view.querySelector(`#qt${prefix}HighlightColor`).value.toLowerCase(),{themeSensitive:true}); view.querySelector(`#qtReset${prefix}`)?.addEventListener("click",()=>resetSection(kind));
    }
    bind("question","Question"); bind("answer","Answer");
    view.querySelector("#qtSetAnswerMark")?.addEventListener("change",event=>{settings.dapchigi.answer.answerMark=Boolean(event.target.checked);applyToBase();syncControls();persist();}); view.querySelector("#qtSetAnswerKeywordRed")?.addEventListener("change",event=>{settings.dapchigi.answer.keywordRed=Boolean(event.target.checked);applyToBase();syncControls();persist();});
    function setLevel(level){settings.display.scaleLevel=clampLevel(level);applyScale();syncControls();persist("화면 크기 저장됨");}
    view.querySelector("#qtScaleRange")?.addEventListener("input",event=>setLevel(event.target.value)); view.querySelector("#qtScaleDown")?.addEventListener("click",()=>setLevel(settings.display.scaleLevel-1)); view.querySelector("#qtScaleUp")?.addEventListener("click",()=>setLevel(settings.display.scaleLevel+1)); view.querySelector("#qtScaleDefault")?.addEventListener("click",()=>setLevel(DEFAULT_SCALE_LEVEL));
    function exportPayload(){return{format:SETTINGS_FORMAT,version:SETTINGS_VERSION,exportedAt:new Date().toISOString(),settings:clone(settings)};} function downloadJson(payload){const stamp=new Date().toISOString().replace(/[:.]/g,"-");const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`qtimer-settings-${stamp}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);}
    view.querySelector("#qtSettingsExport")?.addEventListener("click",()=>downloadJson(exportPayload())); const fileInput=view.querySelector("#qtSettingsFile"); view.querySelector("#qtSettingsImport")?.addEventListener("click",()=>fileInput?.click()); fileInput?.addEventListener("change",async()=>{const file=fileInput.files?.[0];fileInput.value="";if(!file)return;try{const payload=JSON.parse(await file.text());const incoming=validatePayload(payload);if(!window.confirm("현재 환경설정을 가져온 설정으로 교체하시겠습니까?"))return;replaceSettings(incoming,{message:"설정 불러오기 완료"});}catch(error){window.alert(`환경설정 불러오기 실패: ${error.message||error}`);}});
    view.querySelector("#qtSettingsReset")?.addEventListener("click",()=>{if(!window.confirm("QTimer 환경설정을 전체 기본값으로 복원하시겠습니까? 학습기록은 삭제되지 않습니다."))return;const migrated=migrateBase(base.validatePayload({format:SETTINGS_FORMAT,version:2,settings:{version:2,dapchigi:{question:{fontFamily:"default",fontSize:"default",fontColor:"#101828",bold:false,highlight:false,highlightColor:"#bfdbfe",emphasisScope:"all"},answer:{fontFamily:"default",fontSize:"default",fontColor:"#101828",bold:false,highlight:false,highlightColor:"#fecaca",emphasisScope:"all",answerMark:false,keywordRed:true}},display:{scale:"normal"}}}));migrated.display.scaleLevel=DEFAULT_SCALE_LEVEL;replaceSettings(migrated,{message:"전체 기본값으로 복원됨"});}); syncControls();
  }

  function validatePayload(payload){
    if(!validObject(payload)||payload.format!==SETTINGS_FORMAT||![1,2,3].includes(Number(payload.version))||!validObject(payload.settings))throw new Error("QTimer 환경설정 파일 형식이 아닙니다.");
    if(Number(payload.version)===3)return normalizeSettings(payload.settings);
    const migrated=base.validatePayload(payload); return migrateBase(migrated);
  }

  function replaceSettings(next,{persist:truePersist=true,message="자동 저장됨",render=true}={}){
    settings=normalizeSettings(next); applyToBase({render}); syncControls(); if(persist:truePersist)persist(message); return clone(settings);
  }

  function installQuickSync(){
    for(const [kind,id] of [["question","#dapQuestionStyle"],["answer","#dapAnswerStyle"]]) document.querySelector(id)?.addEventListener("change",()=>setTimeout(()=>{const fromBase=base.get().dapchigi[kind];settings.dapchigi[kind]=normalizePresentation({...settings.dapchigi[kind],...fromBase},kind,settings.dapchigi[kind]);settings.dapchigi[kind].theme=inferTheme(kind,settings.dapchigi[kind]);persist("답치기 빠른 설정 동기화");syncControls();applyScale();},0));
    const observer=new MutationObserver(()=>applyScale()); observer.observe(document.body,{attributes:true,attributeFilter:["style"]});
  }

  settings=loadSettings();
  installStyles();
  applyToBase({render:false});
  removeV2View();
  installView();
  applyScale();
  persist("환경설정 v3 준비 완료");
  installQuickSync();

  function exportPayload(){return{format:SETTINGS_FORMAT,version:SETTINGS_VERSION,exportedAt:new Date().toISOString(),settings:clone(settings)};}
  globalThis.QTIMER_SETTINGS={
    key:SETTINGS_KEY,legacyKey:base.legacyKey,format:SETTINGS_FORMAT,version:SETTINGS_VERSION,
    get:()=>clone(settings),replace:(next,options={})=>replaceSettings(next,options),exportPayload,validatePayload,
    applyAnswerKeywordColor:()=>base.applyAnswerKeywordColor(),applyScreenScale:applyScale,
    themes:{question:clone(QUESTION_THEMES),answer:clone(ANSWER_THEMES)},scaleSteps:[...SCALE_STEPS]
  };
})();