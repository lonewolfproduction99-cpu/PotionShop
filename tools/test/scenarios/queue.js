// Queue: with all tables full, new customers wait outside and move in FIFO when a table frees.
module.exports = async ({ sleep, evalG, shot }) => {
  await evalG(() => localStorage.clear());
  const r = await evalG(() => {
    const PS = gdjs.PotionShop; const G = PS.game;
    const seated = [];
    for (let i = 0; i < 3; i++) { const c = PS.World.spawnCustomer(G); c.obj.setPosition(G.doorOutside[0], G.doorOutside[1]); c.path = []; PS.World.onArrivedAtDoor(G, c); seated.push(c); }
    const q = [];
    for (let i = 0; i < 2; i++) { const c = PS.World.spawnCustomer(G); c.obj.setPosition(G.doorOutside[0], G.doorOutside[1]); c.path = []; PS.World.onArrivedAtDoor(G, c); q.push(c.id); }
    const seatOwners = G.seats.filter((s) => s.occupant).map((s) => s.occupant.id);
    const dup = new Set(seatOwners).size !== seatOwners.length;
    window.__q = q; window.__first = seated[0];
    return { seatOwners, queue: G.queue.map((c) => c.id), dup };
  });
  console.log('initial', JSON.stringify(r));
  await sleep(6000);
  await shot('30_queue');
  const r2 = await evalG(() => { const PS = gdjs.PotionShop; const G = PS.game; PS.World.storm(G, window.__first);
    return { queue: G.queue.map((c) => c.id), firstQueuedState: G.customers.find((c) => c.id === window.__q[0]).state }; });
  console.log('after a table frees', JSON.stringify(r2), r2.firstQueuedState === 'toSeat' && r2.queue[0] === r.queue[1] ? 'PASS' : 'FAIL');
};
