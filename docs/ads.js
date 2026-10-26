/* Potion Shop: rewarded-ad adapter.
 *
 * The game only talks to window.PotionAds:
 *   PotionAds.isAvailable()            -> true when a rewarded ad can be requested now
 *   PotionAds.showRewardedAd(placement) -> Promise<{ rewarded: boolean, reason: string }>
 *   PotionAds.onRewardEarned(fn)       -> fn(placement) after a provider confirmed the reward
 *   PotionAds.onAdFailed(fn)           -> fn(placement, reason) when no reward was earned
 *
 * Providers (chosen in ads-config.js, see pwa/README.md):
 *   none        no ads: the game hides/disables ad buttons and keeps working.
 *   simulated   DEVELOPMENT ONLY. A clearly labelled fake ad for testing the flow.
 *               Refused when the config mode is "production".
 *   adsense-h5  Google AdSense "H5 Games Ads" (Ad Placement API: adBreak type "reward").
 *               Reward only on adViewed().
 *   gpt         Google Ad Manager rewarded web ads (Google Publisher Tag, OutOfPageFormat.REWARDED).
 *               Reward only on the rewardedSlotGranted event.
 *   playgama    Playgama Bridge SDK. Reward only when rewardedState becomes "rewarded".
 *
 * A reward is never granted on "closed", on a timeout or on an error: only on the
 * provider's own reward signal.
 */
