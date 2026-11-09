# p6-pages · P.6 Student Portal

Public GitHub Pages site for Mr Cheung's P.6 English class (HCY).

**Student URL:** https://mrcheunghcy.github.io/p6-pages/

Students only see this site. Practice pages only — no exam finals, class lists, scores, or Google Forms.

## GitHub Pages

Repo: [MrcheungHCY/p6-pages](https://github.com/MrcheungHCY/p6-pages)

Settings → Pages → Build and deployment:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

`.nojekyll` is in the root so Pages serves the HTML, `downloads/*.md`, and `assets/` as static files (Jekyll is off).

The first deploy can take a minute after `main` updates. If Pages was not enabled by the API, use the settings above.

## File tree

```
index.html                 hub (U1–U4, Exam Vocab, Games, tenses link)
units/u1 … units/u4        scrolling unit pages
downloads/u1 … u4          notes, 重點, grammar, comprehension packs
vocab/                     1st Exam Vocabulary (25 words + images)
games/                     games hub
games/exam-revision/01–10  Exam Revision Games (practice banks)
games/u1, games/u3         unit game packs
games/banks/               practice banks + no-exam filter
grammar/                   conditionals, used to, pronouns
assets/css/                portal.css
assets/banks/              shared grammar banks
assets/hcy-*.js / .css     speech, touch, deeplinks, teacher HUD
assets/fx-kit/             Motion + Three.js FX kit and demo
assets/fx-kit/styles/      style-pack art (reserved)
assets/character-library/  hcy-chars.js + png/ (reserved for art)
assets/ocr/                handwriting reader (reserved)
```

Tenses practice lives on its own site: https://mrcheunghcy.github.io/6d-tenses-practice/

FX demo (same kit the revision games load): `assets/fx-kit/demo.html`  
on Pages: https://mrcheunghcy.github.io/p6-pages/assets/fx-kit/demo.html

## Still open

- **Style packs** land in `assets/fx-kit/styles/` (mascot PNGs per pack). The kit already falls back if a PNG is missing.
- **Character library** PNGs land in `assets/character-library/png/`. Games point at `char-026.png` and others; missing images hide themselves.
- **OCR** scripts land in `assets/ocr/` for Dictation Tug-of-War. Until they arrive, typed answers still work.
- **Visuals:** each unit page has a Pictures & memes slot (`#pics`) waiting for art.
- **Unit packs:** notes / 重點 / grammar sheets are short classroom prompts. Comprehension downloads are practice frames, not full passages. U4 is marked as scaffolding (unless / so that). U2 has notes but no separate unit-game folder yet.

## Hard rules

- No exam finals or drafts, and no exam-paper stems (games run `games/banks/no-exam-filter.js`)
- No student names, emails, scores, or MasterScores
- No Google Form IDs
