/* Venture 9.1.1 — Ligas mensais com emblemas visuais.
   Usa transações do XP Ledger para calcular o XP ganho no mês; não altera o XP acumulado.
   A sincronização continua sendo a legada, portanto o placar ainda não é antifraude de servidor.
*/
const VENTURE_MONTHLY_LEAGUE_VERSION = 1;
const VENTURE_MONTHLY_LEAGUE_LAUNCH_MONTH = '2026-11';
const VENTURE_MONTHLY_LEAGUE_HISTORY_LIMIT = 12;
const VENTURE_MONTHLY_LEAGUE_DIVISIONS = [
  { name: 'Bronze', icon: '🥉', css: 'bronze', image: 'assets/ligas/bronze.webp' },
  { name: 'Prata', icon: '🥈', css: 'silver', image: 'assets/ligas/prata.webp' },
  { name: 'Ouro', icon: '🥇', css: 'gold', image: 'assets/ligas/ouro.webp' },
  { name: 'Safira', icon: '💠', css: 'sapphire', image: 'assets/ligas/safira.webp' },
  { name: 'Rubi', icon: '❤️', css: 'ruby', image: 'assets/ligas/rubi.webp' },
  { name: 'Esmeralda', icon: '💚', css: 'emerald', image: 'assets/ligas/esmeralda.webp' },
  { name: 'Ametista', icon: '💜', css: 'amethyst', image: 'assets/ligas/ametista.webp' },
  { name: 'Pérola', icon: '🤍', css: 'pearl', image: 'assets/ligas/perola.webp' },
  { name: 'Obsidiana', icon: '⚫', css: 'obsidian', image: 'assets/ligas/obsidiana.webp' },
  { name: 'Diamante', icon: '💎', css: 'diamond', image: 'assets/ligas/diamante.webp' }
];

function ventureMonthlyPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function ventureMonthlyMonthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit'
  }).formatToParts(date);
  const part = type => parts.find(item => item.type === type)?.value || '00';
  return `${part('year')}-${part('month')}`;
}
function ventureMonthlyActiveSeasonKey(date = new Date()) {
  const current = ventureMonthlyMonthKey(date);
  return current < VENTURE_MONTHLY_LEAGUE_LAUNCH_MONTH ? VENTURE_MONTHLY_LEAGUE_LAUNCH_MONTH : current;
}
function ventureMonthlyMonthFromTimestamp(timestamp) {
  const value = Number(timestamp);
  return Number.isFinite(value) && value > 0 ? ventureMonthlyMonthKey(new Date(value)) : '';
}
function ventureMonthlyShiftMonth(monthKey, delta = 1) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || ''));
  if (!match) return ventureMonthlyActiveSeasonKey();
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1 + Number(delta || 0), 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
function ventureMonthlyClampDivision(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(VENTURE_MONTHLY_LEAGUE_DIVISIONS.length - 1, Math.floor(n))) : 0;
}
function ventureMonthlyNormalizeState(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const seasonKey = /^\d{4}-\d{2}$/.test(String(raw.seasonKey || '')) ? String(raw.seasonKey) : ventureMonthlyActiveSeasonKey();
  const history = {};
  Object.entries(ventureMonthlyPlainObject(raw.history)).forEach(([month, record]) => {
    if (/^\d{4}-\d{2}$/.test(month) && record && typeof record === 'object' && !Array.isArray(record)) history[month] = { ...record };
  });
  const retained = Object.keys(history).sort().slice(-VENTURE_MONTHLY_LEAGUE_HISTORY_LIMIT);
  return {
    version: VENTURE_MONTHLY_LEAGUE_VERSION,
    division: ventureMonthlyClampDivision(raw.division),
    seasonKey,
    history: Object.fromEntries(retained.map(month => [month, history[month]])),
    enrolledAt: Math.max(0, Number(raw.enrolledAt) || 0),
    updatedAt: Math.max(0, Number(raw.updatedAt) || 0)
  };
}
function mergeVentureMonthlyLeague(left, right) {
  const a = ventureMonthlyNormalizeState(left), b = ventureMonthlyNormalizeState(right);
  if (!a) return b || undefined;
  if (!b) return a;
  let winner;
  if (a.seasonKey !== b.seasonKey) winner = a.seasonKey > b.seasonKey ? a : b;
  else if (a.updatedAt !== b.updatedAt) winner = a.updatedAt > b.updatedAt ? a : b;
  else winner = a.division >= b.division ? a : b;
  const history = { ...a.history };
  Object.entries(b.history).forEach(([month, incoming]) => {
    const existing = history[month];
    if (!existing || (Number(incoming.closedAt) || 0) > (Number(existing.closedAt) || 0)) history[month] = incoming;
  });
  const months = Object.keys(history).sort().slice(-VENTURE_MONTHLY_LEAGUE_HISTORY_LIMIT);
  return {
    ...winner,
    history: Object.fromEntries(months.map(month => [month, history[month]])),
    enrolledAt: Math.min(a.enrolledAt || Infinity, b.enrolledAt || Infinity) === Infinity ? 0 : Math.min(a.enrolledAt || Infinity, b.enrolledAt || Infinity),
    updatedAt: Math.max(a.updatedAt, b.updatedAt)
  };
}
function ventureMonthlyXpForMonth(user, monthKey) {
  const transactions = ventureMonthlyPlainObject(user?.xpLedger?.transactions);
  let total = 0;
  Object.values(transactions).forEach(tx => {
    if (!tx || typeof tx !== 'object') return;
    if (ventureMonthlyMonthFromTimestamp(tx.createdAt) !== monthKey) return;
    const delta = Number(tx.delta);
    if (Number.isFinite(delta) && delta > 0) total += Math.floor(delta);
  });
  return total;
}
function ventureMonthlyPromotionCounts(activeCount) {
  const n = Math.max(0, Math.floor(Number(activeCount) || 0));
  if (n < 2) return { promote: 0, demote: 0 };
  return { promote: Math.max(1, Math.ceil(n * 0.2)), demote: n >= 5 ? Math.max(1, Math.floor(n * 0.1)) : 0 };
}
function ventureMonthlyCompareEntries(a, b) {
  return (Number(b.score) || 0) - (Number(a.score) || 0) ||
    String(a.user?.name || '').localeCompare(String(b.user?.name || ''), 'pt-BR', { sensitivity: 'base' });
}
function ventureMonthlyLeaderboardForDivision(sourceUsers, monthKey, division) {
  return Object.entries(sourceUsers || {})
    .filter(([, user]) => user && user.name && !user._deleted)
    .map(([key, user]) => ({ key, user, state: ventureMonthlyNormalizeState(user.ventureMonthlyLeague),
      division: ventureMonthlyNormalizeState(user.ventureMonthlyLeague)?.division ?? 0,
      score: ventureMonthlyXpForMonth(user, monthKey) }))
    .filter(entry => entry.division === division && (!entry.state || entry.state.seasonKey === monthKey))
    .sort(ventureMonthlyCompareEntries);
}
function ventureMonthlySaveStateIfChanged(changed) {
  if (!changed) return;
  try {
    const storageKey = typeof STORAGE_USERS_KEY === 'string' ? STORAGE_USERS_KEY : 'mequi_olimpiadas_users_v6';
    localStorage.setItem(storageKey, JSON.stringify(users));
  } catch (error) { console.warn('Não foi possível salvar o progresso das Ligas Mensais.', error); }
  if (typeof currentUserKey !== 'undefined' && currentUserKey && users[currentUserKey] && typeof scheduleCloudSync === 'function') {
    scheduleCloudSync(currentUserKey, false);
  }
}
function ventureMonthlyCloseSeason(monthKey) {
  const entries = Object.entries(users || {}).filter(([, user]) => user && user.name && !user._deleted &&
    ventureMonthlyNormalizeState(user.ventureMonthlyLeague)?.seasonKey === monthKey);
  if (!entries.length) return false;
  const groups = new Map();
  entries.forEach(([key, user]) => {
    const state = ventureMonthlyNormalizeState(user.ventureMonthlyLeague);
    const division = state?.division ?? 0;
    if (!groups.has(division)) groups.set(division, []);
    groups.get(division).push({ key, user, state, score: ventureMonthlyXpForMonth(user, monthKey) });
  });
  const nextSeason = ventureMonthlyShiftMonth(monthKey, 1);
  const closedAt = Date.now();
  groups.forEach((group, division) => {
    const sorted = group.slice().sort(ventureMonthlyCompareEntries);
    const active = sorted.filter(entry => entry.score > 0);
    const movement = ventureMonthlyPromotionCounts(active.length);
    const activeRanks = new Map(active.map((entry, index) => [entry.key, index]));
    sorted.forEach(entry => {
      const rankIndex = activeRanks.has(entry.key) ? activeRanks.get(entry.key) : -1;
      let nextDivision = division, outcome = 'stayed';
      if (rankIndex >= 0 && division < VENTURE_MONTHLY_LEAGUE_DIVISIONS.length - 1 && rankIndex < movement.promote) {
        nextDivision = division + 1; outcome = 'promoted';
      } else if (rankIndex >= 0 && division > 0 && movement.demote > 0 && rankIndex >= active.length - movement.demote) {
        nextDivision = division - 1; outcome = 'demoted';
      } else if (rankIndex < 0) outcome = 'inactive';
      const state = entry.state || ventureMonthlyNormalizeState({ division, seasonKey: monthKey, history: {} });
      state.history[monthKey] = { score: entry.score, rank: rankIndex >= 0 ? rankIndex + 1 : null,
        participants: active.length, divisionBefore: division, divisionAfter: nextDivision, outcome, closedAt };
      const historyKeys = Object.keys(state.history).sort().slice(-VENTURE_MONTHLY_LEAGUE_HISTORY_LIMIT);
      state.history = Object.fromEntries(historyKeys.map(key => [key, state.history[key]]));
      state.division = nextDivision; state.seasonKey = nextSeason; state.updatedAt = closedAt;
      entry.user.ventureMonthlyLeague = state;
      entry.user.updatedAt = Math.max(Number(entry.user.updatedAt) || 0, closedAt);
    });
  });
  return true;
}
function ventureMonthlyProcessRollovers() {
  const target = ventureMonthlyActiveSeasonKey();
  let changed = false;
  const existingMonths = Object.values(users || {}).filter(user => user && user.name && !user._deleted)
    .map(user => ventureMonthlyNormalizeState(user.ventureMonthlyLeague)?.seasonKey)
    .filter(month => month && month < target).sort();
  if (!existingMonths.length) return false;
  let cursor = existingMonths[0], guard = 0;
  while (cursor < target && guard++ < 36) {
    if (ventureMonthlyCloseSeason(cursor)) changed = true;
    cursor = ventureMonthlyShiftMonth(cursor, 1);
  }
  return changed;
}
function ventureMonthlyEnsureAllUsers() {
  if (typeof users === 'undefined' || !users || typeof users !== 'object') return false;
  let changed = ventureMonthlyProcessRollovers();
  const target = ventureMonthlyActiveSeasonKey();
  Object.entries(users).forEach(([key, user]) => {
    if (!user || !user.name || user._deleted) return;
    const current = ventureMonthlyNormalizeState(user.ventureMonthlyLeague);
    if (!current) {
      user.ventureMonthlyLeague = { version: VENTURE_MONTHLY_LEAGUE_VERSION, division: 0, seasonKey: target,
        history: {}, enrolledAt: Date.now(), updatedAt: Date.now() };
      changed = true;
    } else if (JSON.stringify(current) !== JSON.stringify(user.ventureMonthlyLeague)) {
      user.ventureMonthlyLeague = current;
      changed = true;
    }
  });
  ventureMonthlySaveStateIfChanged(changed);
  return changed;
}
function ventureMonthlyEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function ventureMonthlyMonthLabel(monthKey) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) return monthKey;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
function ventureMonthlyPeriodLabel(monthKey) {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) return monthKey;
  const year = Number(match[1]), month = Number(match[2]);
  const end = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `01/${String(month).padStart(2, '0')} – ${String(end).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}
function ventureMonthlyAvatar(user) {
  const avatar = String(user?.avatar || '🍔');
  return avatar.startsWith('data:image/') || avatar.length > 4 ? '🍔' : avatar;
}
function ventureMonthlyCreateDivisionImage(division, className) {
  const image = document.createElement('img');
  image.className = className;
  image.src = division.image;
  image.alt = '';
  image.setAttribute('aria-hidden', 'true');
  image.decoding = 'async';
  image.loading = 'lazy';
  image.draggable = false;
  return image;
}
function ventureMonthlySetDivisionLabel(node, division, className = 'vml-board-division') {
  if (!node) return;
  node.className = `${className} vml-${division.css}`;
  node.replaceChildren();
  node.append(ventureMonthlyCreateDivisionImage(division, `${className}-icon`));
  const label = document.createElement('span');
  label.textContent = `Liga ${division.name}`;
  node.append(label);
}
function ventureMonthlyRenderDivisionPath(currentDivision) {
  const path = document.getElementById('vmlDivisionPath');
  if (!path) return;
  path.replaceChildren();
  VENTURE_MONTHLY_LEAGUE_DIVISIONS.forEach((division, index) => {
    const item = document.createElement('div');
    item.className = `vml-path-item${index === currentDivision ? ' is-current' : ''}${index < currentDivision ? ' is-cleared' : ''}`;
    item.title = `${division.name}${index < currentDivision ? ' · conquistada' : index === currentDivision ? ' · sua liga atual' : ''}`;
    const icon = ventureMonthlyCreateDivisionImage(division, `vml-path-icon vml-${division.css}`);
    const label = document.createElement('small'); label.textContent = division.name;
    item.append(icon, label); path.append(item);
  });
}
function renderVentureMonthlyLeague() {
  const root = document.getElementById('ventureMonthlyLeague');
  if (!root || typeof users === 'undefined' || !users) return;
  const targetMonth = ventureMonthlyActiveSeasonKey();
  const actualMonth = ventureMonthlyMonthKey();
  const preSeason = actualMonth < VENTURE_MONTHLY_LEAGUE_LAUNCH_MONTH;
  const currentUser = typeof currentUserKey !== 'undefined' && currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted
    ? users[currentUserKey] : null;
  const currentState = ventureMonthlyNormalizeState(currentUser?.ventureMonthlyLeague) || { division: 0, seasonKey: targetMonth, history: {} };
  const division = VENTURE_MONTHLY_LEAGUE_DIVISIONS[currentState.division] || VENTURE_MONTHLY_LEAGUE_DIVISIONS[0];
  const score = currentUser ? ventureMonthlyXpForMonth(currentUser, targetMonth) : 0;
  const board = ventureMonthlyLeaderboardForDivision(users, targetMonth, currentState.division);
  const active = board.filter(entry => entry.score > 0);
  const activeIndex = active.findIndex(entry => currentUser && entry.key === currentUserKey);
  const rankIndex = board.findIndex(entry => currentUser && entry.key === currentUserKey);
  const movement = ventureMonthlyPromotionCounts(active.length);
  const promoteZone = activeIndex >= 0 && activeIndex < movement.promote && currentState.division < VENTURE_MONTHLY_LEAGUE_DIVISIONS.length - 1;

  const setText = (id, text) => { const node = document.getElementById(id); if (node) node.textContent = String(text); };
  const badge = document.getElementById('vmlCurrentBadge');
  ventureMonthlySetDivisionLabel(badge, division, 'vml-current-badge');
  setText('vmlMyMonthlyXp', score.toLocaleString('pt-BR'));
  setText('vmlMyRank', currentUser && score > 0 && rankIndex >= 0 ? `${rankIndex + 1}º de ${board.length}` : '—');
  setText('vmlPeriod', preSeason ? 'Começa em 01/11/2026' : ventureMonthlyMonthLabel(targetMonth));
  setText('vmlSeasonStatus', preSeason ? 'Em breve' : 'Ativa');
  ventureMonthlySetDivisionLabel(document.getElementById('vmlBoardDivision'), division, 'vml-board-division');
  setText('vmlPromotionCount', preSeason ? 'A temporada inaugural começa em novembro.' :
    currentState.division === 9 ? 'Você chegou à liga mais alta.' :
    promoteZone ? '🔥 Você está na zona de promoção!' : active.length < 2 ? 'Jogue para abrir a disputa da liga.' :
      'Ganhe XP nos jogos para entrar na zona de promoção.');
  setText('vmlPromotionDetail', preSeason ? 'Até lá, seu XP acumulado e o ranking geral continuam valendo normalmente.' :
    currentState.division === 9 ? 'Mantenha sua posição na Liga Diamante. Os últimos colocados podem cair se houver participantes ativos suficientes.' :
    active.length < 2 ? 'A disputa de promoção abre quando pelo menos dois participantes ganharem XP neste mês.' :
    currentState.division === 0 ? `Os ${movement.promote} melhores participantes ativos podem subir no fechamento do mês. Bronze é a divisão inicial; ninguém cai abaixo dela.` :
    `Os ${movement.promote} melhores participantes ativos podem subir no fechamento do mês. Em ligas com 5 ou mais participantes ativos, os últimos ${movement.demote} podem cair uma divisão.`);
  ventureMonthlyRenderDivisionPath(currentState.division);

  const list = document.getElementById('vmlLeaderboard');
  if (!list) return;
  list.replaceChildren();
  if (!board.length) {
    const empty = document.createElement('li'); empty.className = 'vml-empty';
    empty.textContent = 'Nenhum participante cadastrado nesta liga ainda.'; list.append(empty); return;
  }
  board.slice(0, 12).forEach((entry, index) => {
    const row = document.createElement('li');
    row.className = `vml-player-row${currentUser && entry.key === currentUserKey ? ' is-me' : ''}`;
    const rank = document.createElement('span'); rank.className = 'vml-player-rank';
    rank.textContent = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
    const avatar = document.createElement('span'); avatar.className = 'vml-player-avatar'; avatar.textContent = ventureMonthlyAvatar(entry.user);
    const details = document.createElement('span'); details.className = 'vml-player-details';
    const name = document.createElement('strong'); name.textContent = String(entry.user.name || 'Jogador');
    const subtitle = document.createElement('small');
    const history = ventureMonthlyNormalizeState(entry.user.ventureMonthlyLeague)?.history || {};
    const last = Object.keys(history).sort().pop();
    const lastResult = last && history[last];
    subtitle.textContent = entry.score > 0 ? (lastResult?.outcome === 'promoted' && last === ventureMonthlyShiftMonth(targetMonth, -1) ? 'Subiu de liga no mês passado' : 'XP conquistado nesta temporada') : 'Ainda sem XP neste mês';
    details.append(name, subtitle);
    const points = document.createElement('strong'); points.className = 'vml-player-score';
    points.textContent = `${entry.score.toLocaleString('pt-BR')} XP`;
    row.append(rank, avatar, details, points); list.append(row);
  });
}
function refreshVentureMonthlyLeague() {
  ventureMonthlyEnsureAllUsers();
  renderVentureMonthlyLeague();
}
function installVentureMonthlyMergeHook() {
  if (typeof window === 'undefined' || typeof window.mergeSingleUser !== 'function' || window.mergeSingleUser.__ventureMonthlyLeagueWrapped) return;
  const originalMerge = window.mergeSingleUser;
  const wrappedMerge = function (existing, incoming) {
    const merged = originalMerge.apply(this, arguments);
    if (merged && existing && incoming) {
      const state = mergeVentureMonthlyLeague(existing.ventureMonthlyLeague, incoming.ventureMonthlyLeague);
      if (state) merged.ventureMonthlyLeague = state;
      else delete merged.ventureMonthlyLeague;
    }
    return merged;
  };
  wrappedMerge.__ventureMonthlyLeagueWrapped = true;
  window.mergeSingleUser = wrappedMerge;
}
function installVentureMonthlyLeagueHooks() {
  if (typeof window === 'undefined') return;
  installVentureMonthlyMergeHook();
  if (typeof window.renderLeaderboard === 'function' && !window.renderLeaderboard.__ventureMonthlyLeagueWrapped) {
    const originalRender = window.renderLeaderboard;
    const wrappedRender = function () {
      // A tela do ranking geral foi removida: evite ordenar todos os cadastros para uma lista invisível.
      const legacyBoardVisible = document.getElementById('leaderboardContainer') || document.getElementById('podiumTop3Container');
      const result = legacyBoardVisible ? originalRender.apply(this, arguments) : undefined;
      refreshVentureMonthlyLeague();
      return result;
    };
    wrappedRender.__ventureMonthlyLeagueWrapped = true;
    window.renderLeaderboard = wrappedRender;
  }
  if (typeof window.switchMainTab === 'function' && !window.switchMainTab.__ventureMonthlyLeagueWrapped) {
    const originalSwitch = window.switchMainTab;
    const wrappedSwitch = function (tab) {
      const result = originalSwitch.apply(this, arguments);
      if (tab === 'prizes') refreshVentureMonthlyLeague();
      return result;
    };
    wrappedSwitch.__ventureMonthlyLeagueWrapped = true;
    window.switchMainTab = wrappedSwitch;
  }
  if (!window.__ventureMonthlyLeagueFocusHook) {
    window.__ventureMonthlyLeagueFocusHook = true;
    window.addEventListener('focus', refreshVentureMonthlyLeague);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshVentureMonthlyLeague(); });
    window.setInterval(() => { if (!document.hidden) refreshVentureMonthlyLeague(); }, 20000);
  }
}
function initVentureMonthlyLeague() {
  installVentureMonthlyLeagueHooks();
  refreshVentureMonthlyLeague();
}

if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
  window.__VentureMonthlyLeagueTest = {
    divisions: VENTURE_MONTHLY_LEAGUE_DIVISIONS,
    monthKey: ventureMonthlyMonthKey,
    activeSeasonKey: ventureMonthlyActiveSeasonKey,
    monthFromTimestamp: ventureMonthlyMonthFromTimestamp,
    shiftMonth: ventureMonthlyShiftMonth,
    monthlyXpForMonth: ventureMonthlyXpForMonth,
    promotionCounts: ventureMonthlyPromotionCounts,
    mergeState: mergeVentureMonthlyLeague,
    leaderboardForDivision: ventureMonthlyLeaderboardForDivision,
    closeSeason: ventureMonthlyCloseSeason,
    normalizeState: ventureMonthlyNormalizeState,
    installHooks: installVentureMonthlyLeagueHooks
  };
}
if (typeof window !== 'undefined') {
  installVentureMonthlyMergeHook();
  const previousOnload = window.onload;
  window.onload = async function (event) {
    if (typeof previousOnload === 'function') await previousOnload.call(this, event);
    initVentureMonthlyLeague();
  };
}
