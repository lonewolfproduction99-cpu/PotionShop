/* Potion Shop: Playgama Bridge integration (only in the Playgama build, made by
 * tools/platforms/build_playgama.py). Defines window.PotionPlatform, which the
 * game uses for everything Playgama requires:
 *   - Bridge initialization before the game starts,
 *   - saves through bridge.storage (never localStorage), loaded in one call
 *     before the game starts and written in one call per change,
 *   - pause / audio state events from the platform (ads, tab switches),
 *   - the game_ready message,
 *   - interstitials at natural pauses (rewarded ads are in ads.js, provider "playgama").
 * The game is English only; English is the default and fallback language.
 */
(function () {
  'use strict';
  var bridge = window.bridge;
  var PREFIX = 'potionshop_';
  var KEYS = ['save', 'settings'];
  var cache = {};
  var pending = {};
  var timer = null;
  var pauseListeners = [];
  var audioListeners = [];

  function flush() {
    timer = null;
    var names = Object.keys(pending);
    if (!names.length) return;
    var keys = names.map(function (k) { return PREFIX + k; });
    var values = names.map(function (k) { return pending[k]; });
    pending = {};
    bridge.storage.set(keys, values).catch(function (e) { console.warn('[Playgama] save failed', e); });
  }

  var P = (window.PotionPlatform = {
    name: 'playgama',
    language: 'en',
    audioEnabled: true,
    storage: {
      get: function (key) { return Object.prototype.hasOwnProperty.call(cache, key) ? cache[key] : null; },
      set: function (key, text) {
        cache[key] = text;
        pending[key] = text;
        if (!timer) timer = setTimeout(flush, 300); // one call for everything changed together
      },
      remove: function (key) {
        delete cache[key];
        delete pending[key];
        bridge.storage.delete([PREFIX + key]).catch(function () {});
      },
      flush: flush,
    },
    onPause: function (fn) { pauseListeners.push(fn); },
    onAudio: function (fn) {
      audioListeners.push(fn);
      fn(P.audioEnabled); // apply the current state right away, not only on changes
    },
    gameReady: function () { bridge.platform.sendMessage('game_ready'); },
    // Used by the automated tests to simulate the platform's pause/audio events.
    _emit: function (type, value) {
      (type === 'pause' ? pauseListeners : audioListeners).forEach(function (fn) { fn(value); });
    },
    showInterstitial: function (placement) {
      if (bridge.advertisement.isInterstitialSupported) bridge.advertisement.showInterstitial(placement);
    },
  });

  P.ready = bridge.initialize()
    .then(function () {
      P.language = bridge.platform.language || 'en';
      P.audioEnabled = bridge.platform.isAudioEnabled !== false;
      bridge.platform.on(bridge.EVENT_NAME.PAUSE_STATE_CHANGED, function (paused) {
        pauseListeners.forEach(function (fn) { fn(!!paused); });
      });
      bridge.platform.on(bridge.EVENT_NAME.AUDIO_STATE_CHANGED, function (enabled) {
        P.audioEnabled = !!enabled;
        audioListeners.forEach(function (fn) { fn(!!enabled); });
      });
      return bridge.storage.get(KEYS.map(function (k) { return PREFIX + k; }));
    })
    .then(function (data) {
      KEYS.forEach(function (k, i) {
        var v = data && data[i];
        if (v === null || v === undefined || v === '') return;
        cache[k] = typeof v === 'string' ? v : JSON.stringify(v);
      });
    })
    .catch(function (e) {
      // The game still starts (with a fresh save) rather than staying on a black screen.
      console.warn('[Playgama] initialization failed', e);
    });

  // Write pending saves before the page goes away.
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () { if (document.hidden) flush(); });
})();
