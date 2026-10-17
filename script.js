/* =========================================================================
   OLIMPÍADAS DO BÁSICO — VENTURE (script.js v7.8 MODULAR COMPLETO)
   Requer questions.js carregado antes no index.html
   ========================================================================= */

const $ = id => document.getElementById(id);
const AVATAR_LIST = ["🍔", "🍟", "🍦", "🔥", "👨‍🍳", "👑", "⚡", "🏆", "🚀", "🥤", "🥓", "🎯"];
let selectedRegAvatar = "🍔";

// Data Oficial de Encerramento: 25/10/2026 às 23:59:59
const EVENT_END_TIMESTAMP = new Date("2026-10-25T23:59:59-03:00").getTime();

const STORAGE_USERS_KEY = "mequi_olimpiadas_users_v6";
const STORAGE_CURRENT_KEY = "mequi_olimpiadas_active_user_v6";
const STORAGE_THEME_KEY = "mequi_olimpiadas_theme_v7";
const STORAGE_DUEL_HISTORY = "mequi_olimpiadas_duel_history_v75";
const ADMIN_SECRET_PASS = "342005";
const HEARTS_COOLDOWN_MS = 10 * 60 * 1000;
const SYNC_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v65_cluster_state";
const DUEL_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v71_live_duels";
const CLOUD_HTTP_URL = "https://ntfy.sh/mequi_venture_olimpiadas_2026_v63_store";

let mqttClients = [], users = {}, currentUserKey = localStorage.getItem(STORAGE_CURRENT_KEY) || null;
let currentBookFilter = "ALL", currentStreak = 0, currentHearts = 5, currentQuizQuestionId = null, isAdminUnlocked = false;
let searchDebounceTimer = null, cloudSyncQueueTimer = null, cooldownIntervalId = null, heartbeatIntervalId = null;
let lastLeaderboardHash = "", lastAdminListHash = "", lastHttpFetchTime = 0;
let pendingDuelInvite = null, activeDuel = null, currentReviewItem = null, photoUploadTarget = "register";
let duelHistoryList = JSON.parse(localStorage.getItem(STORAGE_DUEL_HISTORY) || "[]");
let activeRecipe = (typeof KITCHEN_RECIPES !== "undefined" && KITCHEN_RECIPES[0]) ? KITCHEN_RECIPES[0] : null;
let currentRecipeStep = 0;

// =========================================================================
// 🎵 MOTOR DE ÁUDIO (JINGLE + CLIQUES + ERRO + GIRO 3D)
// =========================================================================
let globalAudioCtx = null;
function getAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!globalAudioCtx) globalAudioCtx = new Ctx();
  if (globalAudioCtx.state === "suspended") globalAudioCtx.resume();
  return globalAudioCtx;
}
document.addEventListener("click", getAudio, { once: true });
document.addEventListener("touchstart", getAudio, { once: true });

function playTone(notes, type = "triangle", vol = 0.4) {
  try {
    const ctx = getAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    notes.forEach(n => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(n.f, now + (n.s || 0));
      if (n.fEnd) osc.frequency.exponentialRampToValueAtTime(n.fEnd, now + (n.s || 0) + n.d);
      gain.gain.setValueAtTime(vol, now + (n.s || 0));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (n.s || 0) + n.d);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + (n.s || 0)); osc.stop(now + (n.s || 0) + n.d + 0.02);
    });
  } catch (e) {}
}

function playMcDonaldsJingle() {
  const seq = [{ f: 523.25, s: 0, d: 0.16 }, { f: 587.33, s: 0.19, d: 0.16 }, { f: 659.25, s: 0.38, d: 0.2 }, { f: 880, s: 0.65, d: 0.26 }, { f: 783.99, s: 0.96, d: 0.65 }];
  playTone(seq, "triangle", 0.7);
  playTone(seq.map(x => ({ ...x, f: x.f * 2 })), "sine", 0.22);
}
function playHitSuccessSound() { playTone([{ f: 587.33, s: 0, d: 0.09 }, { f: 880, s: 0.08, d: 0.22 }], "sine", 0.45); }
function playWrongAnswerSound() { playTone([{ f: 220, s: 0, d: 0.14 }, { f: 155, s: 0.16, d: 0.24 }], "sawtooth", 0.32); }
function playTabClickSound() { playTone([{ f: 520, fEnd: 880, s: 0, d: 0.06 }], "triangle", 0.28); }
function playCardFlipSound() { playTone([{ f: 260, fEnd: 620, s: 0, d: 0.12 }], "sine", 0.32); }

