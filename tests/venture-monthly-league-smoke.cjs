const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/11-ligas-mensais.js'), 'utf8');
const store = new Map();
const document = {
  hidden: false,
  getElementById: () => null,
  addEventListener() {}
};
const window = {
  location: { protocol: 'file:' },
  mergeSingleUser: (existing, incoming) => ({ ...existing, ...incoming }),
  addEventListener() {},
  setInterval() {}
};
const context = {
  console, Date, Intl, Math, JSON, Object, Number, String, Array, Set, Map,
  document, window, localStorage: {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value))
  },
  users: {}, currentUserKey: null, STORAGE_USERS_KEY: 'users'
};
vm.createContext(context);
vm.runInContext(source, context, { filename: 'js/11-ligas-mensais.js' });
const api = window.__VentureMonthlyLeagueTest;
function assert(condition, message) { if (!condition) throw new Error(message); }
function test(name, fn) { fn(); console.log(`PASS: ${name}`); }
function user(name, division, score, month = '2026-11') {
  const timestamp = Date.parse(`${month}-10T12:00:00-03:00`);
  return {
    name, xp: 1000 + score,
    ventureMonthlyLeague: { version: 1, division, seasonKey: month, history: {}, enrolledAt: timestamp, updatedAt: timestamp },
    xpLedger: { version: 1, baseXp: 1000, baseId: `base:${name}`, transactions: {
      [`reward:${name}`]: { delta: score, source: 'test-reward', createdAt: timestamp, absorbed: false }
    }, updatedAt: timestamp, conflicts: [] }
  };
}

test('the league has ten divisions in ascending order', () => {
  assert(api.divisions.length === 10, 'expected ten divisions');
  assert(api.divisions[0].name === 'Bronze' && api.divisions[9].name === 'Diamante', 'expected Bronze to Diamante');
});
test('each division maps to its own local badge image', () => {
  const images = api.divisions.map(division => division.image);
  assert(images.length === 10 && new Set(images).size === 10, 'expected ten distinct image paths');
  for (const image of images) {
    assert(typeof image === 'string' && image.startsWith('assets/ligas/') && image.endsWith('.webp'), `invalid badge path: ${image}`);
    assert(fs.existsSync(path.join(root, image)), `missing league badge asset: ${image}`);
  }
});
test('the inaugural season is scheduled for November 2026', () => {
  assert(api.activeSeasonKey(new Date('2026-10-24T15:00:00Z')) === '2026-11', 'October should remain pre-season');
  assert(api.activeSeasonKey(new Date('2026-12-05T12:00:00-03:00')) === '2026-12', 'later seasons follow the calendar month');
});
test('monthly XP sums ledger rewards only inside the selected Sao Paulo month', () => {
  const u = { xp: 50000, xpLedger: { transactions: {
    november: { delta: 120, createdAt: Date.parse('2026-11-03T12:00:00-03:00') },
    november2: { delta: 40, createdAt: Date.parse('2026-11-29T23:00:00-03:00') },
    october: { delta: 900, createdAt: Date.parse('2026-10-31T23:00:00-03:00') },
    december: { delta: 700, createdAt: Date.parse('2026-12-01T00:05:00-03:00') }
  } } };
  assert(api.monthlyXpForMonth(u, '2026-11') === 160, 'only November XP events should count');
});
test('promotion and demotion thresholds are deterministic', () => {
  const two = api.promotionCounts(2), five = api.promotionCounts(5), ten = api.promotionCounts(10);
  assert(two.promote === 1 && two.demote === 0, 'two active players: one promotion, no demotion');
  assert(five.promote === 1 && five.demote === 1, 'five active players: one promotion and one demotion');
  assert(ten.promote === 2 && ten.demote === 1, 'ten active players: top 20 percent promote and bottom 10 percent demote');
});
test('monthly leaderboard is separate from cumulative XP and sorted by monthly XP', () => {
  const users = { a: user('Ana', 0, 100), b: user('Bia', 0, 350), c: user('Caio', 0, 200) };
  const board = api.leaderboardForDivision(users, '2026-11', 0);
  assert(board.map(item => item.key).join(',') === 'b,c,a', 'monthly ledger XP should determine the order');
});
test('merging monthly league states preserves history and the latest season', () => {
  const merged = api.mergeState(
    { division: 1, seasonKey: '2026-11', updatedAt: 100, enrolledAt: 50, history: { '2026-10': { outcome: 'stayed', closedAt: 80 } } },
    { division: 2, seasonKey: '2026-12', updatedAt: 200, enrolledAt: 60, history: { '2026-11': { outcome: 'promoted', closedAt: 190 } } }
  );
  assert(merged.seasonKey === '2026-12' && merged.division === 2, 'latest season and division should win');
  assert(merged.history['2026-10'] && merged.history['2026-11'], 'history from both devices should be preserved');
});
test('the user merge hook preserves monthly league state from both devices', () => {
  api.installHooks();
  const merged = window.mergeSingleUser(
    { name: 'TESTE', ventureMonthlyLeague: { division: 1, seasonKey: '2026-11', updatedAt: 100, history: { '2026-10': { outcome: 'stayed', closedAt: 80 } } } },
    { name: 'TESTE', ventureMonthlyLeague: { division: 2, seasonKey: '2026-12', updatedAt: 200, history: { '2026-11': { outcome: 'promoted', closedAt: 190 } } } }
  );
  assert(merged.ventureMonthlyLeague.seasonKey === '2026-12', 'merge hook should keep the latest season');
  assert(merged.ventureMonthlyLeague.history['2026-10'] && merged.ventureMonthlyLeague.history['2026-11'], 'merge hook should union league history');
});
test('month close promotes the top Bronze player and handles Silver demotion without touching XP', () => {
  const users = {};
  [500, 400, 300, 200, 100].forEach((score, i) => users[`b${i+1}`] = user(`Bronze ${i+1}`, 0, score));
  [500, 400, 300, 200, 100].forEach((score, i) => users[`s${i+1}`] = user(`Silver ${i+1}`, 1, score));
  context.users = users;
  const xpBefore = Object.fromEntries(Object.entries(users).map(([key, u]) => [key, u.xp]));
  assert(api.closeSeason('2026-11') === true, 'month close should process existing participants');
  assert(users.b1.ventureMonthlyLeague.division === 1, 'top Bronze participant should move to Silver');
  assert(users.b5.ventureMonthlyLeague.division === 0, 'Bronze bottom stays in Bronze');
  assert(users.s1.ventureMonthlyLeague.division === 2, 'top Silver participant should move to Gold');
  assert(users.s5.ventureMonthlyLeague.division === 0, 'bottom Silver participant should drop to Bronze');
  assert(Object.entries(users).every(([key, u]) => u.xp === xpBefore[key]), 'closing the month must never change cumulative XP');
  assert(users.b1.ventureMonthlyLeague.seasonKey === '2026-12', 'users should advance to the next season');
  assert(users.b1.ventureMonthlyLeague.history['2026-11'].score === 500, 'closed-season score should be recorded');
});
console.log('All monthly league smoke tests passed.');
