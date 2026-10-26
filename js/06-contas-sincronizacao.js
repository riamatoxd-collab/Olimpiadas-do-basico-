/* Venture 9.2.2 · js/06-contas-sincronizacao.js · arquivo carregado na ordem indicada no HTML. */
function isPhotoAvatar(val) { return typeof val === "string" && val.startsWith("data:image/"); }
function renderAvatarBadge(avatarVal, sizeClasses = "w-10 h-10", textClasses = "text-xl", extraClasses = "pro-card") {
const val = avatarVal || "🍔";
return isPhotoAvatar(val)
? `<img src="${val}" alt="Foto" class="${sizeClasses} rounded-2xl object-cover border-2 border-[#FFC72C] shadow-sm shrink-0" />`
: `<div class="${sizeClasses} rounded-2xl ${extraClasses} flex items-center justify-center ${textClasses} shrink-0">${val}</div>`;
}
function triggerPhotoUpload(targetMode) {
playTabClickSound();
photoUploadTarget = targetMode;
const input = $("hiddenGalleryInput");
if (input) { input.value = ""; input.click(); }
}
function handleGalleryFileSelected(event) {
const file = event.target.files && event.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = e => {
const img = new Image();
img.onload = () => {
const canvas = document.createElement("canvas");
canvas.width = 110; canvas.height = 110;
const minDim = Math.min(img.width, img.height);
canvas.getContext("2d").drawImage(img, (img.width - minDim) / 2, (img.height - minDim) / 2, minDim, minDim, 0, 0, 110, 110);
const dataUrl = canvas.toDataURL("image/jpeg", 0.74);
playHitSuccessSound();
if (photoUploadTarget === "register") {
selectedRegAvatar = dataUrl; renderAvatarSelector();
} else if (currentUserKey && users[currentUserKey]) {
users[currentUserKey].avatar = dataUrl; users[currentUserKey].updatedAt = Date.now();
closeAvatarModal(); scheduleCloudSync(currentUserKey, true);
}
};
img.src = e.target.result;
};
reader.readAsDataURL(file);
}
function initTheme() {
if (localStorage.getItem(STORAGE_THEME_KEY) === "dark") {
document.body.classList.add("dark-mode");
if ($("themeToggleBtn")) $("themeToggleBtn").textContent = "☀️";
}
}
function toggleDarkMode() {
playTabClickSound();
const isDark = document.body.classList.toggle("dark-mode");
localStorage.setItem(STORAGE_THEME_KEY, isDark ? "dark" : "light");
if ($("themeToggleBtn")) $("themeToggleBtn").textContent = isDark ? "☀️" : "🌙";
}
function showXpToast(amount) {
const c = $("xpToastContainer");
if (!c) return;
const t = document.createElement("div");
t.className = "xp-toast gold-gradient text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-xl border-2 border-white";
t.textContent = `+${amount} XP ⚡`;
c.appendChild(t); setTimeout(() => t.remove(), 1250);
}
// =========================================================================
// SINCRONIZAÇÃO EM TEMPO REAL E RESGATE DE CONTAS
// =========================================================================
let heartbeatSyncQueueTimer = null;
function scheduleHeartbeatSync(key) {
if (!key || !users[key] || users[key]._deleted) return;
if (heartbeatSyncQueueTimer) clearTimeout(heartbeatSyncQueueTimer);
heartbeatSyncQueueTimer = setTimeout(() => {
const user = users[key];
if (!user || user._deleted) return;
const packet = JSON.stringify({ __ventureHeartbeat: true, key, lastSeen: user.lastSeen });
mqttClients.forEach(c => { if (c && c.connected) try { c.publish(SYNC_MQTT_TOPIC, packet); } catch (e) {} });
fetch(CLOUD_HTTP_URL, { method: "POST", body: JSON.stringify({ type: "single", k: key, u: user }) }).catch(() => {});
}, 1000);
}
function scheduleHeartbeatUiRefresh(key) {
if (typeof publicProfileSelectedKey !== "undefined" && publicProfileSelectedKey === key) {
const modal = $("publicProfileModal");
if (modal && !modal.classList.contains("hidden") && typeof renderPublicProfile === "function") renderPublicProfile();
}
}
function startHeartbeat() {
if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
heartbeatIntervalId = setInterval(() => {
if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
users[currentUserKey].lastSeen = Date.now();
scheduleHeartbeatSync(currentUserKey);
}
}, 15000);
}
// CORREÇÃO CRÍTICA v8.9.1: recuperação de cadastros sem substituir o registro
// moderno por um legado incompleto. Um erro em uma conta não invalida as demais.
const STORAGE_XP_EMERGENCY_BACKUP = "mequi_venture_score_backup_v891";
function backupKnownScores(candidates) {
  try {
    const old=JSON.parse(localStorage.getItem(STORAGE_XP_EMERGENCY_BACKUP)||"{}");
    const safe=old&&typeof old==="object"&&!Array.isArray(old)?old:{};
    Object.entries(candidates).forEach(([key,u])=>{
      if(!u||!u.name||u._deleted)return;
      const prev=safe[key]||{};
      safe[key]={ name:String(u.name),xp:Math.max(Number(prev.xp)||0,Number(u.xp)||0),
        correctAnswers:Math.max(Number(prev.correctAnswers)||0,Number(u.correctAnswers)||0),
        lastCollectedAt:Date.now() };
    });
    localStorage.setItem(STORAGE_XP_EMERGENCY_BACKUP,JSON.stringify(safe));
  }catch(e){ console.warn('Backup de pontos indisponível',e); }
}
function rescuePreviousLocalRegistrations() {
  // v6 primeiro: é o cadastro atual. Outros armazenamentos são backups parciais.
  const keys=["mequi_olimpiadas_users_v6","mequi_olimpiadas_users_v5","mequi_olimpiadas_users_v4","mequi_olimpiadas_users_v3"];
  const staged={...users};
  let error=false;
  for(const k of keys){
    let parsed;
    try {parsed=JSON.parse(localStorage.getItem(k)||"null");}
    catch(e){console.error('Falha ao ler armazenamento '+k,e);error=true;continue;}
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)) continue;
    for(const [uk,u] of Object.entries(parsed)){
      if(!u||!u.name)continue;
      const incoming={...u,role:u.role||u.station||"Atendente",avatar:u.avatar||"🍔",
        hearts:u.hearts!==undefined?u.hearts:5,heartsLockUntil:u.heartsLockUntil||0,
        mistakes:Array.isArray(u.mistakes)?u.mistakes:[],lastSeen:u.lastSeen||0,updatedAt:u.updatedAt||0};
      try {staged[uk]=mergeSingleUser(staged[uk],incoming);}
      catch(e){error=true;console.error('Falha recuperando colaborador',uk,e);}
    }
  }
  backupKnownScores(staged);
  if(error){
    console.error('Recuperação incompleta. Não sobrescrevemos o cadastro original.');
    // Os dados recuperados continuam disponíveis na sessão, mas nenhum backup
    // original é substituído se alguma etapa de migração falhar.
    users=staged;
    return;
  }
  users=staged;
  localStorage.setItem(STORAGE_USERS_KEY,JSON.stringify(users));
}
function mergeQuizRotation(ex,inc){
  const a=ex&&ex.quizRotation, b=inc&&inc.quizRotation;
  if(!a)return b;
  if(!b)return a;
  return (Number(b.updatedAt)||0)>(Number(a.updatedAt)||0)?b:a;
}

