/* Venture 8.8 · js/02-estado.js · arquivo carregado na ordem indicada no HTML. */
const STORAGE_USERS_KEY = "mequi_olimpiadas_users_v6";
const STORAGE_CURRENT_KEY = "mequi_olimpiadas_active_user_v6";
const STORAGE_THEME_KEY = "mequi_olimpiadas_theme_v7";
const STORAGE_DUEL_HISTORY = "mequi_olimpiadas_duel_history_v75";
const ADMIN_SECRET_PASS = "342005";
const HEARTS_COOLDOWN_MS = 10 * 60 * 1000;
const SYNC_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v65_cluster_state";
const DUEL_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v71_live_duels";
const TRAINER_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v83_trainer_content";
const TRAINER_HTTP_URL = "https://ntfy.sh/mequi_venture_olimpiadas_2026_trainer_v83";
const TRAINER_STORAGE_KEY = "mequi_venture_trainer_v83";
const DUEL_WIN_XP = 100;
const CLOUD_HTTP_URL = "https://ntfy.sh/mequi_venture_olimpiadas_2026_v63_store";
let mqttClients = [], users = {}, currentUserKey = localStorage.getItem(STORAGE_CURRENT_KEY) || null;
let currentBookFilter = "ALL", currentStreak = 0, currentHearts = 5, currentQuizQuestionId = null, isAdminUnlocked = false;
// A sequência é uma propriedade do colaborador (não é apenas memória da aba).
// O horário da última resposta permite sincronizar inclusive quando a sequência volta a zero.
function streakStateOf(user) {
  if (!user || !Object.prototype.hasOwnProperty.call(user, "quizStreak")) return null;
  const count = Number(user.quizStreak);
  const at = Number(user.quizStreakUpdatedAt);
  return { quizStreak: Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0,
    quizStreakUpdatedAt: Number.isFinite(at) ? Math.max(0, at) : 0 };
}
function mergeQuizStreak(a, b) {
  const left = streakStateOf(a), right = streakStateOf(b);
  if (!left && !right) return {};
  if (!left) return right;
  if (!right) return left;
  if (right.quizStreakUpdatedAt > left.quizStreakUpdatedAt) return right;
  if (left.quizStreakUpdatedAt > right.quizStreakUpdatedAt) return left;
  return (Number(b.updatedAt) || 0) > (Number(a.updatedAt) || 0) ? right : left;
}
function restoreQuizStreak() {
  const user = currentUserKey && users[currentUserKey];
  currentStreak = streakStateOf(user)?.quizStreak || 0;
  const display = $("statStreakDisplay");
  if (display) display.textContent = `${currentStreak} 🔥`;
}
function saveQuizStreak() {
  const user = currentUserKey && users[currentUserKey];
  if (!user) return;
  user.quizStreak = Math.max(0, Math.floor(currentStreak));
  user.quizStreakUpdatedAt = Date.now();
  user.updatedAt = Math.max(Number(user.updatedAt) || 0, user.quizStreakUpdatedAt);
  // Persistir imediatamente evita perder a última resposta se fechar o navegador.
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}
let searchDebounceTimer = null, cloudSyncQueueTimer = null, cooldownIntervalId = null, heartbeatIntervalId = null;
let lastLeaderboardHash = "", lastAdminListHash = "", lastHttpFetchTime = 0;
let pendingDuelInvite = null, activeDuel = null, currentReviewItem = null, photoUploadTarget = "register";
let duelHistoryList = JSON.parse(localStorage.getItem(STORAGE_DUEL_HISTORY) || "[]");
let activeRecipe = KITCHEN_RECIPES[0], currentRecipeStep = 0;
