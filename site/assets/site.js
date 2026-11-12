(function () {
  var root = document.documentElement;
  document.querySelectorAll('.theme').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    });
  });
  // slide-out menu
  var drawer = document.querySelector('.drawer');
  // older Safari (iOS 15.3 and earlier) has no <dialog>: fall back to a plain open attribute
  if (drawer && !drawer.showModal) {
    drawer.showModal = function () { drawer.setAttribute('open', ''); drawer.classList.add('fallback'); };
    drawer.close = function () { drawer.removeAttribute('open'); document.body.classList.remove('menu-open'); };
  }
  if (drawer) {
    document.querySelectorAll('.open-menu').forEach(function (b) {
      b.addEventListener('click', function () { drawer.showModal(); document.body.classList.add('menu-open'); });
    });
    var shut = function () { drawer.classList.add('closing'); setTimeout(function () { drawer.classList.remove('closing'); drawer.close(); document.body.classList.remove('menu-open'); }, 180); };
    drawer.querySelector('.drawer-close').addEventListener('click', shut);
    drawer.addEventListener('click', function (e) { if (e.target === drawer) shut(); });
    drawer.addEventListener('close', function () { document.body.classList.remove('menu-open'); });
    var here = drawer.querySelector('ol [aria-current]');
    if (here) drawer.addEventListener('animationstart', function () { here.scrollIntoView({ block: 'center' }); }, { once: true });
  }
  // stagger article blocks on load
  document.querySelectorAll('.reveal > *').forEach(function (el, i) { el.style.setProperty('--d', Math.min(i, 14)); });
  // figure labels: "Fig. 5.1"
  var n = (document.querySelector('.big-n') || {}).textContent;
  var fig = root.lang === 'ar' ? 'شكل' : 'Fig.';
  document.querySelectorAll('.widget').forEach(function (w, i) {
    w.setAttribute('data-fig', fig + ' ' + (n ? parseInt(n, 10) + '.' : '') + (i + 1));
  });
  // close the chapter menu when clicking elsewhere
  document.addEventListener('click', function (e) {
    var d = document.querySelector('.toc[open]');
    if (d && !d.contains(e.target)) d.removeAttribute('open');
  });
})();
