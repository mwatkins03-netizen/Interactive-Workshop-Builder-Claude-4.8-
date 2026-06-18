/* ============================================================
   app.js — core engine for the AI Literacy Activities toolkit
   Plain ES5-ish vanilla JS (no build step, no modules) so the
   files work both on GitHub Pages and by double-clicking locally.
   Exposes a single global: window.AILit
   ============================================================ */
(function () {
  "use strict";

  var KEY_CONFIG = "ailit:config";       // Marc's edited config override
  var KEY_RESP = "ailit:responses";      // an attendee's responses

  /* ---------- tiny DOM helpers ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function")
        n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function uid(p) { return (p || "id") + "-" + Math.random().toString(36).slice(2, 8); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- storage ---------- */
  var store = {
    getConfig: function () {
      try {
        var raw = localStorage.getItem(KEY_CONFIG);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return JSON.parse(JSON.stringify(window.DEFAULT_CONFIG));
    },
    saveConfig: function (cfg) {
      try { localStorage.setItem(KEY_CONFIG, JSON.stringify(cfg)); } catch (e) {}
    },
    resetConfig: function () { try { localStorage.removeItem(KEY_CONFIG); } catch (e) {} },

    getResponses: function () {
      try { return JSON.parse(localStorage.getItem(KEY_RESP)) || {}; } catch (e) { return {}; }
    },
    setResponse: function (activityId, value) {
      var all = store.getResponses();
      all[activityId] = { value: value, at: new Date().toISOString() };
      try { localStorage.setItem(KEY_RESP, JSON.stringify(all)); } catch (e) {}
      // optional live-results sync (only when a session code is active)
      try {
        if (window.AILitCloud && window.AILitCloud.enabled && window.AILIT_SESSION) {
          var a = getActivity(activityId);
          window.AILitCloud.submit(window.AILIT_SESSION, activityId, a ? a.type : "", value);
        }
      } catch (e) {}
    },
    clearResponses: function () { try { localStorage.removeItem(KEY_RESP); } catch (e) {} }
  };

  function getActivity(id) {
    var cfg = store.getConfig();
    for (var i = 0; i < cfg.activities.length; i++)
      if (cfg.activities[i].id === id) return cfg.activities[i];
    return null;
  }

  /* ---------- icons ---------- */
  var ICONS = {
    sparkle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" fill="currentColor"/><circle cx="19" cy="18" r="1.6" fill="currentColor"/></svg>',
    star: function (filled) { return '<svg width="34" height="34" viewBox="0 0 24 24" fill="' + (filled ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.5"><path d="M12 3l2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.9 6.6 19.4l1.2-6L3.4 9.3l6-.7L12 3z"/></svg>'; }
  };

  /* type glyphs (1em, inherit color) */
  function _svg(inner, fill) {
    return '<svg class="tico" viewBox="0 0 24 24" fill="' + (fill ? "currentColor" : "none") +
      '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var GLYPH = {
    spectrum: _svg('<line x1="3" y1="12" x2="21" y2="12"/><circle cx="15" cy="12" r="3.2" fill="currentColor" stroke="none"/>'),
    tally: _svg('<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'),
    sort: _svg('<rect x="3" y="9" width="5" height="11" rx="1.2"/><rect x="9.5" y="5" width="5" height="15" rx="1.2"/><rect x="16" y="12" width="5" height="8" rx="1.2"/>'),
    poll: _svg('<circle cx="5" cy="6" r="1.7" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.7"/><circle cx="5" cy="18" r="1.7"/><line x1="9.5" y1="6" x2="20" y2="6"/><line x1="9.5" y1="12" x2="20" y2="12"/><line x1="9.5" y1="18" x2="20" y2="18"/>'),
    rating: _svg('<path d="M12 3.2l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.8 6.9 19l1.1-5.7-4.3-4 5.8-.7z" fill="currentColor" stroke="none"/>'),
    shorttext: _svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><line x1="14.5" y1="5.5" x2="18.5" y2="9.5"/>'),
    reflection: _svg('<rect x="4.5" y="3.5" width="15" height="17" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/>'),
    wordcloud: _svg('<path d="M7 16.5a4 4 0 0 1-.6-7.96A5 5 0 0 1 16.2 7.5a3.5 3.5 0 0 1 .8 6.9"/><circle cx="8.5" cy="20" r="1.1" fill="currentColor" stroke="none"/><circle cx="12.5" cy="20.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="16.5" cy="20" r="1.1" fill="currentColor" stroke="none"/>'),
    ranking: _svg('<line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><path d="M5 9.5V4M3.4 5.6 5 4l1.6 1.6"/><path d="M5 14.5V20M3.4 18.4 5 20l1.6-1.6"/>'),
    likert: _svg('<line x1="4" y1="8" x2="20" y2="8"/><circle cx="4" cy="8" r="1.6"/><circle cx="12" cy="8" r="1.6"/><circle cx="20" cy="8" r="1.6" fill="currentColor"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="4" cy="16" r="1.6" fill="currentColor"/><circle cx="12" cy="16" r="1.6"/><circle cx="20" cy="16" r="1.6"/>'),
    quiz: _svg('<path d="M9 18h6M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.1 1 1.7h5.2c0-.6.4-1.2 1-1.7A6 6 0 0 0 12 3z"/>'),
    dotvote: _svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/>'),
    emoji: _svg('<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none"/><path d="M8 14.5c1.6 2 6.4 2 8 0"/>')
  };

  /* ---------- shared footer: attribution + AI disclosure ---------- */
  function footer() {
    var f = el("footer", { class: "site-footer no-print-keep" });
    var bar = el("div", { class: "wrap attribution" }, [
      el("div", { html: "Created by <strong>Marc Watkins</strong> · AI Literacy for Faculty" }),
      el("div", { class: "ai-disclosure", html:
        ICONS.sparkle +
        '<span><strong>AI disclosure:</strong> This toolkit was built with the help of an AI assistant (Anthropic Claude). All content is reviewed and curated by Marc Watkins.</span>'
      })
    ]);
    f.appendChild(bar);
    return f;
  }

  /* =============================================================
     ACTIVITY TYPES
     Each: { label, icon, blurb, defaultConfig(),
             render(box, activity, saved, onSave),
             editor(box, activity, onChange),
             summarize(activity, saved) -> DOM node }
     ============================================================= */
  var TYPES = {};

  /* ----- SPECTRUM (slider positioning) ----- */
  TYPES.spectrum = {
    label: "Spectrum / slider", icon: GLYPH.spectrum,
    blurb: "Position on a line between two poles.",
    defaultConfig: function () { return { leftLabel: "Left", rightLabel: "Right", midLabel: "", min: 0, max: 100, start: 50 }; },
    render: function (box, a, saved, onSave) {
      var c = a.config, val = (saved && saved.value != null) ? saved.value : c.start;
      var marks = el("div", { class: "row between", style: "color:var(--text-dim);font-weight:600;font-size:.9rem" }, [
        el("span", { text: c.leftLabel }),
        c.midLabel ? el("span", { class: "muted", text: c.midLabel }) : null,
        el("span", { text: c.rightLabel })
      ]);
      var input = el("input", { type: "range", min: c.min, max: c.max, value: val,
        style: "width:100%;accent-color:var(--c-violet);height:6px" });
      var readout = el("div", { class: "center", style: "margin-top:10px;font-size:1.6rem;font-weight:800" });
      function paint() { readout.innerHTML = '<span class="gradient-text">' + input.value + '</span>'; }
      input.addEventListener("input", paint);
      input.addEventListener("change", function () { onSave(Number(input.value)); });
      paint();
      box.appendChild(el("div", { class: "stack" }, [marks, input, readout]));
    },
    editor: function (box, a, onChange) {
      var c = a.config;
      box.appendChild(grid2([
        textField("Left label", c.leftLabel, function (v) { c.leftLabel = v; onChange(); }),
        textField("Right label", c.rightLabel, function (v) { c.rightLabel = v; onChange(); }),
        textField("Middle label (optional)", c.midLabel, function (v) { c.midLabel = v; onChange(); }),
        numField("Start value", c.start, function (v) { c.start = v; onChange(); })
      ]));
    },
    summarize: function (a, saved) {
      var c = a.config, val = saved.value;
      var pct = (val - c.min) / (c.max - c.min) * 100;
      var bar = el("div", { style: "position:relative;height:10px;border-radius:999px;background:var(--bg-2);border:1px solid var(--stroke)" }, [
        el("div", { style: "position:absolute;top:-5px;left:" + pct + "%;transform:translateX(-50%);width:20px;height:20px;border-radius:50%;background:var(--grad-brand)" })
      ]);
      return el("div", { class: "stack" }, [
        el("div", { class: "row between muted", style: "font-size:.85rem" }, [el("span", { text: c.leftLabel }), el("span", { text: c.rightLabel })]),
        bar,
        el("div", { html: "You placed yourself at <strong>" + val + "</strong> / " + c.max })
      ]);
    }
  };

  /* ----- TALLY (counters) ----- */
  TYPES.tally = {
    label: "Tally counters", icon: GLYPH.tally,
    blurb: "Count how many of a set apply to you.",
    defaultConfig: function () { return { items: [{ label: "Item one", count: 0 }], allowAdd: true }; },
    render: function (box, a, saved, onSave) {
      var counts = (saved && saved.value) || {};
      var list = el("div", { class: "stack" });
      function row(item, i) {
        var n = counts[i] || 0;
        var num = el("span", { style: "min-width:2.2em;text-align:center;font-size:1.4rem;font-weight:800", html: '<span class="gradient-text">' + n + '</span>' });
        var minus = el("button", { class: "btn btn-sm btn-ghost", text: "−", onclick: function () { counts[i] = Math.max(0, (counts[i] || 0) - 1); num.innerHTML = '<span class="gradient-text">' + counts[i] + '</span>'; onSave(counts); } });
        var plus = el("button", { class: "btn btn-sm btn-primary", text: "+", onclick: function () { counts[i] = (counts[i] || 0) + 1; num.innerHTML = '<span class="gradient-text">' + counts[i] + '</span>'; onSave(counts); } });
        return el("div", { class: "panel row between" }, [
          el("span", { style: "font-weight:600", text: item.label }),
          el("div", { class: "row" }, [minus, num, plus])
        ]);
      }
      a.config.items.forEach(function (it, i) { list.appendChild(row(it, i)); });
      box.appendChild(list);
    },
    editor: function (box, a, onChange) {
      itemListEditor(box, a.config.items, "Counter label", function (i) { return a.config.items[i].label; },
        function (i, v) { a.config.items[i].label = v; }, function () { a.config.items.push({ label: "New counter", count: 0 }); },
        function (i) { a.config.items.splice(i, 1); }, onChange);
    },
    summarize: function (a, saved) {
      var counts = saved.value || {}, total = 0, rows = [];
      a.config.items.forEach(function (it, i) {
        var n = counts[i] || 0; total += n;
        rows.push(el("li", { html: esc(it.label) + " — <strong>" + n + "</strong>" }));
      });
      return el("div", {}, [el("ul", { style: "margin:0 0 8px;padding-left:18px" }, rows), el("div", { class: "muted", html: "Total tallied: <strong>" + total + "</strong>" })]);
    }
  };

  /* ----- SORT (drag chips into buckets) ----- */
  TYPES.sort = {
    label: "Sorting board", icon: GLYPH.sort,
    blurb: "Drag items into category buckets.",
    defaultConfig: function () { return { categories: [{ id: "a", label: "Category A", hint: "", color: "#3a86ff" }, { id: "b", label: "Category B", hint: "", color: "#2ad9c0" }], items: ["Item 1", "Item 2"] }; },
    render: function (box, a, saved, onSave) {
      var c = a.config;
      var placement = (saved && saved.value) || {}; // itemLabel -> categoryId ("" = unsorted)
      var dragged = null;
      function makeChip(label) {
        var chip = el("div", { class: "chip", draggable: "true", text: label });
        chip.addEventListener("dragstart", function () { dragged = label; chip.classList.add("dragging"); });
        chip.addEventListener("dragend", function () { chip.classList.remove("dragging"); });
        return chip;
      }
      var pool = el("div", { class: "panel", style: "min-height:64px;display:flex;flex-wrap:wrap;gap:10px" });
      pool.dataset.cat = "";
      var buckets = [pool];
      var bucketWrap = el("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(180px,1fr))" });
      c.categories.forEach(function (cat) {
        var zone = el("div", { class: "panel", style: "min-height:96px;border-top:3px solid " + cat.color }, [
          el("div", { class: "row between", style: "margin-bottom:8px" }, [
            el("strong", { text: cat.label }),
            cat.hint ? el("span", { class: "badge", text: cat.hint }) : null
          ])
        ]);
        var drop = el("div", { style: "display:flex;flex-wrap:wrap;gap:8px" });
        drop.dataset.cat = cat.id;
        zone.appendChild(drop);
        buckets.push(drop);
        bucketWrap.appendChild(zone);
      });
      buckets.forEach(function (b) {
        b.addEventListener("dragover", function (e) { e.preventDefault(); b.style.boxShadow = "inset 0 0 0 2px var(--c-blue)"; });
        b.addEventListener("dragleave", function () { b.style.boxShadow = ""; });
        b.addEventListener("drop", function (e) {
          e.preventDefault(); b.style.boxShadow = "";
          if (dragged == null) return;
          placement[dragged] = b.dataset.cat;
          relayout(); onSave(placement);
        });
      });
      function relayout() {
        pool.innerHTML = ""; pool.appendChild(el("span", { class: "muted", style: "font-size:.82rem;align-self:center", text: "Unsorted:" }));
        buckets.forEach(function (b) { if (b !== pool) b.innerHTML = ""; });
        c.items.forEach(function (label) {
          var cat = placement[label] || "";
          var target = pool;
          buckets.forEach(function (b) { if (b.dataset.cat === cat && cat !== "") target = b; });
          target.appendChild(makeChip(label));
        });
      }
      relayout();
      box.appendChild(el("div", { class: "stack" }, [bucketWrap, pool,
        el("div", { class: "muted", style: "font-size:.8rem", text: "Tip: drag a chip back to the Unsorted row to reset it." })]));
    },
    editor: function (box, a, onChange) {
      box.appendChild(el("div", { class: "eyebrow", text: "Categories" }));
      var cats = a.config.categories;
      var catBox = el("div", { class: "stack" });
      cats.forEach(function (cat, i) {
        catBox.appendChild(el("div", { class: "row" }, [
          inlineInput(cat.label, function (v) { cat.label = v; onChange(); }, "Label"),
          inlineInput(cat.hint, function (v) { cat.hint = v; onChange(); }, "Hint"),
          el("input", { type: "color", value: cat.color, style: "width:42px;height:38px;padding:2px", oninput: function (e) { cat.color = e.target.value; onChange(); } }),
          el("button", { class: "btn btn-sm btn-danger", text: "✕", onclick: function () { cats.splice(i, 1); rerender(box, a, onChange); } })
        ]));
      });
      catBox.appendChild(el("button", { class: "btn btn-sm", text: "+ Add category", onclick: function () { cats.push({ id: uid("c"), label: "New", hint: "", color: "#9b5cff" }); rerender(box, a, onChange); } }));
      box.appendChild(catBox);
      box.appendChild(el("hr", { class: "soft" }));
      box.appendChild(el("div", { class: "eyebrow", text: "Items to sort" }));
      itemListEditor(box, a.config.items, "Item", function (i) { return a.config.items[i]; },
        function (i, v) { a.config.items[i] = v; }, function () { a.config.items.push("New item"); },
        function (i) { a.config.items.splice(i, 1); }, onChange);
    },
    summarize: function (a, saved) {
      var placement = saved.value || {};
      var wrap = el("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(160px,1fr))" });
      a.config.categories.forEach(function (cat) {
        var items = a.config.items.filter(function (it) { return placement[it] === cat.id; });
        wrap.appendChild(el("div", { class: "panel", style: "border-top:3px solid " + cat.color }, [
          el("strong", { text: cat.label }),
          el("ul", { style: "margin:6px 0 0;padding-left:18px" }, items.length ? items.map(function (it) { return el("li", { text: it }); }) : [el("li", { class: "muted", text: "—" })])
        ]));
      });
      return wrap;
    }
  };

  /* ----- POLL (single/multi choice) ----- */
  TYPES.poll = {
    label: "Poll / choice", icon: GLYPH.poll,
    blurb: "Single- or multi-select from options.",
    defaultConfig: function () { return { multi: false, options: ["Option A", "Option B", "Option C"] }; },
    render: function (box, a, saved, onSave) {
      var multi = a.config.multi;
      var sel = (saved && saved.value) || (multi ? [] : null);
      var list = el("div", { class: "stack" });
      a.config.options.forEach(function (opt) {
        var active = multi ? sel.indexOf(opt) > -1 : sel === opt;
        var b = el("button", { class: "btn" + (active ? " btn-primary" : ""), style: "width:100%;justify-content:flex-start;text-align:left", text: opt });
        b.addEventListener("click", function () {
          if (multi) { var i = sel.indexOf(opt); if (i > -1) sel.splice(i, 1); else sel.push(opt); }
          else { sel = opt; }
          onSave(sel);
          Array.prototype.forEach.call(list.children, function (child) {
            var on = multi ? sel.indexOf(child.textContent) > -1 : sel === child.textContent;
            child.className = "btn" + (on ? " btn-primary" : "");
          });
        });
        list.appendChild(b);
      });
      box.appendChild(list);
      if (multi) box.appendChild(el("div", { class: "muted", style: "font-size:.8rem;margin-top:8px", text: "Select all that apply." }));
    },
    editor: function (box, a, onChange) {
      box.appendChild(checkField("Allow multiple selections", a.config.multi, function (v) { a.config.multi = v; onChange(); }));
      itemListEditor(box, a.config.options, "Option", function (i) { return a.config.options[i]; },
        function (i, v) { a.config.options[i] = v; }, function () { a.config.options.push("New option"); },
        function (i) { a.config.options.splice(i, 1); }, onChange);
    },
    summarize: function (a, saved) {
      var v = saved.value;
      var chosen = Array.isArray(v) ? v : (v ? [v] : []);
      return el("div", {}, chosen.length ? chosen.map(function (o) { return el("span", { class: "badge", style: "margin:0 6px 6px 0", text: o }); }) : [el("span", { class: "muted", text: "No selection" })]);
    }
  };

  /* ----- RATING (stars / scale) ----- */
  TYPES.rating = {
    label: "Rating scale", icon: GLYPH.rating,
    blurb: "A 1–N confidence or agreement rating.",
    defaultConfig: function () { return { scale: 5, lowLabel: "Low", highLabel: "High", icon: "star" }; },
    render: function (box, a, saved, onSave) {
      var n = a.config.scale, val = (saved && saved.value) || 0;
      var stars = el("div", { class: "row center", style: "justify-content:center;gap:6px;color:var(--c-amber)" });
      function paint() { Array.prototype.forEach.call(stars.children, function (s, i) { s.innerHTML = ICONS.star(i < val); }); }
      for (var i = 1; i <= n; i++) (function (k) {
        var s = el("button", { class: "btn-ghost", style: "background:none;border:none;cursor:pointer;color:inherit;padding:2px", onclick: function () { val = k; paint(); onSave(val); } });
        stars.appendChild(s);
      })(i);
      paint();
      box.appendChild(el("div", { class: "stack center" }, [
        el("div", { class: "row between muted", style: "font-size:.85rem" }, [el("span", { text: a.config.lowLabel }), el("span", { text: a.config.highLabel })]),
        stars
      ]));
    },
    editor: function (box, a, onChange) {
      box.appendChild(grid2([
        numField("Scale (max)", a.config.scale, function (v) { a.config.scale = Math.max(2, Math.min(10, v)); onChange(); }),
        textField("Low label", a.config.lowLabel, function (v) { a.config.lowLabel = v; onChange(); }),
        textField("High label", a.config.highLabel, function (v) { a.config.highLabel = v; onChange(); })
      ]));
    },
    summarize: function (a, saved) {
      return el("div", { html: "Rated <strong>" + saved.value + "</strong> of " + a.config.scale });
    }
  };

  /* ----- SHORTTEXT (single open response) ----- */
  TYPES.shorttext = {
    label: "Short text", icon: GLYPH.shorttext,
    blurb: "One open-ended written response.",
    defaultConfig: function () { return { placeholder: "Type here…", maxLength: 240 }; },
    render: function (box, a, saved, onSave) {
      var ta = el("textarea", { placeholder: a.config.placeholder, maxlength: a.config.maxLength });
      ta.value = (saved && saved.value) || "";
      var count = el("div", { class: "muted", style: "text-align:right;font-size:.78rem" });
      function upd() { count.textContent = ta.value.length + " / " + a.config.maxLength; }
      ta.addEventListener("input", upd);
      ta.addEventListener("change", function () { onSave(ta.value); });
      ta.addEventListener("blur", function () { onSave(ta.value); });
      upd();
      box.appendChild(el("div", { class: "stack" }, [ta, count]));
    },
    editor: function (box, a, onChange) {
      box.appendChild(grid2([
        textField("Placeholder", a.config.placeholder, function (v) { a.config.placeholder = v; onChange(); }),
        numField("Max length", a.config.maxLength, function (v) { a.config.maxLength = v; onChange(); })
      ]));
    },
    summarize: function (a, saved) {
      return el("blockquote", { style: "margin:0;padding-left:14px;border-left:3px solid var(--c-violet)", text: saved.value || "—" });
    }
  };

  /* ----- REFLECTION (multiple prompts) ----- */
  TYPES.reflection = {
    label: "Reflection card", icon: GLYPH.reflection,
    blurb: "Several written prompts in one card.",
    defaultConfig: function () { return { prompts: ["Prompt one", "Prompt two"] }; },
    render: function (box, a, saved, onSave) {
      var vals = (saved && saved.value) || {};
      var stack = el("div", { class: "stack" });
      a.config.prompts.forEach(function (p, i) {
        var ta = el("textarea", { placeholder: "Your response…", style: "min-height:60px" });
        ta.value = vals[i] || "";
        ta.addEventListener("change", function () { vals[i] = ta.value; onSave(vals); });
        ta.addEventListener("blur", function () { vals[i] = ta.value; onSave(vals); });
        stack.appendChild(el("label", { class: "field" }, [el("span", { text: p }), ta]));
      });
      box.appendChild(stack);
    },
    editor: function (box, a, onChange) {
      itemListEditor(box, a.config.prompts, "Prompt", function (i) { return a.config.prompts[i]; },
        function (i, v) { a.config.prompts[i] = v; }, function () { a.config.prompts.push("New prompt"); },
        function (i) { a.config.prompts.splice(i, 1); }, onChange);
    },
    summarize: function (a, saved) {
      var vals = saved.value || {};
      return el("div", { class: "stack" }, a.config.prompts.map(function (p, i) {
        return el("div", {}, [el("div", { class: "muted", style: "font-size:.82rem;font-weight:600", text: p }),
          el("div", { html: esc(vals[i]) || '<span class="muted">—</span>' })]);
      }));
    }
  };

  /* ----- WORDCLOUD (collect short words) ----- */
  TYPES.wordcloud = {
    label: "Word cloud", icon: GLYPH.wordcloud,
    blurb: "Collect short words; watch them grow into a cloud.",
    defaultConfig: function () { return { maxWords: 5, placeholder: "Add a word…" }; },
    render: function (box, a, saved, onSave) {
      var words = (saved && saved.value) ? saved.value.slice() : [];
      var colors = ["var(--vermilion)", "var(--c-teal)", "var(--c-magenta)", "var(--c-blue)", "var(--c-amber)", "var(--c-cyan)"];
      var cloud = el("div", { class: "row", style: "gap:8px;min-height:42px;margin-top:4px" });
      function paint() {
        cloud.innerHTML = "";
        if (!words.length) { cloud.appendChild(el("span", { class: "muted", text: "Your words appear here — tap one to remove it." })); return; }
        words.forEach(function (w, i) {
          var size = (0.95 + Math.min(0.9, w.length / 16)).toFixed(2);
          var chip = el("button", { class: "chip", style: "font-size:" + size + "rem;color:" + colors[i % colors.length], title: "Remove", text: w });
          chip.addEventListener("click", function () { words.splice(i, 1); paint(); onSave(words); });
          cloud.appendChild(chip);
        });
      }
      var input = el("input", { type: "text", placeholder: a.config.placeholder, style: "flex:1" });
      var add = el("button", { class: "btn btn-primary", text: "Add" });
      function addWord() {
        var v = input.value.trim();
        if (!v || words.length >= a.config.maxWords) { input.value = ""; return; }
        words.push(v); input.value = ""; paint(); onSave(words); input.focus();
      }
      add.addEventListener("click", addWord);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addWord(); } });
      box.appendChild(el("div", { class: "stack" }, [
        el("div", { class: "row" }, [input, add]),
        el("div", { class: "muted", style: "font-size:.78rem", html: "Up to <strong>" + a.config.maxWords + "</strong> words." }),
        cloud
      ]));
      paint();
    },
    editor: function (box, a, onChange) {
      box.appendChild(grid2([
        numField("Max words", a.config.maxWords, function (v) { a.config.maxWords = Math.max(1, v); onChange(); }),
        textField("Input placeholder", a.config.placeholder, function (v) { a.config.placeholder = v; onChange(); })
      ]));
    },
    summarize: function (a, saved) {
      var words = saved.value || [];
      return el("div", { class: "row", style: "gap:8px" }, words.length ? words.map(function (w) { return el("span", { class: "badge", text: w }); }) : [el("span", { class: "muted", text: "—" })]);
    }
  };

  /* ----- RANKING (order by priority) ----- */
  TYPES.ranking = {
    label: "Ranking", icon: GLYPH.ranking,
    blurb: "Nudge items into priority order.",
    defaultConfig: function () { return { options: ["Highest priority", "Middle", "Lowest"] }; },
    render: function (box, a, saved, onSave) {
      var order = (saved && saved.value) ? saved.value.slice() : a.config.options.slice();
      a.config.options.forEach(function (o) { if (order.indexOf(o) < 0) order.push(o); });
      order = order.filter(function (o) { return a.config.options.indexOf(o) > -1; });
      var list = el("div", { class: "stack" });
      function paint() {
        list.innerHTML = "";
        order.forEach(function (o, i) {
          var up = el("button", { class: "btn btn-sm btn-ghost", text: "↑", title: "Move up" });
          var dn = el("button", { class: "btn btn-sm btn-ghost", text: "↓", title: "Move down" });
          up.addEventListener("click", function () { if (i > 0) { var t = order[i - 1]; order[i - 1] = order[i]; order[i] = t; paint(); onSave(order); } });
          dn.addEventListener("click", function () { if (i < order.length - 1) { var t = order[i + 1]; order[i + 1] = order[i]; order[i] = t; paint(); onSave(order); } });
          list.appendChild(el("div", { class: "panel row between" }, [
            el("div", { class: "row", style: "gap:10px" }, [
              el("span", { class: "badge", style: "background:var(--vermilion);color:#fff7e6", text: String(i + 1) }),
              el("span", { style: "font-weight:700", text: o })
            ]),
            el("div", { class: "row", style: "gap:4px" }, [up, dn])
          ]));
        });
      }
      paint();
      box.appendChild(list);
    },
    editor: function (box, a, onChange) {
      itemListEditor(box, a.config.options, "Item", function (i) { return a.config.options[i]; },
        function (i, v) { a.config.options[i] = v; }, function () { a.config.options.push("New item"); },
        function (i) { a.config.options.splice(i, 1); }, onChange);
    },
    summarize: function (a, saved) {
      var order = saved.value || [];
      return el("ol", { style: "margin:0;padding-left:20px" }, order.map(function (o) { return el("li", { style: "font-weight:600", text: o }); }));
    }
  };

  /* ----- LIKERT (agreement across statements) ----- */
  TYPES.likert = {
    label: "Agreement scale", icon: GLYPH.likert,
    blurb: "Rate several statements disagree → agree.",
    defaultConfig: function () { return { statements: ["Statement one", "Statement two"], scale: 5, lowLabel: "Disagree", highLabel: "Agree" }; },
    render: function (box, a, saved, onSave) {
      var vals = (saved && saved.value) || {};
      var stack = el("div", { class: "stack" });
      a.config.statements.forEach(function (s, si) {
        var dots = el("div", { class: "row", style: "gap:6px" });
        for (var k = 1; k <= a.config.scale; k++) (function (val) {
          var b = el("button", { class: "btn btn-sm" + (vals[si] === val ? " btn-primary" : ""), style: "min-width:38px;justify-content:center", text: String(val) });
          b.addEventListener("click", function () {
            vals[si] = val; onSave(vals);
            Array.prototype.forEach.call(dots.children, function (c, idx) { c.className = "btn btn-sm" + ((idx + 1) === val ? " btn-primary" : ""); });
          });
          dots.appendChild(b);
        })(k);
        stack.appendChild(el("div", { class: "panel" }, [
          el("div", { style: "font-weight:700;margin-bottom:8px", text: s }),
          dots,
          el("div", { class: "row between muted", style: "font-size:.74rem;margin-top:4px" }, [el("span", { text: a.config.lowLabel }), el("span", { text: a.config.highLabel })])
        ]));
      });
      box.appendChild(stack);
    },
    editor: function (box, a, onChange) {
      box.appendChild(grid2([
        numField("Scale (max)", a.config.scale, function (v) { a.config.scale = Math.max(2, Math.min(10, v)); onChange(); }),
        textField("Low label", a.config.lowLabel, function (v) { a.config.lowLabel = v; onChange(); }),
        textField("High label", a.config.highLabel, function (v) { a.config.highLabel = v; onChange(); })
      ]));
      box.appendChild(el("hr", { class: "soft" }));
      box.appendChild(el("div", { class: "eyebrow", text: "Statements" }));
      itemListEditor(box, a.config.statements, "Statement", function (i) { return a.config.statements[i]; },
        function (i, v) { a.config.statements[i] = v; }, function () { a.config.statements.push("New statement"); },
        function (i) { a.config.statements.splice(i, 1); }, onChange);
    },
    summarize: function (a, saved) {
      var vals = saved.value || {};
      return el("div", { class: "stack" }, a.config.statements.map(function (s, i) {
        return el("div", { class: "row between" }, [el("span", { text: s }), el("strong", { text: (vals[i] != null ? vals[i] + " / " + a.config.scale : "—") })]);
      }));
    }
  };

  /* ----- QUIZ (knowledge check with feedback) ----- */
  TYPES.quiz = {
    label: "Knowledge check", icon: GLYPH.quiz,
    blurb: "A question; reveals the right answer and why.",
    defaultConfig: function () { return { options: ["Option A", "Option B", "Option C"], correct: 0, explanation: "Add an explanation that appears after answering." }; },
    render: function (box, a, saved, onSave) {
      var chosen = (saved && saved.value != null) ? saved.value : null;
      var list = el("div", { class: "stack" });
      var feedback = el("div", { style: "margin-top:12px" });
      function paint() {
        Array.prototype.forEach.call(list.children, function (b, i) {
          b.className = "btn"; b.style.width = "100%"; b.style.justifyContent = "flex-start"; b.style.textAlign = "left";
          b.style.background = ""; b.style.color = "";
          if (chosen != null) {
            if (i === a.config.correct) { b.style.background = "var(--c-teal)"; b.style.color = "#0b1f1c"; }
            else if (i === chosen) { b.style.background = "var(--vermilion)"; b.style.color = "#fff7e6"; }
          }
        });
        feedback.innerHTML = "";
        if (chosen != null) {
          var ok = chosen === a.config.correct;
          feedback.appendChild(el("div", { class: "panel", style: "border-color:" + (ok ? "var(--c-teal)" : "var(--vermilion)") }, [
            el("strong", { html: ok ? "✓ Correct!" : "✗ Not quite — the answer is: " + esc(a.config.options[a.config.correct]) }),
            a.config.explanation ? el("p", { class: "muted", style: "margin:.4em 0 0", text: a.config.explanation }) : null
          ]));
        }
      }
      a.config.options.forEach(function (opt, i) {
        var b = el("button", { class: "btn", style: "width:100%;justify-content:flex-start;text-align:left", text: opt });
        b.addEventListener("click", function () { chosen = i; onSave(i); paint(); });
        list.appendChild(b);
      });
      box.appendChild(el("div", { class: "stack" }, [list, feedback]));
      paint();
    },
    editor: function (box, a, onChange) {
      box.appendChild(el("div", { class: "muted", style: "font-size:.85rem;margin-bottom:10px", text: "Put the question in the activity Prompt field above." }));
      box.appendChild(numField("Correct option (1 = first)", a.config.correct + 1, function (v) { a.config.correct = Math.max(0, v - 1); onChange(); }));
      box.appendChild(textField("Explanation (shown after answering)", a.config.explanation, function (v) { a.config.explanation = v; onChange(); }));
      box.appendChild(el("div", { class: "eyebrow", text: "Answer options" }));
      itemListEditor(box, a.config.options, "Option", function (i) { return a.config.options[i]; },
        function (i, v) { a.config.options[i] = v; }, function () { a.config.options.push("New option"); },
        function (i) { a.config.options.splice(i, 1); }, onChange);
    },
    summarize: function (a, saved) {
      var v = saved.value, ok = v === a.config.correct;
      return el("div", {}, [
        el("div", { html: "Your answer: <strong>" + esc(a.config.options[v]) + "</strong> " + (ok ? "✓" : "✗") }),
        ok ? null : el("div", { class: "muted", html: "Correct: " + esc(a.config.options[a.config.correct]) })
      ]);
    }
  };

  /* ----- DOTVOTE (allocate a budget of dots) ----- */
  TYPES.dotvote = {
    label: "Dot vote", icon: GLYPH.dotvote,
    blurb: "Spend a fixed number of dots across options.",
    defaultConfig: function () { return { options: ["Option A", "Option B", "Option C"], dots: 5 }; },
    render: function (box, a, saved, onSave) {
      var alloc = (saved && saved.value) || {};
      var total = a.config.dots;
      function used() { var s = 0; a.config.options.forEach(function (_, i) { s += alloc[i] || 0; }); return s; }
      var remain = el("span");
      function paintRemain() { remain.innerHTML = '<strong class="gradient-text" style="font-size:1.15rem">' + (total - used()) + '</strong> of ' + total + ' dots left'; }
      var list = el("div", { class: "stack" });
      a.config.options.forEach(function (opt, i) {
        var num = el("span", { style: "min-width:1.6em;text-align:center;font-weight:800", text: String(alloc[i] || 0) });
        var minus = el("button", { class: "btn btn-sm btn-ghost", text: "−" });
        var plus = el("button", { class: "btn btn-sm btn-primary", text: "+" });
        minus.addEventListener("click", function () { if ((alloc[i] || 0) > 0) { alloc[i] = alloc[i] - 1; num.textContent = alloc[i]; onSave(alloc); paintRemain(); } });
        plus.addEventListener("click", function () { if (used() < total) { alloc[i] = (alloc[i] || 0) + 1; num.textContent = alloc[i]; onSave(alloc); paintRemain(); } });
        list.appendChild(el("div", { class: "panel row between" }, [
          el("span", { style: "font-weight:700", text: opt }),
          el("div", { class: "row" }, [minus, num, plus])
        ]));
      });
      box.appendChild(el("div", { class: "stack" }, [el("div", { class: "center" }, [remain]), list]));
      paintRemain();
    },
    editor: function (box, a, onChange) {
      box.appendChild(numField("Total dots", a.config.dots, function (v) { a.config.dots = Math.max(1, v); onChange(); }));
      itemListEditor(box, a.config.options, "Option", function (i) { return a.config.options[i]; },
        function (i, v) { a.config.options[i] = v; }, function () { a.config.options.push("New option"); },
        function (i) { a.config.options.splice(i, 1); }, onChange);
    },
    summarize: function (a, saved) {
      var alloc = saved.value || {};
      return el("div", { class: "stack" }, a.config.options.map(function (opt, i) {
        var n = alloc[i] || 0;
        return el("div", { class: "row between" }, [el("span", { text: opt }), el("strong", { text: n + (n === 1 ? " dot" : " dots") })]);
      }));
    }
  };

  /* ----- EMOJI (reaction pulse-check) ----- */
  TYPES.emoji = {
    label: "Reaction check", icon: GLYPH.emoji,
    blurb: "A quick emoji pulse-check.",
    defaultConfig: function () { return { options: [{ emoji: "😀", label: "Energized" }, { emoji: "🤔", label: "Curious" }, { emoji: "😐", label: "Neutral" }, { emoji: "😟", label: "Worried" }] }; },
    render: function (box, a, saved, onSave) {
      var chosen = (saved && saved.value != null) ? saved.value : null;
      var grid = el("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(110px,1fr))" });
      a.config.options.forEach(function (o, i) {
        var b = el("button", { class: "panel center", style: "cursor:pointer;color:inherit;background:" + (chosen === i ? "var(--c-teal)" : "var(--bg-2)") });
        b.appendChild(el("div", { style: "font-size:2.2rem;line-height:1", text: o.emoji }));
        b.appendChild(el("div", { style: "font-weight:700;margin-top:6px;font-size:.9rem", text: o.label }));
        b.addEventListener("click", function () {
          chosen = i; onSave(i);
          Array.prototype.forEach.call(grid.children, function (c, idx) { c.style.background = idx === i ? "var(--c-teal)" : "var(--bg-2)"; });
        });
        grid.appendChild(b);
      });
      box.appendChild(grid);
    },
    editor: function (box, a, onChange) {
      var list = el("div", { class: "stack" });
      function build() {
        list.innerHTML = "";
        a.config.options.forEach(function (o, i) {
          var em = el("input", { type: "text", value: o.emoji, style: "width:60px;text-align:center" });
          em.addEventListener("input", function () { o.emoji = em.value; onChange(); });
          list.appendChild(el("div", { class: "row" }, [
            em,
            inlineInput(o.label, function (v) { o.label = v; onChange(); }, "Label"),
            el("button", { class: "btn btn-sm btn-danger", text: "✕", onclick: function () { a.config.options.splice(i, 1); onChange(); build(); } })
          ]));
        });
        list.appendChild(el("button", { class: "btn btn-sm", text: "+ Add reaction", onclick: function () { a.config.options.push({ emoji: "🙂", label: "New" }); onChange(); build(); } }));
      }
      build();
      box.appendChild(list);
    },
    summarize: function (a, saved) {
      var o = a.config.options[saved.value];
      return el("div", { html: o ? '<span style="font-size:1.4rem">' + o.emoji + '</span> ' + esc(o.label) : "—" });
    }
  };

  /* ---------- editor form helpers ---------- */
  function textField(label, val, on) {
    var inp = el("input", { type: "text", value: val == null ? "" : val });
    inp.addEventListener("input", function () { on(inp.value); });
    return el("label", { class: "field" }, [el("span", { text: label }), inp]);
  }
  function numField(label, val, on) {
    var inp = el("input", { type: "number", value: val });
    inp.addEventListener("input", function () { on(Number(inp.value)); });
    return el("label", { class: "field" }, [el("span", { text: label }), inp]);
  }
  function checkField(label, val, on) {
    var inp = el("input", { type: "checkbox" });
    inp.checked = !!val;
    inp.addEventListener("change", function () { on(inp.checked); });
    return el("label", { class: "row", style: "gap:8px;margin-bottom:12px;cursor:pointer" }, [inp, el("span", { text: label })]);
  }
  function inlineInput(val, on, ph) {
    var inp = el("input", { type: "text", value: val == null ? "" : val, placeholder: ph || "", style: "flex:1" });
    inp.addEventListener("input", function () { on(inp.value); });
    return inp;
  }
  function grid2(fields) {
    return el("div", { class: "grid", style: "grid-template-columns:repeat(auto-fit,minmax(200px,1fr))" }, fields);
  }
  function itemListEditor(box, arr, label, get, set, add, remove, onChange) {
    var list = el("div", { class: "stack" });
    function build() {
      list.innerHTML = "";
      arr.forEach(function (_, i) {
        list.appendChild(el("div", { class: "row" }, [
          inlineInput(get(i), function (v) { set(i, v); onChange(); }, label),
          el("button", { class: "btn btn-sm btn-danger", text: "✕", onclick: function () { remove(i); onChange(); build(); } })
        ]));
      });
      list.appendChild(el("button", { class: "btn btn-sm", text: "+ Add " + label.toLowerCase(), onclick: function () { add(); onChange(); build(); } }));
    }
    build();
    box.appendChild(list);
  }
  function rerender(box, a, onChange) { box.innerHTML = ""; TYPES[a.type].editor(box, a, onChange); }

  /* ---------- public render of a live activity ---------- */
  function renderActivity(mount, activity, opts) {
    opts = opts || {};
    var t = TYPES[activity.type];
    var saved = store.getResponses()[activity.id];
    var card = el("div", { class: "card card-glow" });
    card.appendChild(el("div", { class: "eyebrow", html: ICONS.sparkle + " " + esc(t.label) }));
    card.appendChild(el("h2", { class: "gradient-text", text: activity.title }));
    if (activity.prompt) card.appendChild(el("p", { class: "lead", text: activity.prompt }));
    var body = el("div", { style: "margin-top:18px" });
    var status = el("div", { class: "row", style: "margin-top:16px;min-height:20px" });
    function flash() {
      status.innerHTML = "";
      status.appendChild(el("span", { class: "badge", style: "color:var(--c-teal);border-color:var(--c-teal)", html: "✓ Saved to your device" }));
    }
    t.render(body, activity, saved, function (value) { store.setResponse(activity.id, value); flash(); if (opts.onSave) opts.onSave(value); });
    card.appendChild(body);
    card.appendChild(status);
    if (saved) flash();
    mount.appendChild(card);
    return card;
  }

  window.AILit = {
    el: el, $: $, uid: uid, esc: esc,
    store: store, getActivity: getActivity,
    TYPES: TYPES, ICONS: ICONS,
    footer: footer, renderActivity: renderActivity, rerenderEditor: rerender
  };
})();
