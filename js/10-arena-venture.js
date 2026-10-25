/* Venture 9.0.1 — Arena de Treino diária e painel complementar de duelos.
   Usa o addXp legado; não substitui as regras de XP, cadastro ou ranking.
   A sincronização permanece best-effort e não oferece validação centralizada.
*/
const VENTURE_ARENA_QUESTION_COUNT = 5;
const VENTURE_ARENA_QUESTION_XP = 20;
const VENTURE_ARENA_COMPLETION_XP = 50;
const VENTURE_ARENA_HISTORY_LIMIT = 30;

function ventureArenaTodayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const part = key => parts.find(p => p.type === key)?.value || '00';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
function ventureArenaPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function mergeVentureArenaState(left, right) {
  if (!left && !right) return undefined;
  const a = ventureArenaPlainObject(left), b = ventureArenaPlainObject(right);
  const dailyClaims = { ...ventureArenaPlainObject(a.dailyClaims), ...ventureArenaPlainObject(b.dailyClaims) };
  for (const day of new Set([...Object.keys(ventureArenaPlainObject(a.dailyClaims)), ...Object.keys(ventureArenaPlainObject(b.dailyClaims))])) {
    const ca = a.dailyClaims?.[day], cb = b.dailyClaims?.[day];
    if (ca && cb) {
      const mergedClaim = { ...ca, ...cb };
      const legacyClaimed = (ca.status === undefined && ca.claimedAt) || (cb.status === undefined && cb.claimedAt);
      if (ca.status === 'claimed' || cb.status === 'claimed' || legacyClaimed) mergedClaim.status = 'claimed';
      else if (ca.status === 'pending' || cb.status === 'pending') mergedClaim.status = 'pending';
      const times = [Number(ca.claimedAt), Number(cb.claimedAt)].filter(n => Number.isFinite(n) && n > 0);
      mergedClaim.claimedAt = times.length ? Math.min(...times) : 0;
      mergedClaim.rewardId = ca.rewardId || cb.rewardId;
      dailyClaims[day] = mergedClaim;
    }
    if (dailyClaims[day] && !Number.isFinite(Number(dailyClaims[day].claimedAt))) dailyClaims[day].claimedAt = 0;
  }
  const history = { ...ventureArenaPlainObject(a.history), ...ventureArenaPlainObject(b.history) };
  for (const day of new Set([...Object.keys(ventureArenaPlainObject(a.history)), ...Object.keys(ventureArenaPlainObject(b.history))])) {
    const ha = a.history?.[day], hb = b.history?.[day];
    if (!ha) history[day] = hb;
    else if (!hb) history[day] = ha;
    else history[day] = (Number(hb.correct) > Number(ha.correct) || (Number(hb.correct) === Number(ha.correct) && Number(hb.completedAt) > Number(ha.completedAt))) ? hb : ha;
  }
  const sa = a.activeSession && typeof a.activeSession === 'object' ? a.activeSession : null;
  const sb = b.activeSession && typeof b.activeSession === 'object' ? b.activeSession : null;
  let activeSession = sa || sb;
  if (sa && sb) {
    if (sa.day !== sb.day) activeSession = String(sb.day || '') > String(sa.day || '') ? sb : sa;
    else if (Boolean(sa.completed) !== Boolean(sb.completed)) activeSession = sa.completed ? sa : sb;
    else {
      const ca = Object.keys(ventureArenaPlainObject(sa.answers)).length;
      const cb = Object.keys(ventureArenaPlainObject(sb.answers)).length;
      activeSession = cb > ca || (cb === ca && (Number(sb.updatedAt) || 0) > (Number(sa.updatedAt) || 0)) ? sb : sa;
    }
  }
  const sortedDays = Object.keys(history).sort().slice(-VENTURE_ARENA_HISTORY_LIMIT);
  const retainedHistory = Object.fromEntries(sortedDays.map(day => [day, history[day]]));
  return {
    version: 1,
    dailyClaims,
    history: retainedHistory,
    activeSession,
    updatedAt: Math.max(Number(a.updatedAt) || 0, Number(b.updatedAt) || 0)
  };
}
function ventureArenaQuestionRewardId(day, questionId) {
  return `arena:${String(day)}:question:${String(questionId)}`;
}
function ventureArenaCompletionRewardId(day) {
  return `arena:${String(day)}:completion`;
}
function ventureArenaRecalculateSessionXp(session) {
  if (!session || Number(session.xpLedgerVersion) !== 1) return;
  const answerXp = Object.values(ventureArenaPlainObject(session.answers)).reduce((sum, answer) => sum + Math.max(0, Number(answer?.xp) || 0), 0);
  session.xpEarned = answerXp + Math.max(0, Number(session.completionBonusXp) || 0);
}
function ventureArenaReconcileXpRewards(user, state) {
  if (!user || !state || typeof addXp !== 'function' || typeof getXpTransaction !== 'function') return false;
  let changed = false;
  const session = state.activeSession && typeof state.activeSession === 'object' ? state.activeSession : null;
  if (session && Number(session.xpLedgerVersion) === 1) {
    for (const [qid, answer] of Object.entries(ventureArenaPlainObject(session.answers))) {
      if (!answer || !answer.correct || !answer.rewardId) continue; // respostas antigas já podem ter sido creditadas
      let tx = getXpTransaction(answer.rewardId, user);
      if (!tx) {
        addXp(VENTURE_ARENA_QUESTION_XP, answer.rewardId, { source: 'arena-question' });
        tx = getXpTransaction(answer.rewardId, user);
      }
      if (tx && Number(answer.xp) !== Number(tx.delta)) { answer.xp = Number(tx.delta) || 0; answer.rewardPending = false; changed = true; }
      else if (!tx && answer.rewardPending !== true) { answer.rewardPending = true; changed = true; }
    }
  }
  const day = session?.day;
  if (day && !state.dailyClaims[day] && session.completed && Number(session.correct) >= 4 && Number(session.xpLedgerVersion) === 1) {
    state.dailyClaims[day] = { claimedAt: 0, rewardXp: VENTURE_ARENA_COMPLETION_XP, kind: 'daily-completion',
      status: 'pending', rewardId: ventureArenaCompletionRewardId(day) };
    changed = true;
  }
  // Um claim pendente pode chegar de outro aparelho mesmo que a sessão local ainda não tenha sido mesclada.
  // A chave estável impede que a mesma recompensa diária seja somada duas vezes.
  for (const [claimDay, claim] of Object.entries(ventureArenaPlainObject(state.dailyClaims))) {
    if (!claim || claim.status !== 'pending') continue; // claims legados sem status já foram pagos
    const rewardId = claim.rewardId || ventureArenaCompletionRewardId(claimDay);
    claim.rewardId = rewardId;
    let tx = getXpTransaction(rewardId, user);
    if (!tx) {
      addXp(VENTURE_ARENA_COMPLETION_XP, rewardId, { source: 'arena-completion' });
      tx = getXpTransaction(rewardId, user);
    }
    if (tx) {
      claim.status = 'claimed';
      claim.claimedAt = Number(tx.createdAt) || Date.now();
      claim.awardedXp = Number(tx.delta) || 0;
      if (session && session.day === claimDay && Number(session.xpLedgerVersion) === 1) session.completionBonusXp = Number(tx.delta) || 0;
      changed = true;
    }
  }
  if (session && Number(session.xpLedgerVersion) === 1) {
    const before = Number(session.xpEarned) || 0;
    ventureArenaRecalculateSessionXp(session);
    if (before !== Number(session.xpEarned)) changed = true;
    if (session.completed && session.day) {
      const oldHistory = state.history[session.day];
      const nextHistory = { ...(oldHistory || {}), day: session.day, correct: Number(session.correct) || 0,
        total: Array.isArray(session.questionIds) ? session.questionIds.length : VENTURE_ARENA_QUESTION_COUNT,
        xpEarned: Number(session.xpEarned) || 0, completedAt: Number(session.completedAt) || Date.now(),
        completionBonus: state.dailyClaims[session.day]?.status === 'claimed',
        questionIds: Array.isArray(session.questionIds) ? session.questionIds.slice() : [] };
      if (JSON.stringify(oldHistory || null) !== JSON.stringify(nextHistory)) { state.history[session.day] = nextHistory; changed = true; }
    }
  }
  if (changed) saveVentureArenaState(true);
  return !Object.values(ventureArenaPlainObject(session?.answers)).some(answer => answer?.correct && answer.rewardId && answer.rewardPending);
}

