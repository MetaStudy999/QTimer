// QTimer Semantic Choice Marking v1
// Data-neutral presentation layer for Dapchigi reveal stage.
// Red = exam answer target. Blue = non-answer choice that conforms to a negative stem.
// No strikethrough is used: exclusion does not imply that the concept itself is false.
(function initSemanticChoiceMarkingV1(){
  const VERSION = 1;
  const NEGATIVE_FALSE_RE = /(옳지\s*않|올바르지\s*않|틀린|맞지\s*않|잘못된|부적절|적절하지\s*않)/;
  const NEGATIVE_EXCLUSION_RE = /(아닌\s*것|해당하지\s*않|포함되지\s*않|속하지\s*않|거리가\s*먼|관계(?:가|이)?\s*없|관련(?:이)?\s*없|제외되는|제외한)/;
  const POSITIVE_RE = /(옳은|올바른|맞는|적절한|해당하는|포함되는|속하는|관계(?:가|이)?\s*있는|관련(?:이)?\s*있는)/;

  function classifyStem(text){
    const stem = String(text || "");
    const falseNegative = NEGATIVE_FALSE_RE.test(stem);
    const exclusionNegative = NEGATIVE_EXCLUSION_RE.test(stem);
    const positive = POSITIVE_RE.test(stem);

    // Contradictory/compound wording is intentionally conservative: show only the answer target.
    if ((falseNegative || exclusionNegative) && positive) return "uncertain";
    if (falseNegative) return "negative-false";
    if (exclusionNegative) return "negative-exclusion";
    return "positive";
  }

  function clearSemanticMarks(){
    document.querySelectorAll("#choices .choice").forEach(choice => {
      choice.classList.remove("qt-semantic-target", "qt-semantic-support");
      delete choice.dataset.semanticRole;
      choice.querySelectorAll(".qt-semantic-badge").forEach(badge => badge.remove());
    });
    document.querySelector("#choices")?.removeAttribute("data-semantic-stem");
  }

  function appendBadge(choice, role){
    const textSpan = choice.children?.[1];
    if (!textSpan || textSpan.querySelector(".qt-semantic-badge")) return;
    const badge = document.createElement("span");
    badge.className = `qt-semantic-badge qt-semantic-badge-${role}`;
    badge.textContent = role === "target" ? "● 선택" : "✓ 부합";
    textSpan.append(" ", badge);
  }

  function apply(){
    clearSemanticMarks();
    if (typeof state === "undefined" || state.mode !== "dapchigi" || state.dapchigiV1?.step !== "reveal") return;
    if (typeof currentQuestion !== "function" || typeof effectiveAnswer !== "function") return;

    const q = currentQuestion();
    if (!q) return;
    const answer = Number(effectiveAnswer(q));
    if (!Number.isInteger(answer) || answer < 1) return;

    const stemType = classifyStem(q.questionText);
    const choices = [...document.querySelectorAll("#choices .choice")];
    document.querySelector("#choices")?.setAttribute("data-semantic-stem", stemType);

    choices.forEach(choice => {
      const number = Number(choice.dataset.answer);
      if (number === answer) {
        choice.classList.add("qt-semantic-target");
        choice.dataset.semanticRole = "target";
        appendBadge(choice, "target");
        return;
      }

      // Only confident negative stems receive blue support marking.
      // Positive and uncertain stems leave all non-answer choices visually neutral.
      if (stemType === "negative-false" || stemType === "negative-exclusion") {
        choice.classList.add("qt-semantic-support");
        choice.dataset.semanticRole = "support";
        appendBadge(choice, "support");
      }
    });
  }

  function installStyles(){
    if (document.querySelector("#qtSemanticChoiceStyles")) return;
    const style = document.createElement("style");
    style.id = "qtSemanticChoiceStyles";
    style.textContent = `
      :root {
        --qt-semantic-target: #b42318;
        --qt-semantic-target-soft: #fff1f0;
        --qt-semantic-support: #175cd3;
        --qt-semantic-support-soft: #eff8ff;
      }
      body.dapchigi-active #choices .choice.qt-semantic-target {
        border-color: var(--qt-semantic-target) !important;
        background: var(--qt-semantic-target-soft) !important;
        box-shadow: inset 4px 0 0 var(--qt-semantic-target);
      }
      body.dapchigi-active #choices .choice.qt-semantic-support {
        border-color: color-mix(in srgb, var(--qt-semantic-support) 58%, var(--qt-border, #dce2ea)) !important;
        background: var(--qt-semantic-support-soft) !important;
        box-shadow: inset 4px 0 0 var(--qt-semantic-support);
      }
      body.dapchigi-active #choices .choice.qt-semantic-target,
      body.dapchigi-active #choices .choice.qt-semantic-target *,
      body.dapchigi-active #choices .choice.qt-semantic-support,
      body.dapchigi-active #choices .choice.qt-semantic-support * {
        text-decoration-line: none !important;
      }
      body.dapchigi-active #choices .choice.qt-semantic-target .choice-number,
      body.dapchigi-active #choices .choice.qt-semantic-target > span:nth-child(2),
      body.dapchigi-active #choices .choice.qt-semantic-target mark {
        color: var(--qt-semantic-target) !important;
        font-weight: 900 !important;
      }
      body.dapchigi-active #choices .choice.qt-semantic-support .choice-number,
      body.dapchigi-active #choices .choice.qt-semantic-support > span:nth-child(2),
      body.dapchigi-active #choices .choice.qt-semantic-support mark {
        color: var(--qt-semantic-support) !important;
        font-weight: 850 !important;
      }
      .qt-semantic-badge {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        margin-left: 8px;
        padding: 2px 7px;
        border-radius: 999px;
        font-size: 12px;
        line-height: 1;
        font-weight: 900 !important;
        vertical-align: middle;
        white-space: nowrap;
      }
      .qt-semantic-badge-target {
        color: var(--qt-semantic-target) !important;
        background: color-mix(in srgb, var(--qt-semantic-target-soft) 72%, white);
        border: 1px solid color-mix(in srgb, var(--qt-semantic-target) 40%, white);
      }
      .qt-semantic-badge-support {
        color: var(--qt-semantic-support) !important;
        background: color-mix(in srgb, var(--qt-semantic-support-soft) 72%, white);
        border: 1px solid color-mix(in srgb, var(--qt-semantic-support) 38%, white);
      }
      @media (prefers-contrast: more) {
        body.dapchigi-active #choices .choice.qt-semantic-target,
        body.dapchigi-active #choices .choice.qt-semantic-support {
          border-width: 2px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function scheduleApply(){
    queueMicrotask(apply);
  }

  installStyles();

  const stage = document.querySelector("#dapStageChip");
  if (stage) {
    new MutationObserver(scheduleApply).observe(stage, { childList: true, subtree: true, characterData: true });
  }

  ["modeSelect", "dapAnswerStyle", "dapQuestionStyle", "dapSubject", "dapChapter"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", scheduleApply);
  });
  document.getElementById("dapApplyScope")?.addEventListener("click", scheduleApply);
  document.getElementById("dapAdvance")?.addEventListener("click", scheduleApply);
  document.getElementById("dapEvalRow")?.addEventListener("click", scheduleApply);
  document.addEventListener("keydown", event => {
    if (state?.mode !== "dapchigi") return;
    if (event.key === " " || ["o", "a", "x"].includes(event.key.toLowerCase())) scheduleApply();
  }, { capture: true });

  globalThis.QTIMER_SEMANTIC_CHOICE_MARKING = Object.freeze({
    version: VERSION,
    classifyStem,
    apply
  });

  scheduleApply();
})();