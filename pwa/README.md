# Potion Shop as an installable web app (PWA) with rewarded ads

The GDevelop project stays as it is. After every HTML5 export, `tools/pwa/apply_pwa.py` adds a thin PWA layer next to the exported files. It never edits GDevelop's `code*.js`, `data.js` or assets.

| File in the build | Comes from | What it does |
| --- | --- | --- |
| `manifest.webmanifest` | written by `apply_pwa.py` | Standalone display, portrait, theme colour and icons (including maskable) |
| `icons/` | `pwa/icons/` (made by `tools/pwa/build_icons.py`) | Home-screen icons, plus the 180×180 `apple-touch-icon` for iPhone |
| `index.html` | patched between `PWA:BEGIN` / `PWA:END` | iPhone meta tags, `viewport-fit=cover`, touch CSS, rotate-to-portrait notice, and the scripts below |
| `sw.js` | `pwa/sw.template.js` | Service worker: precaches every file, works offline and installs updates cleanly |
| `pwa.js` | `pwa/pwa.js` | Registers the service worker and shows the "Restart" update banner. Also requests persistent storage, saves the game on `pagehide` and reports the safe-area insets |
| `ads.js` | `pwa/ads.js` | Rewarded-ad adapter: `showRewardedAd()`, `onRewardEarned()`, `onAdFailed()` |
| `ads-config.js` | `pwa/config/ads-config.<mode>.js` | Picks the ad provider |
| `_headers` | `pwa/_headers` | Cloudflare Pages: `sw.js`, `index.html` and config are never cached by the CDN |

## Rebuilding after a GDevelop export

`tools/export.sh` already runs the PWA step. If you export from the GDevelop editor yourself (File → Export → HTML5 → local folder), run:

```
python3 tools/pwa/apply_pwa.py <export folder> --ads development   # test build, simulated ads
python3 tools/pwa/apply_pwa.py <export folder> dist --ads production  # what gets deployed
```

The script is safe to run again on the same folder. Every run computes a new version from the content of all files, so phones download the new version and show the update banner.

## Ads: what is implemented, and what is not

`window.PotionAds` gives the game three things: `showRewardedAd(placement)`, `onRewardEarned(fn)` and `onAdFailed(fn)`. The game's `PS.Ads` (src/08_main.js) only grants a reward when `showRewardedAd` resolves `{ rewarded: true }`. That only happens on the provider's own reward signal:

| Provider (`provider:` in ads-config) | Reward signal used | Status |
| --- | --- | --- |
| `none` | never | **Production default.** Ad buttons show "(unavailable)", and gold or gems still work. |
| `simulated` | the tester presses "Claim test reward" after 5 s | **Development only.** Labelled "DEVELOPMENT TEST AD". It is refused automatically when `mode: 'production'`. |
| `adsense-h5` | `adViewed()` from Google's Ad Placement API (`adBreak({type: 'reward'})`) | Written from Google's documentation. **Not tested: needs an approved account.** |
| `gpt` | `rewardedSlotGranted` from Google Publisher Tag rewarded slots | Written from Google's documentation. **Not tested: needs an Ad Manager account.** |
| `playgama` | `rewardedState === 'rewarded'` from Playgama Bridge | Written from Playgama's documentation. **Not tested.** Refused on Bridge's `mock` platform. |

While an ad is on screen, the shop simulation is paused and the sound is muted. A reward is never granted on close, on a timeout, on an error, or while the device is offline.

**No ad has been monetized yet.** Nothing in this repository has shown a real ad. Only the simulated flow and the "no provider" behaviour are tested.

### Provider research (October 2026, from the providers' public docs)

- **Google AdSense, "H5 Games Ads" (Ad Placement API)**
  - Made for HTML5 web games, and supports rewarded placements (`adBreak` with `type: 'reward'`, `beforeReward(showAdFn)`, `adViewed`, `adDismissed`, `adBreakDone`).
  - Requires an **approved AdSense account** and a **separate application** for games ads. Google says approval is not guaranteed.
  - Rewards must have no value outside the game.
  - Testing uses `data-adbreak-test="on"`: set `adsense.testMode: true`.
  - Google's docs don't mention installed (home-screen) PWAs. That has to be tested on a real iPhone.