function getVentureArenaData(user = currentUserKey && users[currentUserKey]) {
  if (!user) return null;
  if (!user.ventureArena || typeof user.ventureArena !== 'object' || Array.isArray(user.ventureArena)) {
    user.ventureArena = { version: 1, dailyClaims: {}, history: {}, activeSession: null, updatedAt: 0 };
  }
  const state = user.ventureArena;
  state.version = 1;
  state.dailyClaims = ventureArenaPlainObject(state.dailyClaims);
  state.history = ventureArenaPlainObject(state.history);
  return state;
}
function saveVentureArenaState(sync = true) {
  if (!currentUserKey || !users[currentUserKey]) return false;
  const user = users[currentUserKey];
  const state = getVentureArenaData(user);
  const now = Date.now();
  state.updatedAt = now;
  user.updatedAt = Math.max(Number(user.updatedAt) || 0, now);
  try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); }
  catch (err) { console.warn('Não foi possível salvar o progresso da Arena Venture.', err); return false; }
  if (sync && typeof scheduleCloudSync === 'function') scheduleCloudSync(currentUserKey, false);
  return true;
}
function ventureArenaEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function ventureArenaStats(state) {
  const entries = Object.values(ventureArenaPlainObject(state?.history));
  return {
    completed: entries.length,
    correct: entries.reduce((sum, item) => sum + (Number(item?.correct) || 0), 0),
    best: entries.reduce((best, item) => Math.max(best, Number(item?.correct) || 0), 0)
  };
}
function renderVentureArena() {
  const root = $('training-mode-arena');
  if (!root) return;
  const message = $('ventureArenaMessage');
  const intro = $('ventureArenaIntro');
  const game = $('ventureArenaGame');
  const summary = $('ventureArenaSummary');
  const startBtn = $('ventureArenaStartBtn');
  const user = currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted ? users[currentUserKey] : null;
  if (!user) {
    if (message) message.textContent = 'Entre na sua conta para salvar o progresso e receber XP oficial.';
    if (intro) intro.classList.remove('hidden');
    if (game) game.classList.add('hidden');
    if (summary) summary.classList.add('hidden');
    if (startBtn) { startBtn.disabled = true; startBtn.textContent = 'Entre para jogar'; }
    ['ventureArenaRuns','ventureArenaCorrect','ventureArenaBest'].forEach(id => { const el = $(id); if (el) el.textContent = '—'; });
    return;
  }
  const state = getVentureArenaData(user);
  ventureArenaReconcileXpRewards(user, state);
  const stats = ventureArenaStats(state);
  if ($('ventureArenaRuns')) $('ventureArenaRuns').textContent = String(stats.completed);
  if ($('ventureArenaCorrect')) $('ventureArenaCorrect').textContent = String(stats.correct);
  if ($('ventureArenaBest')) $('ventureArenaBest').textContent = `${stats.best}/5`;
  const today = ventureArenaTodayKey();
  const session = state.activeSession && state.activeSession.day === today ? state.activeSession : null;
  const claim = state.dailyClaims[today];
  if (session && session.completed) {
    if (intro) intro.classList.add('hidden');
    if (game) game.classList.add('hidden');
    if (summary) summary.classList.remove('hidden');
    renderVentureArenaSummary(session, state.history[today], claim);
    if (message) message.textContent = 'Desafio de hoje concluído. Um novo desafio estará disponível amanhã.';
    if (startBtn) { startBtn.disabled = true; startBtn.textContent = 'Desafio concluído hoje'; }
    return;
  }
  if (claim && session && !session.completed) {
    // Outra sessão/aparelho já registrou o bônus de hoje. Bloqueia a sessão local incompleta.
    session.completed = true;
    session.completedAt = Number(claim.claimedAt) || Date.now();
    session.updatedAt = Math.max(Number(session.updatedAt) || 0, session.completedAt);
    state.history[today] = state.history[today] || {
      day: today, correct: Number(session.correct) || 0, total: session.questionIds?.length || VENTURE_ARENA_QUESTION_COUNT,
      xpEarned: Number(session.xpEarned) || 0, completedAt: session.completedAt, completionBonus: true,
      questionIds: Array.isArray(session.questionIds) ? session.questionIds.slice() : []
    };
    saveVentureArenaState(true);
    if (intro) intro.classList.add('hidden');
    if (game) game.classList.add('hidden');
    if (summary) summary.classList.remove('hidden');
    renderVentureArenaSummary(session, state.history[today], claim);
    if (message) message.textContent = 'A recompensa de hoje já foi registrada neste cadastro ou em outro aparelho sincronizado.';
    if (startBtn) { startBtn.disabled = true; startBtn.textContent = 'Recompensa de hoje já registrada'; }
    return;
  }
  if (claim && !session) {
    if (intro) intro.classList.add('hidden');
    if (game) game.classList.add('hidden');
    if (summary) summary.classList.remove('hidden');
    renderVentureArenaSummary(null, state.history[today], claim);
    if (message) message.textContent = 'A recompensa de hoje já foi registrada neste cadastro.';
    if (startBtn) { startBtn.disabled = true; startBtn.textContent = 'Recompensa de hoje já registrada'; }
    return;
  }
  if (session && !session.completed) {
    if (intro) intro.classList.add('hidden');
    if (summary) summary.classList.add('hidden');
    if (game) game.classList.remove('hidden');
    if (message) message.textContent = 'Desafio em andamento — seu progresso está salvo neste cadastro.';
    if (startBtn) { startBtn.disabled = false; startBtn.textContent = 'Retomar desafio'; }
    renderVentureArenaQuestion(session);
    return;
  }
  if (intro) intro.classList.remove('hidden');
  if (game) game.classList.add('hidden');
  if (summary) summary.classList.add('hidden');
  if (message) message.textContent = 'Cinco perguntas por dia. As questões erradas recebem prioridade para ajudar na revisão.';
  if (startBtn) { startBtn.disabled = false; startBtn.textContent = 'Começar desafio de hoje'; }
}
function renderVentureArenaSummary(session, historyRecord, claim) {
  const score = Number(historyRecord?.correct ?? session?.correct ?? 0);
  const total = Number(historyRecord?.total ?? session?.questionIds?.length ?? VENTURE_ARENA_QUESTION_COUNT);
  const hasScore = Boolean(historyRecord || session);
  const xp = Number(historyRecord?.xpEarned ?? session?.xpEarned ?? 0);
  if ($('ventureArenaScore')) $('ventureArenaScore').textContent = hasScore ? `${score}/${total} acertos` : 'Concluído';
  if ($('ventureArenaReward')) $('ventureArenaReward').textContent = claim ? `Bônus diário já registrado${claim.rewardXp ? ` (+${claim.rewardXp} XP base)` : ''}.` : (score >= 4 ? `Meta alcançada! Bônus de conclusão registrado.` : 'Desafio finalizado. Tente novamente amanhã para melhorar sua marca.');
  if ($('ventureArenaSummaryDetail')) $('ventureArenaSummaryDetail').textContent = `XP da Arena nesta sessão: ${xp}. Bônus de missões e outras campanhas podem ser somados separadamente.`;
}
function startVentureArena() {
  if (!currentUserKey || !users[currentUserKey] || users[currentUserKey]._deleted) {
    alert('Entre na sua conta para iniciar a Arena e salvar o XP oficial.');
    return;
  }
  const user = users[currentUserKey];
  const state = getVentureArenaData(user);
  const today = ventureArenaTodayKey();
  if (state.activeSession?.day === today) {
    renderVentureArena();
    return;
  }
  if (state.dailyClaims[today]) {
    renderVentureArena();
    return;
  }
  const bank = typeof getQuestionBank === 'function' ? getQuestionBank() : [];
  if (bank.length < VENTURE_ARENA_QUESTION_COUNT) {
    alert('O banco de questões não tem perguntas suficientes para iniciar este desafio.');
    return;
  }
  const byId = new Map(bank.map(q => [String(q.id), q]));
  const mistakeIds = Array.isArray(user.mistakes) ? user.mistakes.map(String) : [];
  const prioritized = mistakeIds.map(id => byId.get(id)).filter(Boolean).sort(() => Math.random() - 0.5).slice(0, 3);
  const picked = [...prioritized];
  const used = new Set(picked.map(q => String(q.id)));
  const rest = bank.filter(q => !used.has(String(q.id))).sort(() => Math.random() - 0.5);
  while (picked.length < VENTURE_ARENA_QUESTION_COUNT && rest.length) picked.push(rest.shift());
  if (picked.length < VENTURE_ARENA_QUESTION_COUNT) {
    alert('Não foi possível montar um desafio completo com as questões disponíveis.');
    return;
  }
  state.activeSession = {
    day: today,
    questionIds: picked.map(q => q.id),
    answers: {},
    index: 0,
    correct: 0,
    xpEarned: 0,
    completionBonusXp: 0,
    xpLedgerVersion: 1,
    completed: false,
    startedAt: Date.now(),
    updatedAt: Date.now()
  };
  saveVentureArenaState(true);
  renderVentureArena();
}
function renderVentureArenaQuestion(session) {
  const ids = Array.isArray(session.questionIds) ? session.questionIds : [];
  if (!ids.length) { renderVentureArena(); return; }
  const index = Math.max(0, Math.min(Number(session.index) || 0, ids.length - 1));
  const qid = ids[index];
  const item = getQuestionBank().find(q => String(q.id) === String(qid));
  if (!item) {
    const message = $('ventureArenaMessage');
    if (message) message.textContent = 'Uma questão deste desafio não está disponível. O progresso foi preservado; tente novamente após atualizar o banco de questões.';
    return;
  }
  const answers = ventureArenaPlainObject(session.answers);
  const answer = answers[String(item.id)];
  if ($('ventureArenaQuestionMeta')) $('ventureArenaQuestionMeta').textContent = `Questão ${index + 1} de ${ids.length} · ${item.level || 'Treino'}`;
  if ($('ventureArenaQuestionNumber')) $('ventureArenaQuestionNumber').textContent = `${index + 1}/${ids.length}`;
  const progressValue = index + (answer ? 1 : 0);
  if ($('ventureArenaProgress')) $('ventureArenaProgress').style.width = `${Math.round((progressValue / ids.length) * 100)}%`;
  if ($('ventureArenaProgressTrack')) $('ventureArenaProgressTrack').setAttribute('aria-valuenow', String(progressValue));
  if ($('ventureArenaQuestion')) $('ventureArenaQuestion').textContent = item.q;
  const options = $('ventureArenaOptions');
  if (!options) return;
  options.replaceChildren();
  const choices = [...(Array.isArray(item.w) ? item.w : []), item.a].sort(() => Math.random() - 0.5);
  const letters = ['A', 'B', 'C', 'D'];
  choices.forEach((choice, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'venture-arena-option';
    button.innerHTML = `<span class="venture-arena-option-letter">${letters[i]}</span><span>${ventureArenaEscape(choice)}</span>`;
    button.disabled = Boolean(answer);
    if (answer && choice === item.a) button.classList.add('is-correct');
    if (answer && !answer.correct && choice === answer.chosen) button.classList.add('is-wrong');
    button.addEventListener('click', () => answerVentureArenaQuestion(item, choice, button));
    options.appendChild(button);
  });
  const feedback = $('ventureArenaFeedback');
  if (feedback) {
    feedback.classList.toggle('hidden', !answer);
    if (answer) {
      feedback.className = `rounded-xl p-3 text-xs font-extrabold ${answer.correct ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-500'}`;
      feedback.textContent = answer.correct ? (Number(answer.xp) > 0 ? `Resposta correta! +${Number(answer.xp)} XP registrado(s).` : (answer.rewardPending ? 'Resposta salva. O XP está pendente de gravação; avance novamente para tentar recuperar a recompensa.' : 'Resposta correta registrada.')) : `Não foi dessa vez. Gabarito: ${item.a}. A questão entrou em Minhas Dúvidas.`;
    }
  }
  const next = $('ventureArenaNextBtn');
  if (next) {
    next.classList.toggle('hidden', !answer);
    next.textContent = index === ids.length - 1 ? 'Ver resultado 🏆' : 'Próxima questão →';
  }
}
function answerVentureArenaQuestion(item, choice, selectedButton) {
  const user = currentUserKey && users[currentUserKey];
  const state = getVentureArenaData(user);
  const session = state?.activeSession;
  if (!session || session.completed || session.day !== ventureArenaTodayKey()) return;
  const qid = String(item.id);
  if (ventureArenaPlainObject(session.answers)[qid]) return;
  const correct = choice === item.a;
  session.xpLedgerVersion = 1;
  const rewardId = correct ? ventureArenaQuestionRewardId(session.day, qid) : null;
  const answerRecord = { correct, chosen: choice, answeredAt: Date.now(), xp: 0, rewardMarked: correct,
    rewardId, rewardPending: Boolean(correct) };
  session.answers[qid] = answerRecord;
  if (correct) session.correct = (Number(session.correct) || 0) + 1;
  session.updatedAt = Date.now();
  // Primeiro persiste a resposta; o ID idempotente permite recuperar o crédito após uma interrupção.
  saveVentureArenaState(true);
  if (correct) {
    if (typeof addXp === 'function') addXp(VENTURE_ARENA_QUESTION_XP, rewardId, { source: 'arena-question' });
    const tx = typeof getXpTransaction === 'function' ? getXpTransaction(rewardId, user) : null;
    if (tx) { answerRecord.xp = Number(tx.delta) || 0; answerRecord.rewardPending = false; }
    ventureArenaRecalculateSessionXp(session);
    if (typeof recordMissionActivity === 'function') recordMissionActivity('quiz_correct');
  } else if (typeof recordMistakeQuestion === 'function') {
    recordMistakeQuestion(item.id);
  }
  session.updatedAt = Date.now();
  saveVentureArenaState(true);
  renderVentureArenaQuestion(session);
  if (selectedButton) {
    const options = $('ventureArenaOptions');
    if (options) options.querySelectorAll('button').forEach(button => { button.disabled = true; });
  }
  const feedback = $('ventureArenaFeedback');
  if (feedback) {
    feedback.classList.remove('hidden');
    feedback.className = `rounded-xl p-3 text-xs font-extrabold ${correct ? 'bg-emerald-500/15 text-emerald-600' : 'bg-red-500/15 text-red-500'}`;
    feedback.textContent = correct ? (answerRecord.rewardPending ? 'Resposta salva, mas não foi possível confirmar a gravação do XP. Tente avançar novamente para recuperar a recompensa.' : `Resposta correta! Você ganhou +${Number(answerRecord.xp) || VENTURE_ARENA_QUESTION_XP} XP.`) : `Não foi dessa vez. Gabarito: ${item.a}. A questão entrou em Minhas Dúvidas.`;
  }
  if (selectedButton) selectedButton.classList.add(correct ? 'is-correct' : 'is-wrong');
  const next = $('ventureArenaNextBtn');
  if (next) {
    next.classList.remove('hidden');
    next.textContent = Number(session.index) >= session.questionIds.length - 1 ? 'Ver resultado 🏆' : 'Próxima questão →';
  }
}
function nextVentureArenaQuestion() {
  const user = currentUserKey && users[currentUserKey];
  const state = getVentureArenaData(user);
  const session = state?.activeSession;
  if (!session || session.completed) { renderVentureArena(); return; }
  ventureArenaReconcileXpRewards(user, state);
  const index = Math.max(0, Number(session.index) || 0);
  const qid = String(session.questionIds?.[index]);
  const currentAnswer = ventureArenaPlainObject(session.answers)[qid];
  if (!currentAnswer) return;
  if (currentAnswer.correct && currentAnswer.rewardId && !getXpTransaction(currentAnswer.rewardId, user)) {
    const feedback = $('ventureArenaFeedback');
    if (feedback) { feedback.classList.remove('hidden'); feedback.textContent = 'O XP ainda não foi salvo. Verifique o armazenamento/conexão e tente novamente.'; }
    return;
  }
  if (index >= session.questionIds.length - 1) {
    completeVentureArenaSession(session, state);
    return;
  }
  session.index = index + 1;
  session.updatedAt = Date.now();
  saveVentureArenaState(true);
  renderVentureArenaQuestion(session);
}
function completeVentureArenaSession(session, state) {
  if (!session || session.completed) { renderVentureArena(); return; }
  const user = currentUserKey && users[currentUserKey];
  if (!user) return;
  const day = session.day;
  const correct = Math.max(0, Math.min(session.questionIds.length, Number(session.correct) || 0));
  session.completed = true;
  session.completedAt = Date.now();
  session.xpLedgerVersion = 1;
  session.completionBonusXp = Number(session.completionBonusXp) || 0;
  session.updatedAt = session.completedAt;
  // A sessão concluída é persistida primeiro. A rotina de reconciliação cria um claim
  // pendente e só o marca como recebido depois de encontrar o crédito no ledger.
  saveVentureArenaState(true);
  ventureArenaReconcileXpRewards(user, state);
  state.history[day] = {
    day, correct, total: session.questionIds.length,
    xpEarned: Number(session.xpEarned) || 0,
    completedAt: session.completedAt,
    completionBonus: Boolean(state.dailyClaims[day] && state.dailyClaims[day].status === 'claimed'),
    questionIds: session.questionIds.slice()
  };
  const days = Object.keys(state.history).sort();
  for (const oldDay of days.slice(0, Math.max(0, days.length - VENTURE_ARENA_HISTORY_LIMIT))) delete state.history[oldDay];
  saveVentureArenaState(true);
  if (typeof renderMissionHub === 'function') renderMissionHub();
  renderVentureArena();
}

