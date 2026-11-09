# HCY offline OCR bundle

## Versions (downloaded 2026-10-20)
| File | Source |
|------|--------|
| `tesseract.min.js` | jsDelivr `tesseract.js@5.1.1` |
| `worker.min.js` | jsDelivr `tesseract.js@5.1.1` |
| `tesseract-core.wasm.js` | jsDelivr `tesseract.js-core@5.1.1` |
| `tesseract-core-simd.wasm` | jsDelivr `tesseract.js-core@5.1.1` |
| `eng.traineddata.gz` | jsDelivr `@tesseract.js-data/eng` (tessdata 4.0.0) |

## Helper
`hcy-ocr.js` → `window.HCY_OCR`

## Manual re-fetch (if files missing)
```bash
OCR="_assets/ocr"
curl -fsSL "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js" -o "$OCR/tesseract.min.js"
curl -fsSL "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js" -o "$OCR/worker.min.js"
curl -fsSL "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core.wasm.js" -o "$OCR/tesseract-core.wasm.js"
curl -fsSL "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1/tesseract-core-simd.wasm" -o "$OCR/tesseract-core-simd.wasm"
curl -fsSL "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0/eng.traineddata.gz" -o "$OCR/eng.traineddata.gz"
```

## Game wiring (G06)
From `dictation-tug-of-war/index.html`, relative OCR base is `../../../../_assets/ocr/`.
Prefer local script tag over CDN; keep CDN as comment fallback only if desired.