// XP Ledger v1: registra recompensas por ID e permite mesclar eventos distintos
// quando os aparelhos partem da mesma base. Não substitui validação no servidor.
const XP_LEDGER_VERSION = 1;
const XP_LEDGER_MAX_DELTA = 100000;
function xpPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function xpSafeInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}
function xpLedgerIsValid(ledger) {
  return Boolean(ledger && typeof ledger === "object" && !Array.isArray(ledger) &&
    Number(ledger.version) === XP_LEDGER_VERSION && Number.isFinite(Number(ledger.baseXp)) &&
    ledger.transactions && typeof ledger.transactions === "object" && !Array.isArray(ledger.transactions));
}
function xpLedgerNormalize(user) {
  const source = user && xpPlainObject(user.xpLedger);
  if (!xpLedgerIsValid(source)) {
    const baseXp = xpSafeInteger(user && user.xp);
    const name = String(user && user.name || "unknown").trim().toLocaleLowerCase("pt-BR");
    return { version: XP_LEDGER_VERSION, baseXp, baseId: `legacy:${name}:${baseXp}`, transactions: {}, updatedAt: 0, conflicts: [] };
  }
  const transactions = {};
  Object.entries(xpPlainObject(source.transactions)).forEach(([rawId, raw]) => {
    if (!raw || typeof raw !== "object") return;
    const id = String(rawId).slice(0, 200), delta = Number(raw.delta);
    if (!id || !Number.isFinite(delta) || delta <= 0 || delta > XP_LEDGER_MAX_DELTA) return;
    transactions[id] = { delta: Math.round(delta), source: String(raw.source || "reward").slice(0, 80),
      createdAt: xpSafeInteger(raw.createdAt), absorbed: raw.absorbed === true };
  });
  const name = String(user && user.name || "unknown").trim().toLocaleLowerCase("pt-BR");
  return { version: XP_LEDGER_VERSION, baseXp: xpSafeInteger(source.baseXp),
    baseId: String(source.baseId || `legacy:${name}:${xpSafeInteger(source.baseXp)}`).slice(0, 180),
    transactions, updatedAt: xpSafeInteger(source.updatedAt),
    conflicts: Array.isArray(source.conflicts) ? source.conflicts.slice(-10) : [] };
}
function xpLedgerTotal(ledger) {
  if (!xpLedgerIsValid(ledger)) return 0;
  let total = xpSafeInteger(ledger.baseXp);
  Object.values(xpPlainObject(ledger.transactions)).forEach(tx => {
    if (!tx || tx.absorbed === true) return;
    const delta = Number(tx.delta);
    if (Number.isFinite(delta)) total += Math.round(delta);
  });
  return Math.max(0, Math.floor(total));
}
function xpLedgerRebase(ledger, balance, baseId, conflict) {
  const out = xpLedgerNormalize({ name: "", xpLedger: ledger });
  out.baseXp = xpSafeInteger(balance);
  out.baseId = String(baseId).slice(0, 180);
  Object.values(out.transactions).forEach(tx => { tx.absorbed = true; });
  out.updatedAt = Date.now();
  if (conflict) out.conflicts = [...out.conflicts, { type: String(conflict.type || "reconciled"), at: Date.now(),
    balance: out.baseXp, leftXp: xpSafeInteger(conflict.leftXp), rightXp: xpSafeInteger(conflict.rightXp) }].slice(-10);
  return out;
}
function xpLedgerEnsure(user) {
  if (!user) return null;
  const hadLedger = xpLedgerIsValid(user.xpLedger);
  let ledger = xpLedgerNormalize(user);
  const visibleXp = xpSafeInteger(user.xp), calculatedXp = xpLedgerTotal(ledger);
  if (hadLedger && visibleXp > calculatedXp) {
    ledger = xpLedgerRebase(ledger, visibleXp,
      `legacy-reconcile:${String(user.name || "unknown").toLowerCase()}:${visibleXp}:${Date.now()}`,
      { type: "legacy-balance-ahead", leftXp: visibleXp, rightXp: calculatedXp });
  }
  user.xpLedger = ledger;
  user.xp = xpLedgerTotal(ledger);
  return ledger;
}
function xpLedgerTransaction(user, transactionId) {
  const ledger = user && xpLedgerIsValid(user.xpLedger) ? user.xpLedger : null;
  if (!ledger || !transactionId) return null;
  const id = String(transactionId).slice(0, 200);
  const transaction = xpPlainObject(ledger.transactions)[id];
  return transaction ? { ...transaction, id } : null;
}
function getXpTransaction(transactionId, user = currentUserKey && users[currentUserKey]) {
  return xpLedgerTransaction(user, transactionId);
}
function createXpEventId(prefix = "xp") {
  let token = "";
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) token = crypto.randomUUID(); } catch (_) {}
  if (!token) token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  return `${String(prefix || "xp").slice(0, 40)}:${token}`;
}
function xpMergeTransactionMaps(a, b) {
  const merged = { ...xpPlainObject(a) };
  Object.entries(xpPlainObject(b)).forEach(([id, incoming]) => {
    if (!incoming || typeof incoming !== "object") return;
    const old = merged[id];
    if (!old) { const { id: _incomingId, ...compact } = incoming; merged[id] = compact; return; }
    const oldDelta = Number(old.delta) || 0, newDelta = Number(incoming.delta) || 0;
    const { id: _oldId, ...oldCompact } = old;
    const { id: _incomingId, ...incomingCompact } = incoming;
    merged[id] = { ...oldCompact, ...incomingCompact, delta: Math.round(Math.max(oldDelta, newDelta)),
      absorbed: old.absorbed === true || incoming.absorbed === true };
  });
  return merged;
}
function xpLedgerConflictMerge(ex, inc, left, right, reason) {
  const leftLedger = left ? xpLedgerNormalize({ name: ex && ex.name, xpLedger: left }) : xpLedgerNormalize(ex);
  const rightLedger = right ? xpLedgerNormalize({ name: inc && inc.name, xpLedger: right }) : xpLedgerNormalize(inc);
  const balance = Math.max(xpSafeInteger(ex && ex.xp), xpSafeInteger(inc && inc.xp), xpLedgerTotal(leftLedger), xpLedgerTotal(rightLedger));
  const transactions = xpMergeTransactionMaps(leftLedger.transactions, rightLedger.transactions);
  Object.values(transactions).forEach(tx => { tx.absorbed = true; });
  const updatedAt = Math.max(leftLedger.updatedAt, rightLedger.updatedAt, xpSafeInteger(ex && ex.updatedAt), xpSafeInteger(inc && inc.updatedAt));
  const name = String(ex && ex.name || inc && inc.name || "unknown").trim().toLocaleLowerCase("pt-BR");
  const conflicts = [...leftLedger.conflicts, ...rightLedger.conflicts,
    { type: reason, at: updatedAt || Date.now(), balance, leftXp: xpSafeInteger(ex && ex.xp), rightXp: xpSafeInteger(inc && inc.xp) }].slice(-10);
  return { xp: balance, xpLedger: { version: XP_LEDGER_VERSION, baseXp: balance,
    baseId: `reconciled:${name}:${balance}:${updatedAt}`, transactions, updatedAt, conflicts } };
}
function mergeXpLedgerState(ex, inc) {
  const leftXp = xpSafeInteger(ex && ex.xp), rightXp = xpSafeInteger(inc && inc.xp);
  const hasLeft = xpLedgerIsValid(ex && ex.xpLedger), hasRight = xpLedgerIsValid(inc && inc.xpLedger);
  if (!hasLeft && !hasRight) return { xp: Math.max(leftXp, rightXp), xpLedger: undefined };
  if (hasLeft && !hasRight) {
    const ledger = xpLedgerNormalize(ex), total = xpLedgerTotal(ledger);
    if (rightXp <= total) return { xp: total, xpLedger: ledger };
    return xpLedgerConflictMerge(ex, inc, ledger, null, "legacy-balance-ahead");
  }
  if (!hasLeft && hasRight) {
    const ledger = xpLedgerNormalize(inc), total = xpLedgerTotal(ledger);
    if (leftXp <= total) return { xp: total, xpLedger: ledger };
    return xpLedgerConflictMerge(ex, inc, null, ledger, "legacy-balance-ahead");
  }
  const a = xpLedgerNormalize(ex), b = xpLedgerNormalize(inc);
  const sameBaseline = a.baseId === b.baseId && a.baseXp === b.baseXp;
  const txIds = new Set([...Object.keys(a.transactions), ...Object.keys(b.transactions)]);
  const absorptionMismatch = [...txIds].some(id => a.transactions[id] && b.transactions[id] &&
    Boolean(a.transactions[id].absorbed) !== Boolean(b.transactions[id].absorbed));
  if (!sameBaseline || absorptionMismatch) {
    return xpLedgerConflictMerge(ex, inc, a, b, !sameBaseline ? "baseline-mismatch" : "transaction-state-mismatch");
  }
  const transactions = xpMergeTransactionMaps(a.transactions, b.transactions);
  const ledger = { version: XP_LEDGER_VERSION, baseXp: a.baseXp, baseId: a.baseId, transactions,
    updatedAt: Math.max(a.updatedAt, b.updatedAt), conflicts: [...a.conflicts, ...b.conflicts].slice(-10) };
  return { xp: xpLedgerTotal(ledger), xpLedger: ledger };
}
function persistXpMutation() {
  try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); return true; }
  catch (err) { console.warn("Não foi possível salvar o XP localmente.", err); return false; }
}
function mergePendingXpRewards(a, b) {
  const merged = { ...xpPlainObject(a) };
  Object.entries(xpPlainObject(b)).forEach(([id, pending]) => {
    if (!pending || typeof pending !== "object") return;
    const old = merged[id];
    if (!old) merged[id] = pending;
    else merged[id] = { ...old, ...pending, delta: Math.max(Number(old.delta) || 0, Number(pending.delta) || 0),
      createdAt: Math.min(Number(old.createdAt) || Infinity, Number(pending.createdAt) || Infinity) };
  });
  Object.keys(merged).forEach(id => { if (!Number.isFinite(Number(merged[id]?.createdAt))) merged[id].createdAt = Date.now(); });
  return Object.keys(merged).length ? merged : undefined;
}
function setXpBalanceForUser(key, targetBalance, options = {}) {
  const user = users[key];
  if (!user) return false;
  const oldXp = user.xp, oldLedger = user.xpLedger ? JSON.parse(JSON.stringify(user.xpLedger)) : undefined;
  const oldPending = user.pendingXpRewards ? JSON.parse(JSON.stringify(user.pendingXpRewards)) : undefined;
  const oldUpdatedAt = user.updatedAt, oldAdminOverrideAt = user.adminOverrideAt;
  const ledger = xpLedgerEnsure(user), target = xpSafeInteger(targetBalance), now = Date.now();
  Object.values(ledger.transactions).forEach(tx => { tx.absorbed = true; });
  ledger.baseXp = target;
  ledger.baseId = `admin:${String(key).slice(0, 80)}:${now}:${target}`;
  ledger.updatedAt = now;
  user.xpLedger = ledger;
  user.xp = target;
  delete user.pendingXpRewards; // alteração administrativa explícita prevalece sobre créditos ainda pendentes
  user.updatedAt = now;
  if (options.adminOverride !== false) user.adminOverrideAt = now;
  if (!persistXpMutation()) {
    user.xp = oldXp;
    if (oldLedger === undefined) delete user.xpLedger; else user.xpLedger = oldLedger;
    if (oldPending === undefined) delete user.pendingXpRewards; else user.pendingXpRewards = oldPending;
    user.updatedAt = oldUpdatedAt;
    if (oldAdminOverrideAt === undefined) delete user.adminOverrideAt; else user.adminOverrideAt = oldAdminOverrideAt;
    return false;
  }
  if (typeof backupKnownScores === "function") backupKnownScores(users);
  return true;
}
function mergeSingleUser(ex, inc) {
if (!ex) return inc;
const streak = mergeQuizStreak(ex, inc);
const quizRotation = mergeQuizRotation(ex, inc);
const ventureArena = typeof mergeVentureArenaState === "function" ? mergeVentureArenaState(ex.ventureArena, inc.ventureArena) : (inc.ventureArena || ex.ventureArena);
if ((inc.adminOverrideAt || 0) > (ex.adminOverrideAt || 0)) return { ...inc, ...streak, quizRotation, missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium), trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards}, practicalAssessments:mergePracticalAssessments(ex.practicalAssessments,inc.practicalAssessments), dailyChest:mergeDailyChest(ex.dailyChest,inc.dailyChest), ventureArena };
if ((ex.adminOverrideAt || 0) > (inc.adminOverrideAt || 0)) return { ...ex, ...streak, quizRotation, missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium), trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards}, practicalAssessments:mergePracticalAssessments(ex.practicalAssessments,inc.practicalAssessments), dailyChest:mergeDailyChest(ex.dailyChest,inc.dailyChest), ventureArena };
if (inc._deleted && (inc.updatedAt || 0) >= (ex.updatedAt || 0)) {
  const deletedXpState = mergeXpLedgerState(ex, inc);
  return { ...inc, ...streak, quizRotation, xp: deletedXpState.xp, xpLedger: deletedXpState.xpLedger,
    missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium),
    trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards},
    practicalAssessments:mergePracticalAssessments(ex.practicalAssessments,inc.practicalAssessments), dailyChest:mergeDailyChest(ex.dailyChest,inc.dailyChest), ventureArena };
}
const newer = (inc.updatedAt || 0) >= (ex.updatedAt || 0);
const xpState = mergeXpLedgerState(ex, inc);
return {
...ex, ...inc, ...streak, quizRotation, _deleted: false,
role: inc.role || ex.role || "Atendente",
avatar: (newer && inc.avatar) ? inc.avatar : (ex.avatar || inc.avatar || "🍔"),
xp: xpState.xp,
xpLedger: xpState.xpLedger,
pendingXpRewards: mergePendingXpRewards(ex.pendingXpRewards, inc.pendingXpRewards),
correctAnswers: Math.max(ex.correctAnswers || 0, inc.correctAnswers || 0),
hearts: newer && inc.hearts !== undefined ? inc.hearts : (ex.hearts !== undefined ? ex.hearts : 5),
heartsLockUntil: newer && inc.heartsLockUntil !== undefined ? inc.heartsLockUntil : (ex.heartsLockUntil || 0),
mistakes: newer && Array.isArray(inc.mistakes) ? inc.mistakes : (Array.isArray(ex.mistakes) ? ex.mistakes : []),
missionProgress: mergeMissionProgress(ex.missionProgress,inc.missionProgress),
profilePremium: mergeProfilePremium(ex.profilePremium,inc.profilePremium),
trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges),
duelRewards:{...ex.duelRewards,...inc.duelRewards}, practicalAssessments:mergePracticalAssessments(ex.practicalAssessments,inc.practicalAssessments), dailyChest:mergeDailyChest(ex.dailyChest,inc.dailyChest), ventureArena,
lastSeen: Math.max(ex.lastSeen || 0, inc.lastSeen || 0),
updatedAt: Math.max(ex.updatedAt || 0, inc.updatedAt || 0)
};
}
function mergeUserDictionaries(loc, rem) {
const m = { ...loc };
if (rem && typeof rem === "object") {
Object.keys(rem).forEach(k => { if (rem[k] && rem[k].name) m[k] = mergeSingleUser(m[k], rem[k], k); });
}
return m;
}
function refreshUIIfNeeded() {
restoreQuizStreak();
updateHeaderUI();
syncActiveUserHeartsState();
updateMistakesBadge();
const isVisible = id => { const el = $(id); return !!el && !el.classList.contains("hidden"); };
// Atualize somente os painéis visíveis; os demais são atualizados ao abrir a aba.
// Isso evita reconstruir listas e perfis inteiros a cada mensagem recebida da nuvem.
if (isVisible("tab-training")) {
  populateDuelOpponentList();
  renderDuelHistory();
  if (typeof renderVentureArena === "function") renderVentureArena();
  if (typeof renderVentureDuelDashboard === "function") renderVentureDuelDashboard();
}
if (isVisible("tab-missions")) {
  renderMissionHub();
  renderDailyChest();
}
if (isVisible("tab-trainer")) {
  renderTrainerPublicContent();
  if (typeof isTrainerUnlocked !== "undefined" && isTrainerUnlocked) renderPracticalTrainerRoster();
}
if (isVisible("tab-profile")) renderPremiumProfile();
if (typeof publicProfileSelectedKey !== "undefined" && publicProfileSelectedKey && isVisible("publicProfileModal")) renderPublicProfile();
// A tela do ranking geral foi removida na 9.2.1. Não calcule nem ordene todos
// os cadastros para uma lista invisível; só faça isso se a tela legado ou o ADM existir.
const legacyBoardVisible = $("leaderboardContainer") || $("podiumTop3Container");
const adminNeedsList = typeof isAdminUnlocked !== "undefined" && isAdminUnlocked;
if (!legacyBoardVisible && !adminNeedsList) return;
const sorted = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
const hash = JSON.stringify(sorted.map(u => `${u.name}:${u.xp}:${u.correctAnswers}:${(u.avatar || "").slice(-15)}:${u.role}:${u.lastSeen || 0}:${u.profilePremium?.updatedAt||0}:${Object.keys(u.missionProgress?.badges||{}).length}:${Object.keys(u.practicalAssessments?.records||{}).length}`));
if (legacyBoardVisible && hash !== lastLeaderboardHash) { lastLeaderboardHash = hash; renderLeaderboard(); }
if (adminNeedsList && hash !== lastAdminListHash) { lastAdminListHash = hash; renderAdminUsersList(); }
}
function initClusterSync() {
["wss://broker.emqx.io:8084/mqtt", "wss://broker.hivemq.com:8884/mqtt"].forEach(url => {
try {
const client = mqtt.connect(url, { clientId: "mq78_" + Math.random().toString(16).slice(2, 10), clean: true, connectTimeout: 5000, reconnectPeriod: 6000 });
client.on("connect", () => {
if ($("syncStatusText")) $("syncStatusText").textContent = "● Conectado em Tempo Real (Finaliza 25/10)";
client.subscribe(SYNC_MQTT_TOPIC); client.subscribe(DUEL_MQTT_TOPIC); client.subscribe(TRAINER_MQTT_TOPIC);
});
client.on("message", (topic, msg) => {
try {
const data = JSON.parse(msg.toString());
if (topic === SYNC_MQTT_TOPIC) {
if (data && data.__ventureHeartbeat === true && data.key && Number.isFinite(Number(data.lastSeen))) {
const existingUser = users[data.key];
if (existingUser && !existingUser._deleted) {
existingUser.lastSeen = Math.max(Number(existingUser.lastSeen) || 0, Number(data.lastSeen) || 0);
scheduleHeartbeatUiRefresh(data.key);
}
} else {
users = mergeUserDictionaries(users, data);
localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
if (currentUserKey && typeof recoverPendingXpRewards === "function") recoverPendingXpRewards(currentUserKey);
refreshUIIfNeeded();
}
} else if (topic === DUEL_MQTT_TOPIC) handleIncomingDuelPacket(data);
else if (topic === TRAINER_MQTT_TOPIC) mergeTrainerState(data);
} catch (e) {}
});
mqttClients.push(client);
} catch (e) {}
});
}
function publishDuelPacket(pkt) {
const p = JSON.stringify(pkt);
if (['question','answer','finish'].includes(pkt.type)) handleIncomingDuelPacket(pkt);
mqttClients.forEach(c => { if (c && c.connected) try { c.publish(DUEL_MQTT_TOPIC, p); } catch (e) {} });
}
let localUsersPersistTimer = null;
let localMutationUiRefreshTimer = null;
function scheduleLocalMutationUiRefresh() {
if (localMutationUiRefreshTimer) return;
localMutationUiRefreshTimer = setTimeout(() => {
  localMutationUiRefreshTimer = null;
  try {
    if (currentUserKey && users[currentUserKey] && typeof updateHeaderUI === "function" && $("userNameDisplay")) updateHeaderUI();
    if (typeof syncActiveUserHeartsState === "function") syncActiveUserHeartsState();
    if (typeof updateMistakesBadge === "function") updateMistakesBadge();
    const isVisible = id => { const el = $(id); return !!el && !el.classList.contains("hidden"); };
    if (isVisible("tab-missions")) {
      if (typeof renderMissionHub === "function") renderMissionHub();
      if (typeof renderDailyChest === "function") renderDailyChest();
    }
    if (isVisible("tab-training")) {
      const duelMode = $("training-mode-duel");
      if (duelMode && !duelMode.classList.contains("hidden")) {
        if (typeof populateDuelOpponentList === "function") populateDuelOpponentList();
        if (typeof renderDuelHistory === "function") renderDuelHistory();
        if (typeof renderVentureDuelDashboard === "function") renderVentureDuelDashboard();
      }
    }
    if (isVisible("tab-profile") && typeof renderPremiumProfile === "function") renderPremiumProfile();
    if (isVisible("tab-trainer") && typeof renderTrainerPublicContent === "function") {
      renderTrainerPublicContent();
      if (typeof isTrainerUnlocked !== "undefined" && isTrainerUnlocked && typeof renderPracticalTrainerRoster === "function") renderPracticalTrainerRoster();
    }
    if (isVisible("tab-admin") && typeof isAdminUnlocked !== "undefined" && isAdminUnlocked && typeof renderAdminUsersList === "function") renderAdminUsersList();
    if (typeof publicProfileSelectedKey !== "undefined" && publicProfileSelectedKey && isVisible("publicProfileModal") && typeof renderPublicProfile === "function") renderPublicProfile();
  } catch (error) {
    console.warn("Não foi possível atualizar um painel após a alteração local.", error);
  }
}, 0);
}
function scheduleCloudSync(keyToPush, immediate = false) {
// Persista uma vez por lote de alterações. XP continua com seu write-ahead ledger
// síncrono; isso evita serializar a base inteira repetidamente no mesmo clique.
if (!localUsersPersistTimer) {
  localUsersPersistTimer = setTimeout(() => {
    localUsersPersistTimer = null;
    try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); }
    catch (error) { console.warn("Não foi possível persistir os dados locais.", error); }
  }, 0);
}
scheduleLocalMutationUiRefresh();
clearTimeout(cloudSyncQueueTimer);
cloudSyncQueueTimer = setTimeout(() => {
const full = JSON.stringify(users);
mqttClients.forEach(c => { if (c && c.connected) try { c.publish(SYNC_MQTT_TOPIC, full, { retain: true }); } catch (e) {} });
if (keyToPush && users[keyToPush]) {
fetch(CLOUD_HTTP_URL, { method: "POST", body: JSON.stringify({ type: "single", k: keyToPush, u: users[keyToPush] }) }).catch(() => {});
}
}, immediate ? 150 : 3000);
}
async function fetchCloudHistorySafe(force = false) {
if (!force && Date.now() - lastHttpFetchTime < 20000) return;
lastHttpFetchTime = Date.now();
try {
const res = await fetch(`${CLOUD_HTTP_URL}/json?poll=1&since=all`);
if (res.ok) {
const lines = (await res.text()).trim().split("\n");
lines.forEach(l => {
try {
const pkt = JSON.parse(l);
if (pkt.event === "message" && pkt.message) {
const d = JSON.parse(pkt.message);
if (d.type === "single" && d.k && d.u) users[d.k] = mergeSingleUser(users[d.k], d.u, d.k);
}
} catch (e) {}
});
backupKnownScores(users);
localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
refreshUIIfNeeded();
}
} catch (e) {console.warn('Histórico de nuvem indisponível',e);}
}
function forceSyncNow() {
playTabClickSound();
if (currentUserKey && users[currentUserKey]) scheduleCloudSync(currentUserKey, true);
fetchCloudHistorySafe(true);
}
// =========================================================================
// PATENTES, PERFIL E AUTENTICAÇÃO
// =========================================================================
function getLevelInfo(xp) {
if (xp >= 25000) return { level: 7, title: "👑 Nível 7 — Lenda dos Arcos Dourados", min: 25000, max: 40000 };
if (xp >= 15000) return { level: 6, title: "🔥 Nível 6 — Mestre das Olimpíadas", min: 15000, max: 25000 };
if (xp >= 10000) return { level: 5, title: "💎 Nível 5 — Diamante Best Burger", min: 10000, max: 15000 };
if (xp >= 6000) return { level: 4, title: "🥇 Nível 4 — Padrão Ouro Venture", min: 6000, max: 10000 };
if (xp >= 3000) return { level: 3, title: "🥈 Nível 3 — Especialista de Prata", min: 3000, max: 6000 };
if (xp >= 1000) return { level: 2, title: "🥉 Nível 2 — Chapa de Bronze", min: 1000, max: 3000 };
return { level: 1, title: "🔰 Nível 1 — Iniciante", min: 0, max: 1000 };
}
function renderAvatarSelector() {
const grid = $("regAvatarGrid");
if (!grid) return;
const custom = isPhotoAvatar(selectedRegAvatar);
grid.innerHTML = `<div class="col-span-6 mb-1">
<button type="button" onclick="triggerPhotoUpload('register')" class="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed ${custom ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/5'} flex items-center justify-center gap-2 text-xs font-extrabold btn-tap">
${custom ? `<img src="${selectedRegAvatar}" class="w-8 h-8 rounded-xl object-cover" /> <span class="text-emerald-500">✅ Foto Selecionada</span>` : `<span>📸 Enviar Foto da Galeria / PC</span>`}
</button></div>` + AVATAR_LIST.map(ic => `<button type="button" onclick="selectRegAvatar('${ic}')" class="avatar-option p-2 rounded-2xl border-2 subtle-box text-xl flex items-center justify-center ${ic === selectedRegAvatar ? 'selected' : ''}">${ic}</button>`).join("");
}
function selectRegAvatar(ic) { playTabClickSound(); selectedRegAvatar = ic; renderAvatarSelector(); }
function openAvatarModal() {
playTabClickSound();
if (!currentUserKey || !users[currentUserKey]) return;
const cur = users[currentUserKey].avatar || "🍔";
$("changeAvatarGrid").innerHTML = `<div class="col-span-4 mb-1">
<button type="button" onclick="triggerPhotoUpload('profile')" class="w-full py-3 rounded-2xl text-slate-950 font-black text-xs btn-anim-yellow flex items-center justify-center gap-2">📸 Escolher Foto da Galeria / PC</button>
</div>` + AVATAR_LIST.map(ic => `<button type="button" onclick="changeUserAvatar('${ic}')" class="p-3 rounded-2xl border-2 ${ic === cur ? 'border-red-600 bg-red-500/15' : 'subtle-box'} text-2xl flex items-center justify-center btn-tap">${ic}</button>`).join("");
$("avatarPickerModal").classList.remove("hidden");
}
function closeAvatarModal() { playTabClickSound(); $("avatarPickerModal").classList.add("hidden"); }
function changeUserAvatar(ic) {
playTabClickSound();
if (!currentUserKey || !users[currentUserKey]) return;
users[currentUserKey].avatar = ic; users[currentUserKey].updatedAt = Date.now();
closeAvatarModal(); scheduleCloudSync(currentUserKey, true);
}
function switchAuthTab(mode) {
playTabClickSound(); $("authError").classList.add("hidden");
$("loginForm").classList.toggle("hidden", mode !== "login");
$("registerForm").classList.toggle("hidden", mode === "login");
$("tabLoginBtn").className = mode === "login" ? "flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-[#DA291C] text-white" : "flex-1 py-2.5 text-xs font-extrabold rounded-xl text-muted-pro";
$("tabRegisterBtn").className = mode !== "login" ? "flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-[#DA291C] text-white" : "flex-1 py-2.5 text-xs font-extrabold rounded-xl text-muted-pro";
}
function showAuthError(msg) { playWrongAnswerSound(); const e = $("authError"); e.textContent = msg; e.classList.remove("hidden"); }
function handleRegister() {
const name = $("regName").value.trim().toUpperCase(), role = $("regRole").value, pass = $("regPass").value.trim();
if (name.length < 2) return showAuthError("Digite seu nome válido.");
if (pass.length < 4) return showAuthError("A senha precisa ter pelo menos 4 dígitos.");
const key = name.toLowerCase();
users[key] = {
name, role, avatar: selectedRegAvatar, password: pass, _deleted: false,
xp: users[key] && !users[key]._deleted ? (users[key].xp || 0) : 0,
correctAnswers: users[key] && !users[key]._deleted ? (users[key].correctAnswers || 0) : 0,
hearts: 5, heartsLockUntil: 0, mistakes: users[key]?.mistakes || [],
quizStreak: users[key]?.quizStreak || 0, quizStreakUpdatedAt: users[key]?.quizStreakUpdatedAt || 0,
quizRotation:users[key]?.quizRotation, xpLedger:users[key] && !users[key]._deleted ? users[key].xpLedger : undefined,
ventureArena:users[key] && !users[key]._deleted ? users[key].ventureArena : undefined,
ventureMonthlyLeague:users[key] && !users[key]._deleted ? users[key].ventureMonthlyLeague : undefined,
pendingXpRewards:users[key] && !users[key]._deleted ? users[key].pendingXpRewards : undefined,
missionProgress:users[key]?.missionProgress, profilePremium:users[key]?.profilePremium, trainerChallenges:users[key]?.trainerChallenges || {}, duelRewards:users[key]?.duelRewards || {}, practicalAssessments:users[key]?.practicalAssessments, dailyChest:users[key]?.dailyChest, lastSeen: Date.now(), updatedAt: Date.now()
};
currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
recoverPendingXpRewards(key);
$("authModal").classList.add("hidden"); playHitSuccessSound();
restoreQuizStreak(); syncActiveUserHeartsState(); loadNextQuizQuestion(); scheduleCloudSync(key, true);
}
async function handleLogin() {
  const rawName = $("loginName").value.trim();
  const pass = $("loginPass").value.trim();
  if (!rawName) return showAuthError("Digite seu nome para entrar!");
  const key = rawName.toLowerCase();
  const btn = $("btnLoginSubmit");
  btn.textContent = "ENTRANDO...";
  btn.disabled = true;
  if (!users[key]) {
    await fetchCloudHistorySafe(true);
  }
  btn.textContent = "ENTRAR NO TREINAMENTO 🚀";
  btn.disabled = false;
  if (pass === ADMIN_SECRET_PASS) {
    if (!users[key]) {
      users[key] = {
        name: rawName.toUpperCase(),
        role: "Treinador",
        avatar: "👑",
        password: pass,
        xp: 0,
        correctAnswers: 0,
        hearts: 5,
        heartsLockUntil: 0,
        mistakes: [],
        lastSeen: Date.now(),
        updatedAt: Date.now()
      };
    }
    users[key]._deleted = false;
    currentUserKey = key;
    localStorage.setItem(STORAGE_CURRENT_KEY, key);
    recoverPendingXpRewards(key);
    $("authModal").classList.add("hidden");
    playHitSuccessSound();
    restoreQuizStreak();
    syncActiveUserHeartsState();
    loadNextQuizQuestion();
    scheduleCloudSync(key, true);
    return;
  }
  if (!users[key] || users[key]._deleted) {
    return showAuthError("Conta não encontrada neste aparelho! Clique em 'CRIAR CONTA' acima (ou use a senha ADM).");
  }
  if (users[key].password && users[key].password !== pass) {
    return showAuthError("Senha incorreta! Tente novamente.");
  }
  currentUserKey = key;
  localStorage.setItem(STORAGE_CURRENT_KEY, key);
  recoverPendingXpRewards(key);
  $("authModal").classList.add("hidden");
  playHitSuccessSound();
  restoreQuizStreak();
  syncActiveUserHeartsState();
  loadNextQuizQuestion();
  scheduleCloudSync(key, true);
}
function logoutUser() {
  playTabClickSound();
  currentUserKey = null;
  currentStreak = 0;
  const streakDisplay = $("statStreakDisplay");
  if (streakDisplay) streakDisplay.textContent = "0 🔥";
  if (isTrainerUnlocked) lockTrainerCenter();
  localStorage.removeItem(STORAGE_CURRENT_KEY);
  $("loginPass").value = "";
  $("authModal").classList.remove("hidden");
}
function addXp(amount, transactionId = null, metadata = {}) {
  if (!currentUserKey || !users[currentUserKey] || users[currentUserKey]._deleted) return 0;
  const user = users[currentUserKey];
  const baseAmount = Number(amount) || 0;
  if (!(baseAmount > 0)) return 0;
  const calculated = Number(xpForReward(baseAmount));
  const awarded = Number.isFinite(calculated) ? Math.min(XP_LEDGER_MAX_DELTA, Math.max(0, Math.round(calculated))) : 0;
  if (!awarded) return 0;
  const oldXp = xpSafeInteger(user.xp);
  const oldLedger = user.xpLedger ? JSON.parse(JSON.stringify(user.xpLedger)) : undefined;
  const oldPending = user.pendingXpRewards ? JSON.parse(JSON.stringify(user.pendingXpRewards)) : undefined;
  const oldUpdatedAt = user.updatedAt;
  const ledger = xpLedgerEnsure(user);
  const balanceBeforeAward = xpSafeInteger(user.xp);
  const txId = String(transactionId || createXpEventId("reward")).trim().slice(0, 200);
  if (!txId) return 0;
  if (!ledger.transactions[txId] && user.pendingXpRewards && user.pendingXpRewards[txId]) {
    // Não recalcula o valor de uma intenção já gravada, mesmo se o XP x2 mudou.
    recoverPendingXpRewards(currentUserKey);
    return 0;
  }
  if (ledger.transactions[txId]) {
    if (user.pendingXpRewards && user.pendingXpRewards[txId]) {
      delete user.pendingXpRewards[txId];
      if (!Object.keys(user.pendingXpRewards).length) delete user.pendingXpRewards;
      if (persistXpMutation()) scheduleCloudSync(currentUserKey, false);
    } else if (oldXp !== user.xp || JSON.stringify(oldLedger || null) !== JSON.stringify(user.xpLedger || null)) {
      if (persistXpMutation()) scheduleCloudSync(currentUserKey, false);
    }
    return 0;
  }
  const now = Date.now();
  const source = String(metadata && metadata.source || "legacy-reward").slice(0, 80);
  const transaction = { delta: awarded, source, createdAt: now, absorbed: false };
  const pendingRecord = { id: txId, delta: awarded, source, createdAt: now,
    baseAmount: Math.min(XP_LEDGER_MAX_DELTA, Math.max(0, Math.round(baseAmount))),
    multiplier: Math.max(1, Math.min(10, Number(calculated / baseAmount) || 1)) };
  // Write-ahead intent: se a página fechar entre a intenção e o crédito, o próximo
  // login recupera esta recompensa sem recalcular o multiplicador nem duplicar o XP.
  user.pendingXpRewards = { ...xpPlainObject(user.pendingXpRewards), [txId]: pendingRecord };
  if (!persistXpMutation()) {
    user.xp = oldXp;
    if (oldLedger === undefined) delete user.xpLedger; else user.xpLedger = oldLedger;
    if (oldPending === undefined) delete user.pendingXpRewards; else user.pendingXpRewards = oldPending;
    user.updatedAt = oldUpdatedAt;
    return 0;
  }
  // Segunda gravação é atômica no localStorage: evento aplicado e intenção removida juntos.
  ledger.transactions[txId] = transaction;
  ledger.updatedAt = now;
  user.xpLedger = ledger;
  user.xp = xpLedgerTotal(ledger);
  user.updatedAt = Math.max(Number(user.updatedAt) || 0, now);
  delete user.pendingXpRewards[txId];
  if (!Object.keys(user.pendingXpRewards).length) delete user.pendingXpRewards;
  if (!persistXpMutation()) {
    // A intenção da primeira gravação continua salva; deixa a recuperação concluir o crédito.
    user.xpLedger = JSON.parse(JSON.stringify(ledger));
    delete user.xpLedger.transactions[txId];
    user.xp = balanceBeforeAward;
    user.pendingXpRewards = { ...xpPlainObject(user.pendingXpRewards), [txId]: pendingRecord };
    user.updatedAt = oldUpdatedAt;
    return 0;
  }
  const credited = Math.max(0, user.xp - balanceBeforeAward);
  backupKnownScores(users);
  showXpToast(credited);
  const oldLevel = getLevelInfo(balanceBeforeAward).level;
  const newLevel = getLevelInfo(user.xp).level;
  if (newLevel > oldLevel) playMcDonaldsJingle();
  else playHitSuccessSound();
  scheduleCloudSync(currentUserKey, false);
  return credited;
}
function reconcileXpRewardMarkers(user) {
  if (!user || !xpLedgerIsValid(user.xpLedger)) return false;
  let changed = false;
  const ledger = user.xpLedger;
  Object.entries(xpPlainObject(ledger.transactions)).forEach(([id, tx]) => {
    if (!tx || typeof tx !== "object") return;
    const source = String(tx.source || "");
    const at = xpSafeInteger(tx.createdAt) || Date.now();
    if (source === "mission" && id.startsWith("mission:")) {
      const progress = user.missionProgress;
      if (progress && typeof progress === "object") {
        if (!progress.claims || typeof progress.claims !== "object" || Array.isArray(progress.claims)) progress.claims = {};
        const claimId = id.slice("mission:".length);
        if (!progress.claims[claimId]) { progress.claims[claimId] = at; changed = true; }
      }
    } else if (source === "trainer-challenge" && id.startsWith("trainer-challenge:")) {
      const challengeId = id.slice("trainer-challenge:".length);
      const progress = user.trainerChallenges && user.trainerChallenges[challengeId];
      if (progress && !progress.claimedAt && Number(progress.count) >= 1) { progress.claimedAt = at; changed = true; }
    } else if (source === "daily-chest" && id.startsWith("daily-chest:")) {
      const day = id.slice("daily-chest:".length);
      const claim = user.dailyChest?.claims?.[day];
      if (claim && claim.kind === "xp" && claim.status === "pending") {
        claim.status = "claimed"; claim.claimedAt = at; claim.awardedXp = Number(tx.delta) || 0; changed = true;
      }
    } else if (source === "duel-win" && id.startsWith("duel-win:")) {
      const body = id.slice("duel-win:".length), splitAt = body.lastIndexOf(":");
      if (splitAt > 0) {
        const duelId = body.slice(0, splitAt);
        if (!user.duelRewards || typeof user.duelRewards !== "object" || Array.isArray(user.duelRewards)) user.duelRewards = {};
        if (!user.duelRewards[duelId]) { user.duelRewards[duelId] = at; changed = true; }
      }
    } else if (source === "arena-question" && id.startsWith("arena:") && user.ventureArena?.activeSession) {
      const session = user.ventureArena.activeSession;
      let found = false;
      Object.values(xpPlainObject(session.answers)).forEach(answer => {
        if (answer && answer.rewardId === id) {
          found = true;
          if (Number(answer.xp) !== Number(tx.delta) || answer.rewardPending) {
            answer.xp = Number(tx.delta) || 0; answer.rewardPending = false; changed = true;
          }
        }
      });
      if (found) {
        session.xpLedgerVersion = 1;
        const answerXp = Object.values(xpPlainObject(session.answers)).reduce((sum, answer) => sum + Math.max(0, Number(answer?.xp) || 0), 0);
        session.xpEarned = answerXp + Math.max(0, Number(session.completionBonusXp) || 0);
      }
    } else if (source === "arena-completion") {
      const match = /^arena:(\d{4}-\d{2}-\d{2}):completion$/.exec(id);
      if (match && user.ventureArena && typeof user.ventureArena === "object") {
        const day = match[1], arena = user.ventureArena;
        if (!arena.dailyClaims || typeof arena.dailyClaims !== "object" || Array.isArray(arena.dailyClaims)) arena.dailyClaims = {};
        const oldClaim = arena.dailyClaims[day];
        if (!oldClaim || oldClaim.status === "pending") {
          arena.dailyClaims[day] = { ...(oldClaim || {}), claimedAt: at, rewardXp: 50, kind: "daily-completion",
            status: "claimed", rewardId: id, awardedXp: Number(tx.delta) || 0 };
          changed = true;
        }
        const session = arena.activeSession;
        if (session && session.day === day && Number(session.xpLedgerVersion) === 1) {
          if (Number(session.completionBonusXp) !== Number(tx.delta)) changed = true;
          session.completionBonusXp = Number(tx.delta) || 0;
          const answerXp = Object.values(xpPlainObject(session.answers)).reduce((sum, answer) => sum + Math.max(0, Number(answer?.xp) || 0), 0);
          session.xpEarned = answerXp + session.completionBonusXp;
        }
      }
    }
  });
  return changed;
}
function recoverPendingXpRewards(key = currentUserKey) {
  if (!key || !users[key] || users[key]._deleted) return 0;
  const user = users[key];
  const pending = xpPlainObject(user.pendingXpRewards);
  const entries = Object.entries(pending);
  if (!entries.length && !xpLedgerIsValid(user.xpLedger)) return 0;
  const oldUserXp = user.xp;
  const oldLedger = user.xpLedger ? JSON.parse(JSON.stringify(user.xpLedger)) : undefined;
  const oldPending = user.pendingXpRewards ? JSON.parse(JSON.stringify(user.pendingXpRewards)) : undefined;
  const oldUpdatedAt = user.updatedAt;
  const oldMarkers = {
    missionProgress: user.missionProgress ? JSON.parse(JSON.stringify(user.missionProgress)) : undefined,
    trainerChallenges: user.trainerChallenges ? JSON.parse(JSON.stringify(user.trainerChallenges)) : undefined,
    dailyChest: user.dailyChest ? JSON.parse(JSON.stringify(user.dailyChest)) : undefined,
    duelRewards: user.duelRewards ? JSON.parse(JSON.stringify(user.duelRewards)) : undefined,
    ventureArena: user.ventureArena ? JSON.parse(JSON.stringify(user.ventureArena)) : undefined
  };
  const ledgerBefore = JSON.stringify(user.xpLedger || null);
  const ledger = xpLedgerEnsure(user);
  let recovered = 0, changed = JSON.stringify(user.xpLedger || null) !== ledgerBefore;
  entries.forEach(([rawId, raw]) => {
    if (!raw || typeof raw !== "object") { delete pending[rawId]; changed = true; return; }
    const id = String(rawId).slice(0, 200);
    if (ledger.transactions[id]) { delete pending[rawId]; changed = true; return; }
    const delta = Number(raw.delta);
    if (!Number.isFinite(delta) || delta <= 0 || delta > XP_LEDGER_MAX_DELTA) return;
    ledger.transactions[id] = { delta: Math.round(delta), source: String(raw.source || "recovered-reward").slice(0, 80),
      createdAt: xpSafeInteger(raw.createdAt) || Date.now(), absorbed: false };
    delete pending[rawId]; changed = true; recovered++;
  });
  user.xpLedger = ledger;
  user.xp = xpLedgerTotal(ledger);
  if (Object.keys(pending).length) user.pendingXpRewards = pending; else delete user.pendingXpRewards;
  if (reconcileXpRewardMarkers(user)) changed = true;
  if (changed || user.xp !== oldUserXp) {
    ledger.updatedAt = Date.now(); user.updatedAt = Math.max(Number(user.updatedAt) || 0, Date.now());
    if (persistXpMutation()) { backupKnownScores(users); scheduleCloudSync(key, false); }
    else {
      user.xp = oldUserXp;
      if (oldLedger === undefined) delete user.xpLedger; else user.xpLedger = oldLedger;
      if (oldPending === undefined) delete user.pendingXpRewards; else user.pendingXpRewards = oldPending;
      user.updatedAt = oldUpdatedAt;
      Object.entries(oldMarkers).forEach(([field, value]) => { if (value === undefined) delete user[field]; else user[field] = value; });
      recovered = 0;
    }
  }
  return recovered;
}

