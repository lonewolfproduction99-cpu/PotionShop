/* Potion Shop: Progressive Web App helpers (added after the GDevelop HTML5 export
 * by tools/pwa/apply_pwa.py; the GDevelop project itself is not changed).
 *  - registers the service worker (offline play) and offers a "Restart to update"
 *    button when a new version has been downloaded,
 *  - asks the browser to keep the save data (persistent storage),
 *  - exposes the iPhone safe-area insets to the game,
 *  - shows a "rotate to portrait" hint on phones held sideways.
 */
(function () {
  'use strict';
  var PWA = (window.PotionShopPWA = window.PotionShopPWA || {});

  // ----- safe areas (iPhone notch / home indicator), in CSS pixels
  var probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
    'padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  PWA.safeInsets = function () {
    if (!probe.parentNode && document.body) document.body.appendChild(probe);
    var cs = getComputedStyle(probe);
    return { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 };
  };
  PWA.standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

  // ----- keep save data: ask for persistent storage where supported
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then(function (p) { if (!p) return navigator.storage.persist(); })
      .catch(function () {});
  }

  // ----- small HTML banner (outside the game canvas)
  function banner(text, button, onClick) {
    var old = document.getElementById('potion-pwa-banner');
    if (old) old.remove();
    var b = document.createElement('div');
    b.id = 'potion-pwa-banner';
    b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top));' +
      'z-index:9999;background:#2b1d16;color:#fff;border:2px solid #e8a33a;border-radius:12px;padding:10px 12px;' +
      'font:600 15px system-ui,sans-serif;display:flex;gap:10px;align-items:center;width:max-content;max-width:92vw;' +
      'box-sizing:border-box;box-shadow:0 4px 16px #0008';
    var t = document.createElement('span');
    t.textContent = text;
    b.appendChild(t);
    if (button) {
      var btn = document.createElement('button');
      btn.textContent = button;
      btn.style.cssText = 'font:700 15px system-ui;border:0;border-radius:8px;padding:8px 12px;background:#5cb85c;color:#fff';
      btn.onclick = onClick;
      b.appendChild(btn);
    }
    var x = document.createElement('button');
    x.textContent = '✕';
    x.setAttribute('aria-label', 'Close');
    x.style.cssText = 'font:700 15px system-ui;border:0;background:transparent;color:#ccc';
    x.onclick = function () { b.remove(); };
    b.appendChild(x);
    document.body.appendChild(b);
  }

  // Save the game before the page is replaced.
  function saveGame() {
    try {
      var PS = window.gdjs && window.gdjs.PotionShop;
      if (PS && PS.game) PS.game.saveNow();
    } catch (e) { console.warn(e); }
  }
  window.addEventListener('pagehide', saveGame);

  // ----- service worker: offline play and clean updates
  PWA.updateReady = false;
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        PWA.registration = reg;
        function offer(worker) {
          PWA.updateReady = true;
          banner('A new version of Potion Shop is ready.', 'Restart', function () {
            saveGame();
            worker.postMessage({ type: 'SKIP_WAITING' });
          });
        }
        // A new version that finished downloading while an older one runs this page.
        if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
        reg.addEventListener('updatefound', function () {
          var w = reg.installing;
          if (!w) return;
          w.addEventListener('statechange', function () {
            if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w);
          });
        });
        // Look for updates when the app comes back to the foreground.
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') reg.update().catch(function () {});
        });
      }).catch(function (e) { console.warn('[PWA] service worker registration failed', e); });
      var reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (!PWA.updateReady || reloading) return; // first install: nothing to reload
        reloading = true;
        location.reload();
      });
    });
  }

  // ----- offline notice (the game keeps working)
  window.addEventListener('offline', function () { banner('You are offline: the game still works, ads are unavailable.'); });
  window.addEventListener('online', function () {
    var b = document.getElementById('potion-pwa-banner');
    if (b && /offline/.test(b.textContent)) b.remove();
  });
})();
