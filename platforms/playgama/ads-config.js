// Ads configuration for the Playgama build: rewarded ads through Playgama Bridge.
// Rewards are only granted when Bridge reports the "rewarded" state, and never
// on Bridge's local "mock" platform.
window.POTION_ADS_CONFIG = {
  mode: 'production',
  provider: 'playgama',
};