// =========================================================================
// ⏳ CRONÔMETRO DE FINALIZAÇÃO (25/10) + 🍔 SISTEMA DE COZINHA
// =========================================================================
function injectCountdownAndKitchenUI() {
  const themeBtn = $("themeToggleBtn");
  if (themeBtn && !$("soundTestBtn")) {
    const sb = document.createElement("button");
    sb.id = "soundTestBtn"; sb.title = "Tocar Jingle"; sb.innerHTML = "🔊";
    sb.className = "bg-slate-950/30 hover:bg-slate-950/45 w-9 h-9 rounded-2xl flex items-center justify-center text-sm border border-white/15 btn-tap";
    sb.onclick = playMcDonaldsJingle;
    themeBtn.parentNode.insertBefore(sb, themeBtn);
  }

  const mainEl = document.querySelector("main");
  if (mainEl && !$("countdownBannerTop")) {
    const banner = document.createElement("div");
    banner.id = "countdownBannerTop";
    banner.className = "pro-card rounded-3xl p-3.5 mb-4 border-2 border-[#FFC72C] flex items-center justify-between gap-2 shadow-md";
    banner.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="text-2xl float-slow">🏁</span>
        <div>
          <span class="text-[10px] font-black uppercase text-red-500 tracking-wider block">Finalização Oficial • 25/10</span>
          <p class="font-black text-xs">Reta Final da Caneca Oficial Méqui ☕</p>
        </div>
      </div>
      <div id="countdownTimerText" class="gold-gradient text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm shrink-0">--d --h --m</div>
    `;
    mainEl.insertBefore(banner, mainEl.firstChild);
  }

  const printArea = $("rankingPrintArea");
  if (printArea && !$("rankingPrintCountdown")) {
    const pb = document.createElement("div");
    pb.id = "rankingPrintCountdown";
    pb.className = "subtle-box rounded-2xl p-2.5 text-center text-xs font-black border border-amber-500/40";
    pb.innerHTML = `⏳ Encerramento Oficial: <span class="text-red-500">25/10</span> • <span id="printCountdownSpan">--</span>`;
    printArea.insertBefore(pb, printArea.children[1]);
  }

  const tabQuiz = $("tab-quiz");
  if (tabQuiz && !$("kitchenSystemCard") && typeof KITCHEN_RECIPES !== "undefined") {
    const kitchenCard = document.createElement("div");
    kitchenCard.id = "kitchenSystemCard";
    kitchenCard.className = "pro-card rounded-3xl p-5 border-2 border-red-500/40 space-y-3";
    kitchenCard.innerHTML = `
      <div class="flex items-center justify-between gap-2 border-b border-slate-500/20 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-11 h-11 rounded-2xl mc-gradient text-[#FFC72C] flex items-center justify-center text-2xl font-black shrink-0 shadow">🍔</div>
          <div>
            <span class="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Sistema de Cozinha • +30 XP</span>
            <h3 class="font-black text-sm mt-0.5">Bancada Monta-Lanche (Linha 49°C a 57°C)</h3>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <select id="kitchenRecipeSelect" onchange="selectKitchenRecipe(this.value)" class="flex-1 px-3 py-2 rounded-xl subtle-box text-xs font-extrabold focus:outline-none">
          ${KITCHEN_RECIPES.map(r => `<option value="${r.id}">${r.name}</option>`).join("")}
        </select>
        <button onclick="resetKitchenGame()" class="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 font-black text-xs btn-tap">Reiniciar 🔄</button>
      </div>
      <div class="subtle-box p-3 rounded-2xl space-y-1.5">
        <div class="flex justify-between text-[11px] font-black">
          <span class="text-amber-500">📋 Montagem Atual (Ordem Oficial):</span>
          <span id="kitchenProgressBadge" class="text-emerald-500">0/0</span>
        </div>
        <div id="kitchenTrayBuilt" class="flex flex-wrap gap-1.5 min-h-[34px] items-center text-[11px] font-bold text-muted-pro">
          Toque no 1º ingrediente abaixo para iniciar a montagem!
        </div>
      </div>
      <div id="kitchenChoicesGrid" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
      <div id="kitchenFeedback" class="hidden p-3 rounded-2xl text-xs font-extrabold text-center"></div>
    `;
    tabQuiz.insertBefore(kitchenCard, tabQuiz.children[2]);
    initKitchenGame();
  }

  updateEventCountdown();
  setInterval(updateEventCountdown, 1000);
}

function updateEventCountdown() {
  const diff = EVENT_END_TIMESTAMP - Date.now();
  const topEl = $("countdownTimerText"), printEl = $("printCountdownSpan");
  if (diff <= 0) {
    const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
    const champ = list[0] ? list[0].name : "1º Colocado";
    if (topEl) topEl.textContent = `🏆 ENCERRADO! Campeão: ${champ}`;
    if (printEl) printEl.textContent = `ENCERRADO EM 25/10 • 🏆 Campeão(ã): ${champ}`;
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const str = `Faltam ${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (topEl) topEl.textContent = `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (printEl) printEl.textContent = str;
}

function selectKitchenRecipe(id) {
  playTabClickSound();
  activeRecipe = KITCHEN_RECIPES.find(r => r.id === id) || KITCHEN_RECIPES[0];
  resetKitchenGame();
}

function initKitchenGame() {
  if (typeof KITCHEN_RECIPES === "undefined") return;
  activeRecipe = KITCHEN_RECIPES[0];
  resetKitchenGame();
}

function resetKitchenGame() {
  currentRecipeStep = 0;
  if ($("kitchenFeedback")) $("kitchenFeedback").classList.add("hidden");
  renderKitchenState();
}

function renderKitchenState() {
  const tray = $("kitchenTrayBuilt"), badge = $("kitchenProgressBadge"), grid = $("kitchenChoicesGrid");
  if (!tray || !grid || !activeRecipe) return;
  const total = activeRecipe.steps.length;
  badge.textContent = `${currentRecipeStep}/${total} etapas`;

  tray.innerHTML = currentRecipeStep === 0
    ? `<span class="text-xs text-muted-pro">Clique nos ingredientes abaixo na sequência oficial de montagem:</span>`
    : activeRecipe.steps.slice(0, currentRecipeStep).map((st, i) =>
        `<span class="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-extrabold text-[10px]">${i + 1}. ${st} ✅</span>`
      ).join("");

  const remaining = activeRecipe.steps.slice(currentRecipeStep);
  const shuffled = [...remaining].sort(() => 0.5 - Math.random());
  grid.innerHTML = "";
  shuffled.forEach(stepName => {
    const btn = document.createElement("button");
    btn.className = "option-btn p-3 rounded-2xl font-extrabold text-xs text-left flex items-center justify-between gap-2";
    btn.innerHTML = `<span>🥗 ${stepName}</span><span class="text-[10px] text-amber-500 font-black">+</span>`;
    btn.onclick = () => handleKitchenStepClick(btn, stepName);
    grid.appendChild(btn);
  });
}

function handleKitchenStepClick(btn, chosenStep) {
  const expected = activeRecipe.steps[currentRecipeStep];
  const fb = $("kitchenFeedback");
  if (chosenStep === expected) {
    currentRecipeStep++;
    if (currentRecipeStep >= activeRecipe.steps.length) {
      renderKitchenState();
      addXp(activeRecipe.xp);
      fb.classList.remove("hidden");
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold text-center bg-emerald-500/20 text-emerald-500 border border-emerald-500/40";
      fb.innerHTML = `🎉 <strong>Padrão Ouro Best Burger!</strong> Você montou o <strong>${activeRecipe.name}</strong> perfeitamente e ganhou <strong>+${activeRecipe.xp} XP</strong>!`;
    } else {
      playCardFlipSound();
      renderKitchenState();
    }
  } else {
    playWrongAnswerSound();
    btn.className = "anim-shake-wrong p-3 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs text-left";
    fb.classList.remove("hidden");
    fb.className = "p-3 rounded-2xl text-xs font-extrabold text-center bg-red-500/15 text-red-500 border border-red-500/30";
    fb.innerHTML = `❌ Ordem incorreta! O próximo item oficial é: <span class="underline">${expected}</span>`;
  }
}

// =========================================================================
// FOTOS DA GALERIA, PRINT DO RANKING E TEMA
// =========================================================================
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

function rescuePreviousLocalRegistrations() {
  ["mequi_olimpiadas_users_v3", "mequi_olimpiadas_users_v4", "mequi_olimpiadas_users_v5", "mequi_olimpiadas_users_v6"].forEach(k => {
    try {
      const parsed = JSON.parse(localStorage.getItem(k) || "null");
      if (parsed && typeof parsed === "object") {
        Object.keys(parsed).forEach(uk => {
          const u = parsed[uk];
          if (!u || !u.name) return;
          users[uk] = mergeSingleUser(users[uk], {
            ...u, role: u.role || u.station || "Atendente", avatar: u.avatar || "🍔",
            hearts: u.hearts !== undefined ? u.hearts : 5, heartsLockUntil: u.heartsLockUntil || 0,
            mistakes: Array.isArray(u.mistakes) ? u.mistakes : [], lastSeen: u.lastSeen || 0, updatedAt: u.updatedAt || Date.now()
          });
        });
      }
    } catch (e) {}
  });
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function mergeSingleUser(ex, inc) {
  if (!ex) return inc;
  if ((inc.adminOverrideAt || 0) > (ex.adminOverrideAt || 0)) return inc;
  if ((ex.adminOverrideAt || 0) > (inc.adminOverrideAt || 0)) return ex;
  if (inc._deleted && (inc.updatedAt || 0) >= (ex.updatedAt || 0)) return inc;
  const newer = (inc.updatedAt || 0) >= (ex.updatedAt || 0);
  return {
    ...ex, ...inc, _deleted: false,
    role: inc.role || ex.role || "Atendente",
    avatar: (newer && inc.avatar) ? inc.avatar : (ex.avatar || inc.avatar || "🍔"),
    xp: Math.max(ex.xp || 0, inc.xp || 0),
    correctAnswers: Math.max(ex.correctAnswers || 0, inc.correctAnswers || 0),
    hearts: newer && inc.hearts !== undefined ? inc.hearts : (ex.hearts !== undefined ? ex.hearts : 5),
    heartsLockUntil: newer && inc.heartsLockUntil !== undefined ? inc.heartsLockUntil : (ex.heartsLockUntil || 0),
    mistakes: newer && Array.isArray(inc.mistakes) ? inc.mistakes : (Array.isArray(ex.mistakes) ? ex.mistakes : []),
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
  updateHeaderUI(); syncActiveUserHeartsState(); updateMistakesBadge(); populateDuelOpponentList(); renderDuelHistory();
  const sorted = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const hash = JSON.stringify(sorted.map(u => `${u.name}:${u.xp}:${u.correctAnswers}:${(u.avatar || "").slice(-15)}:${u.role}:${u.lastSeen || 0}`));
  if (hash !== lastLeaderboardHash) { lastLeaderboardHash = hash; renderLeaderboard(); }
  if (isAdminUnlocked && hash !== lastAdminListHash) { lastAdminListHash = hash; renderAdminUsersList(); }
}

function initClusterSync() {
  ["wss://broker.emqx.io:8084/mqtt", "wss://broker.hivemq.com:8884/mqtt"].forEach(url => {
    try {
      const client = mqtt.connect(url, { clientId: "mq78_" + Math.random().toString(16).slice(2, 10), clean: true, connectTimeout: 5000, reconnectPeriod: 6000 });
      client.on("connect", () => {
        if ($("syncStatusText")) $("syncStatusText").textContent = "● Conectado em Tempo Real (Finaliza 25/10)";
        client.subscribe(SYNC_MQTT_TOPIC); client.subscribe(DUEL_MQTT_TOPIC);
      });
      client.on("message", (topic, msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (topic === SYNC_MQTT_TOPIC) {
            users = mergeUserDictionaries(users, data);
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
            refreshUIIfNeeded();
          } else if (topic === DUEL_MQTT_TOPIC) handleIncomingDuelPacket(data);
        } catch (e) {}
      });
      mqttClients.push(client);
    } catch (e) {}
  });
}

function publishDuelPacket(pkt) {
  const p = JSON.stringify(pkt);
  mqttClients.forEach(c => { if (c && c.connected) try { c.publish(DUEL_MQTT_TOPIC, p); } catch (e) {} });
}

function scheduleCloudSync(keyToPush, immediate = false) {
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
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      refreshUIIfNeeded();
    }
  } catch (e) {}
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
  if (xp >= 6000)  return { level: 4, title: "🥇 Nível 4 — Padrão Ouro Venture", min: 6000, max: 10000 };
  if (xp >= 3000)  return { level: 3, title: "🥈 Nível 3 — Especialista de Prata", min: 3000, max: 6000 };
  if (xp >= 1000)  return { level: 2, title: "🥉 Nível 2 — Chapa de Bronze", min: 1000, max: 3000 };
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
    hearts: 5, heartsLockUntil: 0, mistakes: users[key]?.mistakes || [], lastSeen: Date.now(), updatedAt: Date.now()
  };
  currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
  $("authModal").classList.add("hidden"); playHitSuccessSound();
  syncActiveUserHeartsState(); loadNextQuizQuestion(); scheduleCloudSync(key, true);
}

async function handleLogin() {
  const rawName = $("loginName").value.trim(), pass = $("loginPass").value.trim();
  if (!rawName) return showAuthError("Digite seu nome para entrar!");
  const key = rawName.toLowerCase(), btn = $("btnLoginSubmit");
  btn.textContent = "ENTRANDO..."; btn.disabled = true;
  if (!users[key]) await fetchCloudHistorySafe(true);
  btn.textContent = "ENTRAR NO TREINAMENTO 🚀"; btn.disabled = false;

  if (pass === ADMIN_SECRET_PASS) {
    if (!users[key]) {
      users[key] = { name: rawName.toUpperCase(), role: "Treinador", avatar: "👑", password: pass, xp: 0, correctAnswers: 0, hearts: 5, heartsLockUntil: 0, mistakes: [], lastSeen: Date.now(), updatedAt: Date.now() };
    }
    users[key]._deleted = false; currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
    $("authModal").classList.add("hidden"); playHitSuccessSound();
    syncActiveUserHeartsState(); loadNextQuizQuestion(); scheduleCloudSync(key, true);
    return;
  }
  if (!users[key] || users[key]._deleted) return showAuthError("Conta não encontrada! Clique em 'CRIAR CONTA' acima.");
  if (users[key].password && users[key].password !== pass) return showAuthError("Senha incorreta!");

  currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
  $("authModal").classList.add("hidden"); playHitSuccessSound();
  syncActiveUserHeartsState(); loadNextQuizQuestion(); scheduleCloudSync(key, true);
}

function logoutUser() {
  playTabClickSound(); currentUserKey = null; localStorage.removeItem(STORAGE_CURRENT_KEY);
  $("loginPass").value = ""; $("authModal").classList.remove("hidden");
}

function addXp(amount) {
  if (!currentUserKey || !users[currentUserKey]) { playHitSuccessSound(); return; }
  const oldXp = users[currentUserKey].xp || 0, newXp = Math.max(0, oldXp + amount);
  users[currentUserKey].xp = newXp; users[currentUserKey].updatedAt = Date.now();
  showXpToast(amount);
  if (getLevelInfo(newXp).level > getLevelInfo(oldXp).level) playMcDonaldsJingle();
  else playHitSuccessSound();
  scheduleCloudSync(currentUserKey, false);
}

function updateHeaderUI() {
  if (!currentUserKey || !users[currentUserKey]) return;
  const u = users[currentUserKey], info = getLevelInfo(u.xp || 0), av = $("userAvatarDisplay");
  if (av) av.innerHTML = isPhotoAvatar(u.avatar) ? `<img src="${u.avatar}" alt="Foto" class="w-full h-full object-cover" />` : (u.avatar || "🍔");
  $("userNameDisplay").textContent = u.name;
  $("userRoleBadge").textContent = u.role || "Atendente";
  $("userXpDisplay").textContent = `${u.xp || 0} XP`;
  $("userRankTitle").textContent = info.title;
  $("currentLevelNum").textContent = `Nível ${info.level}`;
  $("statHitsDisplay").textContent = `${u.correctAnswers || 0} ✅`;
  const progress = Math.min(100, Math.round((((u.xp || 0) - info.min) / (info.max - info.min)) * 100));
  $("xpProgressBar").style.width = `${Math.max(6, progress)}%`;
  $("nextLevelTarget").textContent = info.level < 7 ? `Faltam ${info.max - (u.xp || 0)} XP para o Nível ${info.level + 1}` : `Patente Máxima Alcançada! 👑`;
}

// =========================================================================
// CADERNO "REVISAR MINHAS DÚVIDAS"
// =========================================================================
function getActiveUserMistakes() {
  if (currentUserKey && users[currentUserKey]) {
    if (!Array.isArray(users[currentUserKey].mistakes)) users[currentUserKey].mistakes = [];
    return users[currentUserKey].mistakes;
  }
  return JSON.parse(localStorage.getItem("mequi_guest_mistakes") || "[]");
}
function recordMistakeQuestion(qId) {
  const list = getActiveUserMistakes();
  if (!list.includes(qId)) { list.push(qId); saveMistakesList(list); }
}
function removeMistakeQuestion(qId) { saveMistakesList(getActiveUserMistakes().filter(id => id !== qId)); }
function saveMistakesList(list) {
  if (currentUserKey && users[currentUserKey]) {
    users[currentUserKey].mistakes = list; users[currentUserKey].updatedAt = Date.now();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else localStorage.setItem("mequi_guest_mistakes", JSON.stringify(list));
  updateMistakesBadge();
}
function updateMistakesBadge() {
  const b = $("mistakesCountBadge");
  if (!b) return;
  const c = getActiveUserMistakes().length;
  b.textContent = `${c} pendente${c === 1 ? "" : "s"}`;
  b.className = c > 0 ? "text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white" : "text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500";
}
function openReviewModal() {
  playTabClickSound();
  if (getActiveUserMistakes().length === 0) return alert("🎉 Você não tem nenhuma dúvida pendente!");
  $("reviewMistakesModal").classList.remove("hidden"); loadNextReviewQuestion();
}
function closeReviewModal() { playTabClickSound(); $("reviewMistakesModal").classList.add("hidden"); }

function loadNextReviewQuestion() {
  playTabClickSound();
  const mistakes = getActiveUserMistakes();
  if (mistakes.length === 0) { playMcDonaldsJingle(); alert("✅ Você zerou todas as suas dúvidas!"); closeReviewModal(); return; }
  const item = QUESTIONS_DB.find(q => q.id === mistakes[Math.floor(Math.random() * mistakes.length)]) || QUESTIONS_DB[0];
  $("reviewMetaBadge").textContent = `Questão #${item.id} • ${item.level}`;
  $("reviewRemainingBadge").textContent = `Faltam zerar: ${mistakes.length}`;
  $("reviewQuestionText").textContent = item.q;
  $("reviewFeedbackBox").classList.add("hidden"); $("nextReviewBtn").classList.add("hidden");
  const container = $("reviewOptionsContainer"); container.innerHTML = "";
  [...item.w, item.a].sort(() => 0.5 - Math.random()).forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `<span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${["A","B","C","D"][idx]}</span><span class="flex-1">${optText}</span>`;
    btn.onclick = () => checkReviewAnswer(btn, optText, item.a, item.id);
    container.appendChild(btn);
  });
}

