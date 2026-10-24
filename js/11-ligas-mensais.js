/* Venture 9.2.0 · ledger de XP, ligas mensais e badges Big Mac.
   O ledger melhora a reconciliação local; não substitui validação autoritativa no servidor. */
(function () {
  "use strict";
  const FIRST_SEASON = "2026-11";
  const LEDGER_LIMIT = 5000;
  const DIVISIONS = [
    { id: "bronze", name: "Bronze", icon: "🥉", emoji: "🍔", css: "vml-bronze" },
    { id: "silver", name: "Prata", icon: "🥈", emoji: "🍔", css: "vml-silver" },
    { id: "gold", name: "Ouro", icon: "🥇", emoji: "🍔", css: "vml-gold" },
    { id: "sapphire", name: "Safira", icon: "💠", emoji: "🍔", css: "vml-sapphire" },
    { id: "ruby", name: "Rubi", icon: "❤️", emoji: "🍔", css: "vml-ruby" },
    { id: "emerald", name: "Esmeralda", icon: "💚", emoji: "🍔", css: "vml-emerald" },
    { id: "amethyst", name: "Ametista", icon: "💜", emoji: "🍔", css: "vml-amethyst" },
    { id: "pearl", name: "Pérola", icon: "🤍", emoji: "🍔", css: "vml-pearl" },
    { id: "obsidian", name: "Obsidiana", icon: "⚫", emoji: "🍔", css: "vml-obsidian" },
    { id: "diamond", name: "Diamante", icon: "💎", emoji: "🍔", css: "vml-diamond" }
  ];
  let generatedIdCounter = 0;
  const currentUser = function () {
    if (typeof currentUserKey === "undefined" || typeof users === "undefined" || !currentUserKey) return null;
    const user = users[currentUserKey];
    return user && user.name && !user._deleted ? user : null;
  };
  const makeId = function (prefix) {
    let random = "";
    try { random = crypto.randomUUID(); } catch (_) { random = Math.random().toString(36).slice(2); }
    generatedIdCounter += 1;
    return String(prefix || "xp") + ":" + Date.now().toString(36) + ":" + generatedIdCounter + ":" + random;
  };
  const toNumber = function (value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };
  const monthKey = function (date) {
    const d = date || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  };
  const parseMonth = function (key) {
    const match = /^(\d{4})-(\d{2})$/.exec(String(key || ""));
    if (!match) return null;
    return { year: Number(match[1]), month: Number(match[2]) - 1 };
  };
  const monthStart = function (key) {
    const p = parseMonth(key);
    return p ? new Date(p.year, p.month, 1).getTime() : 0;
  };
  const nextMonthKey = function (key) {
    const p = parseMonth(key);
    if (!p) return null;
    return monthKey(new Date(p.year, p.month + 1, 1));
  };
  const previousMonthKey = function (key) {
    const p = parseMonth(key);
    if (!p) return null;
    return monthKey(new Date(p.year, p.month - 1, 1));
  };
  const formatMonth = function (key) {
    const p = parseMonth(key);
    if (!p) return String(key || "");
    return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(p.year, p.month, 1));
  };
  const isPreseason = function () { return monthKey() < FIRST_SEASON; };
  const activeSeason = function () { return isPreseason() ? FIRST_SEASON : monthKey(); };
  const getDivisionIndex = function (user) {
    const id = user && user.ventureLeague && user.ventureLeague.divisionId;
    const index = DIVISIONS.findIndex(function (division) { return division.id === id; });
    return index < 0 ? 0 : index;
  };
  const getLeagueState = function (user) {
    if (!user.ventureLeague || typeof user.ventureLeague !== "object") {
      user.ventureLeague = { divisionId: "bronze", updatedAt: 0, history: [], lastFinalizedSeason: null, lastSeenSeason: null };
    }
    if (!Array.isArray(user.ventureLeague.history)) user.ventureLeague.history = [];
    if (!DIVISIONS.some(function (d) { return d.id === user.ventureLeague.divisionId; })) user.ventureLeague.divisionId = "bronze";
    return user.ventureLeague;
  };
  const ensureLedger = function (user) {
    if (!user.ventureXpLedger || typeof user.ventureXpLedger !== "object") user.ventureXpLedger = { version: 1, entries: [] };
    if (!Array.isArray(user.ventureXpLedger.entries)) user.ventureXpLedger.entries = [];
    return user.ventureXpLedger;
  };
  const mergeEntries = function (lists) {
    const byId = new Map();
    (lists || []).forEach(function (list) {
      (Array.isArray(list) ? list : []).forEach(function (entry) {
        if (!entry || !entry.id) return;
        const prior = byId.get(String(entry.id));
        if (!prior || (entry.status === "applied" && prior.status !== "applied") || (Number(entry.at) || 0) > (Number(prior.at) || 0)) {
          byId.set(String(entry.id), Object.assign({}, prior || {}, entry));
        } else if (prior.status !== "applied" && entry.status === "applied") {
          byId.set(String(entry.id), Object.assign({}, prior, entry));
        }
      });
    });
    return Array.from(byId.values()).sort(function (a, b) { return (Number(a.at) || 0) - (Number(b.at) || 0); }).slice(-LEDGER_LIMIT);
  };
  const mergeNotifications = function (lists) {
    const byId = new Map();
    (lists || []).forEach(function (list) {
      (Array.isArray(list) ? list : []).forEach(function (item) {
        if (!item || !item.id) return;
        const id = String(item.id);
        const prior = byId.get(id);
        if (!prior) byId.set(id, Object.assign({}, item));
        else byId.set(id, Object.assign({}, prior, item, {
          readAt: prior.readAt || item.readAt || null,
          createdAt: Math.min(Number(prior.createdAt) || Date.now(), Number(item.createdAt) || Date.now())
        }));
      });
    });
    return Array.from(byId.values()).sort(function (a, b) { return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0); }).slice(0, 100);
  };
  const mergeArena = function (a, b) {
    const left = a && a.days && typeof a.days === "object" ? a.days : {};
    const right = b && b.days && typeof b.days === "object" ? b.days : {};
    const days = Object.assign({}, left);
    Object.keys(right).forEach(function (day) {
      const oldRun = days[day], newRun = right[day];
      if (!oldRun) { days[day] = newRun; return; }
      if (!newRun) return;
      const oldAnswered = Array.isArray(oldRun.questions) ? oldRun.questions.filter(function (q) { return q.answered; }).length : 0;
      const newAnswered = Array.isArray(newRun.questions) ? newRun.questions.filter(function (q) { return q.answered; }).length : 0;
      if (newRun.status === "completed" && oldRun.status !== "completed") { days[day] = newRun; return; }
      if (oldRun.status === "completed" && newRun.status !== "completed") return;
      days[day] = newAnswered > oldAnswered ? newRun : oldRun;
    });
    return { version: 1, days: days };
  };
  const mergeLeague = function (a, b) {
    if (!a) return b || null;
    if (!b) return a;
    const chosen = (Number(b.updatedAt) || 0) >= (Number(a.updatedAt) || 0) ? b : a;
    const history = new Map();
    [].concat(Array.isArray(a.history) ? a.history : [], Array.isArray(b.history) ? b.history : []).forEach(function (item) {
      if (item && item.season) {
        const prior = history.get(item.season);
        if (!prior || (Number(item.finalizedAt) || 0) >= (Number(prior.finalizedAt) || 0)) history.set(item.season, item);
      }
    });
    return Object.assign({}, chosen, { history: Array.from(history.values()).sort(function (x, y) { return String(x.season).localeCompare(String(y.season)); }).slice(-12) });
  };
  const persist = function (sync) {
    try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); } catch (_) {}
    if (sync && typeof currentUserKey !== "undefined" && currentUserKey && typeof scheduleCloudSync === "function") scheduleCloudSync(currentUserKey, false);
  };
  const getSeasonXp = function (user, season) {
    if (!user) return 0;
    const ledger = ensureLedger(user);
    const start = monthStart(season);
    const end = monthStart(nextMonthKey(season));
    if (!start || !end) return 0;
    return ledger.entries.reduce(function (sum, entry) {
      const at = Number(entry && entry.at) || 0;
      if (entry && entry.status === "applied" && at >= start && at < end) return sum + toNumber(entry.amount);
      return sum;
    }, 0);
  };
  const saveLedger = function (user, entry) {
    const ledger = ensureLedger(user);
    const index = ledger.entries.findIndex(function (item) { return item.id === entry.id; });
    if (index >= 0) ledger.entries[index] = Object.assign({}, ledger.entries[index], entry);
    else ledger.entries.push(entry);
    ledger.entries = mergeEntries([ledger.entries]);
    ledger.updatedAt = Date.now();
  };
  const originalAddXp = typeof addXp === "function" ? addXp : null;
  if (originalAddXp && !originalAddXp.__ventureLedgerWrapped) {
    const wrappedAddXp = function (amount, rewardId) {
      const user = currentUser();
      if (!user || !originalAddXp) return originalAddXp.apply(this, arguments);
      const baseAmount = toNumber(amount);
      if (!baseAmount) return originalAddXp.apply(this, arguments);
      const id = rewardId ? String(rewardId) : makeId("xp");
      const ledger = ensureLedger(user);
      const prior = ledger.entries.find(function (entry) { return entry && entry.id === id; });
      if (prior && prior.status === "applied") return 0;
      const beforeXp = toNumber(user.xp);
      let entry = prior;
      if (!entry) {
        const expected = typeof xpForReward === "function" ? toNumber(xpForReward(baseAmount)) : baseAmount;
        entry = { id: id, at: Date.now(), status: "pending", baseAmount: baseAmount, amount: expected, beforeXp: beforeXp, expectedAfterXp: beforeXp + expected, source: "client" };
        saveLedger(user, entry);
        persist(false);
      }
      const gained = originalAddXp.call(this, baseAmount);
      if (gained > 0) {
        saveLedger(user, Object.assign({}, entry, { status: "applied", amount: gained, beforeXp: beforeXp, afterXp: toNumber(user.xp), appliedAt: Date.now() }));
        persist(false);
        if (typeof scheduleCloudSync === "function" && currentUserKey) scheduleCloudSync(currentUserKey, false);
        renderMonthlyLeague();
      } else {
        const entries = ensureLedger(user).entries;
        user.ventureXpLedger.entries = entries.filter(function (item) { return item.id !== id; });
        persist(false);
      }
      return gained;
    };
    wrappedAddXp.__ventureLedgerWrapped = true;
    addXp = wrappedAddXp;
  }
  function recoverPendingEntries(user) {
    if (!user || !originalAddXp) return;
    const ledger = ensureLedger(user);
    let changed = false;
    ledger.entries.slice().forEach(function (entry) {
      if (!entry || entry.status !== "pending") return;
      const before = toNumber(entry.beforeXp);
      const expectedAfter = toNumber(entry.expectedAfterXp);
      const currentXp = toNumber(user.xp);
      if (currentXp >= expectedAfter && currentXp > before) {
        saveLedger(user, Object.assign({}, entry, { status: "applied", amount: expectedAfter - before, afterXp: currentXp, recoveredAt: Date.now() }));
        changed = true;
      } else if (currentXp === before) {
        const gained = originalAddXp.call(null, toNumber(entry.baseAmount));
        if (gained > 0) {
          saveLedger(user, Object.assign({}, entry, { status: "applied", amount: gained, afterXp: toNumber(user.xp), recoveredAt: Date.now() }));
          changed = true;
        }
      }
    });
    if (changed) persist(true);
  }
  if (typeof mergeSingleUser === "function" && !mergeSingleUser.__ventureMergeWrapped) {
    const originalMerge = mergeSingleUser;
    const wrappedMerge = function (existing, incoming) {
      const merged = originalMerge.apply(this, arguments);
      if (!merged) return merged;
      merged.ventureXpLedger = { version: 1, entries: mergeEntries([
        existing && existing.ventureXpLedger && existing.ventureXpLedger.entries,
        incoming && incoming.ventureXpLedger && incoming.ventureXpLedger.entries,
        merged.ventureXpLedger && merged.ventureXpLedger.entries
      ]) };
      merged.ventureNotifications = mergeNotifications([
        existing && existing.ventureNotifications, incoming && incoming.ventureNotifications, merged.ventureNotifications
      ]);
      merged.ventureArena = mergeArena(existing && existing.ventureArena, incoming && incoming.ventureArena);
      merged.ventureLeague = mergeLeague(existing && existing.ventureLeague, incoming && incoming.ventureLeague);
      if (existing && existing.ventureAllStar || incoming && incoming.ventureAllStar || merged.ventureAllStar) {
        const oldStar = existing && existing.ventureAllStar || {};
        const newStar = incoming && incoming.ventureAllStar || {};
        const currentStar = merged.ventureAllStar || {};
        merged.ventureAllStar = Object.assign({}, oldStar, newStar, currentStar);
      }
      return merged;
    };
    wrappedMerge.__ventureMergeWrapped = true;
    mergeSingleUser = wrappedMerge;
  }
  const getAllUsers = function () {
    if (typeof users === "undefined" || !users) return [];
    return Object.entries(users).filter(function (pair) { return pair[1] && pair[1].name && !pair[1]._deleted; });
  };
  const createNode = function (tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };
  function renderDivisionPath(currentIndex) {
    const root = document.getElementById("vmlDivisionPath");
    if (!root) return;
    root.replaceChildren();
    DIVISIONS.forEach(function (division, index) {
      const item = createNode("div", "vml-path-item " + division.css + (index < currentIndex ? " is-cleared" : "") + (index === currentIndex ? " is-current" : ""));
      const icon = createNode("span", "vml-path-icon");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = division.emoji;
      icon.style.borderColor = "var(--vml-tier)";
      icon.style.boxShadow = "inset 0 -4px 0 color-mix(in srgb,var(--vml-tier) 25%,transparent)";
      const name = createNode("small", "", division.name);
      item.append(icon, name);
      root.appendChild(item);
    });
  }
  function renderLeagueBadge(containerId, user) {
    const anchor = document.getElementById(containerId === "ventureLeagueProfileBadge" ? "premiumEquippedTitle" : "publicProfileTitle");
    if (!anchor || !user) return;
    let badge = document.getElementById(containerId);
    if (!badge) {
      badge = createNode("div", "vml-profile-badge");
      badge.id = containerId;
      anchor.insertAdjacentElement("afterend", badge);
    }
    const index = getDivisionIndex(user);
    const division = DIVISIONS[index];
    badge.className = "vml-profile-badge " + division.css;
    badge.replaceChildren();
    const burger = createNode("span", "vml-profile-burger", division.emoji);
    burger.setAttribute("aria-hidden", "true");
    const label = createNode("span", "vml-profile-label", "Liga " + division.name);
    const season = createNode("small", "vml-profile-season", isPreseason() ? "Estreia em novembro" : "Temporada " + formatMonth(activeSeason()));
    badge.append(burger, label, season);
  }
  function getMonthlyRows(divisionIndex, season) {
    return getAllUsers().map(function (pair) {
      return { key: pair[0], user: pair[1], divisionIndex: getDivisionIndex(pair[1]), xp: getSeasonXp(pair[1], season) };
    }).filter(function (row) { return row.divisionIndex === divisionIndex; }).sort(function (a, b) {
      return b.xp - a.xp || String(a.user.name).localeCompare(String(b.user.name), "pt-BR");
    });
  }
  function ensureFinalizeButton() {
    const detail = document.getElementById("vmlPromotionDetail");
    if (!detail) return;
    let button = document.getElementById("vmlFinalizeSeasonBtn");
    if (!button) {
      button = createNode("button", "vml-admin-finalize", "Fechar temporada anterior");
      button.id = "vmlFinalizeSeasonBtn";
      button.type = "button";
      button.addEventListener("click", closePreviousSeason);
      detail.insertAdjacentElement("afterend", button);
    }
    const current = monthKey();
    const previous = previousMonthKey(current);
    const eligible = previous && previous >= FIRST_SEASON;
    const needsClose = getAllUsers().some(function (pair) {
      const league = pair[1].ventureLeague;
      return !league || !league.lastFinalizedSeason || String(league.lastFinalizedSeason) < previous;
    });
    const admin = typeof isAdminUnlocked !== "undefined" && Boolean(isAdminUnlocked);
    button.classList.toggle("hidden", !(admin && eligible && needsClose));
  }
  function renderMonthlyLeague() {
    const root = document.getElementById("ventureMonthlyLeague");
    if (!root) return;
    const user = currentUser();
    const season = activeSeason();
    const index = user ? getDivisionIndex(user) : 0;
    const division = DIVISIONS[index];
    const badge = document.getElementById("vmlCurrentBadge");
    const xpEl = document.getElementById("vmlMyMonthlyXp");
    const rankEl = document.getElementById("vmlMyRank");
    const statusEl = document.getElementById("vmlSeasonStatus");
    const periodEl = document.getElementById("vmlPeriod");
    const boardDivision = document.getElementById("vmlBoardDivision");
    const promo = document.getElementById("vmlPromotionCount");
    const detail = document.getElementById("vmlPromotionDetail");
    const list = document.getElementById("vmlLeaderboard");
    if (badge) { badge.className = "vml-current-badge " + division.css; badge.textContent = division.emoji + " Liga " + division.name; }
    if (boardDivision) boardDivision.textContent = division.emoji + " Liga " + division.name;
    if (xpEl) xpEl.textContent = (user ? getSeasonXp(user, season) : 0).toLocaleString("pt-BR") + " XP";
    if (statusEl) statusEl.textContent = isPreseason() ? "Pré-temporada" : "Em andamento";
    if (periodEl) periodEl.textContent = isPreseason() ? "Começa em 1º de novembro de 2026" : formatMonth(season);
    renderDivisionPath(index);
    const rows = getMonthlyRows(index, season);
    if (rankEl) {
      const myIndex = user ? rows.findIndex(function (row) { return row.key === currentUserKey; }) : -1;
      rankEl.textContent = myIndex >= 0 ? (myIndex + 1) + "º" : "—";
    }
    if (list) {
      list.replaceChildren();
      if (!rows.length) {
        list.appendChild(createNode("li", "vml-empty", "Nenhum jogador cadastrado nesta liga ainda."));
      } else {
        rows.forEach(function (row, rowIndex) {
          const item = createNode("li", "vml-player-row" + (row.key === currentUserKey ? " is-me" : ""));
          const rank = createNode("span", "vml-player-rank", String(rowIndex + 1));
          const avatar = createNode("span", "vml-player-avatar");
          if (typeof row.user.avatar === "string" && row.user.avatar.startsWith("data:image/")) {
            const image = document.createElement("img");
            image.src = row.user.avatar;
            image.alt = "Avatar de " + row.user.name;
            image.loading = "lazy";
            image.style.width = "100%";
            image.style.height = "100%";
            image.style.objectFit = "cover";
            avatar.appendChild(image);
          } else avatar.textContent = row.user.avatar || "🍔";
          const info = createNode("span", "vml-player-details");
          info.append(createNode("strong", "", row.user.name), createNode("small", "", row.xp.toLocaleString("pt-BR") + " XP nesta temporada"));
          const score = createNode("span", "vml-player-score", row.xp.toLocaleString("pt-BR") + " XP");
          item.append(rank, avatar, info, score);
          list.appendChild(item);
        });
      }
    }
    const active = rows.filter(function (row) { return row.xp > 0; });
    if (promo && detail) {
      if (isPreseason()) {
        promo.textContent = "A primeira temporada começa em novembro de 2026.";
        detail.textContent = "Seu XP acumulado continua intacto. A partir de novembro, apenas o XP conquistado no mês contará para a liga.";
      } else if (active.length < 5) {
        promo.textContent = "Aguardando pelo menos 5 participantes ativos nesta liga.";
        detail.textContent = "Jogadores sem XP no mês não são rebaixados automaticamente. Promoções e rebaixamentos são calculados no fechamento da temporada.";
      } else {
        const promotions = Math.max(1, Math.floor(active.length * 0.2));
        const relegations = index > 0 ? Math.max(1, Math.floor(active.length * 0.2)) : 0;
        const activeRank = active.findIndex(function (row) { return user && row.key === currentUserKey; });
        if (activeRank >= 0 && activeRank < promotions && index < DIVISIONS.length - 1) promo.textContent = "🔥 Você está na zona de promoção! Posição " + (activeRank + 1) + " entre " + active.length + ".";
        else if (activeRank >= active.length - relegations && relegations > 0) promo.textContent = "⚠️ Atenção: você está na zona de rebaixamento.";
        else promo.textContent = "Zona de promoção: top " + promotions + " participante(s) ativo(s).";
        detail.textContent = "A prévia é calculada com os dados sincronizados disponíveis neste aparelho. O fechamento definitivo deve ser feito pelo administrador após o fim do mês.";
      }
    }
    if (user) {
      const league = getLeagueState(user);
      if (!isPreseason() && league.lastSeenSeason !== season) {
        league.lastSeenSeason = season;
        if (window.VentureNotifications && typeof window.VentureNotifications.addForUser === "function") {
          window.VentureNotifications.addForUser(currentUserKey, "Nova temporada começou", "A liga de " + formatMonth(season) + " está aberta. Ganhe XP nos treinos e jogos para subir de divisão.", "season", "season-start:" + season);
        }
        persist(false);
      }
      renderLeagueBadge("ventureLeagueProfileBadge", user);
    }
    if (typeof publicProfileSelectedKey !== "undefined" && publicProfileSelectedKey && typeof users !== "undefined") {
      const publicUser = users[publicProfileSelectedKey];
      if (publicUser && !publicUser._deleted) renderLeagueBadge("ventureLeaguePublicBadge", publicUser);
    }
    ensureFinalizeButton();
  }
  function closePreviousSeason() {
    if (!(typeof isAdminUnlocked !== "undefined" && isAdminUnlocked)) {
      alert("Somente o administrador pode fechar a temporada.");
      return;
    }
    const current = monthKey();
    const season = previousMonthKey(current);
    if (!season || season < FIRST_SEASON) {
      alert("Ainda não existe uma temporada mensal concluída para fechar.");
      return;
    }
    const entries = getAllUsers();
    if (!entries.length) return;
    const groups = new Map();
    entries.forEach(function (pair) {
      const index = getDivisionIndex(pair[1]);
      if (!groups.has(index)) groups.set(index, []);
      const xp = getSeasonXp(pair[1], season);
      if (xp > 0) groups.get(index).push({ key: pair[0], user: pair[1], xp: xp });
    });
    groups.forEach(function (group, index) {
      group.sort(function (a, b) { return b.xp - a.xp || String(a.user.name).localeCompare(String(b.user.name), "pt-BR"); });
      if (group.length < 5) return;
      const promoteCount = index < DIVISIONS.length - 1 ? Math.max(1, Math.floor(group.length * 0.2)) : 0;
      const demoteCount = index > 0 ? Math.max(1, Math.floor(group.length * 0.2)) : 0;
      group.forEach(function (row, rank) {
        const league = getLeagueState(row.user);
        if (league.lastFinalizedSeason && league.lastFinalizedSeason >= season) return;
        let newIndex = index, result = "permaneceu";
        if (promoteCount && rank < promoteCount) { newIndex = index + 1; result = "promovido"; }
        else if (demoteCount && rank >= group.length - demoteCount) { newIndex = index - 1; result = "rebaixado"; }
        league.divisionId = DIVISIONS[newIndex].id;
        league.updatedAt = Date.now();
        league.lastFinalizedSeason = season;
        league.history = (league.history || []).filter(function (item) { return item.season !== season; });
        league.history.push({ season: season, divisionId: DIVISIONS[index].id, result: result, xp: row.xp, finalizedAt: Date.now() });
        league.history = league.history.slice(-12);
        if (result !== "permaneceu" && window.VentureNotifications && typeof window.VentureNotifications.addForUser === "function") {
          window.VentureNotifications.addForUser(row.key, result === "promovido" ? "Você subiu de liga! " + DIVISIONS[newIndex].name : "Resultado da liga mensal", result === "promovido" ? "Parabéns! Você avançou para a Liga " + DIVISIONS[newIndex].name + "." : "Você foi para a Liga " + DIVISIONS[newIndex].name + ". Continue treinando para voltar a subir.", result === "promovido" ? "promotion" : "league", "league-result:" + season + ":" + row.key);
        }
      });
    });
    entries.forEach(function (pair) {
      const league = getLeagueState(pair[1]);
      if (!league.lastFinalizedSeason || league.lastFinalizedSeason < season) {
        league.lastFinalizedSeason = season;
        league.updatedAt = Date.now();
        league.history = (league.history || []).filter(function (item) { return item.season !== season; });
        league.history.push({ season: season, divisionId: league.divisionId, result: "sem-participacao", xp: getSeasonXp(pair[1], season), finalizedAt: Date.now() });
        league.history = league.history.slice(-12);
      }
    });
    try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); } catch (_) {}
    if (typeof currentUserKey !== "undefined" && currentUserKey && typeof scheduleCloudSync === "function") scheduleCloudSync(currentUserKey, true);
    renderMonthlyLeague();
    alert("Temporada " + formatMonth(season) + " fechada. As ligas e os avisos de resultado foram atualizados neste conjunto de dados. Confira a sincronização antes de divulgar o resultado oficial.");
  }
  function recoverCurrentUser() {
    const user = currentUser();
    if (!user) return;
    ensureLedger(user);
    getLeagueState(user);
    recoverPendingEntries(user);
  }
  const previousHeader = typeof updateHeaderUI === "function" ? updateHeaderUI : null;
  if (previousHeader && !previousHeader.__ventureLeagueWrapped) {
    const wrapped = function () {
      const result = previousHeader.apply(this, arguments);
      recoverCurrentUser();
      renderMonthlyLeague();
      return result;
    };
    wrapped.__ventureLeagueWrapped = true;
    updateHeaderUI = wrapped;
  }
  const previousLeaderboard = typeof renderLeaderboard === "function" ? renderLeaderboard : null;
  if (previousLeaderboard && !previousLeaderboard.__ventureLeagueWrapped) {
    const wrapped = function () {
      const result = previousLeaderboard.apply(this, arguments);
      renderMonthlyLeague();
      return result;
    };
    wrapped.__ventureLeagueWrapped = true;
    renderLeaderboard = wrapped;
  }
  const previousProfile = typeof renderPremiumProfile === "function" ? renderPremiumProfile : null;
  if (previousProfile && !previousProfile.__ventureLeagueWrapped) {
    const wrapped = function () {
      const result = previousProfile.apply(this, arguments);
      const user = currentUser();
      if (user) renderLeagueBadge("ventureLeagueProfileBadge", user);
      return result;
    };
    wrapped.__ventureLeagueWrapped = true;
    renderPremiumProfile = wrapped;
  }
  const previousPublicProfile = typeof renderPublicProfile === "function" ? renderPublicProfile : null;
  if (previousPublicProfile && !previousPublicProfile.__ventureLeagueWrapped) {
    const wrapped = function () {
      const result = previousPublicProfile.apply(this, arguments);
      const key = typeof publicProfileSelectedKey !== "undefined" ? publicProfileSelectedKey : null;
      if (key && typeof users !== "undefined" && users[key]) renderLeagueBadge("ventureLeaguePublicBadge", users[key]);
      return result;
    };
    wrapped.__ventureLeagueWrapped = true;
    renderPublicProfile = wrapped;
  }
  window.VentureLeagues = {
    divisions: DIVISIONS,
    firstSeason: FIRST_SEASON,
    getSeasonXp: getSeasonXp,
    getSeasonKey: activeSeason,
    getDivision: function (user) { return DIVISIONS[getDivisionIndex(user)]; },
    render: renderMonthlyLeague,
    closePreviousSeason: closePreviousSeason,
    getSeasonHistory: function (user) { return (user && user.ventureLeague && Array.isArray(user.ventureLeague.history) ? user.ventureLeague.history.slice() : []); }
  };
  window.renderVentureMonthlyLeague = renderMonthlyLeague;
  window.closeVenturePreviousSeason = closePreviousSeason;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () {
    recoverCurrentUser();
    renderMonthlyLeague();
  }, { once: true });
  else { recoverCurrentUser(); renderMonthlyLeague(); }
})();