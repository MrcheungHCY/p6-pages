/* P.6 Vocabulary Exam Practice generator.
   Word export uses an in-page OOXML + ZIP store builder (no CDN). */
(function () {
  "use strict";

  var COLLEAGUES = ["Maymay", "Hilary", "Fiona", "Aaron"];
  var STORAGE_KEY = "colleagueClozeQuiz.usedSets.v1";
  var TOTAL_SETS = 100;
  var BLANK = "____________";

  var state = {
    colleague: null,
    bank: null,
    prepared: null // { qCount, versions: [{set, items, bankWords}] }
  };

  function $(id) { return document.getElementById(id); }

  function loadUsedMap() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === "object" ? obj : {};
    } catch (e) {
      return {};
    }
  }

  function saveUsedMap(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  function usedFor(name) {
    var map = loadUsedMap();
    var list = map[name] || [];
    return Array.isArray(list) ? list.slice() : [];
  }

  function setUsedFor(name, ids) {
    var map = loadUsedMap();
    map[name] = ids;
    saveUsedMap(map);
  }

  function unique(ids) {
    var seen = {};
    var out = [];
    ids.forEach(function (id) {
      if (!seen[id]) { seen[id] = true; out.push(id); }
    });
    return out;
  }

  function remainingSets(name) {
    var used = new Set(usedFor(name));
    return (state.bank.sets || []).filter(function (s) { return !used.has(s.id); });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function todayStamp() {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
  }

  function sentenceWithBlank(s) {
    return String(s).replace("_____", BLANK);
  }

  function showMsg(kind, text) {
    var el = $("message");
    el.className = "msg show " + kind;
    el.textContent = text;
  }

  function clearMsg() {
    var el = $("message");
    el.className = "msg";
    el.textContent = "";
  }

  function updateRemaining() {
    var name = state.colleague;
    var row = $("remainRow");
    var pill = $("remainPill");
    var detail = $("remainDetail");
    var workspace = $("workspace");
    if (!name || !state.bank) {
      row.hidden = true;
      workspace.setAttribute("aria-disabled", "true");
      return;
    }
    row.hidden = false;
    workspace.setAttribute("aria-disabled", "false");
    var left = remainingSets(name).length;
    var used = TOTAL_SETS - left;
    pill.textContent = "Unused sets: " + left + " / " + TOTAL_SETS;
    if (left === 0) {
      pill.className = "pill danger";
      detail.textContent = name + " already used all 100 sets. This name will not recycle old sets.";
    } else if (left <= 10) {
      pill.className = "pill warn";
      detail.textContent = name + " has used " + used + " set(s). " + left + " left in this browser.";
    } else {
      pill.className = "pill ok";
      detail.textContent = name + " has used " + used + " set(s) in this browser.";
    }
    var wantV = Number($("vCount").value);
    if (left === 0) {
      $("btnPreview").disabled = true;
      $("btnDownload").disabled = true;
    } else {
      $("btnPreview").disabled = false;
      $("btnDownload").disabled = false;
    }
    if (left > 0 && wantV > left) {
      showMsg("warn", "You asked for " + wantV + " version(s), but " + name + " only has " + left + " unused set(s) left. The download will be capped at " + left + " version(s). 你揀多咗，系統只會出淨低嗰 " + left + " 份，唔會重用舊題組。");
    } else if (left === 0) {
      showMsg("danger", name + " has used all 100 sets. No more versions can be generated for this name. 已經用晒，唔會循環再用。If you are only testing the tool, you may clear this browser’s history below (it will not clear other names or other devices).");
    } else {
      clearMsg();
    }
  }

  function prepareVersions() {
    var name = state.colleague;
    if (!name) {
      showMsg("warn", "Please pick your name first. 請先揀你嘅名。");
      return null;
    }
    var leftSets = remainingSets(name);
    if (leftSets.length === 0) {
      updateRemaining();
      return null;
    }
    var qCount = Number($("qCount").value);
    var wantV = Number($("vCount").value);
    if (!(qCount >= 10 && qCount <= 25) || !(wantV >= 1 && wantV <= 30)) {
      showMsg("danger", "Question count must be 10–25 and versions must be 1–30.");
      return null;
    }
    var take = Math.min(wantV, leftSets.length);
    var picked = shuffle(leftSets).slice(0, take);
    var versions = picked.map(function (set, idx) {
      var items = (set.items || []).slice(0, qCount);
      var words = shuffle(items.map(function (it) { return it.answer; }));
      return {
        versionNo: idx + 1,
        set: set,
        items: items,
        bankWords: words
      };
    });
    var prepared = {
      colleague: name,
      qCount: qCount,
      requestedVersions: wantV,
      versions: versions
    };
    state.prepared = prepared;
    if (take < wantV) {
      showMsg("warn", "Capped to " + take + " version(s) because only " + leftSets.length + " unused set(s) remain for " + name + ". 淨低唔夠，已自動減少份數，唔會重用舊題組。");
    } else {
      clearMsg();
    }
    return prepared;
  }

  function renderPreview(prepared) {
    var card = $("previewCard");
    var box = $("preview");
    var hint = $("previewHint");
    if (!prepared) {
      card.hidden = true;
      box.innerHTML = "";
      return;
    }
    card.hidden = false;
    hint.textContent = "Preview only — this does not mark sets as used. " +
      prepared.colleague + " · " + prepared.qCount + " questions + 1 example · " +
      prepared.versions.length + " version(s). Download Word to mark these sets as used.";
    var html = "";
    prepared.versions.forEach(function (v) {
      html += '<article class="version-card">';
      html += "<h3>Version " + v.versionNo + " of " + prepared.versions.length +
        "  ·  " + escapeHtml(v.set.id) + "</h3>";
      html += '<p class="example"><strong>Example</strong> (extra, not counted in the ' +
        prepared.qCount + " questions)<br>" +
        escapeHtml(sentenceWithBlank(v.set.example.sentence)) +
        "<br>Answer: " + escapeHtml(v.set.example.answer) + "</p>";
      html += '<p class="bank"><strong>Word bank</strong> ' +
        escapeHtml(v.bankWords.join("    ")) + "</p>";
      v.items.forEach(function (it, i) {
        html += '<p class="item">' + (i + 1) + ". " +
          escapeHtml(sentenceWithBlank(it.sentence)) + "</p>";
      });
      html += '<p class="answers"><strong>Answer key (will appear on the next page in Word)</strong><br>';
      html += "Example: " + escapeHtml(v.set.example.answer);
      v.items.forEach(function (it, i) {
        html += "<br>" + (i + 1) + ". " + escapeHtml(it.answer);
      });
      html += "</p></article>";
    });
    box.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- minimal OOXML docx builder (no CDN), technique only ----------
  function crc32(buf) {
    var c = ~0;
    for (var i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (var k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  }
  function u16(n) { var b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; }
  function u32(n) { var b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; }
  function concat(arrays) {
    var len = 0; arrays.forEach(function (a) { len += a.length; });
    var out = new Uint8Array(len); var o = 0;
    arrays.forEach(function (a) { out.set(a, o); o += a.length; });
    return out;
  }
  function strBytes(s) { return new TextEncoder().encode(s); }
  function zipStore(files) {
    var localParts = [];
    var centralParts = [];
    var offset = 0;
    files.forEach(function (f) {
      var name = strBytes(f.name);
      var data = f.data;
      var crc = crc32(data);
      var local = concat([
        u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0),
        name, data
      ]);
      localParts.push(local);
      var central = concat([
        u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0),
        u16(0), u16(0), u32(0), u32(offset), name
      ]);
      centralParts.push(central);
      offset += local.length;
    });
    var centralDir = concat(centralParts);
    var end = concat([
      u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
      u32(centralDir.length), u32(offset), u16(0)
    ]);
    return concat(localParts.concat([centralDir, end]));
  }
  function xmlEscape(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function wPara(text, opts) {
    opts = opts || {};
    var bold = opts.bold ? "<w:b/>" : "";
    var size = opts.size || 28; // half-points; 28 = 14pt
    var align = opts.center ? "<w:jc w:val=\"center\"/>" : "";
    return "<w:p><w:pPr><w:spacing w:line=\"480\" w:lineRule=\"auto\" w:before=\"0\" w:after=\"0\"/>" +
      align + "</w:pPr><w:r>" +
      "<w:rPr><w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\" w:cs=\"Times New Roman\" w:eastAsia=\"Times New Roman\"/>" +
      bold + "<w:sz w:val=\"" + size + "\"/><w:szCs w:val=\"" + size + "\"/></w:rPr>" +
      "<w:t xml:space=\"preserve\">" + xmlEscape(text) + "</w:t></w:r></w:p>";
  }
  function wPageBreak() {
    return "<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>";
  }

  function versionQuestionParas(prepared, v) {
    var body = [];
    body.push(wPara("Vocabulary Exam Practice", { bold: true }));
    body.push(wPara("Colleague: " + prepared.colleague + "    Version: " + v.versionNo + " of " + prepared.versions.length + "    Set ID: " + v.set.id));
    body.push(wPara("Questions: " + prepared.qCount + " plus 1 example    Date: " + todayStamp()));
    body.push(wPara(""));
    body.push(wPara("Example (extra — not counted in the " + prepared.qCount + " questions)", { bold: true }));
    body.push(wPara(sentenceWithBlank(v.set.example.sentence)));
    body.push(wPara("Answer: " + v.set.example.answer));
    body.push(wPara(""));
    body.push(wPara("Word bank", { bold: true }));
    body.push(wPara(v.bankWords.join("     ")));
    body.push(wPara(""));
    v.items.forEach(function (it, i) {
      body.push(wPara((i + 1) + ". " + sentenceWithBlank(it.sentence)));
    });
    return body;
  }

  function versionAnswerParas(prepared, v) {
    var body = [];
    body.push(wPara("Vocabulary Exam Practice — Answer Key", { bold: true }));
    body.push(wPara("Colleague: " + prepared.colleague + "    Version: " + v.versionNo + " of " + prepared.versions.length + "    Set ID: " + v.set.id));
    body.push(wPara(""));
    body.push(wPara("Example: " + v.set.example.answer));
    v.items.forEach(function (it, i) {
      body.push(wPara((i + 1) + ". " + it.answer));
    });
    return body;
  }

  function buildDocx(prepared) {
    var body = [];
    prepared.versions.forEach(function (v, idx) {
      body = body.concat(versionQuestionParas(prepared, v));
      body.push(wPageBreak());
      body = body.concat(versionAnswerParas(prepared, v));
      if (idx < prepared.versions.length - 1) body.push(wPageBreak());
    });

    var documentXml = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">" +
      "<w:body>" + body.join("") +
      "<w:sectPr><w:pgSz w:w=\"11906\" w:h=\"16838\"/>" +
      "<w:pgMar w:top=\"1440\" w:right=\"1440\" w:bottom=\"1440\" w:left=\"1440\"/></w:sectPr>" +
      "</w:body></w:document>";

    var contentTypes = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">" +
      "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>" +
      "<Default Extension=\"xml\" ContentType=\"application/xml\"/>" +
      "<Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>" +
      "</Types>";
    var rels = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">" +
      "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>" +
      "</Relationships>";
    var docRels = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
      "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"></Relationships>";

    var files = [
      { name: "[Content_Types].xml", data: strBytes(contentTypes) },
      { name: "_rels/.rels", data: strBytes(rels) },
      { name: "word/document.xml", data: strBytes(documentXml) },
      { name: "word/_rels/document.xml.rels", data: strBytes(docRels) }
    ];
    return zipStore(files);
  }

  function filenameFor(prepared) {
    return "P6-Vocab-Exam-Practice-" + prepared.colleague + "-" +
      prepared.qCount + "q-" + prepared.versions.length + "v-" +
      todayStamp() + ".docx";
  }

  function downloadPrepared(prepared) {
    var bytes = buildDocx(prepared);
    var blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filenameFor(prepared);
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    var ids = usedFor(prepared.colleague).concat(prepared.versions.map(function (v) { return v.set.id; }));
    setUsedFor(prepared.colleague, unique(ids));
    state.prepared = null;
    updateRemaining();
    showMsg("ok", "Downloaded " + filenameFor(prepared) + ". Marked " + prepared.versions.length + " set(s) as used for " + prepared.colleague + " in this browser only.");
  }

  function onPreview() {
    var prepared = prepareVersions();
    if (prepared) renderPreview(prepared);
  }

  function onDownload() {
    var prepared = state.prepared;
    var qCount = Number($("qCount").value);
    var wantV = Number($("vCount").value);
    var needsNew = !prepared ||
      prepared.colleague !== state.colleague ||
      prepared.qCount !== qCount ||
      prepared.requestedVersions !== wantV;
    if (needsNew) {
      prepared = prepareVersions();
      if (prepared) renderPreview(prepared);
    }
    if (!prepared) return;
    downloadPrepared(prepared);
  }

  function onClear() {
    var name = state.colleague;
    if (!name) {
      showMsg("warn", "Please pick your name first. 請先揀你嘅名。");
      return;
    }
    var used = usedFor(name);
    var ok = window.confirm(
      "Clear used-set history for " + name + " in THIS BROWSER only?\n\n" +
      "This will make all 100 sets available again for " + name +
      " on this computer/browser. It will not recycle sets during a normal generate, and it will not change other names or other devices.\n\n" +
      "目前已用： " + used.length + " / " + TOTAL_SETS + "\n\n" +
      "Are you sure?"
    );
    if (!ok) return;
    setUsedFor(name, []);
    state.prepared = null;
    $("previewCard").hidden = true;
    $("preview").innerHTML = "";
    updateRemaining();
    showMsg("ok", "Cleared used-set history for " + name + " in this browser only.");
  }

  function bindNames() {
    var grid = $("nameGrid");
    COLLEAGUES.forEach(function (name) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "name-btn";
      btn.textContent = name;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () {
        state.colleague = name;
        state.prepared = null;
        grid.querySelectorAll(".name-btn").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        updateRemaining();
      });
      grid.appendChild(btn);
    });
  }

  function fillSelects() {
    var q = $("qCount");
    var v = $("vCount");
    for (var i = 10; i <= 25; i++) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = i + " questions + 1 example";
      if (i === 10) o.selected = true;
      q.appendChild(o);
    }
    for (var n = 1; n <= 30; n++) {
      var p = document.createElement("option");
      p.value = String(n);
      p.textContent = n + (n === 1 ? " version" : " versions");
      if (n === 1) p.selected = true;
      v.appendChild(p);
    }
    q.addEventListener("change", function () { state.prepared = null; updateRemaining(); });
    v.addEventListener("change", function () { state.prepared = null; updateRemaining(); });
  }

  function useBank(bank) {
    if (!bank || !Array.isArray(bank.sets) || bank.sets.length !== 100) {
      showMsg("danger", "The question bank could not be loaded (expected 100 sets). Check bank.js / bank.json in this folder.");
      return;
    }
    state.bank = bank;
    updateRemaining();
  }

  function init() {
    bindNames();
    fillSelects();
    $("btnPreview").addEventListener("click", onPreview);
    $("btnDownload").addEventListener("click", onDownload);
    $("btnClear").addEventListener("click", onClear);
    $("btnPreview").disabled = true;
    $("btnDownload").disabled = true;

    var embedded = window.CLOZE_BANK || null;
    // Prefer bank.js for file://. If the folder is later served over http and
    // bank.json has been swapped, try that first, then fall back to embedded.
    if (window.location.protocol === "file:") {
      useBank(embedded);
      return;
    }
    fetch("bank.json", { cache: "no-store" })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (json) { useBank(json); })
      .catch(function () { useBank(embedded); });
  }

  init();
})();
