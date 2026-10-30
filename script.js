/* Venture 9.2.4 · script.js · arquivo carregado na ordem indicada no HTML. */
function switchTrainingMode(mode) {
  const valid = ["kitchen", "arena", "review", "duel"];
  if (!valid.includes(mode)) return;
  valid.forEach(name => {
    const panel = $(`training-mode-${name}`);
    const btn = $(`training-nav-${name}`);
    if (panel) panel.classList.toggle("hidden", name !== mode);
    if (btn) {
      btn.classList.toggle("is-active", name === mode);
      btn.setAttribute("aria-pressed", String(name === mode));
    }
  });
  if (mode === "arena" && typeof renderVentureArena === "function") renderVentureArena();
  if (mode === "duel" && typeof renderVentureDuelDashboard === "function") renderVentureDuelDashboard();
}
function switchMainTab(tab) {
  const screens = ["quiz", "training", "missions", "prizes", "more", "profile", "book", "trainer", "admin", "allstar"];
  if (!screens.includes(tab)) return;
  playTabClickSound();
  screens.forEach(name => {
    const screen = $(`tab-${name}`);
    if (screen) screen.classList.toggle("hidden", name !== tab);
  });
  const currentNav = ["profile", "book", "trainer", "admin", "allstar"].includes(tab) ? "more" : tab;
  ["quiz", "training", "missions", "prizes", "more"].forEach(name => {
    const button = $(`nav-${name}`);
    if (!button) return;
    button.classList.toggle("active-nav", name === currentNav);
    if (name === currentNav) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (tab === "training") {
    if (typeof populateDuelOpponentList === "function") populateDuelOpponentList();
    if (typeof renderDuelHistory === "function") renderDuelHistory();
    if (typeof renderVentureArena === "function") renderVentureArena();
    if (typeof renderVentureDuelDashboard === "function") renderVentureDuelDashboard();
  }
  if (tab === "missions") {
    if (typeof renderMissionHub === "function") renderMissionHub();
    if (typeof renderDailyChest === "function") renderDailyChest();
  }
  if (tab === "profile") renderPremiumProfile();
  if (tab === "admin" && typeof isAdminUnlocked !== "undefined" && isAdminUnlocked && typeof renderAdminUsersList === "function") renderAdminUsersList();
  if (tab === "prizes" || tab === "admin") fetchCloudHistorySafe(false);
  if (tab === "trainer") {renderPracticalChecklist();renderTrainerCenter();fetchTrainerHistory(false);}
  if (tab === "allstar" && window.VentureAllStar && typeof window.VentureAllStar.render === "function") window.VentureAllStar.render();
  if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: "instant" });
}

