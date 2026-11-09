(function () {
  // On a payment-method page: once a UPI option is chosen, tap the page's Pay / Proceed button
  // so the payment page can hand over to the UPI app. The PIN is always entered by the person in the UPI app.
  if (window.__miroPay) return;
  window.__miroPay = true;

  var BTN = 'button,input[type=submit],input[type=button],a,[role=button]';
  var GO = /^(pay|proceed|make (a )?payment|continue|place (your )?order)\b/i;
  var SKIP = /cancel|\bback\b|previous|\bedit\b|later|guest|see all/i;
  var token = 0;

  function shown(e) {
    var r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return r.width > 4 && r.height > 4 && s.visibility !== 'hidden' && s.display !== 'none';
  }
  function label(e) {
    return ((e.innerText || e.value || e.getAttribute('aria-label') || '') + '').replace(/\s+/g, ' ').trim();
  }
  function hasUpi() {
    return /\bupi\b/i.test((document.body && document.body.innerText) || '');
  }
  function findGo() {
    var bs = document.querySelectorAll(BTN);
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i], l = label(b);
      if (!l || l.length > 40 || !GO.test(l) || SKIP.test(l)) continue;
      if (!shown(b) || b.disabled || b.getAttribute('aria-disabled') === 'true') continue;
      return b;
    }
    return null;
  }
  function afterSelect() {
    if (!hasUpi()) return;
    var my = ++token, end = Date.now() + 4000;
    (function tryTap() {
      if (my !== token) return;
      var b = findGo();
      if (b) { b.scrollIntoView({ block: 'center' }); b.click(); return; }
      if (Date.now() < end) setTimeout(tryTap, 150);
    })();
  }

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t && t.type === 'radio' && t.checked) afterSelect();
  }, true);
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('[role=radio],[role=option]')) setTimeout(afterSelect, 60);
  }, true);
})();
