/*! HCY SpeechSynthesis helper — prefer en-GB / en-HK; rate 1 | 0.75; iOS unlock */
(function (global) {
  'use strict';
  var preferred = null;
  var unlocked = false;

  function pickVoice() {
    if (!global.speechSynthesis) return null;
    var voices = global.speechSynthesis.getVoices() || [];
    var order = ['en-HK', 'en-GB', 'en_GB', 'en-AU', 'en-US', 'en'];
    for (var i = 0; i < order.length; i++) {
      var tag = order[i].toLowerCase();
      for (var j = 0; j < voices.length; j++) {
        var v = voices[j];
        var lang = (v.lang || '').toLowerCase();
        if (lang === tag || lang.indexOf(tag) === 0) return v;
      }
    }
    return voices[0] || null;
  }

  function refreshVoice() { preferred = pickVoice(); }

  if (global.speechSynthesis) {
    refreshVoice();
    global.speechSynthesis.onvoiceschanged = refreshVoice;
  }

  function speak(text, opts) {
    opts = opts || {};
    if (!global.speechSynthesis || !text) return;
    try { global.speechSynthesis.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(String(text));
    u.rate = opts.rate != null ? opts.rate : 1;
    u.pitch = opts.pitch != null ? opts.pitch : 1;
    u.lang = opts.lang || 'en-GB';
    var v = preferred || pickVoice();
    if (v) u.voice = v;
    global.speechSynthesis.speak(u);
  }

  function ensureUnlock(parentEl) {
    if (unlocked || !global.speechSynthesis) return;
    var parent = parentEl || document.body;
    if (!parent || document.getElementById('hcy-speech-unlock')) return;
    var ban = document.createElement('button');
    ban.id = 'hcy-speech-unlock';
    ban.type = 'button';
    ban.textContent = '🔊 Tap to enable audio / 點擊啟用聲音';
    ban.setAttribute('style',
      'position:fixed;top:0;left:0;right:0;z-index:99999;padding:10px 14px;' +
      'background:#111;color:#fff;border:0;font:700 15px/1.3 system-ui,sans-serif;cursor:pointer');
    ban.onclick = function () {
      unlocked = true;
      speak('Ready', { rate: 1 });
      if (ban.parentNode) ban.parentNode.removeChild(ban);
    };
    parent.appendChild(ban);
  }

  global.HCY_SPEECH = {
    speak: speak,
    slow: function (t) { speak(t, { rate: 0.75 }); },
    ensureUnlock: ensureUnlock,
    refreshVoice: refreshVoice
  };
})(typeof window !== 'undefined' ? window : globalThis);
