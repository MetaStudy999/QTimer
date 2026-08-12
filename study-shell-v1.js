// QTimer Study Shell v1 — data-neutral Focus Study UI foundation.
// Keeps SOURCE BANK and learning schemas untouched; only derives presentation from current state.
(function initQTimerStudyShellV1(){
  const SUBJECT_LABELS = {
    all: "전체 과목",
    s1: "1과목 소프트웨어 설계",
    s2: "2과목 소프트웨어 개발",
    s3: "3과목 데이터베이스 구축",
    s4: "4과목 프로그래밍 언어 활용",
    s5: "5과목 정보시스템 구축관리"
  };

  const STEP_LABELS = {
    preview: "답 보기",
    question: "문제 회상",
    mark: "빈칸 마킹",
    reveal: "정답 확인"
  };

  function boot(){
    const studyView = document.querySelector("#studyView");
    const dapPanel = document.querySelector("#dapchigiPanel");
    const modeSelect = document.querySelector("#modeSelect");
    const studyTab = document.querySelector("#studyTab");
    const dashboardTab = document.querySelector("#dashboardTab");
    const dapchigiTab = document.querySelector("#dapchigiTab");

    if (!studyView || !dapPanel || !modeSelect || !studyTab) {
      setTimeout(boot, 40);
      return;
    }
    if (document.querySelector("#qtStudyContext")) return;

    const context = document.createElement("section");
    context.id = "qtStudyContext";
    context.className = "qt-study-context";
    context.setAttribute("aria-label", "현재 학습 위치");
    context.innerHTML = `
      <div class="qt-study-context-main">
        <strong id="qtContextScope">전체 과목</strong>
        <span class="qt-context-separator">/</span>
        <span id="qtContextMode" class="qt-context-chip primary">학습</span>
      </div>
      <div class="qt-study-context-meta">
        <span id="qtContextRound" class="qt-context-chip">1회독</span>
        <span id="qtContextPosition" class="qt-context-chip">1 / 1</span>
        <span id="qtContextStage" class="qt-context-chip">준비</span>
      </div>`;

    const controlBar = studyView.querySelector(":scope > .control-bar");
    if (controlBar) studyView.insertBefore(context, controlBar);
    else studyView.prepend(context);

    const dock = document.createElement("nav");
    dock.id = "qtActionDock";
    dock.className = "qt-action-dock";
    dock.setAttribute("aria-label", "답치기 빠른 동작");
    dock.innerHTML = `
      <button type="button" data-action="space"><span class="qt-key">Space</span>진행</button>
      <button type="button" data-action="o"><span class="qt-key">O</span>맞음</button>
      <button type="button" data-action="a"><span class="qt-key">A</span>애매</button>
      <button type="button" data-action="x"><span class="qt-key">X</span>틀림</button>`;
    document.body.appendChild(dock);

    const q = selector => document.querySelector(selector);
    const contextScope = q("#qtContextScope");
    const contextMode = q("#qtContextMode");
    const contextRound = q("#qtContextRound");
    const contextPosition = q("#qtContextPosition");
    const contextStage = q("#qtContextStage");

    function chapterLabel(value){
      if (!value || value === "all") return "전체 단원";
      const match = String(value).match(/^ch(\d{2})$/i);
      return match ? `Ch${match[1]}` : String(value);
    }

    function inStudyView(){
      return studyView.hidden === false;
    }

    function focusActive(){
      return inStudyView()
        && state?.mode === "dapchigi"
        && dapPanel.hidden === false;
    }

    function programRuntimeEntry(){
      const api = globalThis.QTIMER_DAP_PROGRAMS;
      if (!api?.get || !api?.runtime) return null;
      const stored = api.get();
      if (!stored?.enabled) return null;
      const runtime = api.runtime();
      return runtime?.compiled?.[runtime.index] || null;
    }

    function setDockState(){
      const step = state?.dapchigiV1?.step || "preview";
      const reveal = step === "reveal";
      const space = dock.querySelector('[data-action="space"]');
      const ratingButtons = [...dock.querySelectorAll('[data-action="o"],[data-action="a"],[data-action="x"]')];
      const programEntry = programRuntimeEntry();

      // A user program may intentionally continue after a reveal step (for example,
      // reveal -> question -> reveal inside a repeat block). In that case the visual
      // program, not the legacy fixed reveal rule, decides whether Space or O/A/X is active.
      if (programEntry) {
        const waitingForRating = programEntry.type === "rate";
        if (space) space.disabled = waitingForRating;
        ratingButtons.forEach(button => { button.disabled = !waitingForRating; });
        return;
      }

      if (space) space.disabled = reveal;
      ratingButtons.forEach(button => { button.disabled = !reveal; });
    }

    function syncContext(){
      const active = focusActive();
      document.body.classList.toggle("qt-focus-mode", active);
      document.body.classList.toggle("qt-application-mode", !active);
      context.hidden = !active;
      dock.hidden = !active;

      if (!active) return;

      const ds = state.dapchigiV1 || {};
      const subject = SUBJECT_LABELS[ds.subject] || "학습 범위";
      const chapter = chapterLabel(ds.chapter);
      const round = Math.max(1, Number(ds.round) || 1);
      const count = Math.max(0, state.currentRoundIds?.length || 0);
      const index = count ? Math.min(count, Math.max(1, (Number(state.currentIndex) || 0) + 1)) : 0;
      const stage = STEP_LABELS[ds.step] || "답치기";

      contextScope.textContent = `${subject} > ${chapter}`;
      contextMode.textContent = "답치기";
      contextRound.textContent = `${round}회독`;
      contextPosition.textContent = `${index} / ${count}`;
      contextStage.textContent = stage;
      setDockState();
    }

    function clickExisting(action){
      if (!focusActive()) return;
      if (action === "space") {
        const advance = q("#dapAdvance");
        if (advance && !advance.disabled) advance.click();
        return;
      }
      const rating = q(`#dapEvalRow button[data-rating="${action}"]`);
      if (rating && !rating.disabled && q("#dapEvalRow")?.hidden === false) rating.click();
    }

    dock.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");
      if (!button || button.disabled) return;
      clickExisting(button.dataset.action);
      requestAnimationFrame(syncContext);
    });

    modeSelect.addEventListener("change", () => requestAnimationFrame(syncContext));
    studyTab.addEventListener("click", () => requestAnimationFrame(syncContext));
    dashboardTab?.addEventListener("click", () => requestAnimationFrame(syncContext));
    dapchigiTab?.addEventListener("click", () => requestAnimationFrame(syncContext));

    const observer = new MutationObserver(() => requestAnimationFrame(syncContext));
    observer.observe(dapPanel, {attributes:true, attributeFilter:["hidden"], subtree:false});
    const stageChip = q("#dapStageChip");
    const position = q("#dapPosition");
    if (stageChip) observer.observe(stageChip, {childList:true, characterData:true, subtree:true});
    if (position) observer.observe(position, {childList:true, characterData:true, subtree:true});

    // renderQuestion is frequently called by both the normal study flow and Dapchigi.
    // Wrap it once so context values stay aligned with state without changing learning logic.
    if (!globalThis.__QTIMER_STUDY_SHELL_RENDER_WRAPPED && typeof renderQuestion === "function") {
      const previousRenderQuestion = renderQuestion;
      renderQuestion = function(){
        const result = previousRenderQuestion.apply(this, arguments);
        requestAnimationFrame(syncContext);
        return result;
      };
      globalThis.__QTIMER_STUDY_SHELL_RENDER_WRAPPED = true;
    }

    syncContext();
    globalThis.QTIMER_STUDY_SHELL = {
      version: 1,
      sync: syncContext,
      isFocusActive: focusActive
    };
  }

  boot();
})();
