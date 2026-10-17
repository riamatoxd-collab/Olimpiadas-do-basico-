/* =========================================================================
   OLIMPÍADAS DO BÁSICO — VENTURE (script.js v7.8.2 COMPLETO & MODULAR)
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
      fb.innerHTML = `🎉 <strong>Padrão Ouro Best Burger!</strong> Você montou o <strong>${activeRecipe.name}</strong> perfeitamente e ganhou <strong>+${activeRecipe.xp} XP</strong>![cite: 1]`;
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

// 2. Busca na nuvem com limite máximo de 2.2 segundos (nunca trava o botão Entrar)
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

// 3. Login Destravado no PC e Celular
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
    syncActiveUserHeartsState();
    loadNextQuizQuestion();
    scheduleCloudSync(key, true);
    return;
  }

  if (!users[key] || users[key]._deleted) {
    users[key] = {
      name: rawName.toUpperCase(),
      role: "Atendente",
      avatar: "🍔",
      password: pass,
      _deleted: false,
      xp: 0,
      correctAnswers: 0,
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
// 4. INICIALIZAÇÃO BLINDADA
// =========================================================================
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

  if (typeof QUESTIONS_DB === "undefined" || QUESTIONS_DB.length < 5) {
    const s = document.createElement("script");
    s.src = "questions.js?v=" + Date.now();
    s.onload = startApp;
    s.onerror = startApp;
    document.head.appendChild(s);
  } else {
    startApp();
  }
};
