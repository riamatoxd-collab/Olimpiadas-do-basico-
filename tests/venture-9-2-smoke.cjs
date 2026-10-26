const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const pass = message => console.log('PASS: ' + message);
const fail = message => { console.error('FAIL: ' + message); process.exitCode = 1; };
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of ['script.js','js/06-contas-sincronizacao.js','js/11-ligas-mensais.js','js/12-notificacoes.js','js/13-allstar.js','sw.js']) {
  try { new vm.Script(read(file), { filename: file }); pass(file + ' parses'); }
  catch (error) { fail(file + ' syntax: ' + error.message); }
}
try { JSON.parse(read('version.json')); JSON.parse(read('manifest.webmanifest')); pass('version.json and manifest.webmanifest are valid JSON'); }
catch (error) { fail('invalid metadata JSON: ' + error.message); }
const html = read('index.html');
const requiredHtml = [
  'content="9.2.1"','rel="manifest" href="manifest.webmanifest"',
  'venture-notifications.css?v=9210','venture-allstar.css?v=9210',
  'id="ventureNotificationBell"','id="ventureNotificationsModal"',
  'id="ventureAllStar"','id="premiumMonthlyLeagueBadge"','id="publicProfileMonthlyLeagueBadge"',
  'id="ventureMonthlyLeague"','id="vmlLeaderboard"','id="ventureAllStarAreas"','id="ventureAllStarModes"','id="ventureAllStarProgress"','id="ventureAllStarQuiz"','defer src="https://cdn.tailwindcss.com"','defer src="https://unpkg.com/mqtt/dist/mqtt.min.js"',
  'js/12-notificacoes.js?v=9210','js/13-allstar.js?v=9210'
];
for (const item of requiredHtml) html.includes(item) ? pass('HTML includes ' + item) : fail('HTML missing ' + item);

const version = JSON.parse(read('version.json'));
if (version.version === '9.2.1' && read('script.js').includes('const APP_VERSION = "9.2.1";')) pass('runtime and manifest versions match 9.2.1');
else fail('runtime and manifest versions do not match 9.2.1');
if (/id="nav-prizes"[^>]*>[\s\S]*?<span>Ligas<\/span>/.test(html)) pass('main navigation names the competition tab Ligas');
else fail('main navigation does not show Ligas');
for (const id of ['rankingPrintArea','leaderboardContainer','podiumTop3Container','btnPrintRanking']) {
  if (!html.includes('id="' + id + '"')) pass('legacy ranked UI removed: ' + id);
  else fail('legacy ranked UI still visible in HTML: ' + id);
}
if (!html.includes('html2canvas.min.js') && !read('js/06-contas-sincronizacao.js').includes('html2canvas')) pass('legacy ranking image exporter and html2canvas removed');
else fail('legacy ranking image exporter remains');
const syncSource = read('js/06-contas-sincronizacao.js');
const syncBlock = syncSource.match(/function scheduleCloudSync\([\s\S]*?\n\}/);
if (syncBlock && !syncBlock[0].includes('refreshUIIfNeeded()')) pass('cloud sync does not synchronously rebuild the whole UI on each click');
else fail('cloud sync still performs a full synchronous UI refresh');
if (syncSource.includes('let localUsersPersistTimer = null;') && syncSource.includes('scheduleLocalMutationUiRefresh();')) pass('local persistence and visible-panel refresh are coalesced');
else fail('local persistence/UI refresh is not coalesced');
if (syncSource.includes('if (!legacyBoardVisible && !adminNeedsList) return;')) pass('removed legacy ranking no longer sorts all users during refresh');
else fail('refresh still sorts users for the removed ranking');
const allStarQuestionIds = new Set(read('js/13-allstar.js').match(/BK-[A-Z]+-\d+/g) || []);
if (allStarQuestionIds.size === 55) pass('All Star Kitchen includes 55 source-mapped questions');
else fail('All Star Kitchen question count is ' + allStarQuestionIds.size + ', expected 55');
for (const name of ['bronze','prata','ouro','safira','rubi','esmeralda','ametista','perola','obsidiana','diamante']) {
  fs.existsSync(path.join(root, 'assets/ligas/' + name + '.webp')) ? pass('league badge asset exists: ' + name) : fail('missing league badge asset: ' + name);
}

const store = { data: {}, setItem(k,v) { this.data[k] = v; }, getItem(k) { return this.data[k] || null; } };
const testUsers = { player: { name: 'Jogador de Teste', xp: 1234 } };
let syncCalls = 0;
const fakeDocument = { readyState: 'loading', addEventListener() {}, getElementById() { return null; } };
const fakeWindow = { isSecureContext: false, addEventListener() {} };
const context = {
  window: fakeWindow, document: fakeDocument, localStorage: store, STORAGE_USERS_KEY: 'users',
  users: testUsers, currentUserKey: 'player', scheduleCloudSync() { syncCalls++; },
  alert() {}, console, Date, Math, Intl, setTimeout, clearTimeout,
  handleLogin: async () => true, handleRegister: () => true, logoutUser: () => true,
  switchMainTab() {}, isAdminUnlocked: false
};
vm.createContext(context);
try {
  vm.runInContext(read('js/12-notificacoes.js'), context, { filename: 'js/12-notificacoes.js' });
  const api = fakeWindow.VentureNotifications;
  api.addForUser('player', 'Aviso de teste', 'Corpo do aviso', 'info', 'test-id', false);
  api.addForUser('player', 'Aviso duplicado', 'Não deve duplicar', 'info', 'test-id', false);
  if (testUsers.player.ventureNotifications.length === 1) pass('notification IDs deduplicate repeated notices');
  else fail('notification IDs duplicated unexpectedly');
  if (testUsers.player.ventureNotifications[0].title === 'Aviso de teste') pass('first notification content is preserved');
  else fail('duplicate overwrote the original notification');
  vm.runInContext(read('js/13-allstar.js'), context, { filename: 'js/13-allstar.js' });
  const xpBefore = testUsers.player.xp;
  fakeWindow.VentureAllStar.setTrack('cozinha');
  if (testUsers.player.ventureAllStar && testUsers.player.ventureAllStar.preferredTrack === 'cozinha') pass('All Star track is stored on existing user record');
  else fail('All Star track was not stored');
  if (testUsers.player.xp === xpBefore) pass('choosing an All Star track does not award or remove XP');
  else fail('All Star track changed XP');
  if (JSON.parse(store.getItem('users')).player.ventureAllStar.preferredTrack === 'cozinha') pass('All Star track persists to localStorage');
  else fail('All Star track was not persisted');
} catch (error) { fail('runtime smoke test: ' + error.stack); }


