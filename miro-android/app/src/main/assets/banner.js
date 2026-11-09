(function () {
  // Auto-closes "Get the app / Get Now / Google Play" banners by tapping their X.
  // Generic on purpose: no site name or address is hardcoded.
  if (window.__miroBanner) return;
  window.__miroBanner = true;

  var TEXT = /google\s*play|play\s*store|get\s*now|get the app|download (the )?app|open in app|install app/i;
  var META = /close|dismiss|clos(e|er)-?btn/i;
  var GLYPH = /^[\s\u00d7xX\u2715\u2716\u2717\u2573\u2a2f]+$/;
  var KNOWN = '.smartbanner,[class*="smartbanner"],[id*="smartbanner"],[class*="app-banner"],[class*="install-banner"],[class*="download-app"],[class*="app-install"]';
  var handled = [];
  var queued = false;
  var stopAt = Date.now() + 30000;

  function shown(el) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  }

  function metaOf(el) {
    var c = el.className;
    if (c && c.baseVal !== undefined) c = c.baseVal;
    return (c || '') + ' ' + (el.id || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '');
  }

  // Innermost small element inside `root` that looks like a close (X) button.
  function findClose(root) {
    var all = root.querySelectorAll('a,button,span,div,i,b,img,svg,[role=button]');
    var hits = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.width > 90 || r.height > 90) continue;
      if (!shown(el)) continue;
      var t = (el.textContent || '').trim();
      if (META.test(metaOf(el)) || (t.length > 0 && t.length <= 2 && GLYPH.test(t))) hits.push(el);
    }
    for (var j = hits.length - 1; j >= 0; j--) {
      var inner = true;
      for (var k = 0; k < hits.length; k++) {
        if (k !== j && hits[j].contains(hits[k])) { inner = false; break; }
      }
      if (inner) return hits[j];
    }
    return null;
  }

  function nearEdge(r) {
    return r.top <= 140 || r.bottom >= window.innerHeight - 140;
  }

  function findBanner() {
    var known = document.querySelectorAll(KNOWN);
    for (var i = 0; i < known.length; i++) {
      var b = known[i];
      if (handled.indexOf(b) >= 0 || !shown(b)) continue;
      var c = findClose(b);
      if (c) return { box: b, close: c };
    }
    if (!document.body) return null;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (!TEXT.test(n.nodeValue || '')) continue;
      var el = n.parentElement;
      for (var d = 0; el && d < 8; d++, el = el.parentElement) {
        var r = el.getBoundingClientRect();
        if (r.height > 240) break;
        if (r.height < 30 || r.width < window.innerWidth * 0.6 || !nearEdge(r)) continue;
        if (handled.indexOf(el) >= 0) break;
        var cl = findClose(el);
        if (cl) return { box: el, close: cl };
      }
    }
    return null;
  }

  function tap(el) {
    try {
      var o = { bubbles: true, cancelable: true, view: window };
      el.dispatchEvent(new MouseEvent('mousedown', o));
      el.dispatchEvent(new MouseEvent('mouseup', o));
    } catch (e) { }
    try { el.click(); } catch (e) { }
  }

  function force(box) {
    try {
      box.style.setProperty('display', 'none', 'important');
      var h = document.documentElement;
      h.className = (h.className || '').replace(/\bsmartbanner-\S+/g, '');
      if (h.style.marginTop) h.style.setProperty('margin-top', '0', 'important');
    } catch (e) { }
  }

  function check() {
    queued = false;
    try {
      var f = findBanner();
      if (!f) return;
      handled.push(f.box);
      tap(f.close);
      // If the site's own X did not remove it right away, hide it.
      setTimeout(function () { if (shown(f.box)) force(f.box); }, 250);
    } catch (e) { }
  }

  function queue() {
    if (queued || Date.now() > stopAt) return;
    queued = true;
    (window.requestAnimationFrame || setTimeout)(check, 0);
  }

  function start() {
    queue();
    try {
      new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    } catch (e) { }
    var iv = setInterval(function () {
      if (Date.now() > stopAt) { clearInterval(iv); return; }
      queue();
    }, 500);
  }

  if (document.documentElement) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
