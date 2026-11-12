// Send returning visitors to the language they last read, and new visitors to
// the language their browser prefers. ?choose keeps the chooser on screen.
(function () {
  if (/[?&]choose\b/.test(location.search)) return;
  var lang = null;
  try { lang = localStorage.getItem('lang'); } catch (e) {}
  if (lang !== 'en' && lang !== 'ar') {
    var prefs = navigator.languages || [navigator.language || ''];
    lang = null;
    for (var i = 0; i < prefs.length && !lang; i++) {
      var p = String(prefs[i]).toLowerCase();
      if (p.indexOf('ar') === 0) lang = 'ar'; else if (p.indexOf('en') === 0) lang = 'en';
    }
  }
  if (lang) location.replace(lang + '/index.html');
})();