- **Google Ad Manager rewarded ads for web (GPT)**
  - Needs a Google Ad Manager account. The flow is `defineOutOfPageSlot(path, OutOfPageFormat.REWARDED)` → `rewardedSlotReady` → `makeRewardedVisible()` → `rewardedSlotGranted` → `rewardedSlotClosed`.
  - Only for mobile-optimized pages with neutral zoom.
  - The ad must be visible for at least 7 seconds for a reward. Ads are closed by the user.
  - Only one rewarded request can run at a time, and there's no server-side verification on web.
  - Standalone iOS PWAs are not documented: test on device.
- **Playgama Bridge**
  - A cross-platform SDK for publishing HTML5 games on Playgama and partner game portals.
  - Outside a supported platform it runs a **mock** platform. A self-hosted iPhone PWA is not one of its platforms, so Bridge is not a source of real ads here.
  - It's useful only if you also publish the HTML5 build on Playgama.

**Recommendation:** apply for AdSense and then H5 Games Ads for the PWA. Keep Playgama in mind as a second channel: publish the same export on Playgama's portal with the `playgama` provider.

### Steps that need your accounts

1. **Hosting (Cloudflare Pages, free):**
   1. Create a Cloudflare account.
   2. Go to Workers & Pages → Create → Pages → *Direct Upload*. Create a project named `potion-shop`, or set the GitHub repository variable `CLOUDFLARE_PROJECT` to your name.
   3. Create an API token: My Profile → API Tokens → Create Token → Custom, with the permission **Account → Cloudflare Pages → Edit**.
   4. In GitHub → Settings → Secrets and variables → Actions, add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The account ID is shown in the Cloudflare dashboard.
   5. Pushes to `main` that change `docs/` or `pwa/` deploy automatically (`.github/workflows/deploy.yml`). You can also run the workflow by hand from the Actions tab.
2. **Custom domain (recommended for ads):** AdSense verifies a site and its `ads.txt` at the domain root, so plan on your own domain. Connect it in the Pages project → Custom domains.
3. **AdSense:** sign up, add and verify your site, wait for approval, then apply for H5 Games Ads. Once approved:
   1. Put your `ca-pub-…` id in `pwa/config/ads-config.production.js` with `provider: 'adsense-h5'`.
   2. Add the `ads.txt` line AdSense gives you: put an `ads.txt` file in `docs/` and re-export.
   3. Test first with `testMode: true`.
4. **Ad Manager (optional, alternative):** create a rewarded web ad unit and set `provider: 'gpt'` and `gpt.adUnitPath`.

## iPhone and Android notes

- **Install on iPhone:** open the site in **Safari** → Share → **Add to Home Screen**. The game then opens full screen with its own icon.
- **Install on Android (Chrome):** use ⋮ → **Install app** or **Add to Home screen**.
- **Status bar and home indicator:** the status bar is opaque (`black`), so the game starts below the notch. The bottom tab bar is raised above the home indicator (`env(safe-area-inset-bottom)`).
- **Portrait:** Android honours `orientation: portrait`. iOS ignores the manifest orientation, so phones held sideways get a "turn your phone upright" notice.
- **Saves:** progress lives in `localStorage` for the site's address. Updates never touch it. The app asks for persistent storage.
  - On iPhone, the home-screen app has **its own storage, separate from Safari's**. Progress made in a Safari tab does not carry over to the installed app.
  - WebKit announced that home-screen web apps are exempt from Safari's 7-day storage cap. Deleting the app deletes its save.
- **Offline:** after the first launch, the whole game (about 8 MB) is cached and starts with no network. Ads need a connection: offline, the ad buttons are disabled and everything else works.

## Testing

Automated tests run in headless Chromium, not on an iPhone:

- `node tools/test/play.js <copy of docs> out pwa` checks:
  - manifest and icons;
  - full precache;
  - offline launch, with the save kept;
  - offline ads refused;
  - simulated ad: labelled, pauses and mutes the game, no reward when closed early, one reward when finished;
  - production mode refusing the simulated provider;
  - a new deployment showing the update banner, switching caches cleanly and keeping the save.
- `node tools/test/play.js dist out prodads` checks the production build: no ads configured, buttons disabled, and the game plays on.

**Still to be done by hand on real devices:**
- Safari gameplay.
- Add to Home Screen.
- An offline launch from the home-screen icon in airplane mode.
- An update after a redeploy.
- A real test ad once an ad account is approved.
