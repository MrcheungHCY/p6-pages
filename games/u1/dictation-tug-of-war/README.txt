P.6 U.1 Dictation Tug-of-War
HCY English · Feeling Unwell · Dict 1
=====================================

HOW TO OPEN
-----------
1. Open index.html in Google Chrome (recommended) or Edge.
2. For camera photo input: allow camera permission when prompted.
3. Best on a tablet / laptop with stylus or finger drawing.
4. First open needs network so the handwriting reader can load.
   After that, Chrome usually caches it for offline use.
5. Optional better handwriting reading: open with ?key=YOUR_GEMINI_KEY
   or set window.CONFIG = { apiKey: '...' } in the console before playing.
   No API key is required.


MODES
-----
• Single player (practice) — NO rope / NO AI opponent.
  Simple stats: Correct · Misses · progress (q/total).
  Correct → +1 Correct, cheer, next item.
  Wrong → +1 Miss, stay and retry the same item.
  Ends when the list is finished (results show Correct / Misses).
  Start button: “Start practice!” — Win-by / best-of is hidden.

• Two player — Red vs Blue tug-of-war with rope UI, alternating turns.
  Correct = pull toward your side; wrong = slip toward the other side.
  Win by N (default 5), or optional best-of rounds.
  Start button: “Start Tug of War!”

Teacher start screen:
  1P / 2P · Vocab / Rote / All
  · (2P only) Win by · Best of (0 = win-by only)
  · optional "Show answer after 2 fails"


QUESTION UI
-----------
• Answers are HIDDEN.
• Vocab: English gloss + Chinese hint (HK P.6 friendly).
• Rote: "Write sentence N" + Speak button (Web Speech TTS once).
  The sentence is NOT left on screen after Speak — write from memory.
• Progress: item X of Y.


HANDWRITING CHECK
-----------------
Inputs:
  1) Draw canvas (finger / stylus / mouse) — Clear / Undo
  2) Upload / Camera photo of paper writing
  3) Type backup (for testing or if reading struggles)

Tap “Check my writing”. The UI shows kid/teacher-friendly feedback only:
  • “I read: …” (or “Could not read clearly” if empty/gibberish)
  • Judgment: “✓ Matches the answer.” / “✗ What’s wrong: spelling does not match.”
  • Logic: must match the dictation answer (small typos OK; wrong word = fail)
  • Buttons: Try again / Teacher override
    (✓ Correct appears only when auto-match succeeds)
  • After 2 fails (if checkbox on): “Answer: …”

Engine names, CDN errors, and technical dumps are NOT shown in the UI.


ANSWER MATCHING (normalize + fuzzy)
-----------------------------------
Normalize before compare:
  • lowercase
  • collapse spaces
  • smart quotes → straight (' ' ' → ', " etc.)
  • What's / What's and I've / I've treated the same
  • trim; trailing ? . allowed to mismatch on sentences

Fuzzy accept:
  • exact preferred
  • Levenshtein ≤1 for short vocab (≤6 chars after normalize)
  • ≤2 for longer vocab phrases
  • ≤2–3 for sentences

Reject clear wrong words (e.g. cough vs couch):
  Even if full-string distance is within limit, content-word tokens
  (ignoring a/the/to/…) must align. Same-length single-letter
  substitutions between content words are treated as different words
  and FAIL (cough≠couch). Insertion/deletion typos (dizzy/dizy) OK.


WRITING TIPS
------------
• Write large and clearly; leave space between letters.
• Good light; high contrast (dark ink on white paper).
• Avoid shadows and tilted photos; fill the frame.
• Print-style letters read better than fancy cursive.
• If reading keeps failing: use Teacher override, or Type backup.


FILES
-----
index.html       — full game (CSS + JS inline)
dict-content.txt — answer bank (exact spelling)
README.txt       — this file

No secrets are stored in these files.
