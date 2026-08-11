// QTimer Dapchigi v1 — answer-first rapid encoding + recall flow.
// Data-neutral layer: SOURCE BANK questions/answers are never mutated.
(function initQTimerDapchigiV1(){
  if (document.getElementById("dapchigiPanel")) return;

  const VERSION = 1;
  const MODE = "dapchigi";
  const SUBJECTS = [
    { value:"all", label:"전체 과목", prefixes:[] },
    { value:"s1", label:"1과목 소프트웨어 설계", prefixes:["sujebi-2026-sw-design-"] },
    { value:"s2", label:"2과목 소프트웨어 개발", prefixes:["sujebi-2026-sw-dev-"] },
    { value:"s3", label:"3과목 데이터베이스 구축", prefixes:["sujebi-2026-db-build-"] },
    { value:"s4", label:"4과목 프로그래밍 언어 활용", prefixes:["sujebi-2026-prog-lang-"] },
    { value:"s5", label:"5과목 정보시스템 구축관리", prefixes:["sujebi-2026-system-mgmt-","sujebi-2026-system-build-"] }
  ];
  const NEGATIVE_STEM_RE = /(옳지\s*않|틀린|아닌\s*것|거리가\s*먼|포함되지\s*않|해당하지\s*않|적절하지\s*않|잘못된|부적절)/;
  const NEGATIVE_TERMS = ["옳지 않은", "틀린", "아닌 것", "거리가 먼", "포함되지 않는", "해당하지 않는", "적절하지 않은", "잘못된", "부적절"];
  const STOPWORDS = new Set(["대한","설명","것은","있는","없는","가장","다음","해당","의미","사용","경우","위한","으로","에서","하고","하는","한다","아니다","정답","문제"]);
  const STEP_ORDER = ["preview","question","mark","reveal"];
  const STEP_META = {
    preview:{label:"1 · 답 보기", instruction:"정답을 먼저 확인하세요. Space → 답을 가리고 문제를 봅니다."},
    question:{label:"2 · 문제 회상", instruction:"문제를 읽고 정답을 머릿속으로 회상하세요. Space → 빈칸 마킹."},
    mark:{label:"3 · 빈칸 마킹", instruction:"형광펜 빈칸을 머릿속으로 채우세요. Space → 정답 공개."},
    reveal:{label:"4 · 정답 확인", instruction:"정답을 확인한 뒤 O(맞음) / A(애매) / X(틀림)으로 자기평가하세요."}
  };

  const STYLE_OPTIONS = [
    ["normal","일반"],
    ["all-bold","전체 볼드"],
    ["keyword-bold","핵심어 볼드"],
    ["all-highlight","전체 형광펜"],
    ["keyword-highlight","핵심어 형광펜"]
  ];
  const ANSWER_STYLE_OPTIONS = [...STYLE_OPTIONS, ["mark","답 마킹"]];

  function ensureDapState(){
    const current = state.dapchigiV1 || {};
    state.dapchigiV1 = {
      version: VERSION,
      subject: current.subject || "all",
      chapter: current.chapter || "all",
      questionStyle: current.questionStyle || "normal",
      answerStyle: current.answerStyle || "normal",
      step: STEP_ORDER.includes(current.step) ? current.step : "preview",
      round: Number(current.round) > 0 ? Number(current.round) : 1,
      attempts: Array.isArray(current.attempts) ? current.attempts : [],
      scopeKey: current.scopeKey || "all:all"
    };
    return state.dapchigiV1;
  }

  function subjectOf(q){
    const hit = SUBJECTS.slice(1).find(subject => subject.prefixes.some(prefix => q?.id?.startsWith(prefix)));
    return hit?.value || "unknown";
  }

  function chapterOf(q){
    const match = q?.id?.match(/-ch(\d{2})-/);
    if (match) return `ch${match[1]}`;
    // Ten retained legacy Subject 1 IDs are structurally tracked as Ch04 by the QA baseline.
    if (/^sujebi-2026-sw-design-(?:13|14|15|16|17|18|19|20|21|22)$/.test(q?.id || "")) return "ch04";
    return "unknown";
  }

  function questionsForScope(subject, chapter){
    return QUESTIONS.filter(q => {
      const subjectMatch = subject === "all" || subjectOf(q) === subject;
      const chapterMatch = chapter === "all" || chapterOf(q) === chapter;
      return subjectMatch && chapterMatch;
    });
  }

  function scopeKey(subject, chapter){ return `${subject}:${chapter}`; }

  function escapeMarkup(value){
    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function escapeRegExp(value){ return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function keywordTerms(q, text){
    const source = String(text || "");
    const terms = [];
    for (const term of NEGATIVE_TERMS) if (source.includes(term)) terms.push(term);
    const tokens = String(q?.finalKey || "").match(/[A-Za-z][A-Za-z0-9+.#_-]{1,}|[가-힣]{2,}/g) || [];
    for (const token of tokens) {
      if (!STOPWORDS.has(token) && source.toLowerCase().includes(token.toLowerCase())) terms.push(token);
    }
    return [...new Set(terms)].sort((a,b) => b.length - a.length).slice(0, 8);
  }

  function styledText(q, text, style, kind){
    const safe = escapeMarkup(text);
    if (style === "all-bold") return `<strong class="dap-all-bold">${safe}</strong>`;
    if (style === "all-highlight" || (kind === "answer" && style === "mark")) return `<mark class="dap-highlight dap-highlight-${kind}">${safe}</mark>`;
    if (style !== "keyword-bold" && style !== "keyword-highlight") return safe;

    const terms = keywordTerms(q, text);
    if (!terms.length) {
      return style === "keyword-bold"
        ? `<strong class="dap-keyword">${safe}</strong>`
        : `<mark class="dap-highlight dap-highlight-${kind}">${safe}</mark>`;
    }
    const re = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
    return String(text).split(re).map(part => {
      const isHit = terms.some(term => term.toLowerCase() === part.toLowerCase());
      const escaped = escapeMarkup(part);
      if (!isHit) return escaped;
      return style === "keyword-bold"
        ? `<strong class="dap-keyword">${escaped}</strong>`
        : `<mark class="dap-highlight dap-highlight-${kind}">${escaped}</mark>`;
    }).join("");
  }

  function placeholderFor(text){
    const units = Math.max(4, Math.min(14, Math.ceil(String(text || "").length / 3)));
    return "▰".repeat(units);
  }

  function optionMarkup(options){ return options.map(([value,label]) => `<option value="${value}">${label}</option>`).join(""); }

  function installStyles(){
    const style = document.createElement("style");
    style.id = "dapchigiV1Styles";
    style.textContent = `
      #dapchigiPanel{margin:0 24px 14px;padding:14px 16px;border:1px solid var(--border,#d8dee9);border-radius:14px;background:var(--panel,#fff);display:grid;gap:12px}
      #dapchigiPanel[hidden]{display:none!important}
      .dap-controls{display:flex;flex-wrap:wrap;gap:10px;align-items:end}
      .dap-controls label{display:grid;gap:5px;font-size:.84rem;font-weight:700;min-width:150px}
      .dap-controls select,.dap-controls button{min-height:38px}
      .dap-scope-line{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:.9rem}
      .dap-stage-line{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--border,#e5e7eb)}
      .dap-stage-chip{font-weight:800;border-radius:999px;padding:6px 10px;background:#eef2ff}
      .dap-stage-instruction{flex:1;min-width:260px}
      .dap-answer-card{margin:0 0 18px;padding:18px;border:2px solid #ef4444;border-radius:14px;background:#fff7f7}
      .dap-answer-card[hidden]{display:none!important}
      .dap-answer-label{font-size:.82rem;font-weight:800;letter-spacing:.04em;color:#991b1b;margin-bottom:8px}
      .dap-answer-value{font-size:1.2rem;line-height:1.6}
      .dap-eval-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
      .dap-eval-row[hidden]{display:none!important}
      .dap-eval-row button{min-width:110px;font-weight:800}
      .dap-eval-o{border-color:#15803d!important}.dap-eval-a{border-color:#a16207!important}.dap-eval-x{border-color:#b91c1c!important}
      .dap-highlight{padding:.06em .14em;border-radius:.2em}
      .dap-highlight-question{background:#bfdbfe;color:inherit}
      .dap-highlight-answer{background:#fecaca;color:inherit}
      .dap-keyword{font-weight:900}
      .dap-blank{background:#fecaca!important;border-color:#ef4444!important}
      .dap-blank span:last-child{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;color:#991b1b;font-weight:900}
      .dap-answer-choice{outline:2px solid #ef4444;outline-offset:-2px}
      body.dapchigi-active .timer-row,body.dapchigi-active .confidence-row,body.dapchigi-active .action-row,body.dapchigi-active .question-pane>.shortcut-help{display:none!important}
      body.dapchigi-active .result-pane{display:none!important}
      body.dapchigi-active .workspace{grid-template-columns:minmax(0,1fr)!important}
      body.dapchigi-active .choice{cursor:default}
      .dap-position{font-weight:800}
      .dap-mini-metrics{display:flex;gap:8px;flex-wrap:wrap}
      .dap-mini-metrics span{border:1px solid var(--border,#e5e7eb);border-radius:999px;padding:4px 8px;font-size:.82rem}
      @media(max-width:760px){#dapchigiPanel{margin:0 10px 10px}.dap-controls label{min-width:calc(50% - 8px)}}
    `;
    document.head.appendChild(style);
  }

  function installUI(){
    const modeSelect = els.modeSelect;
    if (![...modeSelect.options].some(option => option.value === MODE)) {
      const option = document.createElement("option");
      option.value = MODE;
      option.textContent = "답치기";
      modeSelect.appendChild(option);
    }

    const panel = document.createElement("section");
    panel.id = "dapchigiPanel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "답치기 설정");
    panel.innerHTML = `
      <div class="dap-controls">
        <label>과목<select id="dapSubject">${SUBJECTS.map(s=>`<option value="${s.value}">${s.label}</option>`).join("")}</select></label>
        <label>단원<select id="dapChapter"><option value="all">전체 단원</option></select></label>
        <label>문제 표시<select id="dapQuestionStyle">${optionMarkup(STYLE_OPTIONS)}</select></label>
        <label>답 표시<select id="dapAnswerStyle">${optionMarkup(ANSWER_STYLE_OPTIONS)}</select></label>
        <button id="dapApplyScope" type="button">범위 적용</button>
      </div>
      <div class="dap-scope-line">
        <strong id="dapScopeCount">범위 0문제</strong>
        <span class="dap-position" id="dapPosition">1 / 1 · 1회차</span>
        <div class="dap-mini-metrics"><span id="dapMetricO">O 0</span><span id="dapMetricA">A 0</span><span id="dapMetricX">X 0</span></div>
      </div>
      <div class="dap-stage-line">
        <span id="dapStageChip" class="dap-stage-chip"></span>
        <span id="dapStageInstruction" class="dap-stage-instruction"></span>
        <button id="dapAdvance" type="button">진행 (Space)</button>
      </div>
    `;
    document.querySelector(".control-bar")?.insertAdjacentElement("afterend", panel);

    const answerCard = document.createElement("section");
    answerCard.id = "dapAnswerCard";
    answerCard.className = "dap-answer-card";
    answerCard.hidden = true;
    answerCard.setAttribute("aria-live", "polite");
    answerCard.innerHTML = `<div class="dap-answer-label">정답</div><div id="dapAnswerValue" class="dap-answer-value"></div>`;
    els.questionText.closest("article")?.insertAdjacentElement("beforebegin", answerCard);

    const evalRow = document.createElement("div");
    evalRow.id = "dapEvalRow";
    evalRow.className = "dap-eval-row";
    evalRow.hidden = true;
    evalRow.innerHTML = `
      <button class="dap-eval-o" data-rating="o" type="button">O 맞음</button>
      <button class="dap-eval-a" data-rating="a" type="button">A 애매</button>
      <button class="dap-eval-x" data-rating="x" type="button">X 틀림</button>
    `;
    els.choices.closest("article")?.insertAdjacentElement("afterend", evalRow);
  }

  installStyles();
  installUI();
  const d = ensureDapState();
  const ui = Object.fromEntries([
    "dapchigiPanel","dapSubject","dapChapter","dapQuestionStyle","dapAnswerStyle","dapApplyScope","dapScopeCount","dapPosition","dapMetricO","dapMetricA","dapMetricX","dapStageChip","dapStageInstruction","dapAdvance","dapAnswerCard","dapAnswerValue","dapEvalRow"
  ].map(id => [id, document.getElementById(id)]));
  const questionArticle = els.questionText.closest("article");

  function populateChapters(){
    const subject = ui.dapSubject.value;
    const chapters = [...new Set(QUESTIONS
      .filter(q => subject === "all" || subjectOf(q) === subject)
      .map(chapterOf)
      .filter(ch => ch !== "unknown"))]
      .sort();
    ui.dapChapter.innerHTML = `<option value="all">전체 단원</option>` + chapters.map(ch => `<option value="${ch}">${ch.toUpperCase()}</option>`).join("");
    ui.dapChapter.disabled = subject === "all";
    const stored = ensureDapState().chapter;
    ui.dapChapter.value = (!ui.dapChapter.disabled && chapters.includes(stored)) ? stored : "all";
  }

  function syncControls(){
    const ds = ensureDapState();
    ui.dapSubject.value = SUBJECTS.some(s=>s.value===ds.subject) ? ds.subject : "all";
    populateChapters();
    ui.dapQuestionStyle.value = STYLE_OPTIONS.some(([value])=>value===ds.questionStyle) ? ds.questionStyle : "normal";
    ui.dapAnswerStyle.value = ANSWER_STYLE_OPTIONS.some(([value])=>value===ds.answerStyle) ? ds.answerStyle : "normal";
    const preview = questionsForScope(ui.dapSubject.value, ui.dapChapter.disabled ? "all" : ui.dapChapter.value);
    ui.dapScopeCount.textContent = `범위 ${preview.length}문제`;
  }

  function applyScope(resetRound=true){
    const ds = ensureDapState();
    ds.subject = ui.dapSubject.value;
    ds.chapter = ui.dapChapter.disabled ? "all" : ui.dapChapter.value;
    const scoped = questionsForScope(ds.subject, ds.chapter);
    if (!scoped.length) return;
    state.currentRoundIds = scoped.map(q => q.id);
    state.currentIndex = 0;
    ds.step = "preview";
    if (resetRound) ds.round = 1;
    ds.scopeKey = scopeKey(ds.subject, ds.chapter);
    saveState();
    renderQuestion();
  }

  function renderAnswerCard(q){
    const ds = ensureDapState();
    const answer = effectiveAnswer(q);
    const choice = q.choices?.[answer - 1] ?? "";
    ui.dapAnswerValue.innerHTML = `<strong>${answer}번</strong> · ${styledText(q, choice, ds.answerStyle, "answer")}`;
  }

  function resetChoicePresentation(q){
    [...els.choices.children].forEach((button, idx) => {
      button.classList.remove("selected","correct","wrong","dap-blank","dap-answer-choice");
      button.disabled = false;
      const textSpan = button.children[1];
      if (textSpan) textSpan.innerHTML = escapeMarkup(q.choices?.[idx] ?? "");
    });
  }

  function renderQuestionStyle(q){
    const ds = ensureDapState();
    els.questionText.innerHTML = styledText(q, q.questionText, ds.questionStyle, "question");
  }

  function renderMarkStage(q){
    const answer = effectiveAnswer(q);
    const isNegative = NEGATIVE_STEM_RE.test(q.questionText || "");
    const targets = isNegative
      ? q.choices.map((_,idx)=>idx+1).filter(number=>number!==answer)
      : [answer];
    [...els.choices.children].forEach(button => {
      const value = Number(button.dataset.answer);
      if (!targets.includes(value)) return;
      button.classList.add("dap-blank");
      const textSpan = button.children[1];
      const original = q.choices?.[value - 1] || "";
      if (textSpan) {
        textSpan.textContent = placeholderFor(original);
        textSpan.setAttribute("aria-label", "빈칸");
      }
    });
  }

  function renderRevealStage(q){
    const ds = ensureDapState();
    const answer = effectiveAnswer(q);
    const button = [...els.choices.children].find(item => Number(item.dataset.answer) === answer);
    if (button) {
      button.classList.add("dap-answer-choice");
      const textSpan = button.children[1];
      if (textSpan) textSpan.innerHTML = styledText(q, q.choices?.[answer-1] || "", ds.answerStyle, "answer");
    }
  }

  function currentScopeAttempts(){
    const ds = ensureDapState();
    return ds.attempts.filter(attempt => attempt.scopeKey === ds.scopeKey && attempt.round === ds.round);
  }

  function renderMetrics(){
    const ds = ensureDapState();
    const attempts = currentScopeAttempts();
    ui.dapMetricO.textContent = `O ${attempts.filter(a=>a.rating==="o").length}`;
    ui.dapMetricA.textContent = `A ${attempts.filter(a=>a.rating==="a").length}`;
    ui.dapMetricX.textContent = `X ${attempts.filter(a=>a.rating==="x").length}`;
    ui.dapPosition.textContent = `${state.currentIndex + 1} / ${state.currentRoundIds.length} · ${ds.round}회차`;
  }

  function renderDapchigi(){
    const ds = ensureDapState();
    const q = currentQuestion();
    if (!q) return;
    document.body.classList.add("dapchigi-active");
    ui.dapchigiPanel.hidden = false;
    stopTimer();
    timerRunning = false;
    ui.dapScopeCount.textContent = `범위 ${state.currentRoundIds.length}문제`;
    renderQuestionStyle(q);
    resetChoicePresentation(q);
    renderAnswerCard(q);

    const meta = STEP_META[ds.step] || STEP_META.preview;
    ui.dapStageChip.textContent = meta.label;
    ui.dapStageInstruction.textContent = meta.instruction;
    ui.dapAdvance.disabled = ds.step === "reveal";
    ui.dapAdvance.textContent = ds.step === "reveal" ? "O / A / X 선택" : "진행 (Space)";

    const preview = ds.step === "preview";
    const reveal = ds.step === "reveal";
    questionArticle.hidden = preview;
    ui.dapAnswerCard.hidden = !(preview || reveal);
    ui.dapEvalRow.hidden = !reveal;

    if (ds.step === "mark") renderMarkStage(q);
    if (reveal) renderRevealStage(q);
    renderMetrics();
    syncControls();
  }

  function clearDapPresentation(){
    document.body.classList.remove("dapchigi-active");
    ui.dapchigiPanel.hidden = true;
    ui.dapAnswerCard.hidden = true;
    ui.dapEvalRow.hidden = true;
    questionArticle.hidden = false;
  }

  function advanceStep(){
    if (state.mode !== MODE) return;
    const ds = ensureDapState();
    const index = STEP_ORDER.indexOf(ds.step);
    if (index < 0 || ds.step === "reveal") return;
    ds.step = STEP_ORDER[index + 1];
    saveState();
    renderDapchigi();
  }

  function recordRating(rating){
    if (state.mode !== MODE || !["o","a","x"].includes(rating)) return;
    const ds = ensureDapState();
    if (ds.step !== "reveal") return;
    const q = currentQuestion();
    const now = new Date().toISOString();
    ds.attempts.push({
      id: globalThis.crypto?.randomUUID?.() || `dap-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      schemaVersion: 1,
      attemptMode: "dapchigi",
      assisted: true,
      questionId: q.id,
      subject: subjectOf(q),
      chapter: chapterOf(q),
      rating,
      negativeStem: NEGATIVE_STEM_RE.test(q.questionText || ""),
      round: ds.round,
      scopeKey: ds.scopeKey,
      questionStyle: ds.questionStyle,
      answerStyle: ds.answerStyle,
      createdAt: now
    });

    const atEnd = state.currentIndex >= state.currentRoundIds.length - 1;
    state.currentIndex = atEnd ? 0 : state.currentIndex + 1;
    if (atEnd) ds.round += 1;
    ds.step = "preview";
    saveState();
    renderQuestion();
  }

  const previousRenderQuestion = renderQuestion;
  renderQuestion = function(){
    previousRenderQuestion();
    if (state.mode === MODE) renderDapchigi();
    else clearDapPresentation();
  };

  // Prevent normal answer selection while Dapchigi uses the choices as read-only recall material.
  els.choices.addEventListener("click", event => {
    if (state.mode !== MODE) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, {capture:true});

  els.modeSelect.addEventListener("change", event => {
    if (els.modeSelect.value !== MODE) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    state.mode = MODE;
    state.timerPolicy = "none";
    ensureDapState().step = "preview";
    syncControls();
    applyScope(false);
    renderSettings();
    els.modeSelect.value = MODE;
  }, {capture:true});

  ui.dapSubject.addEventListener("change", () => {
    const ds = ensureDapState();
    ds.subject = ui.dapSubject.value;
    ds.chapter = "all";
    populateChapters();
    const preview = questionsForScope(ds.subject, "all");
    ui.dapScopeCount.textContent = `선택 예정 ${preview.length}문제`;
    saveState();
  });
  ui.dapChapter.addEventListener("change", () => {
    const ds = ensureDapState();
    ds.chapter = ui.dapChapter.value;
    const preview = questionsForScope(ds.subject, ds.chapter);
    ui.dapScopeCount.textContent = `선택 예정 ${preview.length}문제`;
    saveState();
  });
  ui.dapQuestionStyle.addEventListener("change", () => {
    ensureDapState().questionStyle = ui.dapQuestionStyle.value;
    saveState();
    if (state.mode === MODE) renderDapchigi();
  });
  ui.dapAnswerStyle.addEventListener("change", () => {
    ensureDapState().answerStyle = ui.dapAnswerStyle.value;
    saveState();
    if (state.mode === MODE) renderDapchigi();
  });
  ui.dapApplyScope.addEventListener("click", () => applyScope(true));
  ui.dapAdvance.addEventListener("click", advanceStep);
  ui.dapEvalRow.addEventListener("click", event => {
    const button = event.target.closest("button[data-rating]");
    if (button) recordRating(button.dataset.rating);
  });

  document.addEventListener("keydown", event => {
    if (state.mode !== MODE) return;
    const tag = event.target?.tagName?.toLowerCase();
    if (["input","select","textarea"].includes(tag)) return;
    const key = event.key.toLowerCase();
    if (event.key === " " || ["o","a","x"].includes(key) || /^[1-4]$/.test(event.key) || event.key === "Enter") {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    if (event.key === " ") advanceStep();
    else if (["o","a","x"].includes(key)) recordRating(key);
  }, {capture:true});

  syncControls();
  if (state.mode === MODE) {
    els.modeSelect.value = MODE;
    const dsNow = ensureDapState();
    const scoped = questionsForScope(dsNow.subject, dsNow.chapter);
    if (!scoped.length || !state.currentRoundIds.some(id => scoped.some(q=>q.id===id))) {
      state.currentRoundIds = scoped.length ? scoped.map(q=>q.id) : QUESTIONS.map(q=>q.id);
      state.currentIndex = 0;
      dsNow.step = "preview";
      saveState();
    }
    renderQuestion();
  }
})();
