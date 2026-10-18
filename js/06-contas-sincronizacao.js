/* Venture 8.8 · js/06-contas-sincronizacao.js · arquivo carregado na ordem indicada no HTML. */
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
async function captureAndShareRankingImage() {
playTabClickSound();
const printArea = $("rankingPrintArea"), btn = $("btnPrintRanking");
if (!printArea || typeof html2canvas === "undefined") return shareMyScoreWhatsApp();
const orig = btn.innerHTML;
btn.innerHTML = `<span>⏳ Gerando Print...</span>`; btn.disabled = true;
try {
const canvas = await html2canvas(printArea, { scale: 2, useCORS: true, backgroundColor: document.body.classList.contains("dark-mode") ? "#131b2e" : "#ffffff" });
canvas.toBlob(async blob => {
btn.innerHTML = orig; btn.disabled = false;
if (!blob) return;
const file = new File([blob], "Ranking_Olimpiadas_Mequi.png", { type: "image/png" });
const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
const top3 = list.slice(0, 3).map((u, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${u.name}: ${u.xp || 0} XP`).join("\n");
const caption = `🏆 *RANKING OFICIAL — OLIMPÍADAS DO BÁSICO (FINALIZA 25/10)*\n\n${top3}\n\n🔗 Link: ${window.location.origin}${window.location.pathname}`;
if (navigator.canShare && navigator.canShare({ files: [file] })) {
try { await navigator.share({ files: [file], title: "Ranking Méqui", text: caption }); return; } catch (e) {}
}
const a = document.createElement("a"); a.download = "Ranking_Olimpiadas_Mequi.png"; a.href = URL.createObjectURL(blob); a.click();
window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank");
}, "image/png");
} catch (e) { btn.innerHTML = orig; btn.disabled = false; shareMyScoreWhatsApp(); }
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
function startHeartbeat() {
if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
heartbeatIntervalId = setInterval(() => {
if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
users[currentUserKey].lastSeen = Date.now();
scheduleCloudSync(currentUserKey, false);
}
}, 10000);
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
function mergeSingleUser(ex, inc) {
if (!ex) return inc;
const streak = mergeQuizStreak(ex, inc);
const quizRotation = mergeQuizRotation(ex, inc);
if ((inc.adminOverrideAt || 0) > (ex.adminOverrideAt || 0)) return { ...inc, ...streak, quizRotation, missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium), trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards}, practicalAssessments:mergePracticalAssessments(ex.practicalAssessments,inc.practicalAssessments), dailyChest:mergeDailyChest(ex.dailyChest,inc.dailyChest) };
if ((ex.adminOverrideAt || 0) > (inc.adminOverrideAt || 0)) return { ...ex, ...streak, quizRotation, missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium), trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards}, practicalAssessments:mergePracticalAssessments(ex.practicalAssessments,inc.practicalAssessments), dailyChest:mergeDailyChest(ex.dailyChest,inc.dailyChest) };
if (inc._deleted && (inc.updatedAt || 0) >= (ex.updatedAt || 0)) return { ...inc, ...streak, quizRotation, missionProgress:mergeMissionProgress(ex.missionProgress,inc.missionProgress), profilePremium:mergeProfilePremium(ex.profilePremium,inc.profilePremium), trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges), duelRewards:{...ex.duelRewards,...inc.duelRewards}, practicalAssessments:mergePracticalAssessments(ex.practicalAssessments,inc.practicalAssessments), dailyChest:mergeDailyChest(ex.dailyChest,inc.dailyChest) };
const newer = (inc.updatedAt || 0) >= (ex.updatedAt || 0);
return {
...ex, ...inc, ...streak, quizRotation, _deleted: false,
role: inc.role || ex.role || "Atendente",
avatar: (newer && inc.avatar) ? inc.avatar : (ex.avatar || inc.avatar || "🍔"),
xp: Math.max(ex.xp || 0, inc.xp || 0),
correctAnswers: Math.max(ex.correctAnswers || 0, inc.correctAnswers || 0),
hearts: newer && inc.hearts !== undefined ? inc.hearts : (ex.hearts !== undefined ? ex.hearts : 5),
heartsLockUntil: newer && inc.heartsLockUntil !== undefined ? inc.heartsLockUntil : (ex.heartsLockUntil || 0),
mistakes: newer && Array.isArray(inc.mistakes) ? inc.mistakes : (Array.isArray(ex.mistakes) ? ex.mistakes : []),
missionProgress: mergeMissionProgress(ex.missionProgress,inc.missionProgress),
profilePremium: mergeProfilePremium(ex.profilePremium,inc.profilePremium),
trainerChallenges:mergeTrainerChallenges(ex.trainerChallenges,inc.trainerChallenges),
duelRewards:{...ex.duelRewards,...inc.duelRewards}, practicalAssessments:mergePracticalAssessments(ex.practicalAssessments,inc.practicalAssessments), dailyChest:mergeDailyChest(ex.dailyChest,inc.dailyChest),
lastSeen: Math.max(ex.lastSeen || 0, inc.lastSeen || 0),
updatedAt: Math.max(ex.updatedAt || 0, inc.updatedAt || 0)
};
}
function mergeUserDictionaries(loc, rem) {
const m = { ...loc };
if (rem && typeof rem === "object") {
Object.keys(rem).forEach(k => { if (rem[k] && rem[k].name) m[k] = mergeSingleUser(m[k], rem[k]); });
}
return m;
}
function refreshUIIfNeeded() {
restoreQuizStreak();
updateHeaderUI(); syncActiveUserHeartsState(); updateMistakesBadge(); populateDuelOpponentList(); renderDuelHistory(); renderMissionHub(); renderTrainerPublicContent(); if(isTrainerUnlocked)renderPracticalTrainerRoster(); renderPremiumProfile(); renderDailyChest(); if (publicProfileSelectedKey) renderPublicProfile();
const sorted = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
const hash = JSON.stringify(sorted.map(u => `${u.name}:${u.xp}:${u.correctAnswers}:${(u.avatar || "").slice(-15)}:${u.role}:${u.lastSeen || 0}:${u.profilePremium?.updatedAt||0}:${Object.keys(u.missionProgress?.badges||{}).length}:${Object.keys(u.practicalAssessments?.records||{}).length}`));
if (hash !== lastLeaderboardHash) { lastLeaderboardHash = hash; renderLeaderboard(); }
if (isAdminUnlocked && hash !== lastAdminListHash) { lastAdminListHash = hash; renderAdminUsersList(); }
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
users = mergeUserDictionaries(users, data);
localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
refreshUIIfNeeded();
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
function scheduleCloudSync(keyToPush, immediate = false) {
backupKnownScores(users);
localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
refreshUIIfNeeded();
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
if (d.type === "single" && d.k && d.u) users[d.k] = mergeSingleUser(users[d.k], d.u);
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
quizRotation:users[key]?.quizRotation, missionProgress:users[key]?.missionProgress, profilePremium:users[key]?.profilePremium, trainerChallenges:users[key]?.trainerChallenges || {}, duelRewards:users[key]?.duelRewards || {}, practicalAssessments:users[key]?.practicalAssessments, dailyChest:users[key]?.dailyChest, lastSeen: Date.now(), updatedAt: Date.now()
};
currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
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
function addXp(amount) {
  if (!currentUserKey || !users[currentUserKey]) return 0;
  const awarded = xpForReward(amount);
  const oldXp = users[currentUserKey].xp || 0;
  const newXp = Math.max(0, oldXp + awarded);
  users[currentUserKey].xp = newXp;
  users[currentUserKey].updatedAt = Date.now();
  showXpToast(newXp-oldXp);
  const oldLevel = getLevelInfo(oldXp).level;
  const newLevel = getLevelInfo(newXp).level;
  if (newLevel > oldLevel) {
    playMcDonaldsJingle();
  } else {
    playHitSuccessSound();
  }
  scheduleCloudSync(currentUserKey, false);
  return newXp - oldXp;
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