(function () {
  'use strict';
  var cfg = window.POTION_ADS_CONFIG || { mode: 'production', provider: 'none' };
  var production = cfg.mode !== 'development';
  var providerName = cfg.provider || 'none';
  if (providerName === 'simulated' && production) {
    console.warn('[PotionAds] The simulated ad provider is disabled in production builds.');
    providerName = 'none';
  }

  var rewardListeners = [];
  var failListeners = [];
  var busy = false;

  function emitReward(placement) {
    rewardListeners.forEach(function (fn) { try { fn(placement); } catch (e) { console.error(e); } });
  }
  function emitFail(placement, reason) {
    failListeners.forEach(function (fn) { try { fn(placement, reason); } catch (e) { console.error(e); } });
  }
  function loadScript(src, attrs) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.async = true;
      s.src = src;
      Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }
  function online() {
    return typeof navigator === 'undefined' || navigator.onLine !== false;
  }

  // ------------------------------------------------------------------ providers
  var providers = {};

  providers.none = {
    init: function () { return Promise.resolve(); },
    available: function () { return false; },
    show: function () { return Promise.resolve({ rewarded: false, reason: 'no-provider' }); },
  };

  // DEVELOPMENT ONLY: an HTML overlay that is plainly not a real ad.
  providers.simulated = {
    init: function () { return Promise.resolve(); },
    available: function () { return true; },
    show: function (placement) {
      return new Promise(function (resolve) {
        var seconds = Number(cfg.simulatedSeconds) || 5;
        var box = document.createElement('div');
        box.id = 'potion-sim-ad';
        box.setAttribute('role', 'dialog');
        box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(10,10,20,.94);color:#fff;' +
          'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;' +
          'font:600 18px system-ui,sans-serif;text-align:center;padding:24px;box-sizing:border-box';
        box.innerHTML =
          '<div style="background:#c0392b;padding:6px 14px;border-radius:8px;letter-spacing:1px">DEVELOPMENT TEST AD</div>' +
          '<div style="max-width:320px;opacity:.85">This is not a real advertisement and earns no money. ' +
          'It only tests the rewarded-ad flow (placement: <b></b>).</div>' +
          '<div id="potion-sim-count" style="font-size:44px">' + seconds + '</div>' +
          '<button id="potion-sim-claim" disabled style="font:700 18px system-ui;padding:12px 22px;border-radius:10px;border:0;background:#777;color:#fff">Claim test reward</button>' +
          '<button id="potion-sim-close" style="font:600 15px system-ui;padding:8px 16px;border-radius:8px;border:1px solid #999;background:transparent;color:#ddd">Close (no reward)</button>';
        box.querySelector('b').textContent = String(placement || '');
        document.body.appendChild(box);
        window.PotionAds._pauseGame(true);
        var left = seconds;
        var claim = box.querySelector('#potion-sim-claim');
        var timer = setInterval(function () {
          left -= 1;
          box.querySelector('#potion-sim-count').textContent = left > 0 ? String(left) : '✓';
          if (left <= 0) {
            clearInterval(timer);
            claim.disabled = false;
            claim.style.background = '#27ae60';
          }
        }, 1000);
        function done(result) {
          clearInterval(timer);
          box.remove();
          window.PotionAds._pauseGame(false);
          resolve(result);
        }
        claim.onclick = function () { if (!claim.disabled) done({ rewarded: true, reason: 'simulated' }); };
        box.querySelector('#potion-sim-close').onclick = function () { done({ rewarded: false, reason: 'dismissed' }); };
      });
    },
  };

  // Google AdSense H5 Games Ads (Ad Placement API). Needs an approved AdSense
  // account with H5 games ads access. testMode adds data-adbreak-test="on".
  providers['adsense-h5'] = {
    init: function () {
      var a = cfg.adsense || {};
      if (!a.client) return Promise.reject(new Error('adsense.client missing'));
      window.adsbygoogle = window.adsbygoogle || [];
      window.adBreak = window.adConfig = function (o) { window.adsbygoogle.push(o); };
      var attrs = { 'data-ad-client': a.client, crossorigin: 'anonymous' };
      if (a.testMode) attrs['data-adbreak-test'] = 'on';
      return loadScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
        encodeURIComponent(a.client), attrs).then(function () {
        window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
      });
    },
    available: function () { return typeof window.adBreak === 'function'; },
    show: function (placement) {
      return new Promise(function (resolve) {
        var viewed = false;
        var dismissed = false;
        var offered = false;
        window.adBreak({
          type: 'reward',
          name: String(placement || 'reward'),
          beforeAd: function () { window.PotionAds._pauseGame(true); },
          afterAd: function () { window.PotionAds._pauseGame(false); },
          // The player already accepted in the game's own prompt: show the ad.
          beforeReward: function (showAdFn) { offered = true; showAdFn(); },
          adDismissed: function () { dismissed = true; },
          adViewed: function () { viewed = true; },
          adBreakDone: function (info) {
            window.PotionAds._pauseGame(false);
            if (viewed) resolve({ rewarded: true, reason: 'adViewed' });
            else resolve({ rewarded: false, reason: dismissed ? 'dismissed' : offered ? 'not-completed' :
              'no-fill' + (info && info.breakStatus ? ':' + info.breakStatus : '') });
          },
        });
      });
    },
  };

  // Google Ad Manager rewarded ads for web (Google Publisher Tag).
  providers.gpt = {
    init: function () {
      var g = cfg.gpt || {};
      if (!g.adUnitPath) return Promise.reject(new Error('gpt.adUnitPath missing'));
      window.googletag = window.googletag || { cmd: [] };
      return loadScript('https://securepubads.g.doubleclick.net/tag/js/gpt.js', { crossorigin: 'anonymous' });
    },
    available: function () { return !!(window.googletag && window.googletag.apiReady); },
    show: function (placement) {
      var g = cfg.gpt || {};
      return new Promise(function (resolve) {
        var gt = window.googletag;
        gt.cmd.push(function () {
          var slot = gt.defineOutOfPageSlot(g.adUnitPath, gt.enums.OutOfPageFormat.REWARDED);
          if (!slot) {
            resolve({ rewarded: false, reason: 'unsupported-page' });
            return;
          }
          slot.addService(gt.pubads());
          if (placement) slot.setTargeting('placement', String(placement));
          var granted = false;
          var finished = false;
          var pubads = gt.pubads();
          function finish(result) {
            if (finished) return;
            finished = true;
            clearTimeout(noFill);
            pubads.removeEventListener('rewardedSlotReady', onReady);
            pubads.removeEventListener('rewardedSlotGranted', onGranted);
            pubads.removeEventListener('rewardedSlotClosed', onClosed);
            pubads.removeEventListener('slotRenderEnded', onRender);
            gt.destroySlots([slot]);
            window.PotionAds._pauseGame(false);
            resolve(result);
          }
          function onReady(e) {
            if (e.slot !== slot) return;
            clearTimeout(noFill);
            window.PotionAds._pauseGame(true);
            if (!e.makeRewardedVisible()) finish({ rewarded: false, reason: 'not-displayed' });
          }
          function onGranted(e) { if (e.slot === slot) granted = true; }
          function onClosed(e) {
            if (e.slot !== slot) return;
            finish(granted ? { rewarded: true, reason: 'rewardedSlotGranted' } : { rewarded: false, reason: 'closed-early' });
          }
          function onRender(e) { if (e.slot === slot && e.isEmpty) finish({ rewarded: false, reason: 'no-fill' }); }
          pubads.addEventListener('rewardedSlotReady', onReady);
          pubads.addEventListener('rewardedSlotGranted', onGranted);
          pubads.addEventListener('rewardedSlotClosed', onClosed);
          pubads.addEventListener('slotRenderEnded', onRender);
          var noFill = setTimeout(function () { finish({ rewarded: false, reason: 'timeout' }); }, 15000);
          gt.enableServices();
          gt.display(slot);
        });
      });
    },
  };

  // Playgama Bridge. Real ads only run on platforms Bridge supports; on an
  // unknown host Bridge uses its "mock" platform, which this adapter refuses
  // so that no fake reward can ever be granted in production.
  providers.playgama = {
    init: function () {
      // The Playgama build loads Bridge in index.html and initializes it once
      // (platforms/playgama/playgama.js); reuse that.
      if (window.PotionPlatform && window.PotionPlatform.name === 'playgama') return window.PotionPlatform.ready;
      var p = cfg.playgama || {};
      if (!p.sdkUrl) return Promise.reject(new Error('playgama.sdkUrl missing'));
      return loadScript(p.sdkUrl).then(function () { return window.bridge.initialize(); });
    },
    available: function () {
      var b = window.bridge;
      return !!(b && b.platform && b.platform.id !== 'mock' && b.advertisement && b.advertisement.isRewardedSupported);
    },
    show: function (placement) {
      var b = window.bridge;
      return new Promise(function (resolve) {
        var rewarded = false;
        function onState(state) {
          if (state === 'opened') window.PotionAds._pauseGame(true);
          if (state === 'rewarded') rewarded = true;
          if (state === 'closed' || state === 'failed') {
            b.advertisement.off(b.EVENT_NAME.REWARDED_STATE_CHANGED, onState);
            window.PotionAds._pauseGame(false);
            resolve(rewarded ? { rewarded: true, reason: 'rewarded' } : { rewarded: false, reason: state });
          }
        }
        b.advertisement.on(b.EVENT_NAME.REWARDED_STATE_CHANGED, onState);
        b.advertisement.showRewarded(placement);
      });
    },
  };

  // ------------------------------------------------------------------ public API
  var provider = providers[providerName] || providers.none;
  var initialized = false;
  var initError = null;
  var ready = provider.init().then(function () { initialized = true; }, function (e) {
    initError = e;
    console.warn('[PotionAds] provider "' + providerName + '" unavailable:', e && e.message);
  });

  window.PotionAds = {
    provider: providerName,
    simulated: providerName === 'simulated',
    production: production,
    ready: ready,
    isAvailable: function () {
      return initialized && !initError && !busy && online() && provider.available();
    },
    // Why ads are unavailable (for the interface).
    status: function () {
      if (providerName === 'none') return 'no-provider';
      if (!online()) return 'offline';
      if (initError) return 'error';
      if (!initialized) return 'loading';
      if (busy) return 'busy';
      return provider.available() ? 'ready' : 'no-fill';
    },
    showRewardedAd: function (placement) {
      if (!window.PotionAds.isAvailable()) {
        var reason = window.PotionAds.status();
        emitFail(placement, reason);
        return Promise.resolve({ rewarded: false, reason: reason });
      }
      busy = true;
      return provider.show(placement).catch(function (e) {
        return { rewarded: false, reason: 'error:' + (e && e.message) };
      }).then(function (result) {
        busy = false;
        if (result.rewarded) emitReward(placement);
        else emitFail(placement, result.reason);
        return result;
      });
    },
    onRewardEarned: function (fn) {
      rewardListeners.push(fn);
      return function () { rewardListeners = rewardListeners.filter(function (f) { return f !== fn; }); };
    },
    onAdFailed: function (fn) {
      failListeners.push(fn);
      return function () { failListeners = failListeners.filter(function (f) { return f !== fn; }); };
    },
    // Set by the game: pause the simulation and mute while an ad is on screen.
    _pauseGame: function () {},
  };
})();
