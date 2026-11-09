# HCY Classroom FX Kit

Shared **Motion + Canvas 2D + Three.js** feedback kit for Lesson Manager HTML games.

Soft pastel / projector-readable / kid-friendly — but celebration **density matches an escalate-on-correct classroom party** (confetti, fireworks, streamers, shake, flash, procedural audio).

**Kit only** — drop-in helpers. Do not rewrite existing games to use it until you choose to.


## Aaron — open demo (Mac)

```bash
cd "/Users/aaron/Documents/Grok Bots/Lesson Manager (Lesson planner)/_assets/fx-kit"
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765/demo.html  
Spam **Correct** to climb the party + watch the **3D mascot hop** (default; one shared WebGL with celebration FX). Flip **Style pack** (Japanese · American · JP×US · Legacy) — no server restart. Toggle **2D | 3D**. **Wrong** soft-misses but keeps stage energy.

Playtest checklist: escalate OK · wrong≠dump stage OK · style flip OK · 3D default OK · 2D fallback OK · missing pack PNG → placeholder OK · audio/slider/mute OK · single WebGL OK · kit-only (not wired into games).

---

## Files

```
fx-kit/
  README.md
  demo.html
  css/hcy-fx.css
  css/hcy-fx-themes.css  # 15 pack + legacy CSS variables
  js/hcy-fx.js           # facade: HcyFx API + escalate (+ mascot hooks)
  js/hcy-fx-motion.js    # Canvas 2D particle party + DOM stamp/toast/shake
  js/hcy-fx-audio.js     # soft Web Audio synth (ramps with E)
  js/hcy-fx-three.js     # ONE WebGL: celebration particles + 3D mascot buddy
  js/hcy-fx-mascot.js    # mascot ADD layer (2D PNG/SVG; 3D via HcyFxThree)
  js/hcy-fx-themes.js    # demo style picker + font CDN + localStorage
  mascot/                # Legacy pastel idle/happy/oops.png
  styles/<id>/mascot/    # per-pack art (see styles/README.md)
```

## Include from a game

Relative path from a typical `P.6/.../html/game/` folder:

```html
<link rel="stylesheet" href="../../../../_assets/fx-kit/css/hcy-fx.css" />
<!-- optional Motion One -->
<script src="https://cdn.jsdelivr.net/npm/motion@11.11.17/dist/motion.js"></script>
<!-- optional Three (ADD layer; kit works without it) -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="../../../../_assets/fx-kit/js/hcy-fx-motion.js"></script>
<script src="../../../../_assets/fx-kit/js/hcy-fx-audio.js"></script>
<script src="../../../../_assets/fx-kit/js/hcy-fx-three.js"></script>
<script src="../../../../_assets/fx-kit/js/hcy-fx-mascot.js"></script>
<script src="../../../../_assets/fx-kit/js/hcy-fx.js"></script>
```

Optional mascot mount (demo uses `#hcy-mascot-slot` inside the stage):

```html
<div id="hcy-mascot-slot" class="hcy-mascot-slot"></div>
```

`HcyFx.init()` auto-inits the mascot when `HcyFxMascot` is loaded. Games that already call `HcyFx.correct()` / `wrong()` / `stamp()` get the buddy for free — **kit + demo only for now; do not wire into Conditionals or other games until you choose to.**

All kit scripts are **IIFE / globals** (no ES modules) so `file://` and Google Sites embeds hurt less.

### CDN vs vendored

| Piece | Default | Offline / Sites |
| --- | --- | --- |
| Kit JS/CSS | Relative files under `_assets/fx-kit/` | Same (copy with the game) |
| Motion One | CDN (optional; WAAPI fallback) | Omit CDN — still works |
| Three.js | CDN r160 UMD | Optional: drop `vendor/three.min.js` and point a script tag at it |

### `file://` vs local HTTP

- **IIFE kit files** usually load fine from `file://`.
- **CDN scripts** need network; some browsers tighten mixed/`file` rules.
- **Web Audio** often needs a user gesture (first click) — call anything on `HcyFx` after a tap, or `HcyFxAudio.unlock()`.

Tiny server from the `fx-kit` folder:

```bash
python3 -m http.server 8765
# open http://127.0.0.1:8765/demo.html
```

### Google Sites embed limits

- Sites iframes may block third-party CDN or autoplay audio until interaction.
- Prefer **self-hosted kit paths** (upload `_assets` with the HTML) over raw `file://`.
- Keep scripts as classic `<script src>` (this kit). ES modules are more fragile in Sites.
- If Three is blocked, 2D Canvas + DOM stamps still run (graceful degrade).

## Demo style switcher (15 packs + Legacy)

**Kit + demo only** — do not wire packs into games yet.

### How to switch

1. Open `demo.html` over local HTTP.
2. Use the **Style pack** buttons (groups: Japanese · American · JP×US · Legacy).
3. Toggle **Mascot: 3D | 2D** (default **3D**).
4. Choice persists in `localStorage`: `hcy-fx-style`, `hcy-fx-mascot-mode`.
5. Flipping styles does **not** require restarting `http.server`.

