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
      body.dapchigi-active mark.dap-highlight {
        font-weight: 900 !important;
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