function updateHeaderUI() {
  if (!currentUserKey || !users[currentUserKey]) return;
  const u = users[currentUserKey];
  const info = getLevelInfo(u.xp || 0);
  const avatarEl = $("userAvatarDisplay");
  if (avatarEl) {
    if (isPhotoAvatar(u.avatar)) {
      avatarEl.innerHTML = `<img src="${u.avatar}" alt="Foto" class="w-full h-full object-cover" />`;
    } else {
      avatarEl.textContent = u.avatar || "🍔";
    }
  }
  $("userNameDisplay").textContent = u.name;
  $("userRoleBadge").textContent = u.role || u.station || "Atendente";
  $("userXpDisplay").textContent = `${u.xp || 0} XP`;
  $("userRankTitle").textContent = info.title;
  $("currentLevelNum").textContent = `Nível ${info.level}`;
  $("statHitsDisplay").textContent = `${u.correctAnswers || 0} ✅`;
  const progress = Math.min(100, Math.round((((u.xp || 0) - info.min) / (info.max - info.min)) * 100));
  $("xpProgressBar").style.width = `${Math.max(6, progress)}%`;
  if (info.level < 7) {
    $("nextLevelTarget").textContent = `Faltam ${info.max - (u.xp || 0)} XP para o Nível ${info.level + 1}`;
  } else {
    $("nextLevelTarget").textContent = `Patente Máxima Alcançada! 👑`;
  }
}
// =========================================================================
// CADERNO "REVISAR MINHAS DÚVIDAS"
// =========================================================================