// =========================================================================
// V8.5 — ATUALIZAÇÃO DE VERSÃO NO GITHUB PAGES (SEM APAGAR DADOS)
// =========================================================================
const APP_VERSION = "9.4.0";
const APP_UPDATE_INTERVAL_MS = 60000; // Github Pages é estático: checagem periódica, não push instantâneo.
const APP_UPDATE_IDLE_MS = 45000;
let availableAppUpdate = null;
let appUpdateChecking = false;
let appUpdateLastInteraction = Date.now();
let appUpdatePostponedUntil = 0;
let appUpdateFirstDetectedAt = 0;
function appVersionMessage(msg) {
  const target = $("appVersionStatus");
  if (target) target.textContent = msg;
}
function isAppUpdateUnsafe() {
  if (document.hidden || activeDuel || pendingDuelInvite) return true;
  const modals = ["duelInvitePopup", "duelArenaModal", "ventureNewsModal", "reviewMistakesModal", "publicProfileModal", "avatarPickerModal"];
  if (modals.some(id => {const el = $(id); return el && !el.classList.contains("hidden");})) return true;
  const input = document.activeElement;
  if (input && input.matches && input.matches("input, textarea, select, [contenteditable='true']") && input.getClientRects().length) return true;
  // Não atualiza automaticamente no meio de uma pergunta sem resposta.
  if ($("tab-quiz") && !$('tab-quiz').classList.contains("hidden") &&
      $("quizQuestionText")?.textContent.trim() && $("nextQuizBtn")?.classList.contains("hidden")) return true;
  // Evita perder respostas em formulários não enviados pelo treinador ou administrador.
  const drafts = document.querySelectorAll("#tab-trainer input, #tab-trainer textarea, #tab-admin input, #loginForm input, #registerForm input");
  if (Array.from(drafts).some(el => el.type !== "checkbox" && String(el.value).trim() && el.value !== el.defaultValue)) return true;
  if (currentRecipeStep > 0 && currentRecipeStep < activeRecipe.steps.length &&
      $("tab-training") && !$('tab-training').classList.contains("hidden") &&
      $("training-mode-kitchen") && !$('training-mode-kitchen').classList.contains("hidden")) return true;
  return Date.now() - appUpdateLastInteraction < APP_UPDATE_IDLE_MS;
}
function postponeAppUpdate() {
  appUpdatePostponedUntil = Date.now() + 10 * 60 * 1000;
  const banner = $("appUpdateBanner");
  if (banner) banner.classList.add("hidden");
  appVersionMessage("Nova versão disponível. Você pode atualizar quando quiser.");
}
function showAvailableAppUpdate(latest) {
  availableAppUpdate = latest;
  if (!appUpdateFirstDetectedAt) appUpdateFirstDetectedAt = Date.now();
  const label = $("appUpdateNewVersion");
  if (label) label.textContent = `v${latest}`;
  if (Date.now() >= appUpdatePostponedUntil) {
    const banner = $("appUpdateBanner");
    if (banner) banner.classList.remove("hidden");
  }
  appVersionMessage(`Nova versão v${latest} disponível. Atualize para receber as novidades.`);
}
async function checkForAppUpdate(manual = false) {
  if (appUpdateChecking || !navigator.onLine) {
    if (manual && !navigator.onLine) appVersionMessage("Sem internet. A versão será verificada quando a conexão voltar.");
    return;
  }
  appUpdateChecking = true;
  if (manual) appVersionMessage("Procurando nova versão...");
  const controller = new AbortController();
  const limit = setTimeout(() => controller.abort(), 9000);
  try {
    // Busca sem cache e com parâmetro único; funciona também em GitHub Pages /nome-do-repo/.
    const versionUrl = new URL("version.json", document.baseURI);
    versionUrl.searchParams.set("_check", String(Date.now()));
    const response = await fetch(versionUrl, {cache:"no-store", signal:controller.signal});
    if (!response.ok) throw new Error("version.json não encontrado (HTTP " + response.status + ")");
    const manifest = await response.json();
    const remoteVersion = typeof manifest.version === "string" ? manifest.version.trim() : "";
    if (!/^\d+\.\d+(?:\.\d+)?$/.test(remoteVersion)) throw new Error("Formato de versão inválido");
    if (remoteVersion === APP_VERSION) {
      if (manual) appVersionMessage(`✅ O aplicativo já está atualizado (v${APP_VERSION}).`);
      return;
    }
    // Confirma que o HTML do release já está publicado, evitando loops durante propagação do deploy.
    const pageUrl = new URL("index.html", document.baseURI);
    pageUrl.searchParams.set("_check", String(Date.now()));
    const pageResponse = await fetch(pageUrl, {cache:"no-store", signal:controller.signal});
    if (!pageResponse.ok) throw new Error("Publicação ainda não disponível");
    const remoteHtml = await pageResponse.text();
    const found = remoteHtml.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']/i);
    if (!found || found[1] !== remoteVersion) {
      if (manual) appVersionMessage("Nova publicação em andamento. Tente novamente em instantes.");
      return;
    }
    showAvailableAppUpdate(remoteVersion);
  } catch (err) {
    if (manual) appVersionMessage("Não foi possível verificar agora. Confira se version.json foi publicado no GitHub.");
  } finally {
    clearTimeout(limit);
    appUpdateChecking = false;
  }
}
function installLatestAppVersion() {
  if (!availableAppUpdate) return checkForAppUpdate(true);
  try {
    // Persistir snapshot antes de carregar novos arquivos, sem limpar nenhuma chave antiga.
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (_) {}
  // Evita recarga infinita se um servidor/CDN ainda responder com HTML antigo.
  try {
    sessionStorage.setItem("venture_last_update_attempt", JSON.stringify({version:availableAppUpdate,at:Date.now()}));
  } catch (_) {}
  const url = new URL(window.location.href);
  url.searchParams.set("app_v", availableAppUpdate);
  url.searchParams.set("_fresh", String(Date.now()));
  window.location.replace(url.href);
}
function maybeInstallAppUpdate() {
  if (!availableAppUpdate || Date.now() < appUpdatePostponedUntil || isAppUpdateUnsafe()) return;
  if (Date.now() - appUpdateFirstDetectedAt < 10000) return;
  try {
    const last = JSON.parse(sessionStorage.getItem("venture_last_update_attempt") || "null");
    if (last && last.version === availableAppUpdate && Date.now() - last.at < 120000) return;
  } catch (_) {}
  installLatestAppVersion();
}
function initAppAutoUpdater() {
  const installed = $("appInstalledVersion");
  if (installed) installed.textContent = APP_VERSION;
  const onUserAction = () => {appUpdateLastInteraction = Date.now();};
  document.addEventListener("pointerdown", onUserAction, {passive:true});
  document.addEventListener("keydown", onUserAction, {passive:true});
  document.addEventListener("touchstart", onUserAction, {passive:true});
  document.addEventListener("visibilitychange", () => {if (!document.hidden) {checkForAppUpdate();maybeInstallAppUpdate();}});
  window.addEventListener("focus", () => checkForAppUpdate());
  window.addEventListener("online", () => checkForAppUpdate());
  checkForAppUpdate();
  setInterval(() => {if (!document.hidden) checkForAppUpdate();}, APP_UPDATE_INTERVAL_MS);
  setInterval(maybeInstallAppUpdate, 15000);
}

window.onload = async () => {
  initTheme();
  injectCountdownAndKitchenUI();
  rescuePreviousLocalRegistrations();
  if (typeof recoverPendingXpRewards === "function") recoverPendingXpRewards(currentUserKey);
  renderMissionHub();
  if (typeof renderVentureArena === "function") renderVentureArena();
  if (typeof renderVentureDuelDashboard === "function") renderVentureDuelDashboard();
  renderXpModeStatus();
  restoreQuizStreak();
  renderAvatarSelector();
  syncActiveUserHeartsState();
  loadNextQuizQuestion();
  renderBookList();
  refreshUIIfNeeded();
  if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
    $("authModal").classList.add("hidden");
    updateHeaderUI();
  }
  // Recuperar históricos em paralelo à interface. Não bloqueie a validação das
  // perguntas esperando a nuvem; só inicialize o envio MQTT após o histórico ou timeout.
  const cloudHistoryReady = Promise.race([
    fetchCloudHistorySafe(true),
    new Promise(resolve => setTimeout(resolve, 4500))
  ]);
  const startCloudServices = () => {
    initClusterSync();
    startHeartbeat();
    fetchTrainerHistory(true);
    renderTrainerPublicContent();
  };
  cloudHistoryReady.then(startCloudServices, startCloudServices);
  initAppAutoUpdater();
};
