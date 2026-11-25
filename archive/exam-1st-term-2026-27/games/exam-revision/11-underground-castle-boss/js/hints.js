/*! Colour-code grammar keywords on cards and prompts as hints (same colours on every option; does not mark the answer). */
(function (global) {
  'use strict';

  var CLS_GRAMMAR = 'hint-grammar';
  var CLS_NEG = 'hint-neg';
  var CLS_CUE = 'hint-cue';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeRe(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function rulesFor(item) {
    var skill = (item && (item.skill || item.bank) || '').toLowerCase();
    var rules = [];

    function add(pat, cls, split) {
      rules.push({ pat: pat, cls: cls, split: split || null });
    }

    // Longest / most specific first — overlap resolver also prefers longer matches.
    add('first conditional', CLS_CUE);
    add('reported sentence', CLS_CUE);
    add('reported speech', CLS_CUE);
    add('best advice', CLS_CUE);
    add('good\\/safe', CLS_CUE);
    add('bad\\/unsafe', CLS_CUE);
    add('-ing noun', CLS_CUE);
    add('«[^»]+»', CLS_CUE);
    add('\\u00ab[^\\u00bb]+\\u00bb', CLS_CUE);

    if (item && item.word) {
      add(escapeRe(String(item.word).trim()), CLS_CUE);
    }

    add("should not", CLS_GRAMMAR, 'should-not');
    add("shouldn't", CLS_GRAMMAR, 'shouldnt');
    add("shouldn’t", CLS_GRAMMAR, 'shouldnt');
    add('ought to', CLS_GRAMMAR);
    add('need to be', CLS_GRAMMAR);
    add('should to', CLS_GRAMMAR);
    add('must to', CLS_GRAMMAR);
    add('need to', CLS_GRAMMAR);
    add('not to', CLS_NEG);
    add('does not', CLS_NEG);
    add('do not', CLS_NEG);
    add('did not', CLS_NEG);
    add("don't", CLS_NEG);
    add("doesn't", CLS_NEG);
    add("didn't", CLS_NEG);
    add("don’t", CLS_NEG);
    add("doesn’t", CLS_NEG);
    add("didn’t", CLS_NEG);

    add('\\bshould\\b', CLS_GRAMMAR);
    add('\\bought\\b', CLS_GRAMMAR);
    add('\\bmust\\b', CLS_GRAMMAR);
    add('\\bneed\\b', CLS_GRAMMAR);
    add('\\btold\\b', CLS_GRAMMAR);
    add('\\bsaid\\b', CLS_GRAMMAR);
    add('\\bif\\b', CLS_GRAMMAR);
    add('\\bwill\\b', CLS_GRAMMAR);
    add('\\bwould\\b', CLS_GRAMMAR);
    add('\\bnot\\b', CLS_NEG);
    add('\\bnever\\b', CLS_NEG);

    var toSkills = { 'told-to': 1, 'told to': 1, 'ought-to': 1, 'ought to': 1, 'should': 1, 'need-to-be': 1, 'need to be': 1 };
    if (toSkills[skill]) add('\\bto\\b', CLS_GRAMMAR);

    if (skill === 'ing-noun' || skill === 'ing noun') {
      add('\\b(gives|give|have|has|hurts|hurt|makes|make|causes|cause|helps|help)\\b', CLS_GRAMMAR);
      add('\\b[A-Za-z]+ing\\b', CLS_GRAMMAR);
    }

    if (item && item.slots && item.slots.verb) {
      add('\\b' + escapeRe(String(item.slots.verb)) + '\\b', CLS_GRAMMAR);
    }
    if (item && item.modal) {
      add(escapeRe(String(item.modal)), CLS_GRAMMAR);
    }

    return rules;
  }

  function findRanges(text, rules) {
    var ranges = [], i, re, m, flags;
    for (i = 0; i < rules.length; i++) {
      flags = /[A-Za-z]/.test(rules[i].pat) ? 'gi' : 'g';
      try { re = new RegExp(rules[i].pat, flags); } catch (e) { continue; }
      while ((m = re.exec(text))) {
        if (!m[0]) { re.lastIndex += 1; continue; }
        ranges.push({
          start: m.index,
          end: m.index + m[0].length,
          len: m[0].length,
          cls: rules[i].cls,
          split: rules[i].split,
          text: m[0]
        });
      }
    }
    ranges.sort(function (a, b) { return b.len - a.len || a.start - b.start; });
    var kept = [], j, ok;
    for (i = 0; i < ranges.length; i++) {
      ok = true;
      for (j = 0; j < kept.length; j++) {
        if (ranges[i].start < kept[j].end && ranges[i].end > kept[j].start) { ok = false; break; }
      }
      if (ok) kept.push(ranges[i]);
    }
    kept.sort(function (a, b) { return a.start - b.start; });
    return kept;
  }

  function paintSplit(chunk, split) {
    var lower = chunk.toLowerCase();
    if (split === 'shouldnt') {
      // should + n't (straight or curly apostrophe)
      var cut = chunk.length >= 3 ? chunk.length - 3 : 0;
      return '<span class="' + CLS_GRAMMAR + '">' + esc(chunk.slice(0, cut)) + '</span>' +
             '<span class="' + CLS_NEG + '">' + esc(chunk.slice(cut)) + '</span>';
    }
    if (split === 'should-not') {
      var parts = chunk.split(/(\s+)/);
      // "should" + spaces + "not"
      if (parts.length >= 3) {
        return '<span class="' + CLS_GRAMMAR + '">' + esc(parts[0]) + '</span>' +
               esc(parts[1]) +
               '<span class="' + CLS_NEG + '">' + esc(parts.slice(2).join('')) + '</span>';
      }
    }
    return '<span class="' + CLS_GRAMMAR + '">' + esc(chunk) + '</span>';
  }

  function html(text, item) {
    text = text == null ? '' : String(text);
    var ranges = findRanges(text, rulesFor(item));
    var out = '', i = 0, r, chunk;
    for (var n = 0; n < ranges.length; n++) {
      r = ranges[n];
      out += esc(text.slice(i, r.start));
      chunk = text.slice(r.start, r.end);
      if (r.split) out += paintSplit(chunk, r.split);
      else out += '<span class="' + r.cls + '">' + esc(chunk) + '</span>';
      i = r.end;
    }
    out += esc(text.slice(i));
    return out;
  }

  global.CastleHints = { html: html, rulesFor: rulesFor };
})(typeof window !== 'undefined' ? window : globalThis);
