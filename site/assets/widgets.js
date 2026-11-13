/* Interactive study tools ("Try it" figures). Vanilla JS, no dependencies.
   A chapter places one with:  <div class="widget" data-widget="NAME"></div>
   Each widget is a function that fills its element. Register it in MAP below.
   Rules (see PLAYBOOK.md, stage 6): works on a phone, works in both languages
   and right-to-left, usable by keyboard, redraws when the theme changes, and
   the page still makes sense if the widget fails to load. */
(function () {
  'use strict';
  var LANG = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  var NS = 'http://www.w3.org/2000/svg';

  // All widget text, in both languages. Keep keys identical in en and ar.
  var T = {
    en: { checkTitle: 'Check yourself', show: 'Show answer', hide: 'Hide answer' },
    ar: { checkTitle: 'اختبر نفسك', show: 'أظهر الإجابة', hide: 'أخفِ الإجابة' },
  }[LANG];

  // small helpers
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    for (var k in attrs || {}) { if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function s(tag, attrs) { var el = document.createElementNS(NS, tag); for (var k in attrs || {}) el.setAttribute(k, attrs[k]); return el; }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  void s; void css; // available to project widgets

  /* Example: a self-check card. The question and answer are read from the
     element's own children, so the text stays in the Markdown file:
     <div class="widget" data-widget="self-check">
       <p>Question?</p>
       <p>Answer.</p>
     </div> */
  function selfCheck(el) {
    var paras = Array.prototype.slice.call(el.querySelectorAll('p'));
    var q = paras[0] ? paras[0].textContent : '';
    var a = paras.slice(1).map(function (p) { return p.textContent; }).join(' ');
    el.innerHTML = '';
    var answer = h('div', { class: 'panel', hidden: '' }, [a]);
    var btn = h('button', { type: 'button', class: 'chip', 'aria-expanded': 'false', text: T.show });
    btn.addEventListener('click', function () {
      var open = answer.hasAttribute('hidden');
      if (open) answer.removeAttribute('hidden'); else answer.setAttribute('hidden', '');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? T.hide : T.show;
    });
    el.appendChild(h('h3', { text: T.checkTitle }));
    el.appendChild(h('p', { text: q }));
    el.appendChild(h('div', { class: 'row' }, [btn]));
    el.appendChild(answer);
  }

  var MAP = { 'self-check': selfCheck };

  var done = typeof WeakSet === 'function' ? new WeakSet() : null;
  function init(redraw) {
    document.querySelectorAll('.widget[data-widget]').forEach(function (el) {
      var name = el.getAttribute('data-widget');
      var f = MAP[name];
      // self-check reads its own content, so only build it once
      if (!f || (name === 'self-check' && done && done.has(el))) return;
      if (redraw && name === 'self-check') return;
      try { if (name !== 'self-check') el.innerHTML = ''; f(el); if (done) done.add(el); } catch (e) { console.error(e); }
    });
  }
  init(false);
  var lastW = innerWidth, rt;
  addEventListener('resize', function () { if (Math.abs(innerWidth - lastW) < 40) return; lastW = innerWidth; clearTimeout(rt); rt = setTimeout(function () { init(true); }, 200); });
  new MutationObserver(function () { init(true); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