// Integration smoke: season closure adds one idempotent result notification per active account.
try {
  const leagueUsers = {};
  const november = Date.parse('2026-11-10T12:00:00Z');
  for (let i = 0; i < 5; i++) {
    leagueUsers['p' + i] = {
      name: 'Participante ' + i, xp: 5000 - i * 100,
      xpLedger: { version: 1, baseXp: 0, baseId: 'test-' + i, transactions: { ['nov-' + i]: { delta: 100 - i * 10, createdAt: november + i * 1000 } } },
      ventureMonthlyLeague: { version: 1, division: 0, seasonKey: '2026-11', history: {}, enrolledAt: 1, updatedAt: 1 }
    };
  }
  const monthStore = { data: {}, setItem(k,v) { this.data[k] = v; }, getItem(k) { return this.data[k] || null; } };
  const monthWindow = { location: { protocol: 'file:' }, isSecureContext: false, addEventListener() {} };
  const monthDocument = { readyState: 'complete', hidden: false, addEventListener() {}, getElementById() { return null; } };
  const monthContext = {
    window: monthWindow, document: monthDocument, navigator: {}, localStorage: monthStore,
    STORAGE_USERS_KEY: 'users', users: leagueUsers, currentUserKey: 'p0',
    scheduleCloudSync() {}, alert() {}, console, Date, Math, Intl, setInterval() {}, setTimeout, clearTimeout,
    isAdminUnlocked: false, switchMainTab() {}
  };
  vm.createContext(monthContext);
  vm.runInContext(read('js/11-ligas-mensais.js'), monthContext, { filename: 'js/11-ligas-mensais.js' });
  vm.runInContext(read('js/12-notificacoes.js'), monthContext, { filename: 'js/12-notificacoes.js' });
  const beforeXp = Object.fromEntries(Object.entries(leagueUsers).map(([key, user]) => [key, user.xp]));
  monthContext.ventureMonthlyCloseSeason('2026-11');
  const notificationTotal = Object.values(leagueUsers).reduce((total, user) => total + (user.ventureNotifications || []).length, 0);
  if (notificationTotal === 5) pass('season closure creates a result notification for each account');
  else fail('season closure created ' + notificationTotal + ' notifications, expected 5');
  if (Object.entries(leagueUsers).every(([key, user]) => user.xp === beforeXp[key])) pass('monthly season closure leaves lifetime XP unchanged');
  else fail('monthly season closure changed lifetime XP');
  if (leagueUsers.p0.ventureMonthlyLeague.history['2026-11'].outcome === 'promoted') pass('season closure records the promotion outcome');
  else fail('season closure did not record the expected promotion');
} catch (error) { fail('monthly notification integration: ' + error.stack); }


// Merge smoke: concurrent notification arrays are unioned by stable ID and the newest All Star choice wins.
try {
  const mergeWindow = { isSecureContext: false, addEventListener() {}, mergeSingleUser(a, b) { return Object.assign({}, a || {}, b || {}); } };
  const mergeDocument = { readyState: 'complete', hidden: false, addEventListener() {}, getElementById() { return null; } };
  const mergeContext = { window: mergeWindow, document: mergeDocument, navigator: {}, localStorage: store, STORAGE_USERS_KEY: 'users', users: { player: { name: 'Teste', xp: 10 } }, currentUserKey: 'player', scheduleCloudSync() {}, alert() {}, console, Date, Math, Intl, setTimeout, clearTimeout };
  vm.createContext(mergeContext);
  vm.runInContext(read('js/13-allstar.js'), mergeContext, { filename: 'js/13-allstar.js' });
  const merged = mergeWindow.mergeSingleUser(
    { name: 'Teste', xp: 10, ventureNotifications: [{ id: 'notice-a', title: 'A', createdAt: 1, readAt: null }], ventureAllStar: { preferredTrack: 'drive', updatedAt: 1 } },
    { name: 'Teste', xp: 10, ventureNotifications: [{ id: 'notice-b', title: 'B', createdAt: 2, readAt: null }], ventureAllStar: { preferredTrack: 'cozinha', updatedAt: 2 } }
  );
  if (merged.ventureNotifications.length === 2) pass('merge hook preserves notifications created on both devices');
  else fail('merge hook lost a notification from another device');
  if (merged.ventureAllStar.preferredTrack === 'cozinha') pass('merge hook keeps the latest All Star track choice');
  else fail('merge hook did not preserve the latest All Star track choice');
} catch (error) { fail('notification/All Star merge smoke: ' + error.stack); }

if (!process.exitCode) console.log('All Venture 9.2.1 smoke tests passed.');
