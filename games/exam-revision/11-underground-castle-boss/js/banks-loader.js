/*! Load practice banks, run no-exam filter, normalize 4-card hands, mix skills */
(function (global) {
  'use strict';

  var BANK_SPECS = [
    { file: 'told-to.bank.js', key: 'HCY_BANK_TOLD_TO', name: 'told-to' },
    { file: 'should.bank.js', key: 'HCY_BANK_SHOULD', name: 'should' },
    { file: 'ought-to.bank.js', key: 'HCY_BANK_OUGHT_TO', name: 'ought-to' },
    { file: 'ing-noun.bank.js', key: 'HCY_BANK_ING_NOUN', name: 'ing-noun' },
    { file: 'if-will.bank.js', key: 'HCY_BANK_IF_WILL', name: 'if-will' },
    { file: 'need-to-be.bank.js', key: 'HCY_BANK_NEED_TO_BE', name: 'need-to-be' },
    { file: 'vocab-u1-3.bank.js', key: 'HCY_BANK_VOCAB_U1_3', name: 'vocab-u1-3' },
    { file: 'should-typhoon-practice.bank.js', key: 'HCY_BANK_SHOULD_TYPHOON_PRACTICE', name: 'should-typhoon-practice', optional: true }
  ];

  var EXAMISH = /exam-parallel|Exam\s*[A-J]\b|\[Exam/i;

  function looksLikeExamItem(it) {
    if (!it) return true;
    try { return EXAMISH.test(JSON.stringify(it)); } catch (e) { return true; }
  }

  function uniqueStrings(arr) {
    var out = [], seen = Object.create(null), i, s;
    for (i = 0; i < arr.length; i++) {
      s = String(arr[i] == null ? '' : arr[i]).trim();
      if (!s) continue;
      if (seen[s]) continue;
      seen[s] = 1;
      out.push(s);
    }
    return out;
  }

  function shuffle(arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function collectPool(items, skill, answer, have) {
    var pool = [], i, it, d, k;
    for (i = 0; i < items.length; i++) {
      it = items[i];
      if (skill && it.skill && it.skill !== skill) continue;
      d = [].concat(it.distractors || [], it.choices || []);
      for (k = 0; k < d.length; k++) {
        var s = String(d[k] == null ? '' : d[k]).trim();
        if (s && s !== answer && have.indexOf(s) < 0 && pool.indexOf(s) < 0) pool.push(s);
      }
    }
    return pool;
  }

  function normalizeItem(raw, allForBorrow) {
    if (!raw || looksLikeExamItem(raw)) return null;
    var answer = String(raw.answer == null ? '' : raw.answer).trim();
    if (!answer) return null;
    var opts = uniqueStrings([].concat(raw.distractors || [], raw.choices || []));
    opts = opts.filter(function (s) { return s !== answer; });
    if (opts.length < 3) {
      opts = opts.concat(collectPool(allForBorrow || [], raw.skill, answer, opts));
      opts = uniqueStrings(opts).filter(function (s) { return s !== answer; });
    }
    if (opts.length < 3) return null;
    var distractors = shuffle(opts).slice(0, 3);
    var hand = shuffle([answer].concat(distractors));
    var uniqueHand = uniqueStrings(hand);
    if (uniqueHand.length !== 4 || uniqueHand.indexOf(answer) < 0) return null;
    return {
      id: raw.id,
      prompt: raw.prompt,
      answer: answer,
      distractors: distractors,
      hand: uniqueHand,
      skill: raw.skill || '',
      unit: raw.unit || '',
      bank: raw._bank || '',
      source: raw.source || '',
      word: raw.word || '',
      modal: raw.modal || '',
      phrase: raw.phrase || '',
      slots: raw.slots || null
    };
  }

  function diversify(items) {
    var a = shuffle(items);
    var i, j, tmp;
    for (i = 1; i < a.length; i++) {
      if (a[i].skill && a[i].skill === a[i - 1].skill) {
        for (j = i + 1; j < a.length; j++) {
          if (a[j].skill !== a[i - 1].skill) {
            tmp = a[i]; a[i] = a[j]; a[j] = tmp;
            break;
          }
        }
      }
    }
    return a;
  }

  function scrubPayload(data) {
    if (typeof global.scrubBankPayload === 'function') return global.scrubBankPayload(data);
    var items = !data ? [] : (Array.isArray(data) ? data : (data.items || []));
    if (typeof global.filterNoExamItems === 'function') items = global.filterNoExamItems(items);
    return { items: items };
  }

  var state = {
    counts: [],
    items: [],
    cursor: 0,
    skipped: [],
    examFlaggedInLive: 0
  };

  function load() {
    state.counts = [];
    state.items = [];
    state.cursor = 0;
    state.skipped = [];
    state.examFlaggedInLive = 0;

    var rawBags = [];
    BANK_SPECS.forEach(function (spec) {
      var payload = global[spec.key];
      if (!payload) {
        state.counts.push({ name: spec.name, raw: 0, afterFilter: 0, afterScrub: 0, inDeck: 0, skipped: 'not-loaded' });
        state.skipped.push({ name: spec.name, reason: 'not-loaded' });
        console.warn('[CastleBoss] bank not loaded:', spec.name);
        return;
      }
      var rawItems = Array.isArray(payload) ? payload : (payload.items || []);
      var rawN = rawItems.length;
      var filtered = scrubPayload(payload);
      var afterFilter = (filtered.items || []).length;
      var clean = (filtered.items || []).filter(function (it) { return !looksLikeExamItem(it); });
      var afterScrub = clean.length;
      var note = '';
      if (spec.optional && afterScrub < 8) {
        note = 'skipped — little/nothing survived extra exam-ish scrub (notes/strings)';
        state.skipped.push({ name: spec.name, reason: note, raw: rawN, afterFilter: afterFilter, afterScrub: afterScrub });
        state.counts.push({ name: spec.name, raw: rawN, afterFilter: afterFilter, afterScrub: afterScrub, inDeck: 0, skipped: note });
        console.info('[CastleBoss] skipped', spec.name, note, 'raw=' + rawN, 'after no-exam filter=' + afterFilter, 'after exam-ish scrub=' + afterScrub);
        return;
      }
      clean.forEach(function (it) { it._bank = spec.name; });
      rawBags.push({ spec: spec, items: clean, raw: rawN, afterFilter: afterFilter, afterScrub: afterScrub });
    });

    var borrowPool = [];
    rawBags.forEach(function (b) { borrowPool = borrowPool.concat(b.items); });

    rawBags.forEach(function (b) {
      var normed = [];
      b.items.forEach(function (it) {
        var n = normalizeItem(it, borrowPool);
        if (n) normed.push(n);
      });
      var flagged = normed.filter(looksLikeExamItem);
      state.examFlaggedInLive += flagged.length;
      var keep = normed.filter(function (it) { return !looksLikeExamItem(it); });
      state.counts.push({
        name: b.spec.name,
        raw: b.raw,
        afterFilter: b.afterFilter,
        afterScrub: b.afterScrub,
        inDeck: keep.length,
        droppedNormalize: b.items.length - normed.length
      });
      console.info('[CastleBoss] bank', b.spec.name + ':', 'raw=' + b.raw, 'after no-exam filter=' + b.afterFilter, 'after exam-ish scrub=' + b.afterScrub, 'in live deck=' + keep.length);
      state.items = state.items.concat(keep);
    });

    state.items = diversify(state.items);
    console.info('[CastleBoss] live deck total=', state.items.length, 'exam-flagged in live deck=', state.examFlaggedInLive);
    return {
      items: state.items,
      counts: state.counts,
      skipped: state.skipped,
      examFlaggedInLive: state.examFlaggedInLive,
      total: state.items.length
    };
  }

  function reshuffle() {
    state.items = diversify(state.items);
    state.cursor = 0;
    return state.items.length;
  }

  function nextItem() {
    if (!state.items.length) return null;
    if (state.cursor >= state.items.length) reshuffle();
    var item = state.items[state.cursor++];
    if (item && Array.isArray(item.hand)) item.hand = shuffle(item.hand.slice());
    return item;
  }

  global.CastleBossBanks = {
    load: load,
    nextItem: nextItem,
    reshuffle: reshuffle,
    getItems: function () { return state.items.slice(); },
    getCounts: function () { return { counts: state.counts, total: state.items.length, skipped: state.skipped, examFlaggedInLive: state.examFlaggedInLive }; },
    looksLikeExamItem: looksLikeExamItem,
    resetCursor: function () { state.cursor = 0; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