function renderVentureDuelDashboard() {
  const stats = $('ventureDuelStats');
  const recent = $('ventureDuelRecent');
  const button = $('ventureQuickRematchBtn');
  if (!stats || !recent) return;
  const user = currentUserKey && users[currentUserKey];
  if (!user || user._deleted) {
    stats.textContent = 'Entre na conta para acompanhar seus resultados.';
    recent.textContent = 'Seu histórico de duelos aparecerá aqui.';
    if (button) button.disabled = true;
    return;
  }
  const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-BR');
  const name = normalize(user.name);
  const records = Array.isArray(duelHistoryList) ? duelHistoryList : [];
  const ownMatches = records.filter(h => h && (normalize(h.p1) === name || normalize(h.p2) === name));
  const wins = ownMatches.filter(h => normalize(h.winner) === name).length;
  const losses = ownMatches.length - wins;
  stats.textContent = `Últimos ${ownMatches.length} duelo(s): ${wins} vitória(s) · ${losses} derrota(s)`;
  const latest = ownMatches[0];
  if (!latest) {
    recent.textContent = 'Ainda não há partidas recentes registradas neste aparelho.';
    if (button) button.disabled = true;
    return;
  }
  const opponent = normalize(latest.p1) === name ? latest.p2 : latest.p1;
  recent.textContent = `Último adversário: ${opponent || 'colega'} · ${latest.score1 ?? 0} × ${latest.score2 ?? 0} · ${latest.date || 'horário não informado'}`;
  if (button) {
    const available = Object.entries(users).some(([key, candidate]) => key !== currentUserKey && candidate && !candidate._deleted && normalize(candidate.name) === normalize(opponent));
    button.disabled = !available;
    button.textContent = available ? `Pedir revanche contra ${opponent}` : 'Adversário não disponível';
  }
}
function startVentureQuickRematch() {
  const user = currentUserKey && users[currentUserKey];
  if (!user || user._deleted) { alert('Entre na sua conta para pedir uma revanche.'); return; }
  const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-BR');
  const ownMatches = (Array.isArray(duelHistoryList) ? duelHistoryList : []).filter(h => h && (normalize(h.p1) === normalize(user.name) || normalize(h.p2) === normalize(user.name)));
  const latest = ownMatches[0];
  if (!latest) { alert('Você ainda não tem um duelo recente para pedir revanche.'); return; }
  const opponentName = normalize(latest.p1) === normalize(user.name) ? latest.p2 : latest.p1;
  const opponent = Object.entries(users).find(([key, candidate]) => key !== currentUserKey && candidate && !candidate._deleted && normalize(candidate.name) === normalize(opponentName));
  if (!opponent) { alert('Esse adversário não está disponível neste cadastro agora. Você pode escolher outro colega na lista de duelos.'); return; }
  if (typeof populateDuelOpponentList === 'function') populateDuelOpponentList();
  const select = $('duelOpponentSelect');
  if (select) select.value = opponent[0];
  if (typeof sendLiveDuelInvite === 'function') sendLiveDuelInvite();
}

// Mantém a tela nova atualizada quando o usuário volta à área de Treinos.
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    if (typeof renderVentureArena === 'function') renderVentureArena();
    if (typeof renderVentureDuelDashboard === 'function') renderVentureDuelDashboard();
  });
}
