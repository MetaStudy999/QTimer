// QTimer Dapchigi Focus Reading v2 — problem/explanation-centered study presentation.
// Data-neutral: derives all UI from the current question and Dapchigi state without mutating SOURCE BANK or attempts.
(function initDapchigiFocusReadingV2(){
  const VERSION = 2;
  const NEGATIVE_PHRASES = [
    "옳지 않은", "올바르지 않은", "틀린", "맞지 않는", "잘못된", "부적절한", "적절하지 않은",
    "아닌 것", "해당하지 않는", "포함되지 않는", "속하지 않는", "거리가 먼", "제외되는", "제외한"
  ];
  const STOPWORDS = new Set([
    "다음", "중", "대한", "설명", "것은", "것을", "있는", "없는", "가장", "해당", "알맞은", "올바른",
    "무엇", "어느", "보기", "관련", "경우", "사용", "위한", "하는", "한다", "에서", "으로", "그리고", "또는"
  ]);

  function escapeHtml(value){
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function escapeRegExp(value){ return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function deriveKeywords(text){
    const source = String(text || "");
    const ranked = [];
    const add = (term, score) => {
      const value = String(term || "").trim();
      if (value.length < 2 || !source.includes(value)) return;
      if (STOPWORDS.has(value)) return;
      ranked.push({term:value, score});
    };

    NEGATIVE_PHRASES.forEach(term => { if (source.includes(term)) add(term, 100 + term.length); });

    // Parenthetical technical terms and acronyms are useful visual anchors and are already present in the stem.
    for (const match of source.matchAll(/\(([^()]{2,32})\)/g)) add(match[1], 80 + match[1].length);
    for (const token of source.match(/[A-Za-z][A-Za-z0-9+.#_-]{1,}/g) || []) add(token, 70 + token.length);
    for (const token of source.match(/[가-힣]{2,}/g) || []) {
      if (/^(?:문제|정답|설명|사항|방법|의미|관련|경우|다음|보기)$/.test(token)) continue;
      add(token, Math.min(60, 25 + token.length * 3));
    }

    const unique = new Map();
    ranked.forEach(item => {
      const previous = unique.get(item.term);
      if (!previous || item.score > previous.score) unique.set(item.term, item);
    });
    return [...unique.values()]
      .sort((a,b) => b.score - a.score || b.term.length - a.term.length)
      .slice(0, 6)
      .map(item => item.term)
      .sort((a,b) => b.length - a.length);
  }

  function stemMarkup(text){
    const source = String(text || "");
    const terms = deriveKeywords(source);
    if (!terms.length) return `<mark class="dap-highlight dap-highlight-question qt-focus-stem-mark">${escapeHtml(source)}</mark>`;
    const re = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
    const body = source.split(re).map(part => {
      const hit = terms.some(term => term.toLowerCase() === part.toLowerCase());
      return hit
        ? `<span class="qt-focus-keyword">${escapeHtml(part)}</span>`
        : escapeHtml(part);
    }).join("");
    return `<mark class="dap-highlight dap-highlight-question qt-focus-stem-mark">${body}</mark>`;
  }

  function installStyles(){
    if (document.querySelector("#qtDapFocusReadingV2Styles")) return;
    const style = document.createElement("style");
    style.id = "qtDapFocusReadingV2Styles";
    style.textContent = `
      :root{
        --qt-focus-explain-bg:#ffffff;
        --qt-focus-explain-muted:#667085;
      }
      body.qt-focus-reading-v2{
        --qt-focus-stem-soft:var(--qt-q-highlight,#bfdbfe);
        --qt-focus-keyword:color-mix(in srgb,var(--qt-q-highlight,#bfdbfe) 38%,#111827 62%);
      }
      body.qt-focus-reading-v2 .app-header{display:none!important}
      body.qt-focus-reading-v2 .qt-study-context{position:sticky;top:8px;z-index:70;margin-top:8px;background:rgba(255,255,255,.94);backdrop-filter:blur(12px)}
      .qt-focus-context-actions{display:flex;align-items:center;gap:6px}
      .qt-focus-context-actions button{min-height:32px;padding:5px 9px;border:1px solid var(--qt-border,#dce2ea);border-radius:9px;background:#fff;color:var(--qt-text,#172033);font-weight:800;font-size:12px}
      body.qt-focus-reading-v2:not(.qt-focus-config-open) #dapchigiPanel{display:none!important}
      body.qt-focus-reading-v2.qt-focus-config-open #dapchigiPanel{display:grid!important;position:fixed;z-index:120;top:64px;right:18px;width:min(720px,calc(100vw - 36px));max-height:calc(100vh - 92px);overflow:auto;box-shadow:0 24px 70px rgba(16,24,40,.2)}
      body.qt-focus-reading-v2.qt-focus-config-open::before{content:"";position:fixed;inset:0;z-index:110;background:rgba(15,23,42,.24);backdrop-filter:blur(2px)}
      body.qt-focus-reading-v2 .workspace{display:grid!important;grid-template-columns:minmax(0,1.45fr) minmax(320px,.72fr)!important;gap:16px;align-items:start;max-width:var(--qt-shell-width,1440px);margin:0 auto;padding:12px 18px calc(var(--qt-action-dock-height,64px) + 34px)!important}
      body.qt-focus-reading-v2 .question-pane{max-width:none!important;width:100%;margin:0!important;padding:24px 26px 30px!important}
      body.qt-focus-reading-v2 .question-pane article{max-width:900px!important;margin:0 auto}
      body.qt-focus-reading-v2 #questionText mark.dap-highlight-question{font-weight:900!important}
      #questionText .qt-focus-stem-mark{display:block;padding:16px 18px;border-radius:12px;background:var(--qt-focus-stem-soft)!important;color:inherit!important;line-height:1.65;box-decoration-break:clone;-webkit-box-decoration-break:clone;font-weight:900!important}
      #questionText .qt-focus-keyword{display:inline;padding:.08em .28em;border-radius:.34em;background:var(--qt-focus-keyword);color:#fff!important;font-weight:900!important;box-decoration-break:clone;-webkit-box-decoration-break:clone}
      .qt-dap-explanation{display:none;border:1px solid var(--qt-border,#dce2ea);border-radius:16px;background:var(--qt-focus-explain-bg);padding:20px;min-width:0;box-shadow:0 8px 24px rgba(16,24,40,.05)}
      body.qt-focus-reading-v2 .qt-dap-explanation{display:block;position:sticky;top:68px;max-height:calc(100vh - 158px);overflow:auto}
      .qt-dap-explanation h2{margin:0 0 14px;font-size:18px}
      .qt-explain-lock{display:grid;place-items:center;min-height:220px;text-align:center;padding:18px;color:var(--qt-focus-explain-muted);background:#f8fafc;border:1px dashed #d0d5dd;border-radius:12px;line-height:1.7}
      .qt-explain-section{display:grid;gap:7px;padding:14px 0;border-top:1px solid var(--qt-border,#e5e7eb)}
      .qt-explain-section:first-of-type{border-top:0;padding-top:0}
      .qt-explain-label{font-size:12px;font-weight:900;letter-spacing:.04em;color:var(--qt-focus-explain-muted)}
      .qt-explain-key{font-size:17px;line-height:1.55}
      .qt-explain-text{margin:0;line-height:1.72;color:var(--qt-text,#172033)}
      .qt-explain-answer{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:11px;background:#fff7f6;border:1px solid #fecdca;color:#912018;font-weight:850;line-height:1.55}
      @media(max-width:1080px){body.qt-focus-reading-v2 .workspace{grid-template-columns:1fr!important;max-width:940px}body.qt-focus-reading-v2 .qt-dap-explanation{position:static;max-height:none}}
      @media(max-width:760px){body.qt-focus-reading-v2 .workspace{padding:8px 10px calc(var(--qt-action-dock-height,64px) + 34px)!important;gap:10px}body.qt-focus-reading-v2 .question-pane{padding:18px 14px 24px!important}#questionText .qt-focus-stem-mark{padding:13px 14px}.qt-dap-explanation{padding:16px}.qt-focus-context-actions button span{display:none}}
    `;
    document.head.appendChild(style);
  }

  function boot(){
    const context = document.querySelector("#qtStudyContext");
    const workspace = document.querySelector(".workspace");
    const questionPane = document.querySelector(".question-pane");
    const questionText = document.querySelector("#questionText");
    const dapPanel = document.querySelector("#dapchigiPanel");
    if (!context || !workspace || !questionPane || !questionText || !dapPanel || typeof currentQuestion !== "function") {
      setTimeout(boot, 50);
      return;
    }
    if (document.querySelector("#qtDapExplanation")) return;

    installStyles();

    const explanation = document.createElement("aside");
    explanation.id = "qtDapExplanation";
    explanation.className = "qt-dap-explanation";
    explanation.setAttribute("aria-label", "답치기 해설");
    explanation.hidden = true;
    workspace.insertBefore(explanation, workspace.querySelector(".result-pane"));

    const actions = document.createElement("div");
    actions.className = "qt-focus-context-actions";
    actions.innerHTML = `
      <button id="qtFocusConfigBtn" type="button" aria-expanded="false"><span>범위·표시</span> ⚙</button>
      <button id="qtFocusExitBtn" type="button" title="Esc"><span>집중 종료</span> Esc</button>`;
    context.querySelector(".qt-study-context-meta")?.appendChild(actions);

    const configBtn = document.querySelector("#qtFocusConfigBtn");
    const exitBtn = document.querySelector("#qtFocusExitBtn");
    let wasActive = false;

    function active(){
      return document.body.classList.contains("qt-focus-mode") && state?.mode === "dapchigi";
    }

    function setConfigOpen(open){
      document.body.classList.toggle("qt-focus-config-open", Boolean(open) && active());
      configBtn?.setAttribute("aria-expanded", String(Boolean(open) && active()));
    }

    function cleanFocusPresentation(){
      document.body.classList.remove("qt-focus-reading-v2", "qt-focus-config-open");
      explanation.hidden = true;
      actions.hidden = true;
      configBtn?.setAttribute("aria-expanded", "false");
      wasActive = false;
    }

    function exitFocus(){
      cleanFocusPresentation();
      document.querySelector("#dashboardTab")?.click();
    }

    function renderStem(){
      if (!active()) return;
      const q = currentQuestion();
      if (!q) return;
      questionText.innerHTML = stemMarkup(q.questionText);
    }

    function renderExplanation(){
      const isActive = active();
      explanation.hidden = !isActive;
      if (!isActive) return;
      const q = currentQuestion();
      const step = state?.dapchigiV1?.step || "preview";
      if (!q) return;

      if (step !== "reveal") {
        const message = step === "preview"
          ? "정답은 먼저 확인하되, 해설은 회상 후에 봅니다. 설명을 미리 읽지 않아 기억 인출을 방해하지 않습니다."
          : "먼저 문제와 선택지를 회상하세요. 해설은 ‘정답 확인’ 단계에서 자동으로 열립니다.";
        explanation.innerHTML = `<h2>해설</h2><div class="qt-explain-lock">${escapeHtml(message)}</div>`;
        return;
      }

      const answer = Number(effectiveAnswer(q));
      const choice = q.choices?.[answer - 1] || "";
      explanation.innerHTML = `
        <h2>해설</h2>
        <section class="qt-explain-section">
          <span class="qt-explain-label">정답</span>
          <div class="qt-explain-answer"><strong>${answer}번</strong><span>${escapeHtml(choice)}</span></div>
        </section>
        <section class="qt-explain-section">
          <span class="qt-explain-label">핵심</span>
          <strong class="qt-explain-key">${escapeHtml(q.finalKey || "핵심 요약 없음")}</strong>
        </section>
        <section class="qt-explain-section">
          <span class="qt-explain-label">문제집 해설</span>
          <p class="qt-explain-text">${escapeHtml(q.sourceExplanation || "등록된 문제집 해설이 없습니다.")}</p>
        </section>`;
    }

    function sync(){
      const isActive = active();
      document.body.classList.toggle("qt-focus-reading-v2", isActive);
      explanation.hidden = !isActive;
      actions.hidden = !isActive;

      if (!isActive) {
        cleanFocusPresentation();
        return;
      }

      // First entry shows scope controls only when no specific scope has been chosen yet.
      if (!wasActive) {
        const scopeKey = state?.dapchigiV1?.scopeKey || "all:all";
        setConfigOpen(scopeKey === "all:all");
      }
      wasActive = true;
      renderStem();
      renderExplanation();
    }

    configBtn?.addEventListener("click", () => setConfigOpen(!document.body.classList.contains("qt-focus-config-open")));
    exitBtn?.addEventListener("click", exitFocus);
    document.querySelector("#dashboardTab")?.addEventListener("click", () => requestAnimationFrame(() => requestAnimationFrame(sync)));
    document.querySelector("#dapchigiTab")?.addEventListener("click", () => requestAnimationFrame(() => requestAnimationFrame(sync)));
    document.querySelector("#dapApplyScope")?.addEventListener("click", () => {
      requestAnimationFrame(() => { setConfigOpen(false); sync(); });
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape" || !active()) return;
      event.preventDefault();
      if (document.body.classList.contains("qt-focus-config-open")) setConfigOpen(false);
      else exitFocus();
    }, {capture:true});

    const stageChip = document.querySelector("#dapStageChip");
    if (stageChip) new MutationObserver(() => requestAnimationFrame(sync)).observe(stageChip, {childList:true, subtree:true, characterData:true});
    const position = document.querySelector("#dapPosition");
    if (position) new MutationObserver(() => requestAnimationFrame(sync)).observe(position, {childList:true, subtree:true, characterData:true});

    ["dapQuestionStyle", "dapAnswerStyle", "dapSubject", "dapChapter", "modeSelect"].forEach(id => {
      document.getElementById(id)?.addEventListener("change", () => requestAnimationFrame(sync));
    });

    if (!globalThis.__QTIMER_FOCUS_READING_RENDER_WRAPPED && typeof renderQuestion === "function") {
      const previousRenderQuestion = renderQuestion;
      renderQuestion = function(){
        const result = previousRenderQuestion.apply(this, arguments);
        // Finalize the Focus Reading DOM in the same event turn so callers never observe
        // the transient core-render markup. Keep one rAF pass for layout/theme synchronization.
        sync();
        requestAnimationFrame(sync);
        return result;
      };
      globalThis.__QTIMER_FOCUS_READING_RENDER_WRAPPED = true;
    }

    globalThis.QTIMER_DAP_FOCUS_READING = Object.freeze({version:VERSION, sync, deriveKeywords});
    sync();
  }

  boot();
})();
