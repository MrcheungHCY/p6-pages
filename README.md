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

A deploy that stays on `syncing_files` until the 10-minute job timeout is canceled, and the previous successful build stays live. Another commit on `main` starts a fresh deploy of the same branch.

`.nojekyll` is in the root so Pages serves the HTML, `downloads/*.docx`, and `assets/` as static files (Jekyll is off).

`main` already has the site. GitHub's Pages API refused this agent's token (`403 Resource not accessible by integration`; the repo reports `has_pages: false`). Someone with admin on the repo needs to open **Settings → Pages** and save the branch / folder above once.

Until that save, https://mrcheunghcy.github.io/p6-pages/ returns 404. After it is saved, the first deploy can take about a minute. Direct settings link: https://github.com/MrcheungHCY/p6-pages/settings/pages

## File tree

```
index.html                 hub (U1–U4, Conditionals, P.6 Tenses Practice)
tenses-practice/           P.6 Tenses Practice (100 passages)
units/u1 … units/u4        scrolling unit pages (no character-library strip)
downloads/u1 … u4          notes, 重點, grammar, comprehension (Word .docx)
games/                     unit games only (U1 and U3); not in the hub nav
games/u1, games/u3         unit game packs
grammar/                   conditionals (Unit 3), used to, pronouns
vocab/                     redirect to the hub (old Exam Vocab URL)
writing/                   redirect to the hub (old Writing URL)
vocab-exam-practice/       redirect to the hub
games/exam-revision/       redirect to the hub (games 01–11 too)
archive/exam-1st-term-2026-27/
                           unlisted copies of those exam pages and games/banks
assets/css/                portal.css
assets/banks/              shared grammar banks
assets/hcy-*.js / .css     speech, touch, deeplinks, teacher HUD
assets/fx-kit/             Motion + Three.js FX kit and demo
assets/fx-kit/styles/      16 style packs (idle / happy / oops complete)
assets/character-library/  README, index.csv, hcy-chars.js, png/char-001 … char-082
assets/ocr/                offline Tesseract bundle for Dictation Tug-of-War
```

Tenses practice: https://mrcheunghcy.github.io/p6-pages/tenses-practice/

Unit 4: https://mrcheunghcy.github.io/p6-pages/units/u4/

FX demo: `assets/fx-kit/demo.html`  
on Pages: https://mrcheunghcy.github.io/p6-pages/assets/fx-kit/demo.html

## Still open

- **Style packs are complete** in `assets/fx-kit/styles/`. All 16 packs now have idle, happy, and oops, plus the board and stamp images from both halves.
- **Character library is complete:** `README.md`, `index.csv` (82 rows), `hcy-chars.js`, and `png/char-001.png` … `png/char-082.png`. Revision-game scene images (`char-026`, `031`, `033`, `063`, `065`–`068`, `071`) are on disk.
- **OCR is in** `assets/ocr/` (`hcy-ocr.js`, Tesseract 5.1.1, `eng.traineddata.gz`). Dictation Tug-of-War already points at that folder.
- **Visuals:** unit pages do not show a Pictures · 圖庫 bank or the Notes “Character library” strip. The small trap avatar inside 隱藏陷阱 stays. Unit game links stay on the Unit 1 and Unit 3 pages. `assets/character-library/` and the FX demo stay in the repo.
- **Unit packs:** notes / 重點 are English + Cantonese revision (colour-coded patterns and hidden traps). Matching Word files are `downloads/uN/notes.docx` and `zhongdian.docx`. Comprehension downloads are practice frames, not full passages. Unit 4 is on the hub (Save the Earth: unless, so that, protecting the environment). U4 games are not published yet. U2 has notes but no separate unit-game folder yet. The grammar answer key is not on the public site.
- **Archived from the student hub** (still in git, not linked): 1st Exam Vocabulary, 4-Grid Picture Writing, vocab-exam-practice, and Exam Revision Games 01–11, under `archive/exam-1st-term-2026-27/`. The old URLs redirect to the hub. `grammar/conditionals/` stays; it is the Unit 3 teaching page, not an exam-revision wrapper.

## Hard rules

- No exam finals or drafts, and no exam-paper stems (the archived revision games used `archive/exam-1st-term-2026-27/games/banks/no-exam-filter.js`)
- No student names, emails, scores, or MasterScores
- No Google Form IDs

A Pages retry was needed after the real-3 bank merge (deploy run 42837483697 timed out on Deploy to GitHub Pages).
