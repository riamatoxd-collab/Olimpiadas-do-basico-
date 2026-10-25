const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/06-contas-sincronizacao.js'), 'utf8');
const helperStart = source.indexOf('const XP_LEDGER_VERSION = 1;');
const helperEnd = source.indexOf('function mergeSingleUser(ex, inc) {', helperStart);
const addStart = source.indexOf('function addXp(amount, transactionId = null, metadata = {}) {');
const addEnd = source.indexOf('\nfunction updateHeaderUI()', addStart);
if (helperStart < 0 || helperEnd < 0 || addStart < 0 || addEnd < 0) throw new Error('XP ledger functions not found');
const mergeStart = source.indexOf('function mergeSingleUser(ex, inc) {', helperEnd);
let depth = 0, mergeEnd = -1;
for (let i = source.indexOf('{', mergeStart); i < source.length; i++) {
  if (source[i] === '{') depth++;
  else if (source[i] === '}') { depth--; if (depth === 0) { mergeEnd = i + 1; break; } }
}

function makeContext(initialXp = 1000) {
  const store = new Map();
  let writes = 0, failAtWrite = 0;
  const localStorage = {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem(key, value) {
      writes++;
      if (failAtWrite && writes === failAtWrite) throw new Error('simulated storage failure');
      store.set(key, String(value));
    },
    removeItem: key => store.delete(key),
    setFailAtWrite: n => { failAtWrite = n; },
    writes: () => writes,
    raw: key => store.get(key)
  };
  const context = {
    console: { log(){}, warn(){}, error(){} }, Date, Math, JSON, Object, Number, String, Array, Set, Map, Promise,
    localStorage, STORAGE_USERS_KEY: 'users', STORAGE_XP_EMERGENCY_BACKUP: 'xp-backup',
    currentUserKey: 'teste', users: { teste: { name: 'TESTE', xp: initialXp, updatedAt: 1 } }, xpMultiplier: 1,
    xpForReward: amount => Math.round(Number(amount) * context.xpMultiplier),
    getLevelInfo: xp => ({ level: Math.floor(Number(xp) / 1000) + 1 }),
    showXpToast(){}, playMcDonaldsJingle(){}, playHitSuccessSound(){}, scheduleCloudSync(){}, backupKnownScores(){},
    mergeQuizStreak: () => ({}), mergeQuizRotation: (a,b) => b || a,
    mergeVentureArenaState: (a,b) => b || a,
    mergeMissionProgress: (a,b) => b || a, mergeProfilePremium: (a,b) => b || a,
    mergeTrainerChallenges: (a,b) => b || a, mergePracticalAssessments: (a,b) => b || a,
    mergeDailyChest: (a,b) => b || a
  };
  vm.createContext(context);
  vm.runInContext(source.slice(helperStart, helperEnd) + '\n' + source.slice(addStart, addEnd) + '\n' + source.slice(mergeStart, mergeEnd), context);
  return { context, localStorage };
}
function assert(condition, message) { if (!condition) throw new Error(message); }
function ledgerUser(name, baseXp, txs, currentXp, baseId = `legacy:${name.toLowerCase()}:${baseXp}`) {
  return { name, xp: currentXp, updatedAt: 20, xpLedger: { version: 1, baseXp, baseId, transactions: txs, updatedAt: 20, conflicts: [] } };
}

// Legacy XP is retained as the baseline, and a stable ID is idempotent.
{
  const { context: c } = makeContext(1000);
  const first = c.addXp(25, 'test:one', { source: 'test' });
  assert(first === 25 && c.users.teste.xp === 1025, 'first reward credits XP from legacy balance');
  const second = c.addXp(25, 'test:one', { source: 'test' });
  assert(second === 0 && c.users.teste.xp === 1025, 'same transaction ID cannot credit twice');
  assert(c.getXpTransaction('test:one').delta === 25, 'transaction is auditable');
}

// Two real device contexts that start from the same legacy balance merge separate rewards additively.
{
  const { context: a } = makeContext(1000);
  const { context: b } = makeContext(1000);
  a.addXp(20, 'device-a:reward', { source: 'test' });
  b.addXp(30, 'device-b:reward', { source: 'test' });
  const merged = a.mergeXpLedgerState(a.users.teste, b.users.teste);
  assert(merged.xp === 1050, 'two devices with the same starting balance retain both distinct rewards');
}

// XP x2 is captured in the transaction, so later recovery does not recalculate it.
{
  const { context: c } = makeContext(1000);
  c.xpMultiplier = 2;
  assert(c.addXp(20, 'test:x2', { source: 'test' }) === 40, 'XP x2 credits the doubled amount');
  assert(c.getXpTransaction('test:x2').delta === 40, 'ledger stores the final doubled amount');
  c.xpMultiplier = 1;
  assert(c.addXp(20, 'test:x2', { source: 'test' }) === 0 && c.users.teste.xp === 1040, 'same x2 event is not recalculated or duplicated');
}

