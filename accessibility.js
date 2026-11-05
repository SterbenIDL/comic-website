/* Squad Noobs - accessibility toolbar. Include with: <script src="accessibility.js" defer></script> */
(function () {
  "use strict";
  var KEY = "squad_a11y_v1",
    root = document.documentElement;
  var T = {
    HE: {
      open: "תפריט נגישות (Alt+A)",
      title: "תפריט נגישות",
      close: "סגור",
      closeBtn: "סגור תפריט",
      skip: "דלג לתוכן הראשי",
      on: "פעיל",
      off: "כבוי",
      reset: "איפוס הגדרות",
      statement: "הצהרת נגישות",
      size: "גודל טקסט",
      tts: "הקראת טקסט",
      ttsStop: "עצור הקראה",
      ttsNone: "הקראה אינה נתמכת בדפדפן זה",
      f: {
        "fs+": "הגדל טקסט",
        "fs-": "הקטן טקסט",
        hc: "ניגודיות גבוהה",
        lc: "ניגודיות בהירה",
        inv: "היפוך צבעים",
        gray: "גווני אפור",
        links: "הדגשת קישורים",
        heads: "הדגשת כותרות",
        font: "גופן קריא",
        spacing: "ריווח אותיות",
        lineh: "ריווח שורות",
        cursor: "סמן גדול",
        anim: "עצירת אנימציות",
        hideimg: "הסתרת תמונות",
        guide: "סרגל קריאה",
        focus: "הדגשת מיקוד",
        tts: "הקראת טקסט",
      },
    },
    EN: {
      open: "Accessibility menu (Alt+A)",
      title: "Accessibility menu",
      close: "Close",
      closeBtn: "Close menu",
      skip: "Skip to main content",
      on: "on",
      off: "off",
      reset: "Reset settings",
      statement: "Accessibility statement",
      size: "Text size",
      tts: "Read aloud",
      ttsStop: "Stop reading",
      ttsNone: "Speech is not supported in this browser",
      f: {
        "fs+": "Larger text",
        "fs-": "Smaller text",
        hc: "High contrast",
        lc: "Light contrast",
        inv: "Invert colors",
        gray: "Grayscale",
        links: "Highlight links",
        heads: "Highlight headings",
        font: "Readable font",
        spacing: "Letter spacing",
        lineh: "Line spacing",
        cursor: "Large cursor",
        anim: "Stop animations",
        hideimg: "Hide images",
        guide: "Reading guide",
        focus: "Highlight focus",
        tts: "Read aloud",
      },
    },
  };
  var TOGGLES = [
    "hc",
    "lc",
    "inv",
    "gray",
    "links",
    "heads",
    "font",
    "spacing",
    "lineh",
    "cursor",
    "anim",
    "hideimg",
    "guide",
    "focus",
  ];
  var state = { fs: 100 };
  TOGGLES.forEach(function (k) {
    state[k] = false;
  });
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    for (var k in saved) if (k in state) state[k] = saved[k];
  } catch (e) {}

  function lang() {
    var l = (typeof window.currentLang !== "undefined" ? window.currentLang : root.lang || "he")
      .toString()
      .toUpperCase();
    return l.indexOf("EN") === 0 ? "EN" : "HE";
  }
  function tx() {
    return T[lang()];
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }

  var cur =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M5 2l24 15-10 2 7 14-5 3-7-14-9 8z' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E\") 4 2, auto";
  var css =
    "" +
    ".a11y-skip{position:absolute;top:-80px;inset-inline-start:8px;background:#C9A96A;color:#0B0B0A;padding:10px 16px;font-weight:700;z-index:2147483646;text-decoration:none}.a11y-skip:focus{top:8px}" +
    "#a11y-root{font-family:Heebo,Arial,sans-serif;font-size:16px;line-height:1.4;direction:rtl}#a11y-root[data-l=EN]{direction:ltr}" +
    "#a11y-btn{position:fixed;left:16px;bottom:16px;width:52px;height:52px;border-radius:50%;border:2px solid #0B0B0A;background:#C9A96A;color:#0B0B0A;cursor:pointer;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:0 4px 14px rgba(0,0,0,.6)}" +
    "#a11y-panel{position:fixed;left:16px;bottom:80px;width:min(360px,calc(100vw - 32px));max-height:70vh;overflow:auto;background:#111;color:#fff;border:1px solid #C9A96A;z-index:2147483000;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.7)}#a11y-panel[hidden]{display:none}" +
    "#a11y-panel h2{margin:0 0 10px;font-size:1.1rem;color:#C9A96A;border:0;padding:0}" +
    "#a11y-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}" +
    "#a11y-panel button,#a11y-panel a.b{font:inherit;font-size:.85rem;background:#1c1c1a;color:#fff;border:1px solid #6b5d3a;padding:10px 8px;cursor:pointer;text-align:center;text-decoration:none;display:block}" +
    "#a11y-panel button[aria-pressed=true]{background:#C9A96A;color:#0B0B0A;font-weight:700}" +
    "#a11y-panel button:hover,#a11y-panel a.b:hover{border-color:#C9A96A}#a11y-panel .w{grid-column:1/-1}" +
    "#a11y-btn:focus-visible,#a11y-panel button:focus-visible,#a11y-panel a:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 5px #0B0B0A}" +
    "#a11y-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}" +
    "#a11y-guide{position:fixed;left:0;right:0;height:42px;background:rgba(255,235,59,.22);border-block:2px solid #C9A96A;pointer-events:none;z-index:2147482990;display:none}" +
    ".a11y-guide-on #a11y-guide{display:block}" +
    ".a11y-hc *,.a11y-hc body{background:#000!important;color:#fff!important;border-color:#fff!important;text-shadow:none!important;box-shadow:none!important;background-image:none!important}.a11y-hc a,.a11y-hc a *{color:#ff0!important}" +
    ".a11y-lc *,.a11y-lc body{background:#fff!important;color:#000!important;border-color:#000!important;text-shadow:none!important;box-shadow:none!important;background-image:none!important}.a11y-lc a,.a11y-lc a *{color:#0033cc!important}" +
    ".a11y-hc::before,.a11y-hc::after,.a11y-lc::before,.a11y-lc::after,.a11y-hc body::before,.a11y-hc body::after,.a11y-lc body::before,.a11y-lc body::after{display:none!important}" +
    ".a11y-hc #a11y-btn,.a11y-lc #a11y-btn{border-color:currentColor!important}" +
    ".a11y-inv img,.a11y-inv video,.a11y-inv canvas{filter:invert(1) hue-rotate(180deg)}" +
    ".a11y-links a{text-decoration:underline!important;background:#ffeb3b!important;color:#000!important;outline:2px solid #000}" +
    ".a11y-heads h1,.a11y-heads h2,.a11y-heads h3,.a11y-heads h4,.a11y-heads [role=heading]{outline:3px solid #C9A96A!important;outline-offset:3px;background:rgba(201,169,106,.18)!important}" +
    ".a11y-font body,.a11y-font body *:not(#a11y-root *){font-family:Arial,Helvetica,sans-serif!important}" +
    ".a11y-spacing body *:not(#a11y-root *){letter-spacing:.12em!important;word-spacing:.2em!important}" +
    ".a11y-lineh body *:not(#a11y-root *){line-height:2!important}" +
    ".a11y-cursor,.a11y-cursor *{cursor:" +
    cur +
    "!important}" +
    ".a11y-anim *,.a11y-anim *::before,.a11y-anim *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" +
    ".a11y-hideimg img,.a11y-hideimg video,.a11y-hideimg picture{visibility:hidden!important}" +
    ".a11y-focus *:focus,.a11y-focus *:focus-visible{outline:4px solid #ff0!important;outline-offset:3px!important;box-shadow:0 0 0 7px #000!important}" +
    ":focus-visible{outline:3px solid #C9A96A;outline-offset:2px}" +
    "@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}";

  var st = document.createElement("style");
  st.id = "a11y-css";
  st.textContent = css;

  function apply() {
    TOGGLES.forEach(function (k) {
      root.classList.toggle("a11y-" + k, !!state[k]);
    });
    root.style.fontSize = state.fs === 100 ? "" : state.fs + "%";
    var f = [];
    if (state.inv) f.push("invert(1) hue-rotate(180deg)");
    if (state.gray) f.push("grayscale(1)");
    root.style.filter = f.join(" ");
    if (state.anim)
      document.querySelectorAll("video").forEach(function (v) {
        try {
          v.pause();
        } catch (e) {}
      });
    save();
    if (panel) render();
  }
  function say(m) {
    var l = document.getElementById("a11y-live");
    if (l) {
      l.textContent = "";
      setTimeout(function () {
        l.textContent = m;
      }, 40);
    }
  }

  var speaking = false;
  function readAloud() {
    var t = tx();
    if (!("speechSynthesis" in window)) {
      say(t.ttsNone);
      return;
    }
    if (speaking) {
      speechSynthesis.cancel();
      speaking = false;
      render();
      return;
    }
    var sel = String(window.getSelection ? window.getSelection() : "").trim();
    var main = document.getElementById("mainContent") || document.querySelector("main") || document.body;
    var text = sel || (main.innerText || "").slice(0, 4000);
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang() === "EN" ? "en-US" : "he-IL";
    u.onend = u.onerror = function () {
      speaking = false;
      render();
    };
    speaking = true;
    speechSynthesis.speak(u);
    render();
  }

  var panel, btn, opener;
  function render() {
    var t = tx();
    document.getElementById("a11y-root").setAttribute("data-l", lang());
    btn.setAttribute("aria-label", t.open);
    btn.title = t.open;
    panel.setAttribute("aria-label", t.title);
    var h =
      "<h2>" +
      t.title +
      '</h2><div id="a11y-grid">' +
      '<button data-k="fs-" aria-label="' +
      t.f["fs-"] +
      " (" +
      state.fs +
      '%)">A-</button>' +
      '<button data-k="fs+" aria-label="' +
      t.f["fs+"] +
      " (" +
      state.fs +
      '%)">A+</button>';
    TOGGLES.forEach(function (k) {
      h += '<button data-k="' + k + '" aria-pressed="' + !!state[k] + '">' + t.f[k] + "</button>";
    });
    h +=
      '<button class="w" data-k="tts" aria-pressed="' +
      speaking +
      '">' +
      (speaking ? t.ttsStop : t.f.tts) +
      "</button>" +
      '<button class="w" data-k="reset">' +
      t.reset +
      "</button>" +
      '<a class="b w" href="accessibility.html">' +
      t.statement +
      "</a>" +
      '<button class="w" data-k="close">' +
      t.closeBtn +
      "</button></div>";
    var active =
      document.activeElement &&
      document.activeElement.getAttribute &&
      document.activeElement.getAttribute("data-k");
    panel.innerHTML = h;
    if (active) {
      var again = panel.querySelector('[data-k="' + active + '"]');
      if (again) again.focus();
    }
  }
  function toggle(open) {
    var show = open === undefined ? panel.hidden : open;
    panel.hidden = !show;
    btn.setAttribute("aria-expanded", show);
    if (show) {
      opener = document.activeElement;
      render();
      var f = panel.querySelector("button");
      if (f) f.focus();
    } else if (opener && opener.focus) opener.focus();
    else btn.focus();
  }

  function build() {
    document.head.appendChild(st);
    var main = document.getElementById("mainContent") || document.querySelector("main");
    if (main && !main.id) main.id = "mainContent";
    if (main && !main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    if (main && !document.querySelector(".a11y-skip")) {
      var s = document.createElement("a");
      s.className = "a11y-skip";
      s.href = "#" + main.id;
      s.textContent = tx().skip;
      s.addEventListener("click", function () {
        setTimeout(function () {
          main.focus();
        }, 0);
      });
      document.body.insertBefore(s, document.body.firstChild);
    }
    var r = document.createElement("div");
    r.id = "a11y-root";
    r.innerHTML =
      '<button id="a11y-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="a11y-panel"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v4.5M9 21l3-6.5 3 6.5"/></svg></button>' +
      '<div id="a11y-panel" role="dialog" aria-modal="false" hidden></div><div id="a11y-live" aria-live="polite" role="status"></div><div id="a11y-guide" aria-hidden="true"></div>';
    document.body.appendChild(r);
    btn = document.getElementById("a11y-btn");
    panel = document.getElementById("a11y-panel");
    btn.addEventListener("click", function () {
      toggle();
    });
    panel.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var k = b.getAttribute("data-k"),
        t = tx();
      if (k === "fs+") state.fs = Math.min(200, state.fs + 10);
      else if (k === "fs-") state.fs = Math.max(80, state.fs - 10);
      else if (k === "tts") {
        readAloud();
        return;
      } else if (k === "close") {
        toggle(false);
        return;
      } else if (k === "reset") {
        TOGGLES.forEach(function (x) {
          state[x] = false;
        });
        state.fs = 100;
        try {
          speechSynthesis.cancel();
        } catch (x) {}
        speaking = false;
        say(t.reset);
      } else if (k in state) {
        state[k] = !state[k];
        say(t.f[k] + ": " + (state[k] ? t.on : t.off));
      }
      if (k === "fs+" || k === "fs-") say(t.size + " " + state.fs + "%");
      apply();
    });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        toggle(false);
        return;
      }
      if (e.key !== "Tab") return;
      var f = panel.querySelectorAll("button,a[href]");
      if (!f.length) return;
      var first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.altKey && (e.key === "a" || e.key === "A" || e.key === "ש")) {
        e.preventDefault();
        toggle();
      }
    });
    var g = document.getElementById("a11y-guide");
    function moveGuide(y) {
      g.style.top = y - 21 + "px";
    }
    document.addEventListener("mousemove", function (e) {
      if (state.guide) moveGuide(e.clientY);
    });
    document.addEventListener(
      "touchmove",
      function (e) {
        if (state.guide && e.touches[0]) moveGuide(e.touches[0].clientY);
      },
      { passive: true },
    );
    document.addEventListener("keydown", function (e) {
      if (state.guide && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        var y = (parseInt(g.style.top, 10) || 100) + (e.key === "ArrowDown" ? 24 : -24);
        g.style.top = y + "px";
      }
    });
    root.classList.toggle("a11y-guide-on", !!state.guide);
    new MutationObserver(function () {
      root.classList.toggle("a11y-guide-on", !!state.guide);
    }).observe(root, { attributes: true, attributeFilter: ["class"] });
    apply();
    labelIconButtons();
    watchModals();
    if (!root.hasAttribute("lang")) root.setAttribute("lang", "he");
  }

  /* Give icon-only buttons an accessible name */
  function labelIconButtons() {
    var t = tx();
    document.querySelectorAll("button:not([aria-label])").forEach(function (b) {
      var s = (b.textContent || "").trim();
      if (/^[✕×xX]$/.test(s)) b.setAttribute("aria-label", t.close);
    });
  }

  /* Modals (merch, trailer): dialog roles, focus on open, restore on close, Esc to close */
  function watchModals() {
    var ids = ["merchModal", "trailerModal"],
      openers = {};
    ids.forEach(function (id) {
      var m = document.getElementById(id);
      if (!m) return;
      m.setAttribute("role", "dialog");
      m.setAttribute("aria-modal", "true");
      var h = m.querySelector("h3");
      if (h) {
        if (!h.id) h.id = id + "Title";
        m.setAttribute("aria-labelledby", h.id);
      } else m.setAttribute("aria-label", id);
      var wasHidden = m.classList.contains("hidden");
      new MutationObserver(function () {
        var hidden = m.classList.contains("hidden");
        if (hidden === wasHidden) return;
        wasHidden = hidden;
        if (!hidden) {
          openers[id] = document.activeElement;
          var f = m.querySelector("button,[href],input,select,textarea");
          if (f) f.focus();
        } else if (openers[id] && openers[id].focus) openers[id].focus();
      }).observe(m, { attributes: true, attributeFilter: ["class"] });
      m.addEventListener("keydown", function (e) {
        if (e.key !== "Tab") return;
        var f = Array.prototype.filter.call(
          m.querySelectorAll("button,[href],input,select,textarea,video[controls]"),
          function (x) {
            return x.offsetParent !== null;
          },
        );
        if (!f.length) return;
        var a = f[0],
          z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || (panel && !panel.hidden)) return;
      var mm = document.getElementById("merchModal"),
        tm = document.getElementById("trailerModal");
      if (mm && !mm.classList.contains("hidden") && typeof window.closeMerchModal === "function")
        window.closeMerchModal();
      else if (tm && !tm.classList.contains("hidden") && typeof window.toggleTrailerModal === "function")
        window.toggleTrailerModal();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();