Programmatic:

```js
HcyFxThemes.setStyle('11-ja-neo-tokyo-arcade');
HcyFxThemes.setMode('3d'); // or '2d'
HcyFxMascot.reloadArt({ base: HcyFxThemes.artBaseFor('11-ja-neo-tokyo-arcade'), mode: '3d' });
```

### Pack art paths

`styles/<id>/mascot/{idle,happy,oops}.png` — see `styles/README.md` for all 15 IDs.  
Missing PNGs → 2D SVG placeholder or 3D tinted sphere/billboard (UI never breaks). Legacy uses `mascot/`.

### 3D mascot (single WebGL)

`HcyFxThree` owns **one** `WebGLRenderer` for celebration particles **and** the mascot buddy (textured billboard + soft mesh). `HcyFxMascot` does not open a second context. If WebGL/THREE missing → flat 2D PNG/SVG automatically.

### Google Fonts CDN (SIL / OFL)

Loaded by `hcy-fx-themes.js` for the demo only:

| Pack group | Families |
| --- | --- |
| JP | M PLUS Rounded 1c, Zen Maru Gothic, Yusei Magic, Reggae One, Noto Sans JP |
| US | Bangers, Fredoka, Lobster, Oswald, Nunito |
| JA blends | Black Ops One, Changa One, Outfit, IBM Plex Sans JP, Quicksand (+ shared above) |

All listed families are available on Google Fonts under OFL / SIL Open Font License (or Apache for IBM Plex). Demo does not bundle font binaries.

---

## Public API

```js
HcyFx.init({ intensity: 1, shakeTarget: el, mascotMount: el }); // optional; mascot auto-inits if HcyFxMascot loaded
HcyFxMascot.init({ mount: '#hcy-mascot-slot' }); // or call directly
HcyFx.correct();           // auto streak → escalate
HcyFx.correct(7);          // optional explicit level 0–10
HcyFx.wrong();             // soft miss; resets combo; keeps stage energy
HcyFx.setIntensity(0.7); // 0–1 master scale
HcyFx.mute(true);
HcyFx.reset();             // streak + stage energy
HcyFx.getState();          // { streak, level, E, stageE, intensity, muted }
```

### Helper call examples (3–4)

```js
// 1) After a right answer
HcyFx.correct();

// 2) After a miss (party energy stays)
HcyFx.wrong();

// 3) One-shot stamp / burst without changing streak
HcyFx.stamp('Perfect!');
HcyFx.burst({ x: 200, y: 180, intensity: 0.8 });

// 4) Toast + score pop
HcyFx.toast('Team 2 scores!');
HcyFx.scorePop(50);
```

## Escalate behaviour (patterns)

Reimplemented escalate ideas (not a fork of any branded game):

1. **Correct** raises streak and **stage energy E** (curve toward a cap).
2. FX + audio + optional Three **scale with E** (more confetti → stars → sparks → coins → fireworks / streamers / rain).
3. **Wrong** resets combo/streak and plays soft miss feedback, but **does not dump stage E** — the room keeps its vibe.
4. `setIntensity(0–1)` caps motion/particle scale for projectors or sensitive students.

## Layers

1. **Canvas 2D** (`hcy-fx-motion.js`) — baseline particle party.
2. **DOM** — stamp, toast, shake.
3. **Web Audio** — procedural chimes / clear fanfares / soft boing.
4. **Three.js** (`hcy-fx-three.js`) — **one** WebGL context: additive celebration particles + stamp slam + **3D mascot buddy**; **off** if WebGL/`THREE` missing.
5. **Mascot** (`hcy-fx-mascot.js`) — living buddy ADD life. **3D** (default in demo) uses the shared Three buddy; **2D** uses PNG/SVG + Motion/WAAPI hop. Particles stay primary.

### Mascot PNG drop

Place art in `mascot/`:

- `idle.png` — default / breathe
- `happy.png` — Correct / stamp
- `oops.png` — Wrong soft miss

Missing files → pastel SVG face placeholder; swaps automatically when PNGs appear (`HcyFxMascot.reloadArt()`). Original HCY classroom art only — no third-party mascot copies.

## Soft pastel notes

Palette aligned with Lesson Manager HTML games: pink `#ff7ab6`, sky `#5ec8ff`, mint `#7dffb3`, yellow `#ffe14a`, lilac `#b48cff`, ink `#2a1830`. Cute stamps OK; not locked to any one culture-mark; no memes; no third-party mascots (no ドパキチ / branded copy). Mascot ADDS life; does not replace particles.

## Demo

```bash
cd "/path/to/.../_assets/fx-kit"
python3 -m http.server 8765
# http://127.0.0.1:8765/demo.html
```

Buttons: **Correct**, **Wrong**, **Reset**, **Mute**, intensity slider, **style pack picker**, **2D|3D** toggle. Default mascot mode is **3D**. Spam Correct to escalate; flip packs without restarting the server.
