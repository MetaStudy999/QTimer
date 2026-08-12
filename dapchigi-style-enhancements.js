// QTimer Dapchigi visual emphasis enhancements.
// Keep the existing style values for backward compatibility while upgrading
// their labels and rendering to combine highlight/marking with bold emphasis.
(function initDapchigiStyleEnhancements(){
  const questionStyle = document.querySelector('#dapQuestionStyle');
  const answerStyle = document.querySelector('#dapAnswerStyle');
  if (!questionStyle || !answerStyle) return;

  const renameOption = (select, value, label) => {
    const option = [...select.options].find(item => item.value === value);
    if (option) option.textContent = label;
  };

  renameOption(questionStyle, 'all-highlight', '전체 형광펜 + 볼드');
  renameOption(questionStyle, 'keyword-highlight', '핵심어 형광펜 + 볼드');
  renameOption(answerStyle, 'all-highlight', '전체 형광펜 + 볼드');
  renameOption(answerStyle, 'keyword-highlight', '핵심어 형광펜 + 볼드');
  renameOption(answerStyle, 'mark', '답 마킹 + 볼드');

  if (!document.querySelector('#dapchigiBoldHighlightStyles')) {
    const style = document.createElement('style');
    style.id = 'dapchigiBoldHighlightStyles';
    style.textContent = `
      body.dapchigi-active mark.dap-highlight,
      body.dapchigi-active mark.dap-highlight.dap-highlight-question,
      body.dapchigi-active mark.dap-highlight.dap-highlight-answer {
        font-weight: 900 !important;
      }
      html body.dapchigi-active.qt-focus-reading-v2 #studyView #questionText .qt-focus-stem-mark {
        background: var(--qt-focus-stem-soft,var(--qt-q-highlight,#bfdbfe)) !important;
        font-weight: 900 !important;
      }
      body.qt-focus-reading-v2 .qt-focus-quick-pane[data-qt-focus-quick-pane="question"] .qt-focus-quick-checks {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
})();

// Load the first QTimer Design System vertical slice only after Dapchigi is ready.
// This keeps the stable app/data boot sequence untouched and makes the layer easy to roll back.
(function loadQTimerStudyDesignSystemV1(){
  if (!document.querySelector('link[data-qtimer-design="v1"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './qtimer-design-system-v1.css';
    link.dataset.qtimerDesign = 'v1';
    document.head.appendChild(link);
  }

  if (!document.querySelector('script[data-qtimer-feature="study-shell-v1"]')) {
    const script = document.createElement('script');
    script.src = './study-shell-v1.js';
    script.dataset.qtimerFeature = 'study-shell-v1';
    script.defer = false;
    document.body.appendChild(script);
  }
})();

// Semantic choice marking is reveal-only and data-neutral. Keep it outside the core
// Dapchigi state machine so it can evolve independently without touching learning records.
(function loadSemanticChoiceMarkingV1(){
  if (document.querySelector('script[data-qtimer-feature="semantic-choice-marking-v1"]')) return;
  const script = document.createElement('script');
  script.src = './semantic-choice-marking-v1.js';
  script.dataset.qtimerFeature = 'semantic-choice-marking-v1';
  script.defer = false;
  document.body.appendChild(script);
})();

// Focus Reading v2 keeps Dapchigi centered on problem + explanation and hides global navigation.
// It is a presentation-only layer and intentionally loads after the stable Dapchigi/Study Shell stack.
(function loadDapchigiFocusReadingV2(){
  if (document.querySelector('script[data-qtimer-feature="dapchigi-focus-reading-v2"]')) return;
  const script = document.createElement('script');
  script.src = './dapchigi-focus-reading-v2.js';
  script.dataset.qtimerFeature = 'dapchigi-focus-reading-v2';
  script.defer = false;
  document.body.appendChild(script);
})();

// Focus Quick Settings v1 adds a compact, reversible question/answer/keyword display drawer.
// The module waits for Focus Reading + Settings v3 before booting, so dynamic load order is safe.
(function loadDapchigiFocusQuickSettingsV1(){
  if (document.querySelector('script[data-qtimer-feature="dapchigi-focus-quick-settings-v1"]')) return;
  const script = document.createElement('script');
  script.src = './dapchigi-focus-quick-settings-v1.js';
  script.dataset.qtimerFeature = 'dapchigi-focus-quick-settings-v1';
  script.defer = false;
  document.body.appendChild(script);
})();

// Dapchigi Program Builder v1 lets users visually compose the answer-training order,
// including drag reordering and bounded repeat blocks. It waits for Focus Reading at boot,
// so loading it here does not change the verified question-bank boot sequence.
(function loadDapchigiProgramBuilderV1(){
  if (document.querySelector('script[data-qtimer-feature="dapchigi-program-builder-v1"]')) return;
  const script = document.createElement('script');
  script.src = './dapchigi-program-builder-v1.js';
  script.dataset.qtimerFeature = 'dapchigi-program-builder-v1';
  script.defer = false;
  document.body.appendChild(script);
})();

// Live Format Editor v1 is a WYSIWYG presentation editor. It reads the real current question
// into an isolated preview and never changes study position, attempts, ratings, or SOURCE BANK.
(function loadDapchigiLiveFormatEditorV1(){
  if (document.querySelector('script[data-qtimer-feature="dapchigi-live-format-editor-v1"]')) return;
  const script = document.createElement('script');
  script.src = './dapchigi-live-format-editor-v1.js';
  script.dataset.qtimerFeature = 'dapchigi-live-format-editor-v1';
  script.defer = false;
  document.body.appendChild(script);
})();