// Two distinct transactions from the same baseline merge additively; identical IDs are not summed.
{
  const { context: c } = makeContext(0);
  const a = ledgerUser('TESTE', 1000, { a: { id: 'a', delta: 20, createdAt: 1 } }, 1020);
  const b = ledgerUser('TESTE', 1000, { b: { id: 'b', delta: 30, createdAt: 2 } }, 1030);
  const merged = c.mergeXpLedgerState(a, b);
  assert(merged.xp === 1050, 'different concurrent rewards sum when baseline matches');
  const same = c.mergeXpLedgerState(a, ledgerUser('TESTE', 1000, { a: { id: 'a', delta: 40, createdAt: 3 } }, 1040));
  assert(same.xp === 1040, 'same event ID is merged once and keeps highest recorded award');
}

// A stale legacy device is reconciled without discarding the ledger; uncertain baselines use a conservative max.
{
  const { context: c } = makeContext(0);
  const tracked = ledgerUser('TESTE', 1000, { a: { id: 'a', delta: 20, createdAt: 1 } }, 1020);
  const stale = { name: 'TESTE', xp: 1000, updatedAt: 10 };
  const adopted = c.mergeXpLedgerState(tracked, stale);
  assert(adopted.xp === 1020 && adopted.xpLedger.transactions.a, 'stale legacy snapshot adopts the newer ledger');
  const differentBase = ledgerUser('TESTE', 1050, {}, 1050, 'legacy:teste:1050');
  const conflict = c.mergeXpLedgerState(tracked, differentBase);
  assert(conflict.xp === 1050, 'baseline conflict preserves the maximum known balance');
  assert(conflict.xpLedger.conflicts.some(item => item.type === 'baseline-mismatch'), 'baseline conflict is recorded');
  assert(Object.values(conflict.xpLedger.transactions).every(tx => tx.absorbed), 'uncertain old transactions are absorbed to avoid double-credit');
  c.users.teste = { name: 'TESTE', xp: conflict.xp, xpLedger: conflict.xpLedger, updatedAt: 30 };
  c.addXp(10, 'after-conflict', { source: 'test' });
  assert(c.users.teste.xp === 1060, 'new rewards continue normally after conservative reconciliation');
}

// A persisted pending intent recovers exactly once, with the original XP x2 amount.
{
  const { context: c } = makeContext(1000);
  c.users.teste.xpLedger = { version: 1, baseXp: 1000, baseId: 'legacy:teste:1000', transactions: {}, updatedAt: 1, conflicts: [] };
  c.users.teste.pendingXpRewards = { 'pending:x2': { id: 'pending:x2', delta: 40, source: 'test', createdAt: 10, baseAmount: 20, multiplier: 2 } };
  c.xpMultiplier = 1;
  assert(c.recoverPendingXpRewards('teste') === 1, 'pending reward is recovered');
  assert(c.users.teste.xp === 1040, 'recovery uses the recorded delta, not the current multiplier');
  assert(c.recoverPendingXpRewards('teste') === 0 && c.users.teste.xp === 1040, 'recovery does not duplicate XP');
}

// If the second localStorage write fails, the write-ahead intent survives and can be recovered.
{
  const { context: c, localStorage } = makeContext(500);
  localStorage.setFailAtWrite(localStorage.writes() + 2);
  const credited = c.addXp(40, 'storage-failure:test', { source: 'test' });
  assert(credited === 0 && c.users.teste.xp === 500, 'failed commit does not report a credited reward');
  assert(c.users.teste.pendingXpRewards && c.users.teste.pendingXpRewards['storage-failure:test'], 'pending intent stays available');
  localStorage.setFailAtWrite(0);
  assert(c.recoverPendingXpRewards('teste') === 1, 'pending intent can be recovered after storage returns');
  assert(c.users.teste.xp === 540, 'recovered reward is applied once');
}

// Retrying an existing pending ID does not recalculate XP after the multiplier changes.
{
  const { context: c, localStorage } = makeContext(500);
  c.xpMultiplier = 2;
  localStorage.setFailAtWrite(localStorage.writes() + 2);
  assert(c.addXp(20, 'retry-pending:x2', { source: 'test' }) === 0, 'simulated commit failure leaves a pending intent');
  c.xpMultiplier = 1;
  localStorage.setFailAtWrite(0);
  assert(c.addXp(20, 'retry-pending:x2', { source: 'test' }) === 0, 'retry does not create a second award');
  assert(c.users.teste.xp === 540 && c.getXpTransaction('retry-pending:x2').delta === 40, 'retry recovers the original doubled amount');
}

