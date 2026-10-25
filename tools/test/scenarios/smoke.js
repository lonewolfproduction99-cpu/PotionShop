// Load the game, wait a bit, take screenshots and dump the state.
module.exports = async ({ shot, sleep, state, evalG }) => {
  await evalG(() => localStorage.clear());
  await sleep(2500);
  await shot('01_start');
  console.log(JSON.stringify(await state()));
  await sleep(6000);
  await shot('02_after8s');
  console.log(JSON.stringify(await state()));
};
