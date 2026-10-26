// Ads configuration for DEVELOPMENT / TEST builds (docs/ and the test play link).
// "simulated" shows a clearly labelled fake ad so the rewarded flow can be tested.
// It earns nothing and is refused automatically when mode is "production".
window.POTION_ADS_CONFIG = {
  mode: 'development',
  provider: 'simulated',
  simulatedSeconds: 5,
};