function checkReviewAnswer(selectedBtn, chosen, correct, qId) {
  document.querySelectorAll("#reviewOptionsContainer button").forEach(b => b.disabled = true);
  const fb = $("reviewFeedbackBox"); fb.classList.remove("hidden");
  if (chosen === correct) {
    selectedBtn.className = "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3";
    removeMistakeQuestion(qId); playHitSuccessSound();
    fb.className = "p-3 rounded-2xl text-xs font-extrabold bg-emerald-500/15 text-emerald-500";
    fb.textContent = "✅ Aprendido! Questão removida das dúvidas!";
  } else {
    selectedBtn.className = "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
    playWrongAnswerSound();
    fb.className = "p-3 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500";
    fb.innerHTML = `❌ Gabarito oficial:<br><span class="underline mt-1 inline-block">${correct}</span>`;
  }
  $("nextReviewBtn").classList.remove("hidden");
}

// =========================================================================
// DUELO ONLINE 1 vs 1 + HISTÓRICO
// =========================================================================
function populateDuelOpponentList() {
  const select = $("duelOpponentSelect");
  if (!select) return;
  const cur = select.value, now = Date.now();
  const list = Object.entries(users).filter(([k, u]) => u && u.name && !u._deleted && k !== currentUserKey).sort((a, b) => a[1].name.localeCompare(b[1].name));
  select.innerHTML = `<option value="">Selecione quem você quer desafiar...</option>` +
    list.map(([k, u]) => `<option value="${k}">${(now - (u.lastSeen || 0)) < 25000 ? "🟢 [Online]" : "⚪ [Offline]"} ${u.name} (${u.role || 'Atendente'})</option>`).join("");
  if (cur && users[cur]) select.value = cur;
}

