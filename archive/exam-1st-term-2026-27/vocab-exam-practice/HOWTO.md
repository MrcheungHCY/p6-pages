# Vocabulary Exam Practice — HOWTO

A local P.6 vocabulary cloze tool. It is not published on the public student Pages site (`https://mrcheunghcy.github.io/p6-pages/` / `MrcheungHCY/p6-pages`).

## How to open

1. Open the folder `Colleague-Cloze-Quiz`.
2. Double-click `index.html`, or right-click it and open it in a browser (Chrome, Edge, or Safari).
3. You do **not** need a web server. The page is built to work from a `file://` / local folder because `bank.js` and `app.js` sit beside `index.html`.

## How to use

1. Pick your name first (Maymay, Hilary, Fiona, or Aaron).
2. Check the unused-set counter (out of 100). History is counted **only for the name you picked**.
3. Choose question count **10–25** (every version also has **one extra example**, not counted in that number).
4. Choose how many versions **1–30**.
5. **Preview on this page** shows the quiz but does **not** mark sets as used.
6. **Generate and download Word** downloads a `.docx` and then marks those sets as used for your name.

If you ask for more versions than you still have unused, the app caps the file to what is left and explains this. If you have used all 100, it will not recycle old sets for your name. Other names may still receive the same set.

## Word file

- Filename looks like: `P6-Vocab-Exam-Practice-Aaron-10q-2v-2026-11-10.docx` (name, question count, version count, date).
- The header is **Vocabulary Exam Practice**.
- Times New Roman, 14 pt, double line spacing.
- Each version: title + set id + example (answer shown) + scrambled word bank + numbered cloze items, then a **page break**, then that version’s answer key, then the next version.

## What localStorage does

- Key: `colleagueClozeQuiz.usedSets.v1`, stored **in this browser only**, keyed by name.
- A set is marked used only after a successful Word download (not after preview).
- This does **not** sync across devices, browsers, or other computers. There is no shared backend. If a later shared history is needed, a Sheet or other backend would have to be added (ask Lesson Manager before changing locked logic).
- **Clear my used-set history (this browser only)** asks for confirmation. It is for testing in this browser, not a silent recycle during generate.

## How the bank is stored

The bank already contains 100 real cloze sets for Vocabulary Exam Practice.

- Canonical data: `bank.json`
- Offline copy the page actually loads from a local file: `bank.js` (`window.CLOZE_BANK = …`)

Keep the same shape:

- `meta` (label the bank)
- `sets`: 100 objects, each with
  - `id` such as `set-001` … `set-100`
  - `example`: `{ "id", "code", "tag", "sentence", "answer" }`
  - `items`: at least 25 objects with the same fields
- Each `sentence` must contain exactly one blank marker: `_____`
- `answer` is the single target word (or exact form) to write in the blank

After you replace `bank.json`, rebuild the offline file:

```bash
python3 tools/sync_bank_js.py
```

Then refresh `index.html`. If the folder is later opened through a local http preview, the page will prefer `bank.json`; from `file://` it uses `bank.js`.

Do not put exam finals/drafts, student name lists, or scores into this bank.
