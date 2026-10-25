(function () {
  try {
    var html = document.documentElement;
    html.classList.add('authentic-route', 'ready');
    var saved = localStorage.getItem('uz_theme');
    var theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    html.dataset.theme = theme;
    html.style.backgroundColor = theme === 'light' ? '#F8F6F0' : '#111A15';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false;
    try {
      seen = sessionStorage.getItem('uz_pre_done') === '1';
    } catch (e) {}
    if (reduce || seen) html.classList.add('pre-skip');
    else html.classList.add('is-preloading');
  } catch (e) {}
})();