function sendLiveDuelInvite() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) return alert("Faça login antes de desafiar alguém!");
  const targetKey = $("duelOpponentSelect").value;
  if (!targetKey || !users[targetKey]) return alert("Selecione qual colega você quer desafiar!");
  const me = users[currentUserKey], opp = users[targetKey], duelId = "duel_" + Date.now();
  activeDuel = { duelId, isHost: true, hostKey: currentUserKey, hostName: me.name, hostAvatar: me.avatar || "🍔", guestKey: targetKey, guestName: opp.name, guestAvatar: opp.avatar || "🍟", scoreHost: 0, scoreGuest: 0, round: 0, status: "waiting" };
  openDuelArenaUI();
  $("duelWaitingBox").classList.remove("hidden"); $("duelQuestionArea").classList.add("hidden"); $("duelWinnerBox").classList.add("hidden");
  $("duelWaitingText").textContent = `Aguardando ${opp.name} aceitar no celular dele(a)...`;
  publishDuelPacket({ type: "invite", ...activeDuel });
}

function sendDuelInviteWhatsApp() {
  playTabClickSound();
  if (!activeDuel) return;
  const text = `⚔️ *DESAFIO 1 vs 1 — OLIMPÍADAS DO BÁSICO*\n🔥 *${activeDuel.hostName}* está te chamando para um Duelo ao vivo!\n📲 Acesse: ${window.location.origin}${window.location.pathname}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

function handleIncomingDuelPacket(pkt) {
  if (!pkt || !pkt.type) return;
  if (pkt.type === "invite" && pkt.guestKey === currentUserKey && !activeDuel) {
    pendingDuelInvite = pkt; playHitSuccessSound();
    $("inviteFromNameDisplay").textContent = pkt.hostName; $("duelInvitePopup").classList.remove("hidden");
    return;
  }
  if (!activeDuel || pkt.duelId !== activeDuel.duelId) return;
  if (pkt.type === "decline") { playWrongAnswerSound(); alert(`❌ ${activeDuel.guestName} recusou o duelo.`); leaveActiveDuel(false); return; }
  if (pkt.type === "accept" && activeDuel.isHost && activeDuel.status === "waiting") { activeDuel.status = "playing"; hostStartNextDuelRound(); return; }
  if (pkt.type === "question") {
    Object.assign(activeDuel, { status: "playing", round: pkt.round, scoreHost: pkt.scoreHost, scoreGuest: pkt.scoreGuest, currentQuestion: pkt.question, roundResolved: false, lockedPlayers: {} });
    playCardFlipSound(); renderDuelRoundUI(); return;
  }
  if (pkt.type === "answer" && activeDuel.status === "playing" && !activeDuel.roundResolved) {
    if (pkt.isCorrect) {
      activeDuel.roundResolved = true;
      if (pkt.playerKey === activeDuel.hostKey) activeDuel.scoreHost++; else activeDuel.scoreGuest++;
      updateDuelScoreboardUI(); playHitSuccessSound();
      showDuelBanner(`⚡ ${pkt.playerName} acertou primeiro e marcou +1 ponto!`, "emerald");
      if (activeDuel.isHost) {
        setTimeout(() => {
          if (!activeDuel) return;
          if (activeDuel.scoreHost >= 5 || activeDuel.scoreGuest >= 5) {
            publishDuelPacket({ type: "finish", duelId: activeDuel.duelId, winnerName: activeDuel.scoreHost >= 5 ? activeDuel.hostName : activeDuel.guestName, scoreHost: activeDuel.scoreHost, scoreGuest: activeDuel.scoreGuest });
          } else hostStartNextDuelRound();
        }, 1800);
      }
    } else {
      activeDuel.lockedPlayers[pkt.playerKey] = true; playWrongAnswerSound();
      showDuelBanner(pkt.playerKey === currentUserKey ? `❌ Você errou! Aguardando oponente...` : `🔥 ${pkt.playerName} errou! Sua chance!`, pkt.playerKey === currentUserKey ? "red" : "amber");
      if (activeDuel.lockedPlayers[activeDuel.hostKey] && activeDuel.lockedPlayers[activeDuel.guestKey]) {
        activeDuel.roundResolved = true;
        if (activeDuel.isHost) setTimeout(() => { if (activeDuel) hostStartNextDuelRound(); }, 1800);
      }
    }
    return;
  }
  if (pkt.type === "finish") {
    activeDuel.scoreHost = pkt.scoreHost; activeDuel.scoreGuest = pkt.scoreGuest;
    updateDuelScoreboardUI(); playMcDonaldsJingle();
    $("duelQuestionArea").classList.add("hidden"); $("duelWinnerBox").classList.remove("hidden");
    $("duelWinnerTitle").textContent = `🏆 ${pkt.winnerName} Venceu!`;
    $("duelWinnerSub").textContent = `Placar Final: ${activeDuel.hostName} (${pkt.scoreHost}) x (${pkt.scoreGuest}) ${activeDuel.guestName}`;
    saveDuelHistoryRecord({ p1: activeDuel.hostName, p2: activeDuel.guestName, score1: pkt.scoreHost, score2: pkt.scoreGuest, winner: pkt.winnerName, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    return;
  }
  if (pkt.type === "leave" && pkt.playerKey !== currentUserKey) { alert("O oponente saiu da Arena."); leaveActiveDuel(false); }
}

function saveDuelHistoryRecord(r) {
  duelHistoryList.unshift(r); if (duelHistoryList.length > 5) duelHistoryList.pop();
  localStorage.setItem(STORAGE_DUEL_HISTORY, JSON.stringify(duelHistoryList)); renderDuelHistory();
}
function renderDuelHistory() {
  const c = $("duelHistoryContainer");
  if (!c) return;
  c.innerHTML = duelHistoryList.length === 0
    ? `<div class="p-3 rounded-xl subtle-box text-xs text-center text-muted-pro">Nenhum duelo finalizado recentemente.</div>`
    : duelHistoryList.map(h => `<div class="flex items-center justify-between p-2.5 rounded-xl subtle-box text-xs font-bold"><span>⚔️ <strong>${h.p1}</strong> (${h.score1}) x (${h.score2}) <strong>${h.p2}</strong></span><span class="text-amber-500 font-black">🏆 ${h.winner} <small class="text-muted-pro">${h.date}</small></span></div>`).join("");
}

function acceptDuelInvite() {
  playTabClickSound();
  if (!pendingDuelInvite) return;
  $("duelInvitePopup").classList.add("hidden");
  activeDuel = { ...pendingDuelInvite, isHost: false, scoreHost: 0, scoreGuest: 0, round: 0, status: "playing" };
  pendingDuelInvite = null; openDuelArenaUI();
  $("duelWaitingBox").classList.remove("hidden"); $("duelWaitingText").textContent = "Sorteando 1ª pergunta...";
  publishDuelPacket({ type: "accept", duelId: activeDuel.duelId });
}
function declineDuelInvite() {
  playTabClickSound();
  if (!pendingDuelInvite) return;
  $("duelInvitePopup").classList.add("hidden");
  publishDuelPacket({ type: "decline", duelId: pendingDuelInvite.duelId }); pendingDuelInvite = null;
}
function openDuelArenaUI() { if (activeDuel) { $("duelArenaModal").classList.remove("hidden"); updateDuelScoreboardUI(); } }
function updateDuelScoreboardUI() {
  if (!activeDuel) return;
  if ($("duelP1Avatar")) $("duelP1Avatar").innerHTML = isPhotoAvatar(activeDuel.hostAvatar) ? `<img src="${activeDuel.hostAvatar}" class="w-9 h-9 rounded-xl object-cover mx-auto" />` : activeDuel.hostAvatar;
  if ($("duelP2Avatar")) $("duelP2Avatar").innerHTML = isPhotoAvatar(activeDuel.guestAvatar) ? `<img src="${activeDuel.guestAvatar}" class="w-9 h-9 rounded-xl object-cover mx-auto" />` : activeDuel.guestAvatar;
  $("duelP1Name").textContent = activeDuel.hostName; $("duelP1Score").textContent = activeDuel.scoreHost;
  $("duelP2Name").textContent = activeDuel.guestName; $("duelP2Score").textContent = activeDuel.scoreGuest;
  $("duelRoundBadge").textContent = `Rodada #${activeDuel.round || 1}`;
}
function hostStartNextDuelRound() {
  if (!activeDuel || !activeDuel.isHost) return;
  const item = QUESTIONS_DB[Math.floor(Math.random() * QUESTIONS_DB.length)];
  publishDuelPacket({ type: "question", duelId: activeDuel.duelId, round: (activeDuel.round || 0) + 1, scoreHost: activeDuel.scoreHost, scoreGuest: activeDuel.scoreGuest, question: { id: item.id, level: item.level, q: item.q, a: item.a, options: [...item.w, item.a].sort(() => 0.5 - Math.random()) } });
}
function renderDuelRoundUI() {
  if (!activeDuel || !activeDuel.currentQuestion) return;
  $("duelWaitingBox").classList.add("hidden"); $("duelWinnerBox").classList.add("hidden");
  $("duelQuestionArea").classList.remove("hidden"); $("duelStatusBanner").classList.add("hidden");
  updateDuelScoreboardUI();
  const qObj = activeDuel.currentQuestion;
  $("duelQuestionText").textContent = `(#${qObj.id}) ${qObj.q}`;
  const container = $("duelOptionsContainer"); container.innerHTML = "";
  qObj.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `<span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${["A","B","C","D"][idx]}</span><span class="flex-1">${optText}</span>`;
    btn.onclick = () => submitDuelAnswer(btn, optText, qObj.a);
    container.appendChild(btn);
  });
}
function submitDuelAnswer(selectedBtn, chosen, correct) {
  if (!activeDuel || activeDuel.roundResolved || (activeDuel.lockedPlayers && activeDuel.lockedPlayers[currentUserKey])) return;
  document.querySelectorAll("#duelOptionsContainer button").forEach(b => b.disabled = true);
  const isCorrect = chosen === correct;
  selectedBtn.className = isCorrect ? "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3" : "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
  publishDuelPacket({ type: "answer", duelId: activeDuel.duelId, playerKey: currentUserKey, playerName: users[currentUserKey]?.name || "Jogador", isCorrect });
}
function showDuelBanner(msg, color) {
  const b = $("duelStatusBanner"); b.classList.remove("hidden");
  b.className = `p-3 rounded-2xl text-xs font-extrabold text-center bg-${color}-500/20 text-${color}-500 border border-${color}-500/40`;
  b.textContent = msg;
}
function leaveActiveDuel(notify = true) {
  playTabClickSound();
  if (activeDuel && notify) publishDuelPacket({ type: "leave", duelId: activeDuel.duelId, playerKey: currentUserKey });
  activeDuel = null; $("duelArenaModal").classList.add("hidden");
}