// Transactions committed before a UI claim marker are reconciled on the next load.
{
  const { context: c } = makeContext(0);
  const txs = {
    'mission:daily:2026-10-24:m1': { delta: 15, source: 'mission', createdAt: 11, absorbed: false },
    'trainer-challenge:C1': { delta: 30, source: 'trainer-challenge', createdAt: 12, absorbed: false },
    'daily-chest:2026-10-24': { delta: 40, source: 'daily-chest', createdAt: 13, absorbed: false },
    'duel-win:duel123:teste': { delta: 100, source: 'duel-win', createdAt: 14, absorbed: false },
    'arena:2026-10-24:question:q1': { delta: 20, source: 'arena-question', createdAt: 15, absorbed: false },
    'arena:2026-10-24:completion': { delta: 50, source: 'arena-completion', createdAt: 16, absorbed: false }
  };
  c.users.teste.xpLedger = { version: 1, baseXp: 1000, baseId: 'legacy:teste:1000', transactions: txs, updatedAt: 20, conflicts: [] };
  c.users.teste.xp = 1255;
  c.users.teste.missionProgress = { claims: {} };
  c.users.teste.trainerChallenges = { C1: { count: 1, claimedAt: 0 } };
  c.users.teste.dailyChest = { claims: { '2026-10-24': { kind: 'xp', amount: 40, status: 'pending' } } };
  c.users.teste.duelRewards = {};
  c.users.teste.ventureArena = { dailyClaims: {}, activeSession: { day: '2026-10-24', correct: 4, completed: true, xpLedgerVersion: 1,
    answers: { q1: { correct: true, rewardId: 'arena:2026-10-24:question:q1', xp: 0, rewardPending: true } },
    questionIds: ['q1'], completionBonusXp: 0, xpEarned: 0, completedAt: 16 } };
  c.recoverPendingXpRewards('teste');
  assert(c.users.teste.missionProgress.claims['daily:2026-10-24:m1'], 'mission claim marker is repaired from the committed transaction');
  assert(c.users.teste.trainerChallenges.C1.claimedAt === 12, 'trainer claim marker is repaired');
  assert(c.users.teste.dailyChest.claims['2026-10-24'].status === 'claimed', 'daily chest pending marker is repaired');
  assert(c.users.teste.duelRewards.duel123 === 14, 'duel reward marker is repaired');
  assert(c.users.teste.ventureArena.activeSession.answers.q1.xp === 20, 'arena answer XP is reconciled');
  assert(c.users.teste.ventureArena.dailyClaims['2026-10-24'].status === 'claimed', 'arena completion marker is repaired');
}

// Explicit administrative reset rebases the ledger and clears pending rewards.
{
  const { context: c } = makeContext(1000);
  c.addXp(50, 'before-reset', { source: 'test' });
  c.users.teste.pendingXpRewards = { pending: { delta: 20, source: 'test', createdAt: 1 } };
  assert(c.setXpBalanceForUser('teste', 0, { adminOverride: true }), 'admin balance override saves');
  assert(c.users.teste.xp === 0 && !c.users.teste.pendingXpRewards, 'admin reset is respected and pending rewards are cleared');
  c.addXp(20, 'after-reset', { source: 'test' });
  assert(c.users.teste.xp === 20, 'ledger continues from the explicit admin baseline');
}

// Admin override precedence keeps an intentional reset from being undone by a stale device.
{
  const { context: c } = makeContext(0);
  const stale = ledgerUser('TESTE', 1000, { old: { id: 'old', delta: 50, createdAt: 1 } }, 1050);
  stale.adminOverrideAt = 10;
  const reset = ledgerUser('TESTE', 0, { old: { id: 'old', delta: 50, createdAt: 1, absorbed: true } }, 0, 'admin:teste:20:0');
  reset.adminOverrideAt = 20;
  const merged = c.mergeSingleUser(stale, reset);
  assert(merged.xp === 0 && merged.adminOverrideAt === 20, 'newer explicit admin override wins over stale score');
}

console.log('PASS: legacy XP baseline preserved');
console.log('PASS: stable transaction IDs prevent duplicate credits');
console.log('PASS: concurrent distinct rewards from two matching-baseline devices are additive');
console.log('PASS: XP x2 is stored as the final transaction amount and is not duplicated');
console.log('PASS: distinct concurrent XP events merge additively on a matching baseline');
console.log('PASS: stale legacy snapshots are reconciled conservatively');
console.log('PASS: baseline conflicts preserve maximum XP and are recorded');
console.log('PASS: pending XP rewards recover exactly once with the original multiplier');
console.log('PASS: simulated localStorage interruption is recoverable');
console.log('PASS: retrying a pending ID preserves the original XP x2 value');
console.log('PASS: committed rewards repair missing mission, trainer, chest, duel and Arena markers');
console.log('PASS: explicit admin reset and override precedence are preserved');
