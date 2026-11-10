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

`.nojekyll` is in the root so Pages serves the HTML, `downloads/*.docx`, and `assets/` as static files (Jekyll is off).

`main` already has the site. GitHub's Pages API refused this agent's token (`403 Resource not accessible by integration`; the repo reports `has_pages: false`). Someone with admin on the repo needs to open **Settings → Pages** and save the branch / folder above once.

Until that save, https://mrcheunghcy.github.io/p6-pages/ returns 404. After it is saved, the first deploy can take about a minute. Direct settings link: https://github.com/MrcheungHCY/p6-pages/settings/pages

## File tree

```
index.html                 hub (U1–U4, Exam Vocab, Games, tenses link)
units/u1 … units/u4        scrolling unit pages
downloads/u1 … u4          notes, 重點, grammar, comprehension (Word .docx)
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
assets/fx-kit/styles/      16 style packs (idle / happy / oops complete)
assets/character-library/  README, index.csv, hcy-chars.js, png/char-001 … char-082
assets/ocr/                offline Tesseract bundle for Dictation Tug-of-War
```

Tenses practice lives on its own site: https://mrcheunghcy.github.io/6d-tenses-practice/

FX demo (same kit the revision games load): `assets/fx-kit/demo.html`  
on Pages: https://mrcheunghcy.github.io/p6-pages/assets/fx-kit/demo.html

## Still open

- **Style packs are complete** in `assets/fx-kit/styles/`. All 16 packs now have idle, happy, and oops, plus the board and stamp images from both halves.
- **Character library is complete:** `README.md`, `index.csv` (82 rows), `hcy-chars.js`, and `png/char-001.png` … `png/char-082.png`. Revision-game scene images (`char-026`, `031`, `033`, `063`, `065`–`068`, `071`) are on disk.
- **OCR is in** `assets/ocr/` (`hcy-ocr.js`, Tesseract 5.1.1, `eng.traineddata.gz`). Dictation Tug-of-War already points at that folder.
- **Visuals:** unit pages do not show a Pictures · 圖庫 bank. Vocab images stay on the Exam Vocab page; character strips stay inside Notes. Unit Games sections link out to the revision games and do not embed the default fx-kit classroom buddy.
- **Unit packs:** notes / 重點 on each Unit page are English + Cantonese revision (colour-coded patterns and hidden traps). Matching Word files are `downloads/uN/notes.docx` and `zhongdian.docx`. Comprehension downloads are practice frames, not full passages. U4 teaches unless / so that. U2 has notes but no separate unit-game folder yet.

## Hard rules

- No exam finals or drafts, and no exam-paper stems (games run `games/banks/no-exam-filter.js`)
- No student names, emails, scores, or MasterScores
- No Google Form IDs