// =========================================================================
// CORAÇÕES, SIMULADO, FLASHCARDS, BOOK, RANKING E ADM
// =========================================================================
function getActiveHeartsLockUntil() {
  return (currentUserKey && users[currentUserKey]) ? (users[currentUserKey].heartsLockUntil || 0) : parseInt(localStorage.getItem("mequi_guest_hearts_lock") || "0", 10);
}
function setActiveHeartsState(h, lock) {
  currentHearts = h;
  if (currentUserKey && users[currentUserKey]) {
    users[currentUserKey].hearts = h; users[currentUserKey].heartsLockUntil = lock; users[currentUserKey].updatedAt = Date.now();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else {
    localStorage.setItem("mequi_guest_hearts", String(h)); localStorage.setItem("mequi_guest_hearts_lock", String(lock));
  }
  updateHeartsDisplay();
}
function syncActiveUserHeartsState() {
  const now = Date.now(); let lock = getActiveHeartsLockUntil();
  currentHearts = (currentUserKey && users[currentUserKey] && users[currentUserKey].hearts !== undefined) ? users[currentUserKey].hearts : parseInt(localStorage.getItem("mequi_guest_hearts") || "5", 10);
  if (lock > 0 && now >= lock) setActiveHeartsState(5, 0);
  updateHeartsDisplay(); checkAndRenderCooldownScreen();
}
function formatTimeRemaining(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function checkAndRenderCooldownScreen() {
  const lock = getActiveHeartsLockUntil(), now = Date.now();
  const box = $("quizCooldownBox"), area = $("quizActiveArea"), timer = $("cooldownTimerDisplay");
  if (lock > now) {
    box.classList.remove("hidden"); area.classList.add("hidden"); timer.textContent = formatTimeRemaining(lock - now);
    if (!cooldownIntervalId) {
      cooldownIntervalId = setInterval(() => {
        const rem = getActiveHeartsLockUntil() - Date.now();
        if (rem <= 0) {
          clearInterval(cooldownIntervalId); cooldownIntervalId = null; setActiveHeartsState(5, 0);
          box.classList.add("hidden"); area.classList.remove("hidden"); loadNextQuizQuestion();
          if (currentUserKey) scheduleCloudSync(currentUserKey, true);
        } else timer.textContent = formatTimeRemaining(rem);
      }, 1000);
    }
    return true;
  }
  if (cooldownIntervalId) { clearInterval(cooldownIntervalId); cooldownIntervalId = null; }
  if (currentHearts <= 0) setActiveHeartsState(5, 0);
  box.classList.add("hidden"); area.classList.remove("hidden");
  return false;
}
function changeQuizLevelFilter() { playTabClickSound(); currentStreak = 0; loadNextQuizQuestion(); }
function updateHeartsDisplay() {
  const h = Math.max(0, Math.min(5, currentHearts));
  if ($("quizHeartsInfo")) $("quizHeartsInfo").textContent = "❤️".repeat(h) + "🖤".repeat(5 - h);
}

function loadNextQuizQuestion() {
  playTabClickSound(); syncActiveUserHeartsState();
  if (checkAndRenderCooldownScreen()) return;
  const lvl = $("quizLevelFilter").value;
  const pool = lvl === "ALL" ? QUESTIONS_DB : QUESTIONS_DB.filter(x => x.level === lvl);
  const item = pool[Math.floor(Math.random() * pool.length)];
  currentQuizQuestionId = item.id;
  $("quizQuestionMeta").textContent = `Questão #${item.id} • Nível ${item.level}`;
  $("statStreakDisplay").textContent = `${currentStreak} 🔥`;
  $("quizQuestionText").textContent = item.q;
  $("quizFeedback").classList.add("hidden"); $("nextQuizBtn").classList.add("hidden");
  const container = $("quizOptions"); container.innerHTML = "";
  [...item.w, item.a].sort(() => 0.5 - Math.random()).forEach((optText, idx) => {
    const letter = ["A", "B", "C", "D"][idx], btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `<span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${letter}</span><span class="flex-1">${optText}</span>`;
    btn.onclick = () => checkQuizAnswer(btn, optText, item.a, letter);
    container.appendChild(btn);
  });
}

function checkQuizAnswer(selectedBtn, chosen, correct, letter) {
  document.querySelectorAll("#quizOptions button").forEach(b => {
    b.disabled = true;
    if (b.innerText.includes(correct) && chosen !== correct) b.className = "w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/15 font-extrabold text-xs flex items-center gap-3";
  });
  const fb = $("quizFeedback"); fb.classList.remove("hidden");
  if (chosen === correct) {
    selectedBtn.className = "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3";
    currentStreak++;
    if (currentUserKey && users[currentUserKey]) users[currentUserKey].correctAnswers = (users[currentUserKey].correctAnswers || 0) + 1;
    addXp(25);
    fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-emerald-500/15 text-emerald-500";
    fb.textContent = `✅ Alternativa ${letter} Correta! +25 XP!`;
    $("nextQuizBtn").textContent = "PRÓXIMA PERGUNTA ➡️"; $("nextQuizBtn").classList.remove("hidden");
  } else {
    selectedBtn.className = "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
    currentStreak = 0; playWrongAnswerSound();
    if (currentQuizQuestionId) recordMistakeQuestion(currentQuizQuestionId);
    const nh = Math.max(0, currentHearts - 1);
    if (nh <= 0) {
      setActiveHeartsState(0, Date.now() + HEARTS_COOLDOWN_MS);
      if (currentUserKey) scheduleCloudSync(currentUserKey, true);
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500";
      fb.innerHTML = `💔 <strong>Seus 5 corações acabaram!</strong> Gabarito: <span class="underline">${correct}</span>`;
      $("nextQuizBtn").textContent = "VER CRONÔMETRO (10 MIN) ⏳"; $("nextQuizBtn").classList.remove("hidden");
    } else {
      setActiveHeartsState(nh, 0);
      if (currentUserKey) scheduleCloudSync(currentUserKey, false);
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500";
      fb.innerHTML = `❌ Você perdeu 1 coração (Restam ${nh} ❤️). Salvo em <strong>Minhas Dúvidas</strong>.<br>Gabarito: <span class="underline">${correct}</span>`;
      $("nextQuizBtn").textContent = "PRÓXIMA PERGUNTA ➡️"; $("nextQuizBtn").classList.remove("hidden");
    }
  }
  $("statStreakDisplay").textContent = `${currentStreak} 🔥`;
}

function loadRandomFlashcard() {
  playCardFlipSound();
  const inner = $("fcFlipInner"); if (!inner) return;
  inner.classList.remove("is-flipped");
  setTimeout(() => {
    const item = QUESTIONS_DB[Math.floor(Math.random() * QUESTIONS_DB.length)];
    $("fcMeta").textContent = `Questão #${item.id} (${item.level}) • Toque para girar 3D 🔄`;
    $("fcQuestion").textContent = item.q; $("fcAnswer").textContent = item.a;
  }, 150);
}
function flipFlashcard() { playCardFlipSound(); if ($("fcFlipInner")) $("fcFlipInner").classList.toggle("is-flipped"); }
function debouncedBookSearch() { clearTimeout(searchDebounceTimer); searchDebounceTimer = setTimeout(renderBookList, 150); }
function setBookFilter(lvl) {
  playTabClickSound(); currentBookFilter = lvl;
  ["ALL", "Básico", "Intermediário", "Avançado"].forEach(l => {
    if ($(`filter-${l}`)) $(`filter-${l}`).className = l === lvl ? "px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-red-600 text-white shrink-0" : "px-3.5 py-1.5 rounded-xl text-xs font-extrabold subtle-box shrink-0";
  });
  renderBookList();
}
function renderBookList() {
  const s = $("searchBookInput").value.toLowerCase();
  const filtered = QUESTIONS_DB.filter(x => (currentBookFilter === "ALL" || x.level === currentBookFilter) && (!s || x.q.toLowerCase().includes(s) || x.a.toLowerCase().includes(s) || String(x.id).includes(s)));
  $("bookCountBadge").textContent = `${filtered.length} questões`;
  $("bookQuestionsContainer").innerHTML = filtered.map(x => `
    <div class="pro-card rounded-2xl p-4">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500">Questão #${x.id} • ${x.level}</span>
        <button onclick="revealBookAnswer(this)" class="text-[11px] font-extrabold text-amber-500">Ver Resposta</button>
      </div>
      <p class="font-extrabold text-xs">${x.q}</p>
      <p class="hidden mt-2.5 pt-2.5 border-t border-slate-500/20 text-xs font-bold text-emerald-500">✅ ${x.a}</p>
    </div>`).join("");
}
function revealBookAnswer(btn) {
  playCardFlipSound();
  const ans = btn.parentElement.nextElementSibling.nextElementSibling;
  ans.classList.toggle("hidden");
  btn.textContent = ans.classList.contains("hidden") ? "Ver Resposta" : "Ocultar";
}

function renderLeaderboard() {
  const pod = $("podiumTop3Container"), cont = $("leaderboardContainer");
  const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  if (list.length === 0) {
    if (pod) pod.innerHTML = "";
    if (cont) cont.innerHTML = `<div class="p-6 text-center text-xs font-bold text-muted-pro subtle-box rounded-2xl">Nenhum colaborador cadastrado ainda.</div>`;
    return;
  }
  const [first, second, third] = list;
  if (pod) {
    pod.innerHTML = `
      <div class="flex flex-col items-center">${second ? `${renderAvatarBadge(second.avatar,"w-11 h-11","text-xl","subtle-box")}<p class="font-black text-[10px] truncate w-full text-center mt-1">${second.name}</p><span class="text-[10px] font-extrabold text-red-500">${second.xp||0} XP</span><div class="w-full h-16 mt-2 rounded-t-2xl bg-slate-300 text-slate-900 flex flex-col items-center justify-center font-black"><span>🥈</span><span class="text-[10px]">2º Lugar</span></div>` : ``}</div>
      <div class="flex flex-col items-center"><span class="text-lg float-slow">👑 ☕</span>${renderAvatarBadge(first.avatar,"w-14 h-14","text-2xl","gold-gradient text-slate-950")}<p class="font-black text-xs truncate w-full text-center mt-1">${first.name}</p><span class="text-[11px] font-black text-amber-500">${first.xp||0} XP</span><div class="w-full h-24 mt-2 rounded-t-2xl gold-gradient text-slate-950 flex flex-col items-center justify-center font-black"><span>🥇</span><span class="text-[11px]">1º LUGAR</span></div></div>
      <div class="flex flex-col items-center">${third ? `${renderAvatarBadge(third.avatar,"w-11 h-11","text-xl","subtle-box")}<p class="font-black text-[10px] truncate w-full text-center mt-1">${third.name}</p><span class="text-[10px] font-extrabold text-red-500">${third.xp||0} XP</span><div class="w-full h-14 mt-2 rounded-t-2xl bg-amber-700 text-white flex flex-col items-center justify-center font-black"><span>🥉</span><span class="text-[10px]">3º Lugar</span></div>` : ``}</div>`;
  }
  if (cont) {
    const now = Date.now();
    cont.innerHTML = list.map((u, idx) => {
      const medal = idx === 0 ? "🥇 ☕" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`;
      const dot = (now - (u.lastSeen || 0)) < 25000 ? `<span class="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block ml-1"></span>` : `<span class="w-2.5 h-2.5 bg-slate-400/40 rounded-full inline-block ml-1"></span>`;
      return `<div class="flex items-center justify-between p-3.5 rounded-2xl ${idx === 0 ? 'bg-amber-500/15 border-2 border-amber-500/50' : 'subtle-box'}">
        <div class="flex items-center gap-3"><span class="font-black text-xs w-7 text-center">${medal}</span>${renderAvatarBadge(u.avatar)}<div><p class="font-black text-xs">${u.name} ${dot} <span class="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 uppercase">${u.role||'Atendente'}</span></p><p class="text-[10px] text-muted-pro font-bold">${getLevelInfo(u.xp||0).title}</p></div></div>
        <div class="text-right"><span class="font-black text-xs text-red-500">${u.xp||0} XP</span><span class="block text-[10px] text-muted-pro">${u.correctAnswers||0} acertos</span></div>
      </div>`;
    }).join("");
  }
}

function shareMyScoreWhatsApp() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) return;
  const u = users[currentUserKey];
  const text = `🏆 *OLIMPÍADAS DO BÁSICO — VENTURE*\n👤 Colaborador: *${u.name}*\n⚡ Pontuação: *${u.xp || 0} XP* (${getLevelInfo(u.xp || 0).title})\n✅ Acertos: ${u.correctAnswers || 0}\n🔗 ${window.location.origin}${window.location.pathname}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

function unlockAdminPanel() {
  if ($("adminPassInput").value.trim() === ADMIN_SECRET_PASS) {
    isAdminUnlocked = true; playHitSuccessSound(); $("adminAuthError").classList.add("hidden");
    $("adminLockScreen").classList.add("hidden"); $("adminDashboard").classList.remove("hidden");
    renderAdminUsersList(); fetchCloudHistorySafe(true);
  } else { playWrongAnswerSound(); $("adminAuthError").classList.remove("hidden"); }
}
function lockAdminPanel() {
  playTabClickSound(); isAdminUnlocked = false; $("adminPassInput").value = "";
  $("adminDashboard").classList.add("hidden"); $("adminLockScreen").classList.remove("hidden");
}
function renderAdminUsersList() {
  const entries = Object.entries(users).filter(([k, u]) => u && u.name && !u._deleted).sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0));
  $("adminStatsSummary").textContent = `Total: ${entries.length} colaborador(es)`;
  $("adminUsersList").innerHTML = entries.map(([key, u], i) => `
    <div class="p-4 rounded-2xl subtle-box space-y-2">
      <div class="flex items-center justify-between"><div class="flex items-center gap-2">${renderAvatarBadge(u.avatar)}<div><h4 class="font-black text-xs">#${i+1} ${u.name} (${u.role||'Atendente'})</h4><p class="text-[10px] text-muted-pro">🔑 Senha: ${u.password||'1234'}</p></div></div><span class="font-black text-xs text-red-500">${u.xp||0} XP</span></div>
      <div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-500/20">
        <button onclick="adminAdjustXp('${key}', 100)" class="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[10px]">+100 XP</button>
        <button onclick="adminAdjustXp('${key}', 500)" class="px-2.5 py-1 rounded-xl bg-emerald-800 text-white font-black text-[10px]">+500 XP</button>
        <button onclick="adminAdjustXp('${key}', -100)" class="px-2.5 py-1 rounded-xl bg-amber-600 text-white font-black text-[10px]">-100 XP</button>
        <button onclick="adminSetCustomXp('${key}')" class="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-black text-[10px]">✏️ Definir XP</button>
        <button onclick="adminRestoreHearts('${key}')" class="px-2.5 py-1 rounded-xl bg-pink-600 text-white font-black text-[10px]">❤️ Vidas</button>
        <button onclick="adminResetUser('${key}')" class="px-2.5 py-1 rounded-xl bg-slate-500/20 font-bold text-[10px]">Zerar</button>
        <button onclick="adminDeleteUser('${key}')" class="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-500 font-bold text-[10px] ml-auto">🗑️</button>
      </div>
    </div>`).join("");
}
function adminRestoreHearts(k) {
  if (!users[k]) return;
  users[k].hearts = 5; users[k].heartsLockUntil = 0; users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now();
  if (k === currentUserKey) { setActiveHeartsState(5, 0); checkAndRenderCooldownScreen(); loadNextQuizQuestion(); }
  playHitSuccessSound(); scheduleCloudSync(k, true); renderAdminUsersList();
}
function adminAdjustXp(k, d) {
  if (!users[k]) return;
  const oldL = getLevelInfo(users[k].xp || 0).level;
  users[k].xp = Math.max(0, (users[k].xp || 0) + d);
  users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now();
  if (getLevelInfo(users[k].xp).level > oldL) playMcDonaldsJingle(); else playHitSuccessSound();
  scheduleCloudSync(k, true);
}
function adminSetCustomXp(k) {
  if (!users[k]) return;
  const v = prompt(`Novo XP para ${users[k].name}:`, users[k].xp || 0);
  if (v !== null && !isNaN(parseInt(v, 10))) {
    users[k].xp = Math.max(0, parseInt(v, 10)); users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now();
    playHitSuccessSound(); scheduleCloudSync(k, true);
  }
}
function adminResetUser(k) {
  if (users[k] && confirm(`Zerar XP de ${users[k].name}?`)) {
    users[k].xp = 0; users[k].correctAnswers = 0; users[k].hearts = 5; users[k].heartsLockUntil = 0;
    users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now(); scheduleCloudSync(k, true);
  }
}
function adminDeleteUser(k) {
  if (users[k] && confirm(`Excluir ${users[k].name}?`)) {
    users[k]._deleted = true; users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now(); scheduleCloudSync(k, true);
  }
}
function adminSaveMember() {
  const name = $("admNewName").value.trim().toUpperCase(), role = $("admNewRole").value;
  if (!name) return alert("Digite o nome!");
  const key = name.toLowerCase();
  users[key] = { name, role, _deleted: false, avatar: users[key]?.avatar || "🍔", password: $("admNewPass").value.trim() || "1234", xp: Math.max(0, parseInt($("admNewXp").value \vert{}\vert{} "0", 10)), correctAnswers: Math.max(0, parseInt($("admNewHits").value || "0", 10)), hearts: 5, heartsLockUntil: 0, mistakes: users[key]?.mistakes || [], lastSeen: Date.now(), updatedAt: Date.now(), adminOverrideAt: Date.now() };
  playHitSuccessSound(); scheduleCloudSync(key, true);
  $("admNewName").value = ""; $("admNewPass").value = ""; $("admNewXp").value = ""; $("admNewHits").value = "";
}

function switchMainTab(tab) {
  playTabClickSound();
  ["quiz", "book", "prizes", "admin", "updates"].forEach(t => {
    $(`tab-${t}`).classList.add("hidden");
    if ($(`nav-${t}`)) $(`nav-${t}`).className = "nav-btn flex flex-col items-center py-1.5 rounded-2xl font-bold text-[10px]";
  });
  $(`tab-${tab}`).classList.remove("hidden");
  if ($(`nav-${tab}`)) $(`nav-${tab}`).className = "nav-btn active-nav flex flex-col items-center py-1.5 rounded-2xl text-[10px]";
  if (tab === "prizes" || tab === "admin") fetchCloudHistorySafe(false);
}

window.onload = () => {
  initTheme(); injectCountdownAndKitchenUI(); rescuePreviousLocalRegistrations();
  renderAvatarSelector(); syncActiveUserHeartsState(); loadNextQuizQuestion();
  loadRandomFlashcard(); renderBookList(); refreshUIIfNeeded();
  if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
    $("authModal").classList.add("hidden"); updateHeaderUI();
  }
  initClusterSync(); startHeartbeat(); fetchCloudHistorySafe(true);
};
/* =========================================================================
   🔧 PATCH DE CORREÇÃO DE LOGIN E CARREGAMENTO AUTOMÁTICO (v7.8.1)
   Cole este bloco no final do seu script.js
   ========================================================================= */

// 1. Garante que o app nunca trave mesmo se o questions.js demorar a carregar
window.KITCHEN_RECIPES = window.KITCHEN_RECIPES || [
  { id: "bigmac", name: "🍔 Big Mac Oficial", xp: 30, steps: ["Pão Big Mac (Base + Club + Coroa)", "Molho Big Mac (1/2 oz Base + 1/2 oz Club)", "Alface (12 g Base + 12 g Club = 24 g)", "Picles (2 fatias no Club)", "Queijo Cheddar (1 fatia na Base)", "2 Carnes 10:1 c/ Cebola (3,5 g)"] }
];
window.QUESTIONS_DB = window.QUESTIONS_DB || [
  { id: 1, level: "Básico", q: "Quantas gramas de alface colocamos no BigMac?", a: "12 gr na base e 12 gr no clube, totalizando 24 gramas.", w: ["14 gr na base e 14 gr no clube, totalizando 28 gramas.", "10 gr na base e 10 gr no clube, totalizando 20 gramas.", "15 gr na base e 15 gr no clube, totalizando 30 gramas."] }
];

// 2. Busca na nuvem com limite máximo de 2 segundos (nunca trava o botão Entrar)
async function fetchCloudHistorySafe(force = false) {
  if (!force && Date.now() - lastHttpFetchTime < 20000) return;
  lastHttpFetchTime = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2200);
  try {
    const res = await fetch(`${CLOUD_HTTP_URL}/json?poll=1&since=24h`, { signal: ctrl.signal });
    clearTimeout(timer);
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
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      refreshUIIfNeeded();
    }
  } catch (e) {
    clearTimeout(timer);
  }
}

// 3. Login Destravado no PC e Celular (entra na hora e sincroniza via MQTT)
async function handleLogin() {
  const rawName = $("loginName").value.trim();
  const pass = $("loginPass").value.trim();
  if (!rawName) return showAuthError("Digite seu nome para entrar!");
  if (!pass) return showAuthError("Digite sua senha!");

  const key = rawName.toLowerCase();
  const btn = $("btnLoginSubmit");
  btn.textContent = "ENTRANDO...";
  btn.disabled = true;

  if (!users[key]) {
    await fetchCloudHistorySafe(true);
  }

  btn.textContent = "ENTRAR NO TREINAMENTO 🚀";
  btn.disabled = false;

  // Se o navegador do PC limpou o cache ou ainda está sincronizando a conta da nuvem,
  // cria a sessão local na hora para não bloquear você e puxa o XP real pelo MQTT!
  if (!users[key] || users[key]._deleted) {
    users[key] = {
      name: rawName.toUpperCase(),
      role: "Atendente",
      avatar: "🍔",
      password: pass,
      _deleted: false,
      xp: users[key]?.xp || 0,
      correctAnswers: users[key]?.correctAnswers || 0,
      hearts: 5,
      heartsLockUntil: 0,
      mistakes: [],
      lastSeen: Date.now(),
      updatedAt: Date.now()
    };
  } else if (pass !== ADMIN_SECRET_PASS && users[key].password && users[key].password !== pass) {
    return showAuthError("Senha incorreta! Tente novamente (ou use a senha ADM 342005).");
  }

  users[key]._deleted = false;
  currentUserKey = key;
  localStorage.setItem(STORAGE_CURRENT_KEY, key);
  $("authModal").classList.add("hidden");
  playHitSuccessSound();
  updateHeaderUI();
  try { syncActiveUserHeartsState(); loadNextQuizQuestion(); } catch (e) {}
  scheduleCloudSync(key, true);
}

// 4. Inicialização Blindada (carrega o questions.js automaticamente se faltar no HTML)
window.onload = () => {
  try { initTheme(); } catch (e) {}

  if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
    $("authModal").classList.add("hidden");
  }

  const startApp = () => {
    try { injectCountdownAndKitchenUI(); } catch (e) {}
    try { rescuePreviousLocalRegistrations(); } catch (e) {}
    try { renderAvatarSelector(); } catch (e) {}
    try { syncActiveUserHeartsState(); } catch (e) {}
    try { loadNextQuizQuestion(); } catch (e) {}
    try { loadRandomFlashcard(); } catch (e) {}
    try { renderBookList(); } catch (e) {}
    try { refreshUIIfNeeded(); } catch (e) {}

    if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
      $("authModal").classList.add("hidden");
      updateHeaderUI();
    }

    initClusterSync();
    startHeartbeat();
    fetchCloudHistorySafe(true);
  };

  if (!window.QUESTIONS_DB || window.QUESTIONS_DB.length < 5) {
    const s = document.createElement("script");
    s.src = "questions.js?v=" + Date.now();
    s.onload = startApp;
    s.onerror = startApp;
    document.head.appendChild(s);
  } else {
    startApp();
  }
};
