(function () {
  var popup = document.getElementById('ccgrPopup');
  if (!popup) return;

  var STORAGE_KEY = 'ccgrWelcomePopupDismissed';
  var lastFocused = null;

  function dismissed() {
    try { return sessionStorage.getItem(STORAGE_KEY) === '1'; }
    catch (e) { return false; }
  }
  function markDismissed() {
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }
  function openPopup() {
    if (dismissed()) return;
    lastFocused = document.activeElement;
    popup.hidden = false;
    void popup.offsetWidth;
    popup.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var firstClose = popup.querySelector('[data-ccgr-popup-close]');
    if (firstClose) firstClose.focus({ preventScroll: true });
  }
  function closePopup() {
    popup.classList.remove('is-open');
    document.body.style.overflow = '';
    markDismissed();
    setTimeout(function () {
      popup.hidden = true;
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
    }, 380);
  }

  popup.addEventListener('click', function (e) {
    if (e.target === popup || (e.target.closest && e.target.closest('[data-ccgr-popup-close]'))) {
      closePopup();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popup.classList.contains('is-open')) closePopup();
  });
  popup.querySelectorAll('.ccgr-popup__link').forEach(function (a) {
    a.addEventListener('click', markDismissed);
  });

  if (!dismissed()) {
    window.setTimeout(openPopup, 1200);
  }
})();
