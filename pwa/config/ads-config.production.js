// Ads configuration for the PRODUCTION build (deployed by .github/workflows/deploy.yml).
// Until an ad network approves the game, keep provider "none": ad buttons are
// shown as unavailable and the game plays normally. See pwa/README.md.
//
// Google AdSense H5 Games Ads (after approval):
//   provider: 'adsense-h5', adsense: { client: 'ca-pub-XXXXXXXXXXXXXXXX', testMode: false },
// Google Ad Manager rewarded web ads (after approval):
//   provider: 'gpt', gpt: { adUnitPath: '/NETWORK_CODE/potionshop_rewarded' },
// Playgama Bridge (only when the game runs on a platform Bridge supports):
//   provider: 'playgama', playgama: { sdkUrl: '<Bridge script URL from https://wiki.playgama.com>' },
window.POTION_ADS_CONFIG = {
  mode: 'production',
  provider: 'none',
};
