// QTimer settings v1 — portable, auto-saved presentation preferences.
// Learning attempts and verified SOURCE BANK data remain separate from UI preferences.
(function initQTimerSettingsV1(){
  const SETTINGS_KEY = "qtimer-settings-v1";
  const SETTINGS_FORMAT = "qtimer-settings";
  const SETTINGS_VERSION = 1;
  const STYLE_VALUES = new Set(["normal","all-bold","keyword-bold","all-highlight","keyword-highlight"]);
  const ANSWER_STYLE_VALUES = new Set([...STYLE_VALUES,"mark"]);
  const STOPWORDS = new Set(["대한","설명","것은","있는","없는","가장","다음","해당","의미","사용","경우","위한","으로","에서","하고","하는","한다","아니다","정답","문제"]);

  const DEFAULT_SETTINGS = Object.freeze({
    version: SETTINGS_VERSION,
    dapchigi: {
      questionStyle: "normal",
      answerStyle: "normal",
      answerKeywordRed: true
    }
  });

  let settings = null;
  let statusTimer = null;

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function validObject(value){ return value && typeof value === "object" && !Array.isArray(value); }
  function escapeRegExp(value){ return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }

  function normalizeSettings(raw){
    const source = validObject(raw) ? raw : {};
    const dap = validObject(source.dapchigi) ? source.dapchigi : {};
    return {
      version: SETTINGS_VERSION,
      dapchigi: {
        questionStyle: STYLE_VALUES.has(dap.questionStyle) ? dap.questionStyle : "normal",
        answerStyle: ANSWER_STYLE_VALUES.has(dap.answerStyle) ? dap.answerStyle : "normal",
        answerKeywordRed: dap.answerKeywordRed !== false
      },
      updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null
    };
  }

  function settingsFromCurrentDapchigi(){
    const current = state?.dapchigiV1 || {};
    return normalizeSettings({
      dapchigi: {
        questionStyle: STYLE_VALUES.has(current.questionStyle) ? current.questionStyle : "normal",
        answerStyle: ANSWER_STYLE_VALUES.has(current.answerStyle) ? current.answerStyle : "normal",
        answerKeywordRed: true
      }
    });
  }

  function loadSettings(){
    try {
      const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (validObject(raw)) return normalizeSettings(raw);
    } catch (error) {
      console.warn("[QTimer] invalid settings storage; using migrated defaults", error);
    }
    return settingsFromCurrentDapchigi();
  }

  function setStatus(message){
    const node = document.querySelector("#qtimerSettingsStatus");
    if (!node) return;
    node.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      if (node) node.textContent = "변경 즉시 자동 저장됩니다.";
    }, 2600);
  }

  function persistSettings(message="자동 저장됨"){
    settings.updatedAt = new Date().toISOString();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setStatus(message);
  }

  function syncDapchigiState(){
    if (!state.dapchigiV1) state.dapchigiV1 = {};
    state.dapchigiV1.questionStyle = settings.dapchigi.questionStyle;
    state.dapchigiV1.answerStyle = settings.dapchigi.answerStyle;

    const questionStyle = document.querySelector("#dapQuestionStyle");
    const answerStyle = document.querySelector("#dapAnswerStyle");
    if (questionStyle && [...questionStyle.options].some(option => option.value === settings.dapchigi.questionStyle)) {
      questionStyle.value = settings.dapchigi.questionStyle;
    }
    if (answerStyle && [...answerStyle.options].some(option => option.value === settings.dapchigi.answerStyle)) {
      answerStyle.value = settings.dapchigi.answerStyle;
    }
    if (typeof saveState === "function") saveState();
  }

  function checkboxIdFor(group, style){
    const prefix = group === "question" ? "qtSetQuestion" : "qtSetAnswer";
    const suffixes = {
      "all-bold":"AllBold",
      "keyword-bold":"KeywordBold",
      "all-highlight":"AllHighlight",
      "keyword-highlight":"KeywordHighlight",
      "mark":"Mark"
    };
    return `${prefix}${suffixes[style] || "Normal"}`;
  }

  function syncCheckboxes(){
    for (const input of document.querySelectorAll('input[data-qtimer-style-group="question"]')) {
      input.checked = input.dataset.styleValue === settings.dapchigi.questionStyle;
    }
    for (const input of document.querySelectorAll('input[data-qtimer-style-group="answer"]')) {
      input.checked = input.dataset.styleValue === settings.dapchigi.answerStyle;
    }
    const red = document.querySelector("#qtSetAnswerKeywordRed");
    if (red) red.checked = settings.dapchigi.answerKeywordRed;
  }

  function answerKeywordTerms(q, choiceText){
    const source = String(choiceText || "");
    if (!source) return [];
    const tokens = String(q?.finalKey || "").match(/[A-Za-z][A-Za-z0-9+.#_-]{1,}|[가-힣]{2,}/g) || [];
    return [...new Set(tokens
      .filter(token => !STOPWORDS.has(token))
      .filter(token => source.toLowerCase().includes(token.toLowerCase())))]
      .sort((a,b) => b.length - a.length)
      .slice(0, 10);
  }

  function unwrapKeywordSpans(container){
    if (!container) return;
    for (const span of [...container.querySelectorAll(".qt-answer-keyword-red")]) {
      span.replaceWith(document.createTextNode(span.textContent || ""));
    }
    container.normalize();
  }

  function wrapKeywordText(container, terms){
    if (!container || !terms.length || container.querySelector(".qt-answer-keyword-red")) return;
    const re = new RegExp(`(${terms.map(escapeRegExp).join("|")})`,"gi");
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    for (const node of textNodes) {
      const value = node.nodeValue || "";
      re.lastIndex = 0;
      if (!re.test(value)) continue;
      re.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let cursor = 0;
      for (const match of value.matchAll(re)) {
        const index = match.index ?? 0;
        if (index > cursor) fragment.append(document.createTextNode(value.slice(cursor,index)));
        const span = document.createElement("span");
        span.className = "qt-answer-keyword-red";
        span.textContent = match[0];
        fragment.append(span);
        cursor = index + match[0].length;
      }
      if (cursor < value.length) fragment.append(document.createTextNode(value.slice(cursor)));
      node.replaceWith(fragment);
    }
  }

  function applyAnswerKeywordColor(){
    const answerValue = document.querySelector("#dapAnswerValue");
    const answerChoiceText = document.querySelector(".choice.dap-answer-choice span:last-child");
    const containers = [answerValue,answerChoiceText].filter(Boolean);
    if (!containers.length) return;

    if (!settings.dapchigi.answerKeywordRed || state.mode !== "dapchigi") {
      containers.forEach(unwrapKeywordSpans);
      return;
    }

    const q = typeof currentQuestion === "function" ? currentQuestion() : null;
    if (!q) return;
    const answer = typeof effectiveAnswer === "function" ? effectiveAnswer(q) : Number(q.sourceAnswer);
    const choice = q.choices?.[answer - 1] || "";
    const terms = answerKeywordTerms(q,choice);
    containers.forEach(container => wrapKeywordText(container,terms));
  }

  function renderCurrentDapchigi(){
    if (state.mode === "dapchigi" && typeof renderQuestion === "function") renderQuestion();
    requestAnimationFrame(applyAnswerKeywordColor);
  }

  function applySettings(next,{persist=true,render=true,message="자동 저장됨"}={}){
    settings = normalizeSettings(next);
    syncDapchigiState();
    syncCheckboxes();
    if (persist) persistSettings(message);
    if (render) renderCurrentDapchigi();
    return clone(settings);
  }

  function exportPayload(){
    return {
      format: SETTINGS_FORMAT,
      version: SETTINGS_VERSION,
      exportedAt: new Date().toISOString(),
      settings: clone(settings)
    };
  }

  function validateSettingsPayload(payload){
    if (!validObject(payload) || payload.format !== SETTINGS_FORMAT || payload.version !== SETTINGS_VERSION || !validObject(payload.settings)) {
      throw new Error("QTimer 환경설정 파일 형식이 아닙니다.");
    }
    const normalized = normalizeSettings(payload.settings);
    if (!STYLE_VALUES.has(normalized.dapchigi.questionStyle) || !ANSWER_STYLE_VALUES.has(normalized.dapchigi.answerStyle)) {
      throw new Error("답치기 표시 설정이 올바르지 않습니다.");
    }
    return normalized;
  }

  function downloadJson(payload,prefix="qtimer-settings"){
    const stamp = new Date().toISOString().replace(/[:.]/g,"-");
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${prefix}-${stamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function installStyles(){
    if (document.querySelector("#qtimerSettingsV1Styles")) return;
    const style = document.createElement("style");
    style.id = "qtimerSettingsV1Styles";
    style.textContent = `
      .qt-settings-view{padding:20px 24px 32px;background:#f7f9fc;min-height:calc(100vh - 90px)}
      .qt-settings-shell{max-width:1180px;margin:0 auto;display:grid;gap:14px}
      .qt-settings-hero,.qt-settings-card{background:var(--panel,#fff);border:1px solid var(--border,#d8dee9);border-radius:14px;padding:20px}
      .qt-settings-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.qt-settings-hero h2{margin:3px 0 6px}.qt-settings-hero p{margin:0;color:var(--muted,#667085)}
      .qt-settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.qt-settings-card h3{margin:0 0 8px}.qt-settings-note{margin:0 0 14px;color:var(--muted,#667085);font-size:.9rem}
      .qt-check-list{display:grid;gap:9px}.qt-check{display:flex;gap:10px;align-items:flex-start;padding:11px 12px;border:1px solid var(--border,#e5e7eb);border-radius:10px;background:#fff;cursor:pointer}.qt-check input{margin-top:3px;width:17px;height:17px}.qt-check span{display:grid;gap:2px}.qt-check small{color:var(--muted,#667085)}
      .qt-settings-actions{display:flex;gap:8px;flex-wrap:wrap}.qt-settings-actions button{min-height:40px}.qt-settings-status{font-size:.9rem;color:var(--muted,#667085);font-weight:700}.qt-settings-danger{color:#b42318}
      .qt-answer-keyword-red{color:#d92d20!important;font-weight:900!important}
      @media(max-width:760px){.qt-settings-view{padding:12px}.qt-settings-grid{grid-template-columns:1fr}.qt-settings-hero{flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  function installSettingsView(){
    if (document.querySelector("#settingsView")) return;
    const tabs = document.querySelector(".view-tabs");
    const studyTab = document.querySelector("#studyTab");
    const dapchigiTab = document.querySelector("#dapchigiTab");
    if (!tabs || !studyTab) return;

    const settingsTab = document.createElement("button");
    settingsTab.id = "settingsTab";
    settingsTab.type = "button";
    settingsTab.textContent = "환경설정";
    (dapchigiTab || studyTab).insertAdjacentElement("afterend",settingsTab);

    const settingsView = document.createElement("main");
    settingsView.id = "settingsView";
    settingsView.className = "qt-settings-view";
    settingsView.hidden = true;
    settingsView.innerHTML = `
      <div class="qt-settings-shell">
        <section class="qt-settings-hero">
          <div><p class="eyebrow">QTimer Preferences</p><h2>환경설정</h2><p>표시 설정은 변경 즉시 이 브라우저에 자동 저장됩니다. 학습기록과 별도로 설정만 저장·불러오기 할 수 있습니다.</p></div>
          <span id="qtimerSettingsStatus" class="qt-settings-status">변경 즉시 자동 저장됩니다.</span>
        </section>
        <div class="qt-settings-grid">
          <section class="qt-settings-card">
            <h3>답치기 · 문제 표시</h3>
            <p class="qt-settings-note">강조 방식은 한 가지만 선택됩니다. 모두 해제하면 일반 표시입니다.</p>
            <div class="qt-check-list">
              <label class="qt-check"><input id="qtSetQuestionAllBold" type="checkbox" data-qtimer-style-group="question" data-style-value="all-bold"><span><strong>전체 볼드</strong><small>문제 전체를 굵게 표시</small></span></label>
              <label class="qt-check"><input id="qtSetQuestionKeywordBold" type="checkbox" data-qtimer-style-group="question" data-style-value="keyword-bold"><span><strong>핵심어 볼드</strong><small>부정어·핵심어 중심 굵게 표시</small></span></label>
              <label class="qt-check"><input id="qtSetQuestionAllHighlight" type="checkbox" data-qtimer-style-group="question" data-style-value="all-highlight"><span><strong>전체 형광펜 + 볼드</strong><small>문제 전체 파란 형광펜과 굵은 글씨</small></span></label>
              <label class="qt-check"><input id="qtSetQuestionKeywordHighlight" type="checkbox" data-qtimer-style-group="question" data-style-value="keyword-highlight"><span><strong>핵심어 형광펜 + 볼드</strong><small>핵심어만 파란 형광펜과 굵은 글씨</small></span></label>
            </div>
          </section>
          <section class="qt-settings-card">
            <h3>답치기 · 답 표시</h3>
            <p class="qt-settings-note">답 강조 방식 1개와 ‘답 핵심어 빨간색’은 함께 사용할 수 있습니다.</p>
            <div class="qt-check-list">
              <label class="qt-check"><input id="qtSetAnswerAllBold" type="checkbox" data-qtimer-style-group="answer" data-style-value="all-bold"><span><strong>전체 볼드</strong><small>답 전체를 굵게 표시</small></span></label>
              <label class="qt-check"><input id="qtSetAnswerKeywordBold" type="checkbox" data-qtimer-style-group="answer" data-style-value="keyword-bold"><span><strong>핵심어 볼드</strong><small>답 핵심어 중심 굵게 표시</small></span></label>
              <label class="qt-check"><input id="qtSetAnswerAllHighlight" type="checkbox" data-qtimer-style-group="answer" data-style-value="all-highlight"><span><strong>전체 형광펜 + 볼드</strong><small>답 전체 빨간 계열 형광펜과 굵은 글씨</small></span></label>
              <label class="qt-check"><input id="qtSetAnswerKeywordHighlight" type="checkbox" data-qtimer-style-group="answer" data-style-value="keyword-highlight"><span><strong>핵심어 형광펜 + 볼드</strong><small>답 핵심어만 형광펜과 굵은 글씨</small></span></label>
              <label class="qt-check"><input id="qtSetAnswerMark" type="checkbox" data-qtimer-style-group="answer" data-style-value="mark"><span><strong>답 마킹 + 볼드</strong><small>정답 위치를 강하게 마킹</small></span></label>
              <label class="qt-check"><input id="qtSetAnswerKeywordRed" type="checkbox"><span><strong class="qt-settings-danger">답 핵심어 빨간색 + 볼드</strong><small>정답 핵심어를 빨간 글씨와 볼드로 추가 강조</small></span></label>
            </div>
          </section>
        </div>
        <section class="qt-settings-card">
          <h3>설정 저장 · 불러오기</h3>
          <p class="qt-settings-note">변경 내용은 자동 저장됩니다. 아래 기능은 다른 PC·브라우저로 환경설정만 옮기거나 별도 보관할 때 사용합니다.</p>
          <div class="qt-settings-actions">
            <button id="qtSettingsExport" type="button">설정 파일 저장</button>
            <button id="qtSettingsImport" type="button">설정 파일 불러오기</button>
            <button id="qtSettingsReset" type="button">기본값 복원</button>
            <input id="qtSettingsFile" type="file" accept="application/json,.json" hidden>
          </div>
        </section>
      </div>
    `;
    const dashboardView = document.querySelector("#dashboardView");
    const studyView = document.querySelector("#studyView");
    (dashboardView || studyView || document.body.lastElementChild)?.insertAdjacentElement("afterend",settingsView);

    function clearSettingsActive(){
      settingsView.hidden = true;
      settingsTab.classList.remove("active");
    }
    function showSettings(){
      if (typeof stopTimer === "function") stopTimer();
      if (dashboardView) dashboardView.hidden = true;
      if (studyView) studyView.hidden = true;
      settingsView.hidden = false;
      document.querySelector("#dashboardTab")?.classList.remove("active");
      document.querySelector("#studyTab")?.classList.remove("active");
      document.querySelector("#dapchigiTab")?.classList.remove("active");
      settingsTab.classList.add("active");
      syncCheckboxes();
    }

    settingsTab.addEventListener("click",showSettings);
    document.querySelector("#dashboardTab")?.addEventListener("click",clearSettingsActive);
    document.querySelector("#studyTab")?.addEventListener("click",clearSettingsActive);
    document.querySelector("#dapchigiTab")?.addEventListener("click",clearSettingsActive);

    for (const input of settingsView.querySelectorAll("input[data-qtimer-style-group]")) {
      input.addEventListener("change",() => {
        const group = input.dataset.qtimerStyleGroup;
        const styleValue = input.dataset.styleValue;
        const key = group === "question" ? "questionStyle" : "answerStyle";
        if (input.checked) {
          for (const sibling of settingsView.querySelectorAll(`input[data-qtimer-style-group="${group}"]`)) {
            if (sibling !== input) sibling.checked = false;
          }
          settings.dapchigi[key] = styleValue;
        } else if (settings.dapchigi[key] === styleValue) {
          settings.dapchigi[key] = "normal";
        }
        syncDapchigiState();
        persistSettings();
        renderCurrentDapchigi();
      });
    }

    settingsView.querySelector("#qtSetAnswerKeywordRed")?.addEventListener("change",event => {
      settings.dapchigi.answerKeywordRed = Boolean(event.target.checked);
      persistSettings();
      applyAnswerKeywordColor();
    });

    settingsView.querySelector("#qtSettingsExport")?.addEventListener("click",() => downloadJson(exportPayload()));
    const fileInput = settingsView.querySelector("#qtSettingsFile");
    settingsView.querySelector("#qtSettingsImport")?.addEventListener("click",() => fileInput?.click());
    fileInput?.addEventListener("change",async () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        const incoming = validateSettingsPayload(payload);
        if (!window.confirm("현재 환경설정을 가져온 설정으로 교체하시겠습니까?")) return;
        applySettings(incoming,{persist:true,render:true,message:"설정 불러오기 완료"});
      } catch (error) {
        window.alert(`환경설정 불러오기 실패: ${error.message || error}`);
      }
    });
    settingsView.querySelector("#qtSettingsReset")?.addEventListener("click",() => {
      if (!window.confirm("QTimer 환경설정을 기본값으로 복원하시겠습니까? 학습기록은 삭제되지 않습니다.")) return;
      applySettings(clone(DEFAULT_SETTINGS),{persist:true,render:true,message:"기본값으로 복원됨"});
    });

    syncCheckboxes();
  }

  function installDapchigiSync(){
    const questionStyle = document.querySelector("#dapQuestionStyle");
    const answerStyle = document.querySelector("#dapAnswerStyle");
    questionStyle?.addEventListener("change",() => {
      settings.dapchigi.questionStyle = STYLE_VALUES.has(questionStyle.value) ? questionStyle.value : "normal";
      syncCheckboxes();
      persistSettings();
      requestAnimationFrame(applyAnswerKeywordColor);
    });
    answerStyle?.addEventListener("change",() => {
      settings.dapchigi.answerStyle = ANSWER_STYLE_VALUES.has(answerStyle.value) ? answerStyle.value : "normal";
      syncCheckboxes();
      persistSettings();
      requestAnimationFrame(applyAnswerKeywordColor);
    });

    const answerValue = document.querySelector("#dapAnswerValue");
    const choices = document.querySelector("#choices");
    const observer = new MutationObserver(() => requestAnimationFrame(applyAnswerKeywordColor));
    if (answerValue) observer.observe(answerValue,{subtree:true,childList:true,characterData:true});
    if (choices) observer.observe(choices,{subtree:true,childList:true,characterData:true});
  }

  function boot(){
    const ready = document.querySelector(".view-tabs")
      && document.querySelector("#dapQuestionStyle")
      && document.querySelector("#dapAnswerStyle")
      && document.querySelector("#dapAnswerValue");
    if (!ready) {
      setTimeout(boot,30);
      return;
    }

    settings = loadSettings();
    installStyles();
    installSettingsView();
    syncDapchigiState();
    installDapchigiSync();
    persistSettings("환경설정 준비 완료");
    requestAnimationFrame(applyAnswerKeywordColor);

    globalThis.QTIMER_SETTINGS = {
      key: SETTINGS_KEY,
      format: SETTINGS_FORMAT,
      version: SETTINGS_VERSION,
      get: () => clone(settings),
      replace: (next,options={}) => applySettings(next,options),
      exportPayload,
      validatePayload: validateSettingsPayload,
      applyAnswerKeywordColor
    };
  }

  boot();
})();
