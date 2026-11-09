/*! no-exam-filter.js — Aaron HARD RULE: strip P6 GE 1st Term Exam 2026-2027 paper items */
(function (root) {
  function isExamPaperItem(it) {
    if (!it || typeof it !== "object") return false;
    var s = String(it.source || ""),
      u = String(it.unit || ""),
      tag = String(it.tag || ""),
      id = String(it.id || ""),
      p = String(it.prompt || ""),
      origin = String(it.origin || ""),
      section = String(it.section || "");
    var blob = (s + " " + u + " " + tag + " " + id + " " + p + " " + origin).toLowerCase();
    if (/^exam/i.test(s)) return true;
    if (/exam\s*[a-j]/i.test(blob)) return true;
    if (/\bexam[a-j]\b/i.test(blob)) return true;
    if (/u\d\s*\/\s*exam/i.test(u)) return true;
    if (/typhoon-parallel|examc-parallel|exam-parallel/i.test(tag + " " + origin)) return true;
    // cloze exam section letters only when source/unit already exam-ish or prompt tagged [Exam
    if (/\[exam\b/i.test(p) || /\[exam\b/i.test(id)) return true;
    if ((section === "F" || section === "H") && (/exam/i.test(s + u) || /\[exam/i.test(p))) return true;
    return false;
  }
  function filterNoExamItems(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(function (it) { return !isExamPaperItem(it); });
  }
  function scrubBankPayload(data) {
    if (!data) return { items: [] };
    if (Array.isArray(data)) return filterNoExamItems(data);
    var out = {};
    for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) out[k] = data[k];
    if (out.items && Array.isArray(out.items)) {
      out.items = filterNoExamItems(out.items);
      if (out.meta && typeof out.meta === "object") {
        out.meta = Object.assign({}, out.meta, { count: out.items.length, scrubbed: "no-exam-paper" });
      }
    }
    return out;
  }
  root.isExamPaperItem = isExamPaperItem;
  root.filterNoExamItems = filterNoExamItems;
  root.scrubBankPayload = scrubBankPayload;
})(typeof window !== "undefined" ? window : this);
