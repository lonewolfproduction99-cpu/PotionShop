// Full tutorial walk-through, playing only by tapping where the hand points
// (or the banner's OK / Got it button when there is no hand): first sale,
// extra herb, upgrades, herb shop, then the herb garden.
module.exports = async ({ shot, sleep, evalG, tapGame, page }) => {
  const results = [];
  const check = (name, ok, extra) => results.push((ok ? 'PASS ' : 'FAIL ') + name + (extra ? ' ' + extra : ''));
  await evalG(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.gdjs && gdjs.PotionShop && gdjs.PotionShop.game && gdjs.PotionShop.game.started);
  await sleep(1500);
  // Current tutorial view in whichever scene is on top (shop or garden).
  const view = () => evalG(() => {
    const PS = gdjs.PotionShop;
    const cur = PS.game.scene.getGame().getSceneStack().getCurrentScene();
    const G = cur.__garden || PS.game;
    const T = G.tutorial;
    const h = T && T.hand;
    return {
      scene: cur.__garden ? 'garden' : 'shop',
      active: !!(T && T.active),
      done: PS.game.state.tutorialDone,
      phase: PS.game.state.tutorialPhase,
      text: T ? (T.last || '').split('|')[0] : '',
      hand: h && !h.isHidden() ? [h.getX() + 36, h.getY() + 70] : null,
      next: T && T.next ? [T.next.x + T.next.w / 2, T.next.y + T.next.h / 2] : null,
      level: PS.game.state.level,
    };
  });
  await evalG(() => { gdjs.PotionShop.game.spawnTimer = 0; gdjs.PotionShop.simSteps = 4; });
  const texts = [];
  const phases = [];
  let shots = 0;
  let v;
  for (let i = 0; i < 700; i++) {
    v = await view();
    if (v.done) break;
    if (!phases.includes(v.phase)) {
      phases.push(v.phase);
      console.log('phase', v.phase, 'level', v.level);
    }
    // Waiting for shop level 2 (garden): grant the missing XP to save test time.
    if (v.phase === 'gardenWait') {
      await evalG(() => { const G = gdjs.PotionShop.game; G.addXp(Math.max(1, gdjs.PotionShop.xpForLevel(G.state.level) - G.state.xp)); });
      await sleep(800);
      continue;
    }
    if (v.text && !texts.includes(v.text)) {
      texts.push(v.text);
      if (shots < 40) {
        await evalG(() => { gdjs.PotionShop.simSteps = 1; });
        await sleep(700);
        await shot('t_' + String(shots++).padStart(2, '0'));
        await evalG(() => { gdjs.PotionShop.simSteps = 4; });
        v = await view();
      }
    }
    if (v.hand) {
      await tapGame(v.hand[0], v.hand[1]);
      await sleep(900);
    } else if (v.next) {
      await tapGame(v.next[0], v.next[1]);
      await sleep(900);
    } else {
      await sleep(400);
    }
  }
  console.log('tutorial texts:\n  ' + texts.join('\n  '));
  const end = await evalG(() => { const s = gdjs.PotionShop.game.state; return { done: s.tutorialDone, served: s.served,
    upgrades: Object.values(s.upgrades).reduce((a, b) => a + b, 0), fine: (s.discovered || []).length, garden: s.garden.filter((p) => p.planted && p.herb !== 'moonwater').length }; });
  check('tutorial reaches the end by following the hand', end.done, JSON.stringify(end));
  check('it went through every phase', ['first', 'extra', 'upgrades', 'herbs', 'garden'].every((p) => phases.includes(p)), phases.join(','));
  check('extra herb step explains the bonus herb', texts.some((t) => /bonus herb/.test(t)));
  check('a bonus-herb potion was brewed and discovered', end.fine >= 1);
  check('upgrade step and an upgrade bought (or explained)', texts.some((t) => /Upgrades tab/.test(t)) && (end.upgrades >= 1 || texts.some((t) => /when you have enough gold/.test(t))));
  check('herb shop step', texts.some((t) => /Herb shop/.test(t)));
  check('garden steps: plant a herb, then speed-ups and harvesting', end.garden >= 1 && texts.some((t) => /speed it up/.test(t)));
  const after = await view();
  check('no banner left after the tutorial', !after.active, JSON.stringify(after));
  console.log(results.join('\n'));
};
