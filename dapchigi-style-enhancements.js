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
