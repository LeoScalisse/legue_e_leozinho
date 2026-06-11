(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.warn('Nao foi possivel registrar o PWA.', error);
    });
  });
})();
