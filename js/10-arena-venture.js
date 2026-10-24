/* Venture 9.2.0 · Arena diária. XP oficial, tentativa diária e recuperação por ID. */
(function () {
  "use strict";
  const DAY_MS = 86400000;
  const DAY_KEY = function (date) {
    const d = date || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const userNow = function () {
    if (typeof currentUserKey === "undefined" || typeof users === "undefined" || !currentUserKey) return null;
    const user = users[currentUserKey];
    return user && user.name && !user._deleted ? user : null;
  };
  const getBank = function () {
    if (typeof getQuestionBank === "function") return getQuestionBank();
    if (typeof QUESTIONS_DB !== "undefined" && Array.isArray(QUESTIONS_DB)) return QUESTIONS_DB;
    return [];
  };
  const safeId = function (value) { return String(value); };
  const shuffle = function (items) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  };
  const ensureState = function (user) {
    if (!user.ventureArena || typeof user.ventureArena !== "object") user.ventureArena = { version: 1, days: {} };
    if (!user.ventureArena.days || typeof user.ventureArena.days !== "object") user.ventureArena.days = {};
    return user.ventureArena;
  };
  const persist = function (immediate) {
    try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); } catch (_) {}
    if (typeof currentUserKey !== "undefined" && currentUserKey && typeof scheduleCloudSync === "function") {
      scheduleCloudSync(currentUserKey, Boolean(immediate));
    }
    renderStats();
  };
  const todayState = function (user) {
    const state = ensureState(user);
    const day = DAY_KEY();
    if (!state.days[day]) state.days[day] = null;
    return { state: state, day: day, run: state.days[day] };
  };
  const questionFor = function (id) {
    return getBank().find(function (q) { return safeId(q.id) === safeId(id); }) || null;
  };
  const chooseQuestions = function (user) {
    const bank = getBank().filter(function (q) { return q && q.q && q.a && Array.isArray(q.w) && q.w.length; });
    if (bank.length < 5) return [];
    const mistakes = Array.isArray(user.mistakes) ? user.mistakes : [];
    const mistakePool = shuffle(bank.filter(function (q) {
      return mistakes.some(function (id) { return safeId(id) === safeId(q.id); });
    }));
    const chosen = mistakePool.slice(0, 3);
    const chosenIds = new Set(chosen.map(function (q) { return safeId(q.id); }));
    shuffle(bank.filter(function (q) { return !chosenIds.has(safeId(q.id)); })).slice(0, 5 - chosen.length).forEach(function (q) { chosen.push(q); });
    return shuffle(chosen).slice(0, 5).map(function (q) {
      return { id: q.id, options: shuffle([q.a].concat(q.w)).slice(0, 4), answered: false, correct: false, selected: null, rewardId: null };
    });
  };
  const showMessage = function (message, tone) {
    const el = document.getElementById("ventureArenaMessage");
    if (!el) return;
    el.textContent = message;
    el.className = "relative z-10 rounded-xl p-3 text-xs font-bold " + (tone === "success" ? "bg-emerald-500/10 text-emerald-600" : tone === "warning" ? "bg-amber-500/10 text-amber-700" : "bg-slate-500/10");
  };
  function renderStats() {
    const user = userNow();
    const runsEl = document.getElementById("ventureArenaRuns");
    const correctEl = document.getElementById("ventureArenaCorrect");
    const bestEl = document.getElementById("ventureArenaBest");
    if (!runsEl || !correctEl || !bestEl) return;
    if (!user) { runsEl.textContent = "0"; correctEl.textContent = "0"; bestEl.textContent = "0/5"; return; }
    const days = ensureState(user).days;
    const cutoff = Date.now() - 30 * DAY_MS;
    const runs = Object.entries(days).filter(function (pair) {
      const run = pair[1];
      return run && run.status === "completed" && Number(run.completedAt) >= cutoff;
    }).map(function (pair) { return pair[1]; });
    runsEl.textContent = String(runs.length);
    correctEl.textContent = String(runs.reduce(function (sum, run) { return sum + (Number(run.score) || 0); }, 0));
    bestEl.textContent = String(runs.reduce(function (best, run) { return Math.max(best, Number(run.score) || 0); }, 0)) + "/5";
  }
  function showIntro() {
    const intro = document.getElementById("ventureArenaIntro");
    const game = document.getElementById("ventureArenaGame");
    const summary = document.getElementById("ventureArenaSummary");
    if (intro) intro.classList.remove("hidden");
    if (game) game.classList.add("hidden");
    if (summary) summary.classList.add("hidden");
  }
  function showGame() {
    const intro = document.getElementById("ventureArenaIntro");
    const game = document.getElementById("ventureArenaGame");
    const summary = document.getElementById("ventureArenaSummary");
    if (intro) intro.classList.add("hidden");
    if (game) game.classList.remove("hidden");
    if (summary) summary.classList.add("hidden");
  }
  function showSummary(run) {
    const intro = document.getElementById("ventureArenaIntro");
    const game = document.getElementById("ventureArenaGame");
    const summary = document.getElementById("ventureArenaSummary");
    if (intro) intro.classList.add("hidden");
    if (game) game.classList.add("hidden");
    if (summary) summary.classList.remove("hidden");
    const score = Number(run.score) || 0;
    const scoreEl = document.getElementById("ventureArenaScore");
    const rewardEl = document.getElementById("ventureArenaReward");
    const detailEl = document.getElementById("ventureArenaSummaryDetail");
    if (scoreEl) scoreEl.textContent = score + "/5 acertos";
    if (rewardEl) rewardEl.textContent = "XP base da Arena: " + (score * 20 + (score >= 4 ? 50 : 0)) + " XP. O multiplicador atual continua valendo.";
    if (detailEl) detailEl.textContent = score >= 4 ? "Excelente! Você alcançou o bônus diário." : "Revise suas dúvidas e tente novamente amanhã.";
    const start = document.getElementById("ventureArenaStartBtn");
    if (start) { start.disabled = true; start.textContent = "Desafio de hoje concluído"; }
    showMessage("Desafio concluído! Seu progresso foi salvo neste cadastro.", "success");
  }
  function renderQuestion() {
    const user = userNow();
    if (!user) return;
    const dayData = todayState(user);
    const run = dayData.run;
    if (!run || run.status !== "in-progress") return;
    const index = Math.max(0, Math.min(Number(run.index) || 0, run.questions.length - 1));
    run.index = index;
    const item = run.questions[index];
    const question = questionFor(item.id);
    if (!question) { showMessage("Não foi possível carregar uma questão. O progresso foi preservado.", "warning"); return; }
    const meta = document.getElementById("ventureArenaQuestionMeta");
    const number = document.getElementById("ventureArenaQuestionNumber");
    const progress = document.getElementById("ventureArenaProgress");
    const track = document.getElementById("ventureArenaProgressTrack");
    const questionEl = document.getElementById("ventureArenaQuestion");
    const optionsEl = document.getElementById("ventureArenaOptions");
    const feedback = document.getElementById("ventureArenaFeedback");
    const next = document.getElementById("ventureArenaNextBtn");
    if (meta) meta.textContent = "Questão " + (index + 1) + " de " + run.questions.length;
    if (number) number.textContent = (index + 1) + "/" + run.questions.length;
    if (progress) progress.style.width = (index / run.questions.length * 100) + "%";
    if (track) track.setAttribute("aria-valuenow", String(index));
    if (questionEl) questionEl.textContent = question.q;
    if (optionsEl) {
      optionsEl.replaceChildren();
      item.options.forEach(function (option, optionIndex) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "venture-arena-option";
        button.dataset.optionIndex = String(optionIndex);
        const letter = document.createElement("span");
        letter.className = "venture-arena-option-letter";
        letter.textContent = String.fromCharCode(65 + optionIndex);
        const label = document.createElement("span");
        label.textContent = option;
        button.append(letter, label);
        button.addEventListener("click", function () { answerCurrent(optionIndex); });
        optionsEl.appendChild(button);
      });
    }
    if (feedback) { feedback.classList.add("hidden"); feedback.textContent = ""; }
    if (next) { next.classList.add("hidden"); next.textContent = index === run.questions.length - 1 ? "Ver resultado →" : "Próxima questão →"; }
    if (item.answered) restoreAnsweredUI(item, question);
    persist(false);
  }
  function restoreAnsweredUI(item, question) {
    const optionsEl = document.getElementById("ventureArenaOptions");
    const feedback = document.getElementById("ventureArenaFeedback");
    const next = document.getElementById("ventureArenaNextBtn");
    if (optionsEl) Array.from(optionsEl.querySelectorAll("button")).forEach(function (button) {
      const option = item.options[Number(button.dataset.optionIndex)];
      button.disabled = true;
      if (option === question.a) button.classList.add("is-correct");
      if (option === item.selected && !item.correct) button.classList.add("is-wrong");
    });
    if (feedback) {
      feedback.classList.remove("hidden");
      feedback.textContent = item.correct ? "✅ Correto! +20 XP base." : "❌ Resposta incorreta. A questão foi adicionada às suas dúvidas.";
      feedback.className = "rounded-xl p-3 text-xs font-extrabold " + (item.correct ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600");
    }
    if (next) next.classList.remove("hidden");
  }
  function hasLedgerReward(user, id) {
    const entries = user && user.ventureXpLedger && Array.isArray(user.ventureXpLedger.entries) ? user.ventureXpLedger.entries : [];
    return entries.some(function (entry) { return entry && entry.id === id && entry.status === "applied"; });
  }
  function awardReward(user, amount, rewardId) {
    if (!user || !rewardId || hasLedgerReward(user, rewardId)) return;
    if (typeof addXp === "function") addXp(amount, rewardId);
  }
  function recoverRunRewards(user, run, day) {
    if (!user || !run || !Array.isArray(run.questions)) return;
    run.questions.forEach(function (item) {
      if (item.answered && item.correct) {
        item.rewardId = item.rewardId || ("arena:" + day + ":q:" + safeId(item.id));
        awardReward(user, 20, item.rewardId);
      }
    });
    if (run.status === "completed" && Number(run.score) >= 4) {
      run.bonusRewardId = run.bonusRewardId || ("arena:" + day + ":bonus");
      awardReward(user, 50, run.bonusRewardId);
    }
  }
  function answerCurrent(optionIndex) {
    const user = userNow();
    if (!user) { showMessage("Entre na sua conta para jogar.", "warning"); return; }
    const dayData = todayState(user);
    const run = dayData.run;
    if (!run || run.status !== "in-progress") return;
    const item = run.questions[run.index];
    if (!item || item.answered) return;
    const question = questionFor(item.id);
    if (!question) return;
    const selected = item.options[optionIndex];
    item.answered = true;
    item.selected = selected;
    item.correct = selected === question.a;
    item.answeredAt = Date.now();
    if (item.correct) {
      item.rewardId = "arena:" + dayData.day + ":q:" + safeId(item.id);
      item.credited = false;
      persist(true);
      awardReward(user, 20, item.rewardId);
      item.credited = true;
    } else if (typeof recordMistakeQuestion === "function") {
      recordMistakeQuestion(question.id);
    }
    persist(true);
    restoreAnsweredUI(item, question);
    const track = document.getElementById("ventureArenaProgressTrack");
    const progress = document.getElementById("ventureArenaProgress");
    if (track) track.setAttribute("aria-valuenow", String(run.index + 1));
    if (progress) progress.style.width = ((run.index + 1) / run.questions.length * 100) + "%";
  }
  function finishRun() {
    const user = userNow();
    if (!user) return;
    const dayData = todayState(user);
    const run = dayData.run;
    if (!run || run.status !== "in-progress") return;
    run.score = run.questions.filter(function (item) { return item.answered && item.correct; }).length;
    run.status = "completed";
    run.completedAt = Date.now();
    if (run.score >= 4) run.bonusRewardId = "arena:" + dayData.day + ":bonus";
    persist(true);
    recoverRunRewards(user, run, dayData.day);
    if (run.score >= 4) awardReward(user, 50, run.bonusRewardId);
    persist(true);
    showSummary(run);
    renderStats();
    if (window.VentureNotifications && typeof window.VentureNotifications.addForUser === "function") {
      window.VentureNotifications.addForUser(currentUserKey, "Arena concluída", "Você acertou " + run.score + " de 5 questões na Arena diária.", "achievement", "arena-complete:" + dayData.day);
    }
  }
  function nextQuestion() {
    const user = userNow();
    if (!user) return;
    const run = todayState(user).run;
    if (!run || run.status !== "in-progress") return;
    const item = run.questions[run.index];
    if (!item || !item.answered) return;
    if (run.index >= run.questions.length - 1) { finishRun(); return; }
    run.index += 1;
    persist(false);
    renderQuestion();
  }
  function startArena() {
    const user = userNow();
    if (!user) { showMessage("Entre na sua conta para iniciar a Arena.", "warning"); return; }
    const data = todayState(user);
    if (data.run && data.run.status === "completed") {
      showSummary(data.run);
      showMessage("Você já concluiu a Arena de hoje. Volte amanhã para um novo desafio.", "warning");
      return;
    }
    if (!data.run) {
      const questions = chooseQuestions(user);
      if (questions.length !== 5) { showMessage("O banco ainda não tem cinco questões válidas para montar o desafio.", "warning"); return; }
      data.state.days[data.day] = { day: data.day, status: "in-progress", questions: questions, index: 0, score: 0, createdAt: Date.now() };
      persist(true);
    }
    recoverRunRewards(user, data.state.days[data.day], data.day);
    showGame();
    renderQuestion();
    const start = document.getElementById("ventureArenaStartBtn");
    if (start) { start.disabled = true; start.textContent = "Desafio em andamento"; }
  }
  function init() {
    const user = userNow();
    if (user) {
      const data = todayState(user);
      if (data.run) {
        recoverRunRewards(user, data.run, data.day);
        if (data.run.status === "completed") showSummary(data.run);
        else if (data.run.status === "in-progress") { showGame(); renderQuestion(); }
      }
    }
    renderStats();
    const prevHeader = typeof updateHeaderUI === "function" ? updateHeaderUI : null;
    if (prevHeader && !prevHeader.__ventureArenaWrapped) {
      const wrapped = function () {
        const result = prevHeader.apply(this, arguments);
        renderStats();
        const current = userNow();
        if (current) {
          const data = todayState(current);
          if (data.run) recoverRunRewards(current, data.run, data.day);
        }
        return result;
      };
      wrapped.__ventureArenaWrapped = true;
      updateHeaderUI = wrapped;
    }
  }
  window.startVentureArena = startArena;
  window.nextVentureArenaQuestion = nextQuestion;
  window.renderVentureArenaStats = renderStats;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();