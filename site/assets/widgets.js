/* Interactive study tools ("Try it" figures and the crisis kit). Vanilla JS, no dependencies.
   A page places one with:  <div class="widget" data-widget="NAME"><p>Fallback text.</p></div>
   Each widget is a function that fills its element. Register it in MAP below.
   Rules (see PLAYBOOK.md, stage 6): works on a phone, works in both languages
   and right-to-left, usable by keyboard, follows the theme (colours come from
   CSS variables), and the page still makes sense if the widget fails to load.
   Storage: only the crisis kit and the three-blessings widget save anything,
   and only in this browser (localStorage). Nothing is ever sent anywhere. */
(function () {
  'use strict';
  var LANG = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  var NS = 'http://www.w3.org/2000/svg';
  var KEY = 'life-on-replay:kit:v1';
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // All widget text, in both languages. Keep keys identical in en and ar.
  var TEXT = {
    en: {
      fig: 'Fig.', illustrative: 'Illustrative, not data.',
      checkTitle: 'Check yourself', show: 'Show answer', hide: 'Hide answer',
      // 1 replay
      replayTitle: 'Replay the match', replayLast: "Last night's match", replayYou: 'Your team', replayThem: 'Them',
      replayBtn: 'Replay the match', replayAgain: 'Replay it again', replayMin: 'min',
      replayCount: function (n) { return 'Replays: ' + n + '. Times the score changed: 0.'; },
      replayNote: 'Is there something you keep replaying in your mind, hoping it ends differently? The first truth of chapter 1: it was written, and replaying it will not change the score. What can still change is what you do next.',
      // 2 pebble jar
      jarTitle: 'The pebble jar', jarAsk: 'Tap each day of the past week that was a good day, even in a small way.',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], jarCount: 'Count my age, his way',
      jarResult: function (n) { return n === 0 ? 'No pebbles yet. A good day can be small: a meal with family, a task finished, a call with a friend.' : 'By his count, you lived ' + n + ' of the last 7 days.' + (n < 7 ? ' What would it take to drop one more pebble this week?' : ' A full jar. Notice what made these days good.'); },
      jarLabel: 'A glass jar with one pebble for each good day',
      // 3 waterfall
      fallTitle: 'The fading waterfall', fallDay: 'Day', fallWow: 'How amazing it feels',
      fallSteps: ['Day 1: they stop the car and take photos.', 'Day 2: they no longer get out of the car.', 'Day 3: a glance through the window.', 'Day 4: nobody even points it out.', 'Day 5: it is just the road now.', 'Day 6: it is just the road now.', 'Day 7: it is just the road now.'],
      fallNote: 'The waterfall did not change; they did. Psychologists call this hedonic adaptation. It works on losses too: the sting fades, as the shine does.',
      fallSlider: 'Day of the trip',
      // 4 four ways
      waysTitle: 'Four ways to receive it', waysAsk: 'Think of a recent setback. Which sentence is closest to what you said inside?',
      ways: [
        { say: '"Why me? Why would this happen to me?"', name: 'Discontent and panic', up: 'One step up is patience: it still hurts, but you stop fighting what has already happened. Try saying "God help me" instead of "why me".' },
        { say: '"It burns, but God help me, I will bear it."', name: 'Patience', up: 'One step up is contentment: "since You chose this for me, I accept it." Trust that there may be good in it you cannot see yet.' },
        { say: '"You chose this for me, my Lord, and I accept it."', name: 'Contentment', up: 'One step up is gratitude: noticing what remains, and what this may be giving you.' },
        { say: '"Even in this, there is something to thank God for."', name: 'Gratitude', up: 'The top rung. Hold it gently: the next crisis may start you lower, and that is human.' }
      ],
      waysYou: 'You are at', waysLabel: 'A ladder with four rungs, from discontent at the bottom to gratitude at the top',
      // 6 who to tell
      tellTitle: 'Who to tell', tellAsk: 'Add the people you might talk to, and answer two questions about each.',
      tellName: 'A name, or just initials', tellJudg: 'Sound judgment?', tellSecret: 'Keeps secrets?', yes: 'Yes', no: 'No', tellAdd: 'Add',
      tellVent: 'Someone to vent to', tellLight: 'Keep it light with', tellRemove: 'Remove',
      tellEmpty: 'No one yet.', tellNote: 'The guest says that out of 50 friends, perhaps one or two have both qualities. Nothing you type here is saved or sent.',
      // 8 fair comparison
      cmpTitle: 'A fair comparison', cmpThem: 'Colleague', cmpMe: 'Me', cmpSame: 'Same',
      cmpAreas: ['Home', 'Health', 'Children', 'Family', 'Peace of mind', 'Free time'],
      cmpAll: 'Compare all of life',
      cmpOne: 'Compared on one area, the colleague in the villa wins 1 to 0. That is the comparison the guest calls the door to misery: the wrong area, at the wrong time.',
      cmpWide: function (a, b, c) { return 'On all of life: the colleague has more in ' + a + ', you have more in ' + c + ', and you are level in ' + b + '. The picture is wider than the villa.'; },
      // 9 three blessings
      blessTitle: 'Three blessings tonight', blessAsk: 'Name three good things from today, small ones are fine.',
      blessPh: ['No accident on the road today', 'I finished a task', 'A good evening with a friend'],
      blessN: function (i) { return 'Blessing ' + i; }, blessDone: 'Thank God for them',
      blessThanks: 'Done for tonight. Tomorrow, watch for three more during the day. These are saved in your crisis kit, on this device only.',
      kitLink: 'Open my crisis kit',
      // 10 words that heal
      wordsTitle: 'Words that heal', wordsAsk: 'For each moment, choose what you would say.',
      wordsKind: 'Yes. ', wordsHarsh: 'Those are the words from one of the stories. ',
      wordsScore: function (n, t) { return n + ' of ' + t + ' answered.'; },
      words: [
        { ctx: 'Visiting a friend in hospital.', harsh: '"There\'s nothing wrong with you."', kind: '"May God heal you."', why: 'A patient wants to feel understood, not told the pain is not real.' },
        { ctx: 'A friend\'s decision turned out badly.', harsh: '"It\'s your own fault."', kind: '"You chose what looked right with what you knew then."', why: 'Judge a decision by what was known when it was made, not by how it ended.' },
        { ctx: 'A classmate left two questions blank.', harsh: '"Don\'t worry, the resit was made for people like you."', kind: '"One exam doesn\'t decide who you are. You\'ll be ready next time."', why: 'Kind meaning needs kind wording, or it wounds the person\'s dignity.' },
        { ctx: 'Leaving a sick man\'s room, talking to his son.', harsh: '"If he dies, bury him in the village with his parents."', kind: '"We are praying for him. Tell me if you need anything."', why: 'Hope and practical help, not plans for a funeral.' }
      ],
      // 12 circles
      circTitle: "Life's circles", circAsk: 'A work problem has found its way home. Move it back to where it belongs.',
      circNames: ['Work', 'Home and family', 'Friends', 'Health', 'Hobbies'], circToken: 'Work problem', circMove: 'Move it to:',
      circOk: 'It stays in its own circle. Home, friends, health and hobbies can still go right today.',
      circSpill: function (c) { return 'It has spilled into ' + c + '. The guest\'s advice: don\'t carry a work crisis home and take it out on the people there.'; },
      circLabel: 'Five circles of life, with a work problem placed in one of them',
      // 12 imagine without
      imagTitle: 'Imagine without', imagAsk: 'Tap to take each one away, and imagine your life without it.',
      imagItems: ['Health', 'Family', 'Friends', 'Work'], imagBack: 'Give them all back',
      imagEmpty: 'Hard to imagine. Now give them back.',
      imagDone: 'Everything you just took back, you have today. Imagining a good thing gone makes people value it more; research calls this mental subtraction.',
      imagLeft: function (n) { return n + ' of 4 remain'; },
      // kit
      kitSteps: 'Steps I will try', kitChosen: function (n) { return n + ' chosen'; }, kitCh: 'Ch.',
      kitPerson: 'Someone wise and discreet I can talk to', kitBless: 'Three blessings from today', kitOwn: 'My own step',
      kitPrint: 'Print my kit', kitClear: 'Clear everything', kitClearSure: 'Tap again to clear', kitSaved: 'Saved only in this browser, on this device.',
      kitNoStore: 'This browser is not saving data, so the kit will be empty next time. You can still print it.'
    },
    ar: {
      fig: 'شكل', illustrative: 'توضيحي، وليس بيانات.',
      checkTitle: 'اختبر نفسك', show: 'أظهر الإجابة', hide: 'أخفِ الإجابة',
      replayTitle: 'أعد بث المباراة', replayLast: 'مباراة البارحة', replayYou: 'فريقك', replayThem: 'الخصم',
      replayBtn: 'أعد بث المباراة', replayAgain: 'أعدها مرة أخرى', replayMin: 'د',
      replayCount: function (n) { return 'مرات الإعادة: ' + n + '. مرات تغيّر النتيجة: 0.'; },
      replayNote: 'هل هناك شيء تعيده في ذهنك مرة بعد مرة، على أمل أن ينتهي بشكل مختلف؟ الحقيقة الأولى في الفصل الأول: إنه مكتوب، وإعادته لن تغيّر النتيجة. الذي يمكن أن يتغير هو ما تفعله بعده.',
      jarTitle: 'جرّة الحصى', jarAsk: 'اضغط على كل يوم من الأسبوع الماضي كان يومًا طيبًا، ولو بشيء صغير.',
      days: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'], jarCount: 'احسب عمري بطريقته',
      jarResult: function (n) { return n === 0 ? 'لا حصى بعد. اليوم الطيب قد يكون صغيرًا: وجبة مع الأهل، أو مهمة أنجزتها، أو مكالمة مع صديق.' : 'بحسابه، عشت ' + n + ' من الأيام السبعة الماضية.' + (n < 7 ? ' ما الذي يلزم لتُسقط حصاة أخرى هذا الأسبوع؟' : ' جرّة ممتلئة. لاحظ ما الذي جعل هذه الأيام طيبة.'); },
      jarLabel: 'جرّة زجاجية فيها حصاة لكل يوم طيب',
      fallTitle: 'الشلال الذي يخفت', fallDay: 'اليوم', fallWow: 'مقدار الدهشة',
      fallSteps: ['اليوم 1: يوقفون السيارة ويصوّرون.', 'اليوم 2: لم يعودوا ينزلون من السيارة.', 'اليوم 3: نظرة من النافذة.', 'اليوم 4: لا أحد يشير إليه حتى.', 'اليوم 5: صار مجرد طريق.', 'اليوم 6: صار مجرد طريق.', 'اليوم 7: صار مجرد طريق.'],
      fallNote: 'الشلال لم يتغير؛ هم الذين تغيّروا. يسمّي علماء النفس هذا التكيّف مع المتعة. وهو يعمل على الخسارات أيضًا: يخفت الألم كما يخفت البريق.',
      fallSlider: 'يوم الرحلة',
      waysTitle: 'أربع طرق لاستقبال الأزمة', waysAsk: 'تذكّر شدة مررت بها مؤخرًا. أي هذه الجمل أقرب إلى ما قلته في داخلك؟',
      ways: [
        { say: '«ليش أنا؟ ليش يصير لي هذا؟»', name: 'السخط والجزع', up: 'الدرجة التالية هي الصبر: ما زال يؤلم، لكنك تكفّ عن منازعة ما وقع. جرّب أن تقول «الله يعينني» بدل «ليش أنا».' },
        { say: '«محترق من داخل، لكن الله يعينني وسأتحمّل.»', name: 'الصبر', up: 'الدرجة التالية هي الرضا: «ما دمت اخترت لي هذا يا رب فأنا راضٍ». ثق أن فيه خيرًا قد لا تراه الآن.' },
        { say: '«ما دمت اخترت لي هذا يا رب فأنا راضٍ به.»', name: 'الرضا', up: 'الدرجة التالية هي الشكر: أن تلاحظ ما بقي، وما قد يعطيك إياه هذا.' },
        { say: '«حتى في هذا، هناك ما أحمد الله عليه.»', name: 'الشكر', up: 'أعلى درجة. تمسّك بها برفق: قد تبدأ الأزمة القادمة بك من درجة أدنى، وهذا من طبيعة البشر.' }
      ],
      waysYou: 'أنت عند', waysLabel: 'سلّم من أربع درجات، أدناها السخط وأعلاها الشكر',
      tellTitle: 'لمن تفضفض؟', tellAsk: 'أضف الأشخاص الذين قد تتحدث إليهم، وأجب عن سؤالين عن كل واحد.',
      tellName: 'اسم، أو حروف أولى فقط', tellJudg: 'صاحب رأي؟', tellSecret: 'يحفظ السر؟', yes: 'نعم', no: 'لا', tellAdd: 'أضف',
      tellVent: 'أفضفض له', tellLight: 'أكتفي معه بالحديث الخفيف', tellRemove: 'احذف',
      tellEmpty: 'لا أحد بعد.', tellNote: 'يقول الضيف إنه من بين 50 صديقًا قد يجتمع الشرطان في واحد أو اثنين فقط. لا يُحفظ شيء مما تكتبه هنا ولا يُرسل.',
      cmpTitle: 'مقارنة عادلة', cmpThem: 'الزميل', cmpMe: 'أنا', cmpSame: 'متساويان',
      cmpAreas: ['السكن', 'الصحة', 'الأولاد', 'الأهل', 'راحة البال', 'وقت الفراغ'],
      cmpAll: 'قارن الحياة كلها',
      cmpOne: 'بالمقارنة في جانب واحد، يفوز الزميل صاحب الفيلا 1 مقابل 0. هذه هي المقارنة التي يسمّيها الضيف باب التعاسة: الجانب الخطأ، في التوقيت الخطأ.',
      cmpWide: function (a, b, c) { return 'بالحياة كلها: الزميل يتقدم في ' + a + '، وأنت تتقدم في ' + c + '، وأنتما متساويان في ' + b + '. الصورة أوسع من الفيلا.'; },
      blessTitle: 'ثلاث نعم الليلة', blessAsk: 'سمِّ ثلاثة أشياء جميلة من يومك، والصغيرة تكفي.',
      blessPh: ['لم يقع لي حادث في الطريق اليوم', 'أنجزت مهمة', 'سهرة جميلة مع صديق'],
      blessN: function (i) { return 'النعمة ' + i; }, blessDone: 'الحمد لله عليها',
      blessThanks: 'انتهيت الليلة. غدًا ترقّب ثلاثًا أخرى خلال النهار. حُفظت هذه النعم في عُدّتك للأزمات، على هذا الجهاز فقط.',
      kitLink: 'افتح عُدّتي للأزمات',
      wordsTitle: 'كلمات تداوي', wordsAsk: 'في كل موقف، اختر ما ستقوله.',
      wordsKind: 'نعم. ', wordsHarsh: 'هذه هي الكلمات التي قيلت في إحدى القصص. ',
      wordsScore: function (n, t) { return 'أجبت عن ' + n + ' من ' + t + '.'; },
      words: [
        { ctx: 'تزور صديقًا في المستشفى.', harsh: '«ما فيك إلا العافية.»', kind: '«الله يشفيك.»', why: 'المريض يريد أن يشعر بأنه مفهوم، لا أن يُقال له إن ألمه غير حقيقي.' },
        { ctx: 'قرار اتخذه صديقك انتهى نهاية سيئة.', harsh: '«أنت السبب.»', kind: '«اخترت ما بدا صحيحًا بما كنت تعرفه وقتها.»', why: 'احكم على القرار بما كان معروفًا حين اتُّخذ، لا بما انتهى إليه.' },
        { ctx: 'زميل ترك سؤالين بلا إجابة.', harsh: '«لا تهتم، الدور الثاني ما حطّوه إلا لك ولأشكالك.»', kind: '«اختبار واحد لا يحدد من أنت. ستكون مستعدًا المرة القادمة.»', why: 'المعنى اللطيف يحتاج صياغة لطيفة، وإلا جرح الكرامة.' },
        { ctx: 'تغادر غرفة مريض وتحدّث ابنه.', harsh: '«إن مات أبوك فادفنوه في مقبرة الديرة مع والديه.»', kind: '«ندعو له. أخبرني إن احتجت أي شيء.»', why: 'الرجاء والعون العملي، لا ترتيبات الجنازة.' }
      ],
      circTitle: 'دوائر الحياة', circAsk: 'مشكلة من العمل وجدت طريقها إلى البيت. أعدها إلى مكانها.',
      circNames: ['العمل', 'البيت والأهل', 'الأصدقاء', 'الصحة', 'الهوايات'], circToken: 'مشكلة العمل', circMove: 'انقلها إلى:',
      circOk: 'بقيت في دائرتها. البيت والأصدقاء والصحة والهوايات يمكن أن تسير على ما يرام اليوم.',
      circSpill: function (c) { return 'فاضت إلى دائرة ' + c + '. نصيحة الضيف: لا تنقل أزمة العمل إلى البيت فتفرغها في أهلك.'; },
      circLabel: 'خمس دوائر للحياة، وفي إحداها مشكلة من العمل',
      imagTitle: 'تخيّل بدونها', imagAsk: 'اضغط لتأخذ كل واحدة منها، وتخيّل حياتك بدونها.',
      imagItems: ['الصحة', 'الأهل', 'الأصدقاء', 'العمل'], imagBack: 'أعدها كلها',
      imagEmpty: 'يصعب تخيّلها. والآن أعدها.',
      imagDone: 'كل ما استعدته الآن موجود عندك اليوم. تخيّل غياب شيء جميل يجعل الناس يقدّرونه أكثر؛ ويسمّي البحث هذا الطرح الذهني.',
      imagLeft: function (n) { return 'بقي ' + n + ' من 4'; },
      kitSteps: 'خطوات سأجرّبها', kitChosen: function (n) { return 'اخترت ' + n; }, kitCh: 'ف',
      kitPerson: 'شخص حكيم كتوم أستطيع أن أفضفض له', kitBless: 'ثلاث نعم من يومي', kitOwn: 'خطوتي الخاصة',
      kitPrint: 'اطبع عُدّتي', kitClear: 'امسح كل شيء', kitClearSure: 'اضغط مرة أخرى للمسح', kitSaved: 'محفوظة في هذا المتصفح، على هذا الجهاز فقط.',
      kitNoStore: 'هذا المتصفح لا يحفظ البيانات، فستكون العُدّة فارغة في المرة القادمة. ما زال بإمكانك طباعتها.'
    }
  };
  var T = TEXT[LANG];

  // small helpers
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    for (var k in attrs || {}) { if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function s(tag, attrs, text) { var el = document.createElementNS(NS, tag); for (var k in attrs || {}) el.setAttribute(k, attrs[k]); if (text != null) el.textContent = text; return el; }
  function btn(text, cls, onClick) { var b = h('button', { type: 'button', class: cls || 'chip', text: text }); b.addEventListener('click', onClick); return b; }
  function press(b, on) { b.setAttribute('aria-pressed', String(!!on)); }
  function title(el, text, ask) { el.appendChild(h('h3', { text: text })); if (ask) el.appendChild(h('p', { class: 'note ask', text: ask })); }
  function live(cls) { return h('div', { class: cls || 'panel', 'aria-live': 'polite' }); }
  var uid = 0; function id(p) { uid += 1; return 'w-' + p + '-' + uid; }

  // storage that never throws (private windows and blocked storage just lose it)
  var canStore = (function () { try { localStorage.setItem(KEY + ':t', '1'); localStorage.removeItem(KEY + ':t'); return true; } catch (e) { return false; } })();
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(state) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* not saved */ } }

  /* ---------- self-check (from the starter) ---------- */
  function selfCheck(el) {
    var paras = Array.prototype.slice.call(el.querySelectorAll('p'));
    var q = paras[0] ? paras[0].textContent : '';
    var a = paras.slice(1).map(function (p) { return p.textContent; }).join(' ');
    el.innerHTML = '';
    var answer = h('div', { class: 'panel', hidden: '' }, [a]);
    var b = h('button', { type: 'button', class: 'chip', 'aria-expanded': 'false', text: T.show });
    b.addEventListener('click', function () {
      var open = answer.hasAttribute('hidden');
      if (open) answer.removeAttribute('hidden'); else answer.setAttribute('hidden', '');
      b.setAttribute('aria-expanded', String(open));
      b.textContent = open ? T.hide : T.show;
    });
    title(el, T.checkTitle);
    el.appendChild(h('p', { text: q }));
    el.appendChild(h('div', { class: 'row' }, [b]));
    el.appendChild(answer);
  }

  /* ---------- 1. Replay: the score never changes ---------- */
  function replay(el) {
    var n = 0, timer = null;
    title(el, T.replayTitle);
    var board = h('div', { class: 'scoreboard' }, [
      h('span', { class: 'label', text: T.replayLast }),
      h('div', { class: 'score' }, [h('span', { text: T.replayYou }), h('b', { class: 'big-stat', text: '0 – 2' }), h('span', { text: T.replayThem })]),
    ]);
    var bar = h('div', { class: 'meter' }, [h('i')]);
    var clock = h('span', { class: 'label clock', text: "0'" });
    var count = live('note');
    var reflect = h('div', { class: 'panel', hidden: '' }, [T.replayNote]);
    var go = btn(T.replayBtn, 'chip go', function () {
      if (timer) return;
      go.disabled = true;
      var t = 0, fill = bar.firstChild;
      function tick() {
        t = REDUCED ? 90 : Math.min(90, t + 6);
        fill.style.width = (t / 90 * 100) + '%';
        clock.textContent = t + "'";
        if (t >= 90) {
          clearInterval(timer); timer = null; n += 1;
          count.textContent = T.replayCount(n);
          reflect.removeAttribute('hidden');
          go.textContent = T.replayAgain; go.disabled = false;
        }
      }
      fill.style.width = '0%';
      timer = setInterval(tick, 70); tick();
    });
    el.appendChild(board); el.appendChild(bar);
    el.appendChild(h('div', { class: 'row spread' }, [go, clock]));
    el.appendChild(count); el.appendChild(reflect);
  }

  /* ---------- 2. The pebble jar ---------- */
  function pebbleJar(el) {
    var on = [false, false, false, false, false, false, false];
    title(el, T.jarTitle, T.jarAsk);
    var svg = s('svg', { viewBox: '0 0 200 170', role: 'img', 'aria-label': T.jarLabel, class: 'jar' });
    svg.appendChild(s('path', { d: 'M62 14h76v12c0 6 18 12 18 34v86c0 10-8 16-18 16H62c-10 0-18-6-18-16V60c0-22 18-28 18-34z', style: 'fill: var(--card); stroke: var(--ink-2); stroke-width: 2' }));
    svg.appendChild(s('rect', { x: 58, y: 6, width: 84, height: 10, rx: 3, style: 'fill: var(--paper-2); stroke: var(--ink-2); stroke-width: 2' }));
    var spots = [[78, 146], [100, 148], [122, 146], [89, 128], [111, 128], [100, 110], [78, 112]];
    var pebbles = spots.map(function (p, i) { var c = s('ellipse', { cx: p[0], cy: p[1], rx: 11, ry: 8, style: 'fill: var(--coral); stroke: var(--ink-2); stroke-width: 1' }); c.setAttribute('opacity', '0'); c.dataset.i = i; svg.appendChild(c); return c; });
    var row = h('div', { class: 'row' });
    var result = live();
    result.setAttribute('hidden', '');
    function draw() {
      var k = 0;
      on.forEach(function (v) { if (v) { pebbles[k].setAttribute('opacity', '1'); k += 1; } });
      for (var j = k; j < 7; j++) pebbles[j].setAttribute('opacity', '0');
    }
    T.days.forEach(function (d, i) {
      var b = btn(d, 'chip', function () { on[i] = !on[i]; press(b, on[i]); draw(); if (!result.hasAttribute('hidden')) count(); });
      press(b, false); row.appendChild(b);
    });
    function count() { var n = on.filter(Boolean).length; result.removeAttribute('hidden'); result.textContent = T.jarResult(n); }
    el.appendChild(row);
    el.appendChild(h('div', { class: 'jar-wrap' }, [svg]));
    el.appendChild(h('div', { class: 'row' }, [btn(T.jarCount, 'chip go', count)]));
    el.appendChild(result);
  }

  /* ---------- 3. The fading waterfall ---------- */
  function waterfall(el) {
    var wow = [100, 64, 40, 26, 18, 14, 12]; // illustrative curve
    title(el, T.fallTitle);
    var sid = id('fall');
    var range = h('input', { type: 'range', min: '1', max: '7', step: '1', value: '1', id: sid });
    var lab = h('label', { for: sid, class: 'label', text: T.fallSlider });
    var svg = s('svg', { viewBox: '0 0 320 150', role: 'img', 'aria-label': T.fallWow });
    var bars = wow.map(function (v, i) {
      var x = 18 + i * 42, hgt = v * 1.1;
      var r = s('rect', { x: x, y: 125 - hgt, width: 30, height: hgt, rx: 4 });
      svg.appendChild(r);
      svg.appendChild(s('text', { x: x + 15, y: 143, 'text-anchor': 'middle', class: 'label' }, String(i + 1)));
      return r;
    });
    svg.appendChild(s('line', { x1: 10, x2: 316, y1: 125, y2: 125, style: 'stroke: var(--rule)' }));
    var say = live();
    function draw() {
      var d = +range.value;
      bars.forEach(function (r, i) { r.setAttribute('style', i + 1 === d ? 'fill: var(--signal-text)' : (i + 1 < d ? 'fill: var(--ink-2); opacity: .35' : 'fill: var(--rule)')); });
      say.textContent = T.fallSteps[d - 1] + (d >= 4 ? ' ' + T.fallNote : '');
    }
    range.addEventListener('input', draw);
    el.appendChild(lab); el.appendChild(range); el.appendChild(svg);
    el.appendChild(h('p', { class: 'label', text: T.fallWow + ' · ' + T.illustrative }));
    el.appendChild(say); draw();
  }

  /* ---------- 4. Four ways to receive it ---------- */
  function fourWays(el) {
    title(el, T.waysTitle, T.waysAsk);
    var col = h('div', { class: 'stack' });
    var svg = s('svg', { viewBox: '0 0 260 150', role: 'img', 'aria-label': T.waysLabel, class: 'ladder' });
    svg.appendChild(s('line', { x1: 20, y1: 8, x2: 20, y2: 146, style: 'stroke: var(--ink-2); stroke-width: 3' }));
    svg.appendChild(s('line', { x1: 70, y1: 8, x2: 70, y2: 146, style: 'stroke: var(--ink-2); stroke-width: 3' }));
    var rungs = T.ways.map(function (w, i) {
      var y = 128 - i * 36;
      var r = s('rect', { x: 20, y: y - 4, width: 50, height: 8, rx: 3 });
      var t = s('text', { x: 84, y: y + 5, class: 'label rung' }, w.name);
      svg.appendChild(r); svg.appendChild(t);
      return [r, t];
    });
    var out = live(); out.setAttribute('hidden', '');
    var buttons = T.ways.map(function (w, i) {
      var b = btn(w.say, 'chip wide', function () { pick(i); });
      press(b, false); col.appendChild(b); return b;
    });
    function pick(i) {
      buttons.forEach(function (b, j) { press(b, j === i); });
      rungs.forEach(function (r, j) { r[0].setAttribute('style', j === i ? 'fill: var(--signal-text)' : 'fill: var(--rule)'); r[1].setAttribute('style', j === i ? 'fill: var(--ink); font-weight: 600' : ''); });
      out.removeAttribute('hidden');
      out.innerHTML = '';
      out.appendChild(h('b', { text: T.waysYou + ': ' + T.ways[i].name + '. ' }));
      out.appendChild(document.createTextNode(T.ways[i].up));
    }
    rungs.forEach(function (r) { r[0].setAttribute('style', 'fill: var(--rule)'); });
    el.appendChild(h('div', { class: 'grid2' }, [col, svg]));
    el.appendChild(out);
  }

  /* ---------- 6. Who to tell ---------- */
  function whoToTell(el) {
    var people = [];
    title(el, T.tellTitle, T.tellAsk);
    var nid = id('tell');
    var name = h('input', { type: 'text', id: nid, maxlength: '40', autocomplete: 'off' });
    function yesNo(q) {
      var val = null, g = h('div', { class: 'seg', role: 'group', 'aria-label': q });
      var y = btn(T.yes, '', function () { val = true; press(y, true); press(n, false); });
      var n = btn(T.no, '', function () { val = false; press(y, false); press(n, true); });
      press(y, false); press(n, false); g.appendChild(y); g.appendChild(n);
      return { el: h('div', { class: 'q' }, [h('span', { text: q }), g]), get: function () { return val; }, reset: function () { val = null; press(y, false); press(n, false); } };
    }
    var j = yesNo(T.tellJudg), k = yesNo(T.tellSecret);
    var vent = h('ul'), light = h('ul');
    function draw() {
      vent.innerHTML = ''; light.innerHTML = '';
      people.forEach(function (p, i) {
        var li = h('li', {}, [p.name + ' ', btn(T.tellRemove, 'chip tiny', function () { people.splice(i, 1); draw(); })]);
        (p.ok ? vent : light).appendChild(li);
      });
      if (!vent.children.length) vent.appendChild(h('li', { class: 'empty', text: T.tellEmpty }));
      if (!light.children.length) light.appendChild(h('li', { class: 'empty', text: T.tellEmpty }));
    }
    function add() {
      var v = name.value.trim();
      if (!v || j.get() === null || k.get() === null) { name.focus(); return; }
      people.push({ name: v, ok: j.get() && k.get() });
      name.value = ''; j.reset(); k.reset(); draw(); name.focus();
    }
    name.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
    el.appendChild(h('div', { class: 'field' }, [h('label', { for: nid, text: T.tellName }), name]));
    el.appendChild(j.el); el.appendChild(k.el);
    el.appendChild(h('div', { class: 'row' }, [btn(T.tellAdd, 'chip go', add)]));
    el.appendChild(h('div', { class: 'grid2 out', 'aria-live': 'polite' }, [
      h('div', { class: 'col' }, [h('h4', { text: T.tellVent }), vent]),
      h('div', { class: 'col' }, [h('h4', { text: T.tellLight }), light]),
    ]));
    el.appendChild(h('p', { class: 'note', text: T.tellNote }));
    draw();
  }

  /* ---------- 8. A fair comparison ---------- */
  function fairComparison(el) {
    var val = T.cmpAreas.map(function (a, i) { return i === 0 ? -1 : 0; }); // -1 colleague has more, 0 same, 1 me
    var all = false;
    title(el, T.cmpTitle);
    var rows = h('div', { class: 'cmp' });
    var out = live();
    var more = btn(T.cmpAll, 'chip go', function () { all = true; more.setAttribute('hidden', ''); draw(); });
    function draw() {
      rows.innerHTML = '';
      T.cmpAreas.forEach(function (a, i) {
        if (!all && i > 0) return;
        var g = h('div', { class: 'seg', role: 'group', 'aria-label': a });
        [[-1, T.cmpThem], [0, T.cmpSame], [1, T.cmpMe]].forEach(function (o) {
          var b = btn(o[1], '', function () { val[i] = o[0]; draw(); });
          press(b, val[i] === o[0]); g.appendChild(b);
        });
        rows.appendChild(h('div', { class: 'q' }, [h('span', { text: a }), g]));
      });
      if (!all) { out.textContent = T.cmpOne; return; }
      var a = 0, b = 0, c = 0;
      val.forEach(function (v) { if (v < 0) a += 1; else if (v > 0) c += 1; else b += 1; });
      out.textContent = T.cmpWide(a, b, c);
    }
    el.appendChild(rows); el.appendChild(h('div', { class: 'row' }, [more])); el.appendChild(out);
    draw();
  }

  /* ---------- 9. Three blessings tonight ---------- */
  function threeBlessings(el) {
    var st = load(); st.b = st.b || ['', '', ''];
    title(el, T.blessTitle, T.blessAsk);
    var inputs = T.blessPh.map(function (ph, i) {
      var fid = id('bless');
      var inp = h('input', { type: 'text', id: fid, placeholder: ph, maxlength: '120' });
      inp.value = st.b[i] || '';
      el.appendChild(h('div', { class: 'field' }, [h('label', { for: fid, text: T.blessN(i + 1) }), inp]));
      return inp;
    });
    var out = live(); out.setAttribute('hidden', '');
    el.appendChild(h('div', { class: 'row' }, [btn(T.blessDone, 'chip go', function () {
      var cur = load(); cur.b = inputs.map(function (i) { return i.value.trim(); }); save(cur);
      out.removeAttribute('hidden'); out.innerHTML = '';
      out.appendChild(document.createTextNode((canStore ? T.blessThanks : T.kitNoStore) + ' '));
      out.appendChild(h('a', { href: 'kit.html', text: T.kitLink }));
    })]));
    el.appendChild(out);
  }

  /* ---------- 10. Words that heal ---------- */
  function wordsThatHeal(el) {
    var answered = 0;
    title(el, T.wordsTitle, T.wordsAsk);
    var score = live('note');
    T.words.forEach(function (w, i) {
      var card = h('div', { class: 'col scene' });
      card.appendChild(h('p', { class: 'ctx', text: w.ctx }));
      var g = h('div', { class: 'stack' });
      var fb = h('p', { class: 'note', 'aria-live': 'polite' });
      var opts = i % 2 ? [['kind', w.kind], ['harsh', w.harsh]] : [['harsh', w.harsh], ['kind', w.kind]];
      var done = false;
      opts.forEach(function (o) {
        var b = btn(o[1], 'chip wide', function () {
          Array.prototype.forEach.call(g.children, function (x) { press(x, x === b); });
          fb.textContent = (o[0] === 'kind' ? T.wordsKind : T.wordsHarsh) + w.why;
          if (!done) { done = true; answered += 1; score.textContent = T.wordsScore(answered, T.words.length); }
        });
        press(b, false); g.appendChild(b);
      });
      card.appendChild(g); card.appendChild(fb);
      el.appendChild(card);
    });
    el.appendChild(score);
  }

  /* ---------- 12. Life's circles ---------- */
  function circles(el) {
    var at = 1; // starts at home
    title(el, T.circTitle, T.circAsk);
    var pos = [[90, 70], [210, 70], [50, 165], [150, 175], [250, 165]];
    var svg = s('svg', { viewBox: '0 0 300 230', role: 'img', 'aria-label': T.circLabel });
    var rings = pos.map(function (p, i) {
      var g = s('g', { class: 'circ' });
      var c = s('circle', { cx: p[0], cy: p[1], r: 46 });
      g.appendChild(c);
      g.appendChild(s('text', { x: p[0], y: p[1] - 18, 'text-anchor': 'middle', class: 'label' }, T.circNames[i]));
      g.addEventListener('click', function () { move(i); });
      svg.appendChild(g); return c;
    });
    var token = s('g');
    var dot = s('circle', { r: 9, style: 'fill: var(--signal-text)' });
    token.appendChild(dot);
    svg.appendChild(token);
    var seg = h('div', { class: 'seg wrap', role: 'group', 'aria-label': T.circMove });
    var bs = T.circNames.map(function (n, i) { var b = btn(n, '', function () { move(i); }); seg.appendChild(b); return b; });
    var out = live();
    function move(i) {
      at = i;
      dot.setAttribute('cx', pos[i][0]); dot.setAttribute('cy', pos[i][1] + 8);
      rings.forEach(function (c, j) { c.setAttribute('style', j === i ? (i === 0 ? 'fill: var(--paper-2); stroke: var(--ink-2); stroke-width: 2' : 'fill: var(--paper-2); stroke: var(--signal-text); stroke-width: 2.5') : 'fill: var(--card); stroke: var(--rule); stroke-width: 1.5'); });
      bs.forEach(function (b, j) { press(b, j === i); });
      out.textContent = i === 0 ? T.circOk : T.circSpill(T.circNames[i]);
    }
    el.appendChild(svg);
    el.appendChild(h('p', { class: 'label', text: T.circMove }));
    el.appendChild(seg); el.appendChild(out);
    move(at);
  }

  /* ---------- 12. Imagine without ---------- */
  function imagineWithout(el) {
    var gone = [false, false, false, false];
    title(el, T.imagTitle, T.imagAsk);
    var row = h('div', { class: 'row' });
    var left = h('p', { class: 'big-stat small' });
    var out = live(); out.setAttribute('hidden', '');
    var back = btn(T.imagBack, 'chip go', function () {
      gone = [false, false, false, false]; draw();
      out.removeAttribute('hidden'); out.textContent = T.imagDone;
    });
    var bs = T.imagItems.map(function (n, i) {
      var b = btn(n, 'chip take', function () { gone[i] = !gone[i]; draw(); }); row.appendChild(b); return b;
    });
    function draw() {
      var k = gone.filter(Boolean).length;
      bs.forEach(function (b, i) { press(b, gone[i]); });
      left.textContent = T.imagLeft(4 - k);
      if (k === 4) { out.removeAttribute('hidden'); out.textContent = T.imagEmpty; }
      else if (k > 0) out.setAttribute('hidden', '');
    }
    el.appendChild(row); el.appendChild(left);
    el.appendChild(h('div', { class: 'row' }, [back])); el.appendChild(out);
    draw();
  }

  /* ---------- The crisis kit (signature tool) ----------
     Reads its steps from the list inside the element, so the text stays in the
     Markdown file. Saves the reader's choices in this browser only. */
  function kit(el) {
    var items = Array.prototype.map.call(el.querySelectorAll('li a'), function (a) {
      var href = a.getAttribute('href');
      return { text: a.textContent, href: href, ch: parseInt(href, 10) || '' };
    });
    if (!items.length) return;
    var st = load();
    st.steps = st.steps || []; st.b = st.b || ['', '', ''];
    el.innerHTML = '';
    function persist() { save(st); }

    var count = h('span', { class: 'label', 'aria-live': 'polite' });
    el.appendChild(h('div', { class: 'row spread' }, [h('h3', { text: T.kitSteps }), count]));
    var list = h('ul', { class: 'kit-list' });
    var boxes = [], inputs = [];
    function recount() { count.textContent = T.kitChosen(st.steps.length); }
    items.forEach(function (it) {
      var cid = id('kit');
      var key = it.text;
      var box = h('input', { type: 'checkbox', id: cid });
      boxes.push(box);
      box.checked = st.steps.indexOf(key) >= 0;
      var li = h('li', { class: box.checked ? 'on' : '' }, [
        box, h('label', { for: cid, text: it.text }),
        h('a', { href: it.href, class: 'label ch', text: T.kitCh + ' ' + it.ch, 'aria-label': T.kitCh + ' ' + it.ch + ': ' + it.text }),
      ]);
      box.addEventListener('change', function () {
        var at = st.steps.indexOf(key);
        if (box.checked && at < 0) st.steps.push(key);
        if (!box.checked && at >= 0) st.steps.splice(at, 1);
        li.className = box.checked ? 'on' : '';
        recount(); persist();
      });
      list.appendChild(li);
    });
    el.appendChild(list);

    function field(label, value, onInput, cls) {
      var fid = id('kitf');
      var inp = h('input', { type: 'text', id: fid, maxlength: '140' });
      inp.value = value || '';
      var wrap = h('div', { class: 'field ' + (cls || '') }, [h('label', { for: fid, text: label }), inp]);
      function mark() { wrap.classList.toggle('blank', !inp.value.trim()); }
      inp.addEventListener('input', function () { onInput(inp.value); mark(); persist(); });
      inputs.push([inp, mark]); mark();
      return wrap;
    }
    el.appendChild(field(T.kitPerson, st.person, function (v) { st.person = v; }));
    el.appendChild(h('h3', { text: T.kitBless }));
    [0, 1, 2].forEach(function (i) { el.appendChild(field(T.blessN(i + 1), st.b[i], function (v) { st.b[i] = v; }, 'bless')); });
    el.appendChild(field(T.kitOwn, st.own, function (v) { st.own = v; }));

    var sure = false;
    var clear = btn(T.kitClear, 'chip', function () {
      if (!sure) { sure = true; clear.textContent = T.kitClearSure; setTimeout(function () { sure = false; clear.textContent = T.kitClear; }, 4000); return; }
      st = { steps: [], b: ['', '', ''] }; persist();
      boxes.forEach(function (b) { b.checked = false; b.parentNode.className = ''; });
      inputs.forEach(function (x) { x[0].value = ''; x[1](); });
      sure = false; clear.textContent = T.kitClear; recount();
    });
    el.appendChild(h('div', { class: 'row actions' }, [btn(T.kitPrint, 'chip go', function () { window.print(); }), clear]));
    el.appendChild(h('p', { class: 'note', text: canStore ? T.kitSaved : T.kitNoStore }));
    recount();
  }

  var MAP = {
    'self-check': selfCheck, replay: replay, 'pebble-jar': pebbleJar, waterfall: waterfall, 'four-ways': fourWays,
    'who-to-tell': whoToTell, 'fair-comparison': fairComparison, 'three-blessings': threeBlessings,
    'words-that-heal': wordsThatHeal, circles: circles, 'imagine-without': imagineWithout, kit: kit
  };

  // Every widget follows the theme through CSS variables, so it is built once.
  // Figure labels ("Fig. 12.1") are added by site.js.
  document.querySelectorAll('.widget[data-widget]').forEach(function (el) {
    var name = el.getAttribute('data-widget');
    var f = MAP[name];
    if (!f) return;
    try {
      if (name !== 'self-check' && name !== 'kit') el.innerHTML = '';
      f(el);
      el.classList.add('ready');
    } catch (e) { console.error(e); }
  });
})();
