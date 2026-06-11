(function () {
  const BACK_BUTTON_BURST_MS = 260;

  function handleBackButtonClick(event) {
    const button = event.currentTarget;
    const href = button.getAttribute('href');

    button.classList.remove('is-bursting');
    void button.offsetWidth;
    button.classList.add('is-bursting');

    if (!href || href.startsWith('#') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    window.setTimeout(() => {
      window.location.href = href;
    }, BACK_BUTTON_BURST_MS);
  }

  function initBackButtons() {
    document.querySelectorAll('.profile-back').forEach(button => {
      button.addEventListener('click', handleBackButtonClick);
      button.addEventListener('animationend', () => button.classList.remove('is-bursting'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackButtons);
  } else {
    initBackButtons();
  }
})();
