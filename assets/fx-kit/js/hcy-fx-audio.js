/*! HCY FX — procedural Web Audio (IIFE). Escalates with E; soft miss never dumps the party. */
(function (global) {
  'use strict';

  var ctx = null, master = null, sfx = null, muted = false, volume = 0.7, unlocked = false;

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function ensure() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    sfx = ctx.createGain();
    sfx.gain.value = 0.9;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3;
    comp.attack.value = 0.004; comp.release.value = 0.18;
    var limit = ctx.createDynamicsCompressor();
    limit.threshold.value = -2.5; limit.knee.value = 0; limit.ratio.value = 18;
    limit.attack.value = 0.001; limit.release.value = 0.06;
    sfx.connect(master);
    master.connect(comp); comp.connect(limit); limit.connect(ctx.destination);

    // soft impulse reverb send
    var len = Math.floor(ctx.sampleRate * 1.6);
    var ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = ir.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
    }
    var conv = ctx.createConvolver(); conv.buffer = ir;
    global.__hcyRev = ctx.createGain();
    global.__hcyRev.gain.value = 0.28;
    global.__hcyRev.connect(conv); conv.connect(master);
    return ctx;
  }

  function unlock() {
    ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    unlocked = true;
  }

  function now() { return ctx ? ctx.currentTime : 0; }

  function env(t, peak, a, d) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, Math.max(t + a + 0.01, t + a + d));
    return g;
  }

  function panNode(v) {
    if (!ctx.createStereoPanner) return null;
    var p = ctx.createStereoPanner();
    p.pan.value = v || 0;
    return p;
  }

  function sendRev(node, amt) {
    if (!global.__hcyRev || !amt) return;
    var s = ctx.createGain(); s.gain.value = amt;
    node.connect(s); s.connect(global.__hcyRev);
  }

  function osc(type, f, t, stop, detune) {
    var o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (detune) o.detune.value = detune;
    o.start(t); o.stop(stop);
    return o;
  }

  function noiseBuf() {
    if (!ctx._noise) {
      var nlen = ctx.sampleRate * 1.5;
      var b = ctx.createBuffer(1, nlen, ctx.sampleRate);
      var d = b.getChannelData(0);
      for (var i = 0; i < nlen; i++) d[i] = Math.random() * 2 - 1;
      ctx._noise = b;
    }
    return ctx._noise;
  }

  function noise(t, stop) {
    var n = ctx.createBufferSource();
    n.buffer = noiseBuf(); n.loop = true;
    n.start(t, Math.random()); n.stop(stop);
    return n;
  }

  function tone(freq, t, dur, type, peak, panVal, rev) {
    if (!ctx || muted) return;
    var o = osc(type || 'sine', freq, t, t + dur + 0.05);
    var e = env(t, peak, 0.006, dur);
    var p = panNode(panVal);
    o.connect(e);
    if (p) { e.connect(p); p.connect(sfx); } else e.connect(sfx);
    sendRev(e, rev || 0);
  }

  function bell(mHz, t, v, dur, panVal) {
    var car = osc('sine', mHz, t, t + dur + 0.1);
    var mod = osc('sine', Math.min(12000, mHz * 3.2), t, t + dur + 0.1);
    var mg = ctx.createGain();
    mg.gain.setValueAtTime(mHz * 1.8, t);
    mg.gain.exponentialRampToValueAtTime(mHz * 0.12, t + dur * 0.55);
    mod.connect(mg); mg.connect(car.frequency);
    var e = env(t, v, 0.002, dur);
    var p = panNode(panVal);
    car.connect(e);
    if (p) { e.connect(p); p.connect(sfx); } else e.connect(sfx);
    sendRev(e, 0.3);
  }

  function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function coin(t, v, m) {
    m = m || 83;
    [[0, m], [0.07, m + 5]].forEach(function (pair) {
      var o = osc('square', midiHz(pair[1]), t + pair[0], t + pair[0] + (pair[0] ? 0.32 : 0.08));
      var e = env(t + pair[0], v, 0.001, pair[0] ? 0.3 : 0.07);
      o.connect(e); e.connect(sfx); sendRev(e, 0.12);
    });
  }

  function crash(t, v) {
    var n = noise(t, t + 1.8);
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3800;
    var e = env(t, v, 0.002, 1.5);
    n.connect(hp); hp.connect(e); e.connect(sfx); sendRev(e, 0.25);
  }

  function kick(t, v) {
    var o = osc('sine', 160, t, t + 0.4);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    var e = env(t, v, 0.002, 0.35);
    o.connect(e); e.connect(sfx);
  }

  function impact(t, v) {
    var o = osc('sine', 90, t, t + 1.2);
    o.frequency.exponentialRampToValueAtTime(28, t + 1.0);
    var e = env(t, v, 0.003, 1.0);
    o.connect(e); e.connect(sfx);
    var n = noise(t, t + 0.9);
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800;
    var ne = env(t, v * 0.45, 0.002, 0.8);
    n.connect(lp); lp.connect(ne); ne.connect(sfx); sendRev(ne, 0.35);
  }

  /** Correct chime — grows hard with E */
  function correct(E, combo) {
    unlock();
    if (!ctx || muted) return;
    E = clamp(E == null ? 0.4 : E, 0, 1.2);
    combo = combo || 0;
    var t = now();
    var base = midiHz(Math.min(96, 72 + Math.min(18, combo)));
    bell(base, t, 0.16 + 0.1 * E, 0.95, -0.2);
    bell(base * 1.5, t + 0.06, 0.11 + 0.08 * E, 0.85, 0.3);
    if (E > 0.28) bell(base * 2, t + 0.12, 0.09 + 0.07 * E, 0.95, -0.3);
    if (E > 0.5) { coin(t + 0.02, 0.06 + 0.05 * E, 83); crash(t, 0.1 * E); }
    if (E > 0.75) {
      coin(t + 0.1, 0.05, 88);
      coin(t + 0.16, 0.045, 91);
      kick(t, 0.55);
    }
  }

  /** Problem clear — big celebrate audio ramp */
  function clear(E) {
    unlock();
    if (!ctx || muted) return;
    E = clamp(E == null ? 0.5 : E, 0, 1.2);
    var t = now();
    var root = midiHz(60);
    var arp = [0, 4, 7, 12, 16, 19, 24];
    var n = 3 + Math.round(E * 4);
    for (var i = 0; i < n; i++) bell(root * Math.pow(2, arp[i] / 12), t + i * 0.055, 0.13 + 0.06 * E, 1.2, (i % 2 ? 1 : -1) * 0.4);
    tone(root, t, 0.7, 'triangle', 0.18, 0, 0.25);
    if (E > 0.2) {
      [0, 4, 7, 12].forEach(function (semi, i) {
        tone(root * Math.pow(2, (12 + semi) / 12), t, 0.3, 'sawtooth', 0.04 + 0.05 * E, (i % 2 ? 0.3 : -0.3), 0.2);
      });
    }
    if (E > 0.35) { crash(t, 0.22 + 0.28 * E); kick(t, 0.85); }
    if (E > 0.55) {
      impact(t, 0.45 + 0.4 * E);
      [7, 12, 16, 19, 24].forEach(function (semi, i) {
        tone(root * Math.pow(2, (12 + semi) / 12), t + 0.08 + i * 0.07, i === 4 ? 0.5 : 0.07, 'sawtooth', 0.07, 0, 0.2);
      });
    }
    if (E > 0.8) {
      for (var c = 0; c < 8; c++) coin(t + 0.1 + c * 0.05, 0.05, 79 + (c % 3) * 5);
    }
  }

  /** Soft miss — springy, never a fail horn; does not dump energy */
  function wrong(E) {
    unlock();
    if (!ctx || muted) return;
    E = clamp(E == null ? 0.3 : E, 0, 1.2);
    var t = now();
    var o = osc('sine', 320, t, t + 0.55);
    o.frequency.setValueAtTime(320, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.45);
    var lfo = osc('sine', 15, t, t + 0.55);
    var lg = ctx.createGain(); lg.gain.setValueAtTime(80, t); lg.gain.exponentialRampToValueAtTime(8, t + 0.45);
    lfo.connect(lg); lg.connect(o.frequency);
    var e = env(t, 0.2 + 0.1 * Math.min(1, E), 0.003, 0.5);
    o.connect(e); e.connect(sfx); sendRev(e, 0.15);
  }

  function stamp(E) {
    unlock();
    if (!ctx || muted) return;
    E = clamp(E == null ? 0.5 : E, 0, 1.2);
    var t = now();
    kick(t, 0.35 + 0.25 * E);
    bell(midiHz(84), t + 0.03, 0.14 + 0.08 * E, 0.9, 0);
    if (E > 0.45) crash(t, 0.12 * E);
  }

  function setMuted(m) {
    muted = !!m;
    if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.03);
  }

  function setVolume(v) {
    volume = clamp(v, 0, 1);
    setMuted(muted);
  }

  global.HcyFxAudio = {
    unlock: unlock,
    correct: correct,
    clear: clear,
    wrong: wrong,
    stamp: stamp,
    mute: setMuted,
    setVolume: setVolume,
    isMuted: function () { return muted; }
  };
})(typeof window !== 'undefined' ? window : this);
