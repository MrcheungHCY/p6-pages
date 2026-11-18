/*! Locked combat numbers: Boss 18, Party 12; strong 3, weak 1, miss/timeout 2 */
(function (global) {
  'use strict';

  var BOSS_MAX = 18, PARTY_MAX = 12;
  var DMG_STRONG = 3, DMG_WEAK = 1, DMG_BOSS = 2;
  var FAST_FRAC = 0.4;

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function create(opts) {
    opts = opts || {};
    var timerSec = Number(opts.timerSec);
    if (!isFinite(timerSec) || timerSec < 4) timerSec = 12;
    var state = {
      bossMax: BOSS_MAX,
      partyMax: PARTY_MAX,
      bossHp: BOSS_MAX,
      partyHp: PARTY_MAX,
      timerSec: timerSec,
      startedAt: null,
      endedAt: null,
      nowFn: opts.nowFn || function () { return Date.now(); },
      turnLocked: false,
      phase: 1
    };

    function elapsedMs() {
      if (state.startedAt == null) return 0;
      var now = state.endedAt != null ? state.endedAt : state.nowFn();
      return Math.max(0, now - state.startedAt);
    }

    function timeLeft() {
      return Math.max(0, state.timerSec * 1000 - elapsedMs());
    }

    function isFast() {
      return elapsedMs() <= state.timerSec * 1000 * FAST_FRAC;
    }

    function startTurn() {
      state.startedAt = state.nowFn();
      state.endedAt = null;
      state.turnLocked = false;
    }

    function lockTurn() {
      if (state.endedAt == null) state.endedAt = state.nowFn();
      state.turnLocked = true;
    }

    function apply(kind) {
      var result = { kind: kind, bossDmg: 0, partyDmg: 0, label: '', bossHp: state.bossHp, partyHp: state.partyHp };
      if (kind === 'strong') {
        result.bossDmg = DMG_STRONG;
        result.label = 'STRONG HIT ' + DMG_STRONG;
      } else if (kind === 'weak') {
        result.bossDmg = DMG_WEAK;
        result.label = 'WEAK HIT ' + DMG_WEAK;
      } else if (kind === 'miss') {
        result.partyDmg = DMG_BOSS;
        result.label = 'MISS';
        result.followLabel = 'BOSS ATTACK ' + DMG_BOSS;
      } else if (kind === 'timeout') {
        result.partyDmg = DMG_BOSS;
        result.label = 'BOSS ATTACK ' + DMG_BOSS;
      } else {
        throw new Error('Unknown combat kind: ' + kind);
      }
      state.bossHp = clamp(state.bossHp - result.bossDmg, 0, state.bossMax);
      state.partyHp = clamp(state.partyHp - result.partyDmg, 0, state.partyMax);
      result.bossHp = state.bossHp;
      result.partyHp = state.partyHp;
      result.win = state.bossHp <= 0;
      result.lose = state.partyHp <= 0 && state.bossHp > 0;
      if (state.bossHp <= state.bossMax / 2) state.phase = 2;
      result.phase = state.phase;
      return result;
    }

    function resolveAnswer(correct) {
      if (state.turnLocked) return { ignored: true, reason: 'locked' };
      lockTurn();
      if (timeLeft() <= 0) return apply('timeout');
      if (!correct) return apply('miss');
      return apply(isFast() ? 'strong' : 'weak');
    }

    return {
      BOSS_MAX: BOSS_MAX,
      PARTY_MAX: PARTY_MAX,
      DMG_STRONG: DMG_STRONG,
      DMG_WEAK: DMG_WEAK,
      DMG_BOSS: DMG_BOSS,
      FAST_FRAC: FAST_FRAC,
      startTurn: startTurn,
      lockTurn: lockTurn,
      isLocked: function () { return state.turnLocked; },
      elapsedMs: elapsedMs,
      timeLeft: timeLeft,
      isFast: isFast,
      apply: apply,
      resolveAnswer: resolveAnswer,
      setElapsedMs: function (ms) {
        state.startedAt = state.nowFn() - ms;
        state.endedAt = null;
      },
      setHp: function (boss, party) {
        if (boss != null) state.bossHp = clamp(boss, 0, state.bossMax);
        if (party != null) state.partyHp = clamp(party, 0, state.partyMax);
        if (state.bossHp <= state.bossMax / 2) state.phase = 2;
        else state.phase = 1;
      },
      snapshot: function () {
        return {
          bossHp: state.bossHp,
          partyHp: state.partyHp,
          bossMax: state.bossMax,
          partyMax: state.partyMax,
          timerSec: state.timerSec,
          timeLeft: timeLeft(),
          isFast: isFast(),
          locked: state.turnLocked,
          phase: state.phase
        };
      }
    };
  }

  global.CastleCombat = { create: create, BOSS_MAX: BOSS_MAX, PARTY_MAX: PARTY_MAX, DMG_STRONG: DMG_STRONG, DMG_WEAK: DMG_WEAK, DMG_BOSS: DMG_BOSS, FAST_FRAC: FAST_FRAC };
})(typeof window !== 'undefined' ? window : globalThis);
